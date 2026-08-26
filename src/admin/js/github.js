/**
 * GitHub 自动发布模块
 *
 * 用法（先在 Admin 后台调用 setGitHubConfig 配置）：
 *   await GitHub.publishToSite({ news: ..., newsDetail: ... })
 *
 * 步骤：
 *   1. 用户提供 GitHub PAT + 仓库信息
 *   2. Admin 编辑后调用 publishToSite
 *   3. 转换数据为 src/data/*.js 格式
 *   4. 通过 GitHub Contents API 写入文件
 *   5. GitHub 触发 Netlify 自动部署
 */

const GitHub = (() => {
    const LS_KEY = 'github_config';

    function getConfig() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }
    function setConfig(cfg) {
        localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    }
    function clearConfig() {
        localStorage.removeItem(LS_KEY);
    }
    function isConfigured() {
        const c = getConfig();
        return c && c.token && c.owner && c.repo;
    }

    async function api(method, urlPath, body) {
        const c = getConfig();
        if (!c) throw new Error('GitHub 配置缺失');
        const res = await fetch(`https://api.github.com${urlPath}`, {
            method,
            headers: {
                'Authorization': `token ${c.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
        }
        return await res.json();
    }

    /**
     * UTF-8 字符串 → Base64
     *
     * ⚠️ 不能用 `btoa(String.fromCharCode(...bytes))` — 新加 1-2MB 内容后
     *     spread 超百万参数会触发 "Maximum call stack size exceeded"。
     * 修复：分块处理，每块 ≤ 32KB 用 apply 调，避开栈限制。
     */
    function utf8ToBase64(str) {
        const bytes = new TextEncoder().encode(str);
        const CHUNK = 0x8000; // 32768 字节
        let binary = '';
        for (let i = 0; i < bytes.length; i += CHUNK) {
            const slice = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
            // 使用 apply 逐块调用 String.fromCharCode — 每块最多 3 万参数，足够安全
            binary += String.fromCharCode.apply(null, slice);
        }
        return btoa(binary);
    }

    /**
     * 把 news / newsDetail / pages / site / etc 数据转回 src/data/*.js 格式
     *
     * 【关键修复】原来用 regex `(export\\s+)?const\\s+${name}\\s*=\\s*[\\s\\S]*?;`
     * 在 detailBodies 内容字符串里有 `text-align: center;` 这种 `;` 时会提前误匹配，
     * 导致 detailBodies 块被截断，后续 charter/about 等 entry 被截断在 detailBodies 外
     * 造成 JS 语法错误。现在使用 brace-balance 算法，找第一个完整 { ... } 块。
     */
    function buildJsContent(original, replacements) {
        let result = original;
        for (const [name, newValue] of Object.entries(replacements)) {
            const newJson = JSON.stringify(newValue, null, 2);
            const startMarker = new RegExp(`(export\\s+)?const\\s+${name}\\s*=\\s*\\{`);
            const m = result.match(startMarker);
            if (m) {
                // 从第一个 `{` 开始，brace-counting 找匹配的 `}`
                const startBrace = m.index + m[0].length - 1;
                const closeIdx = findMatchingCloseBrace(result, startBrace);
                if (closeIdx > 0) {
                    result = result.slice(0, m.index) + `export const ${name} = ${newJson};` + result.slice(closeIdx + 1);
                    continue;
                }
            }
            // 不存在或未找到闭合 → 追加
            result += `\nexport const ${name} = ${newJson};\n`;
        }
        return result;
    }

    /**
     * 在字符串中从 startBrace 位置开始查找匹配的闭合 `}`，返荡个 `}` 的下标（-1 未找到）
     * 跳过字符串/模板/正则字面量中的括号。
     */
    function findMatchingCloseBrace(s, startBrace) {
        let depth = 0;
        let inStr = false;
        let strCh = '';
        let esc = false;
        let inTpl = false;
        let inLineComment = false;
        let inBlockComment = false;
        for (let i = startBrace; i < s.length; i++) {
            const c = s[i];
            const next = s[i + 1];
            if (inLineComment) {
                if (c === '\n') inLineComment = false;
                continue;
            }
            if (inBlockComment) {
                if (c === '*' && next === '/') { inBlockComment = false; i++; }
                continue;
            }
            if (inStr) {
                if (esc) { esc = false; continue; }
                if (c === '\\') { esc = true; continue; }
                if (c === strCh) inStr = false;
                continue;
            }
            if (inTpl) {
                if (esc) { esc = false; continue; }
                if (c === '\\') { esc = true; continue; }
                if (c === '`') inTpl = false;
                continue;
            }
            // 未在任何字符串/注释中
            if (c === '/' && next === '/') { inLineComment = true; i++; continue; }
            if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
            if (c === '"' || c === "'") { inStr = true; strCh = c; continue; }
            if (c === '`') { inTpl = true; continue; }
            if (c === '{') depth++;
            else if (c === '}') {
                depth--;
                if (depth === 0) return i;
            }
        }
        return -1;
    }

    /**
     * 获取文件 SHA 用于更新（修复了大文件 content=null 导致 sha 丢失的 bug）
     * 即使文件 > 1 MB，GitHub 会返回 sha，只是 content 为 null
     */
    async function getFileContent(path) {
        try {
            const data = await api('GET', `/repos/{owner}/{repo}/contents/${encodeURI(path)}`.replace('{owner}', getConfig().owner).replace('{repo}', getConfig().repo));
            // ⚠️ GitHub 对大于 1 MB 的文件返回 content=null，此时仅取 sha 即可
            const result = { sha: data.sha };
            if (data.content) {
                try {
                    result.content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
                } catch (e) {
                    console.warn('[getFileContent] content 解码失败，仅返回 sha:', e.message);
                    result.content = null;
                }
            } else {
                result.content = null;
            }
            return result;
        } catch (e) {
            console.warn('[getFileContent] 读取失败:', path, e.message);
            return { content: null, sha: null };
        }
    }

    async function updateFile(path, content, message) {
        const c = getConfig();
        const { sha } = await getFileContent(path);
        const body = {
            message: message || `Update ${path} via Admin`,
            content: utf8ToBase64(content),
            ...(sha ? { sha } : {})
        };
        const data = await api('PUT',
            `/repos/${c.owner}/${c.repo}/contents/${encodeURI(path)}`,
            body
        );
        return data;
    }

    /**
     * 列出 GitHub 仓库某目录下的所有文件
     * GET /repos/{owner}/{repo}/contents/{path}
     * 返回文件数组 [{ name, path, sha, type, size }]，不存在的目录返回 []
     */
    async function listDir(path) {
        try {
            const data = await api('GET', `/repos/{owner}/{repo}/contents/${encodeURI(path)}`.replace('{owner}', getConfig().owner).replace('{repo}', getConfig().repo));
            if (!Array.isArray(data)) {
                // path 指向一个文件而非目录
                return [data];
            }
            return data.filter(function (d) { return d.type === 'file'; });
        } catch (e) {
            // 404 — 目录不存在
            return [];
        }
    }

    /**
     * 推送一个表单备份到 data/news/news_{序号}_{时间戳}.json
     * @param {Object} formData 表单数据对象
     * @param {number} seq 序号（递增）
     * @param {number} ts 时间戳
     * @returns {Object} GitHub API response
     */
    async function saveNewsFormBackup(formData, seq, ts) {
        const c = getConfig();
        if (!c) throw new Error('GitHub 配置缺失');
        const fileName = 'news_' + seq + '_' + ts + '.json';
        const filePath = 'data/news/' + fileName;
        const contentStr = JSON.stringify(formData, null, 2);
        const b64 = btoa(unescape(encodeURIComponent(contentStr)));
        const body = {
            message: '📝 Admin: ' + fileName + ' — ' + (formData && formData.title ? formData.title : 'no-title'),
            content: b64
        };
        const data = await api('PUT',
            '/repos/' + c.owner + '/' + c.repo + '/contents/' + filePath,
            body);
        return { path: filePath, sha: data.content && data.content.sha };
    }

    /**
     * 读取最新序号 (seq) - 数 data/news/ 下 news_N_*.json 文件最大 N
     * 目录不存在则返回 0
     */
    async function getNextNewsSeq() {
        const files = await listDir('data/news');
        let maxN = 0;
        for (const f of files) {
            const m = (f.name || '').match(/^news_(\d+)_/);
            if (m) {
                const n = parseInt(m[1], 10);
                if (!isNaN(n) && n > maxN) maxN = n;
            }
        }
        return maxN + 1;
    }

    /**
     * 读取 File 为 base64（不含前缀）
     */
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result || '';
                const idx = String(result).indexOf(',');
                resolve(idx >= 0 ? String(result).slice(idx + 1) : String(result));
            };
            reader.onerror = () => reject(reader.error || new Error('读取文件失败'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * 上传任意二进制资源（PDF/图片/字体…）到 GitHub
     * @param {File|Blob} file 浏览器中的文件
     * @param {string} path    仓库内路径，例如 "public/assets/standard-battery.pdf"
     * @param {string} message commit message
     */
    async function uploadAsset(file, path, message) {
        const c = getConfig();
        if (!c) throw new Error('GitHub 配置缺失');
        if (!file) throw new Error('未选择文件');
        if (file.size > 50 * 1024 * 1024) {
            throw new Error(`文件过大（${(file.size / 1024 / 1024).toFixed(1)} MB > 50 MB）。GitHub API 限制约 100 MB，建议压缩 PDF 后重试。`);
        }
        const { sha } = await getFileContent(path);
        const base64 = await fileToBase64(file);
        const body = {
            message: message || `📎 Admin: 上传资源 ${path}`,
            content: base64,
            ...(sha ? { sha } : {})
        };
        const data = await api('PUT',
            `/repos/${c.owner}/${c.repo}/contents/${encodeURI(path)}`,
            body
        );
        return data;
    }

    /**
     * 把 Admin 数据发布到 GitHub — 拆分多文件推送
     *
     * 【重构 2026-08】不再拼动 6.5MB 的 src/data/news.js，改为推送多个小 JSON：
     *   1. src/admin/data/news.json                     — 列表（元数据）
     *   2. src/admin/data/news-detail/<id>.json         — 每个详情 body
     *
     * 为安全起见，同时也同步一个最小化的 src/data/news.js （只含 newsList），
     * 以兼容任何仍读取该文件的脚本。
     */
    async function publishNews() {
        const newsData = window.Store.get('news');
        const newsDetailData = window.Store.get('newsDetail');
        if (!newsData) throw new Error('Store.news 不存在');

        const results = [];
        const today = new Date().toISOString().slice(0, 10);

        // 1) 推送 news.json — 完整列表
        const newsJsonStr = JSON.stringify(newsData, null, 2);
        await updateFile('src/admin/data/news.json', newsJsonStr,
            `📰 Admin: 更新新闻列表 (${today})`);
        results.push({ name: 'news.json', ok: true });
        UI.toast('📋 news.json 上传成功', 'success');

        // 2) 按 ID 推送每个详情（只推改动过的 — 下面简化版本全部推）
        if (newsDetailData && typeof newsDetailData === 'object') {
            // 构造 id 到 prefix 的映射（与 page.js 一致）
            const idToType = {};
            for (const cat of Object.keys(newsData)) {
                const prefix = (cat === 'notice') ? 'notice' : 'news';
                for (const item of (newsData[cat] || [])) {
                    if (item && item.id) idToType[item.id] = prefix;
                }
            }

            const ids = Object.keys(newsDetailData);
            let okCount = 0;
            let failCount = 0;
            for (const id of ids) {
                const type = idToType[id] || 'news';
                const safeId = id.replace(/[\\/:*?"<>|]/g, '_').substring(0, 200);
                const filePath = `src/admin/data/${type}/${safeId}.json`;

                // 从列表中拿 metadata
                let meta = null;
                for (const cat of Object.keys(newsData)) {
                    const found = (newsData[cat] || []).find(it => it.id === id);
                    if (found) { meta = found; break; }
                }

                const detailObj = {
                    key: type + ':' + id,
                    id: id,
                    title: meta ? meta.title : '',
                    date: meta ? meta.date : '',
                    iso: meta ? meta.iso : '',
                    category: meta ? meta.category : '',
                    type: meta ? meta.type : '',
                    body: newsDetailData[id],
                    updatedAt: new Date().toISOString()
                };

                try {
                    await updateFile(filePath, JSON.stringify(detailObj, null, 2),
                        `📄 Admin: 更新详情 ${safeId} (${today})`);
                    okCount++;
                } catch (e) {
                    console.warn('[publishNews] 详情推送失败：', filePath, e.message);
                    failCount++;
                }
            }
            results.push({ name: 'news-detail', ok: failCount === 0, okCount, failCount });
            UI.toast(`📄 详情推送: ${okCount} 成功, ${failCount} 失败`, failCount ? 'warn' : 'success');
        }

        // 3) 可选：同步最小版 src/data/news.js（仅含 newsList），供其他脚本 import
        try {
            // 仅保留精简 stub，不推送 detailBodies
            const newsJsStub = '/**\n * 精简版 — 仅含 newsList。详情以 admin/data/news-detail/<id>.json 为准。\n */\nexport const newsList = ' + JSON.stringify(newsData) + ';\n';
            await updateFile('src/data/news.js', newsJsStub,
                `📦 Admin: 同步 newsList 到 src/data/news.js (${today})`);
        } catch (e) {
            console.warn('[publishNews] src/data/news.js stub 同步失败：', e.message);
        }

        return results;
    }

    /**
     * 从 JS 源码字符串中提取指定 const 的对象字面量
     * 用于解析 news.js 现有的 detailBodies（支持带前缀 key 的对象）
     */
    function extractJsonObject(content, name) {
        const startIdx = content.indexOf('export const ' + name + ' = ');
        if (startIdx < 0) return null;
        let i = content.indexOf('{', startIdx);
        let depth = 0;
        let start = i;
        let inStr = false;
        let strCh = '';
        let esc = false;
        while (i < content.length) {
            const c = content[i];
            if (inStr) {
                if (esc) { esc = false; }
                else if (c === '\\') { esc = true; }
                else if (c === strCh) { inStr = false; }
            } else {
                if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; }
                else if (c === '{') depth++;
                else if (c === '}') { depth--; if (depth === 0) { break; } }
            }
            i++;
        }
        if (depth !== 0) return null;
        try {
            return JSON.parse(content.slice(start, i + 1));
        } catch (e) {
            console.warn('[extractJsonObject] 解析失败:', name, e.message);
            return null;
        }
    }

    /**
     * 发布页面模板（如 branches, events, wuxi-office 等嵌在 pages.js content HTML 里的）
     * 注意：pages.js 中的 .content 是 HTML 字符串，本函数假定 Store.pages 已是同样结构
     */
    async function publishPages() {
        const pagesData = window.Store.get('pages');
        if (!pagesData) throw new Error('pages 数据缺失');
        const f = await getFileContent('src/data/pages.js');
        if (!f.content) throw new Error('找不到 src/data/pages.js');
        const newContent = buildJsContent(f.content, { pageTemplates: pagesData });
        return await updateFile('src/data/pages.js', newContent,
            `📄 Admin: 更新页面模板 (${new Date().toISOString().slice(0,10)})`);
    }

    /**
     * 发布 site (导航 + 底部 + 联系方式)
     */
    async function publishSite() {
        const siteData = window.Store.get('site');
        if (!siteData) throw new Error('site 数据缺失');
        const f = await getFileContent('src/data/site.js');
        if (!f.content) throw new Error('找不到 src/data/site.js');
        const newContent = buildJsContent(f.content, { site: siteData });
        return await updateFile('src/data/site.js', newContent,
            `⚙ Admin: 更新站点配置 (${new Date().toISOString().slice(0,10)})`);
    }

    /**
     * 发布 navigation（topbar 导航）
     * 如果 navigation 已包含在 siteData.navigation 中，请使用 publishSite
     */
    async function publishNavigation() {
        const navData = window.Store.get('navigation');
        if (!navData) throw new Error('navigation 数据缺失');
        const f = await getFileContent('src/data/site.js');
        if (!f.content) throw new Error('找不到 src/data/site.js');
        // 替换 navigation + topLinks
        const site = window.Store.get('site') || JSON.parse(f.content.replace(/^[\s\S]*?export\s+const\s+site\s*=\s*/, '').replace(/;[\s\S]*$/, ''));
        site.navigation = navData.navigation || [];
        site.topLinks = navData.topLinks || [];
        const newContent = buildJsContent(f.content, { site });
        return await updateFile('src/data/site.js', newContent,
            `🧭 Admin: 更新顶部导航 (${new Date().toISOString().slice(0,10)})`);
    }

    /**
     * 发布 footer
     */
    async function publishFooter() {
        const footerData = window.Store.get('footer');
        if (!footerData) throw new Error('footer 数据缺失');
        const f = await getFileContent('src/data/site.js');
        if (!f.content) throw new Error('找不到 src/data/site.js');
        const site = window.Store.get('site') || JSON.parse(f.content.replace(/^[\s\S]*?export\ss+const\s+site\s*=\s*/, '').replace(/;[\s\S]*$/, ''));
        site.footer = {
            quickEntries: footerData.quickEntries || [],
            memberEntries: footerData.memberEntries || []
        };
        if (footerData.contact) site.contact = footerData.contact;
        if (footerData.copyright) site.copyright = footerData.copyright;
        if (footerData.slogan) site.slogan = footerData.slogan;
        const newContent = buildJsContent(f.content, { site });
        return await updateFile('src/data/site.js', newContent,
            `📞 Admin: 更新底部信息 (${new Date().toISOString().slice(0,10)})`);
    }

    /**
     * 发布详情（detailRecords + titleOverrides + contextualBodies）
     * 写到 src/data/details.js
     */
    async function publishDetails() {
        const detailsData = window.Store.get('details');
        const titleOverridesData = window.Store.get('titleOverrides');
        const contextualBodiesData = window.Store.get('contextualBodies');
        if (!detailsData) throw new Error('details 数据缺失');

        const f = await getFileContent('src/data/details.js');
        if (!f.content) throw new Error('找不到 src/data/details.js');

        const replacements = { detailRecords: detailsData };
        if (titleOverridesData) replacements.titleOverrides = titleOverridesData;
        if (contextualBodiesData) replacements.contextualBodies = contextualBodiesData;
        const newContent = buildJsContent(f.content, replacements);
        return await updateFile('src/data/details.js', newContent,
            `📋 Admin: 更新详情记录 (${new Date().toISOString().slice(0,10)})`);
    }

    /**
     * 通用工具：从 Store 取数据，生成独立的 data.js 文件内容
     * — 用于首次创建 / 全量覆盖场景
     */
    function buildStandaloneJs(headerComment, exportName, data) {
        const json = JSON.stringify(data, null, 2);
        return `/**\n * ${headerComment}\n */\nexport const ${exportName} = ${json};\n`;
    }

    async function publishStandards() {
        const data = window.Store.get('standards');
        if (!data) throw new Error('standards 数据缺失');
        const content = buildStandaloneJs(
            '政策标准数据 — 通过后台"政策标准"编辑器一键发布更新',
            'standardsList', data);
        return await updateFile('src/data/standards.js', content,
            `📋 Admin: 更新政策标准 (${new Date().toISOString().slice(0,10)})`);
    }

    async function publishEvents() {
        const data = window.Store.get('events');
        if (!data) throw new Error('events 数据缺失');
        const content = buildStandaloneJs(
            '展会活动数据 — 通过后台"展会活动"编辑器一键发布更新',
            'eventsList', data);
        return await updateFile('src/data/events.js', content,
            `🗓 Admin: 更新展会活动 (${new Date().toISOString().slice(0,10)})`);
    }

    async function publishMagazines() {
        const data = window.Store.get('magazines');
        if (!data) throw new Error('magazines 数据缺失');
        const content = buildStandaloneJs(
            '行业杂志数据 — 通过后台"行业杂志"编辑器一键发布更新',
            'magazinesList', data);
        return await updateFile('src/data/magazines.js', content,
            `📖 Admin: 更新行业杂志 (${new Date().toISOString().slice(0,10)})`);
    }

    async function publishBranches() {
        const data = window.Store.get('branches');
        if (!data) throw new Error('branches 数据缺失');
        const content = buildStandaloneJs(
            '分支机构数据 — 通过后台"分支机构"编辑器一键发布更新',
            'branchesData', data);
        return await updateFile('src/data/branches.js', content,
            `🏛 Admin: 更新分支机构 (${new Date().toISOString().slice(0,10)})`);
    }

    async function publishWuxiOffice() {
        const data = window.Store.get('wuxiOffice');
        if (!data) throw new Error('wuxiOffice 数据缺失');
        const content = buildStandaloneJs(
            '无锡办公室数据 — 通过后台"无锡办公室"编辑器一键发布更新',
            'wuxiOfficeData', data);
        return await updateFile('src/data/wuxiOffice.js', content,
            `🏢 Admin: 更新无锡办公室 (${new Date().toISOString().slice(0,10)})`);
    }

    async function publishDownloads() {
        const data = window.Store.get('downloads');
        if (!data) throw new Error('downloads 数据缺失');
        const content = buildStandaloneJs(
            '下载资料数据 — 通过后台"下载资料"编辑器一键发布更新',
            'downloadsList', data);
        return await updateFile('src/data/downloads.js', content,
            `📁 Admin: 更新下载资料 (${new Date().toISOString().slice(0,10)})`);
    }

    async function publishHomepage() {
        const data = window.Store.get('homepage');
        if (!data) throw new Error('homepage 数据缺失');
        const content = buildStandaloneJs(
            '首页内容数据 — 通过后台"首页内容"编辑器一键发布更新',
            'homepageData', data);
        return await updateFile('src/data/homepage.js', content,
            `🏠 Admin: 更新首页内容 (${new Date().toISOString().slice(0,10)})`);
    }

    /**
     * 一键发布 — 把所有本地编辑推到 GitHub
     */
    async function publishAll(opts = {}) {
        const results = [];
        const seq = [
            { name: 'news', run: publishNews, required: true },
            { name: 'details', run: publishDetails, required: false },
            { name: 'standards', run: publishStandards, required: false },
            { name: 'events', run: publishEvents, required: false },
            { name: 'magazines', run: publishMagazines, required: false },
            { name: 'branches', run: publishBranches, required: false },
            { name: 'wuxiOffice', run: publishWuxiOffice, required: false },
            { name: 'downloads', run: publishDownloads, required: false },
            { name: 'homepage', run: publishHomepage, required: false },
            { name: 'site', run: publishSite, required: false },
            { name: 'navigation', run: publishNavigation, required: false },
            { name: 'footer', run: publishFooter, required: false },
            { name: 'pages', run: publishPages, required: false }
        ];
        for (const s of seq) {
            if (opts[s.name] === false) continue;
            try {
                UI.toast(`正在发布 ${s.name}…`, '');
                const r = await s.run();
                results.push({ name: s.name, ok: true, sha: r.content && r.content.sha });
            } catch (e) {
                console.error(`publish ${s.name} failed:`, e);
                results.push({ name: s.name, ok: false, error: e.message });
                if (s.required) throw e;
            }
        }
        return results;
    }

    return {
        getConfig, setConfig, clearConfig, isConfigured,
        api, getFileContent, listDir, updateFile, uploadAsset, fileToBase64,
        saveNewsFormBackup, getNextNewsSeq,
        buildJsContent, buildStandaloneJs,
        publishNews, publishDetails, publishPages, publishSite, publishNavigation, publishFooter,
        publishStandards, publishEvents, publishMagazines, publishBranches,
        publishWuxiOffice, publishDownloads, publishHomepage,
        publishAll
    };
})();

/* 暴露到 window 对象，让非模块化页面（如 dashboard.html）也能直接使用 GitHub.xxx */
if (typeof window !== 'undefined') {
    window.GitHub = GitHub;
}