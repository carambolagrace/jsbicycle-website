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

    function utf8ToBase64(str) {
        // 处理非 ASCII 字符
        return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
    }

    /**
     * 把 news / newsDetail / pages / site / etc 数据转回 src/data/*.js 格式
     * 这是一个简化版本：识别 export const NAME = { ... }; 块并替换
     */
    function buildJsContent(original, replacements) {
        let result = original;
        for (const [name, newValue] of Object.entries(replacements)) {
            const newJson = JSON.stringify(newValue, null, 2);
            // 匹配 export const NAME = {...}; 或 const NAME = {...};
            // 用 [\s\S]*? 非贪婪匹配第一个 ; 之前的内容
            const re = new RegExp(
                `(export\\s+)?const\\s+${name}\\s*=\\s*[\\s\\S]*?;`,
                'm'
            );
            if (re.test(result)) {
                result = result.replace(
                    re,
                    `export const ${name} = ${newJson};`
                );
            } else {
                // 不存在则追加
                result += `\nexport const ${name} = ${newJson};\n`;
            }
        }
        return result;
    }

    async function getFileContent(path) {
        try {
            const data = await api('GET', `/repos/{owner}/{repo}/contents/${encodeURI(path)}`.replace('{owner}', getConfig().owner).replace('{repo}', getConfig().repo));
            return {
                content: decodeURIComponent(escape(atob(data.content.replace(/\n/g, '')))),
                sha: data.sha
            };
        } catch (e) {
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
     * 把 Admin 数据发布到 src/data/*.js
     * 触发 GitHub commit → Netlify 自动部署
     */
    async function publishNews() {
        const newsData = window.Store.get('news');
        const newsDetailData = window.Store.get('newsDetail');
        if (!newsData || !newsDetailData) throw new Error('新闻数据缺失');

        // 读取现有 news.js
        const newsFile = await getFileContent('src/data/news.js');
        if (!newsFile.content) throw new Error('找不到 src/data/news.js');
        // 替换 newsList + detailBodies
        const newContent = buildJsContent(newsFile.content, {
            newsList: newsData,
            detailBodies: newsDetailData
        });
        // 上传
        const res = await updateFile('src/data/news.js', newContent,
            `📰 Admin: 更新新闻资讯 (${new Date().toISOString().slice(0,10)})`);
        return res;
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
        api, getFileContent, updateFile, buildJsContent, buildStandaloneJs,
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