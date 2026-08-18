/**
 * 数据存储 — LocalStorage 封装
 * 每个模块对应一个 key
 *
 * 用法:
 *   Store.loadAll()              // 从 fetch JSON 加载所有模块到 LocalStorage
 *   Store.get('news')            // 获取
 *   Store.set('news', data)      // 保存
 *   Store.exportKey('news')      // 导出单个模块为 JSON 文件
 *   Store.exportAll()            // 导出全部为 JSON 文件
 *   Store.reset('news')          // 还原为初始数据
 */
const Store = (() => {
    const KEYS = {
        news: 'admin_news',
        newsDetail: 'admin_newsDetail',
        events: 'admin_events',
        magazines: 'admin_magazines',
        standards: 'admin_standards',
        branches: 'admin_branches',
        wuxiOffice: 'admin_wuxi_office',
        downloads: 'admin_downloads',
        homepage: 'admin_homepage',
        navigation: 'admin_navigation',
        footer: 'admin_footer',
        pages: 'admin_pages',
        details: 'admin_details',
        site: 'admin_site',
        titleOverrides: 'admin_titleOverrides',
        contextualBodies: 'admin_contextualBodies'
    };
    const META = 'admin_meta';  // 存储初始化时间

    function get(key) {
        try {
            const raw = localStorage.getItem(KEYS[key] || key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }
    function set(key, value) {
        localStorage.setItem(KEYS[key] || key, JSON.stringify(value));
    }
    function remove(key) {
        localStorage.removeItem(KEYS[key] || key);
    }
    function has(key) {
        return localStorage.getItem(KEYS[key] || key) !== null;
    }

    /** 从 ../data/*.json 加载所有模块到 LocalStorage（仅当 LocalStorage 为空） */
    async function loadAll() {
        const tasks = [];
        for (const [key, storeKey] of Object.entries(KEYS)) {
            if (!has(key)) {
                tasks.push(loadOne(key));
            }
        }
        await Promise.all(tasks);
        if (!localStorage.getItem(META)) {
            localStorage.setItem(META, JSON.stringify({ loadedAt: new Date().toISOString() }));
        }
    }
    async function loadOne(key) {
        try {
            const r = await fetch(`../admin/data/${key}.json?_=${Date.now()}`);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const data = await r.json();
            set(key, data);
            return data;
        } catch (e) {
            console.warn(`Failed to load ${key}:`, e.message);
            return null;
        }
    }

    /** 强制从远端 JSON 重新加载（覆盖 LocalStorage） */
    async function refreshAll() {
        for (const key of Object.keys(KEYS)) {
            await loadOne(key);
        }
    }

    /** 重置某个模块为远端默认 */
    async function reset(key) {
        remove(key);
        await loadOne(key);
    }

    /** 导出单个模块为 JSON 文件下载 */
    function exportKey(key) {
        const data = get(key);
        if (!data) { UI.toast(`模块 ${key} 为空`, 'error'); return; }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        download(blob, `${key}.json`);
    }

    /** 导出全部模块为一个合并的 JSON 文件 */
    function exportAll() {
        const all = {};
        let count = 0;
        for (const key of Object.keys(KEYS)) {
            const data = get(key);
            if (data) { all[key] = data; count++; }
        }
        if (count === 0) { UI.toast('没有数据可导出', 'error'); return; }
        all._exportedAt = new Date().toISOString();
        const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
        const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
        download(blob, `jbbea-admin-${stamp}.json`);
    }

    /** 把模块数据导入 LocalStorage（用于恢复） */
    async function importJson(file, key) {
        const text = await file.text();
        try {
            const data = JSON.parse(text);
            if (key) {
                set(key, data);
            } else {
                // 整包导入
                for (const [k, v] of Object.entries(data)) {
                    if (k.startsWith('_')) continue;
                    if (KEYS[k]) set(k, v);
                }
            }
            return true;
        } catch (e) {
            UI.toast('JSON 解析失败: ' + e.message, 'error');
            return false;
        }
    }

    function download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 500);
    }

    return {
        KEYS, get, set, remove, has,
        loadAll, loadOne, refreshAll, reset,
        exportKey, exportAll, importJson
    };
})();