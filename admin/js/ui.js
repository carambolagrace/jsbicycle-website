/**
 * 通用 UI 工具
 */
const UI = (() => {
    function toast(msg, type = '') {
        let t = document.getElementById('toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'toast';
            t.className = 'toast';
            document.body.appendChild(t);
        }
        t.className = 'toast ' + type;
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('show'), 2400);
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function escapeAttr(s) { return escapeHtml(s); }

    function formatDate(iso) {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return iso;
            return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
        } catch (e) { return iso; }
    }

    function todayISO() {
        const d = new Date();
        return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
    }

    /** 简单 slug 生成 */
    function slugify(s) {
        return String(s || '').toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60) || ('item-' + Date.now());
    }

    /** 把 "2026.07.22" → "07.22" */
    function shortDate(iso) {
        if (!iso) return '';
        const m = String(iso).match(/\d{2}\.\d{2}$/);
        return m ? m[0] : iso;
    }

    /** 文件 → base64 (用于图片上传) */
    function fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }

    /** 简单确认对话框 */
    function confirm(msg) { return window.confirm(msg); }

    return { toast, escapeHtml, escapeAttr, formatDate, todayISO, slugify, shortDate, fileToDataURL, confirm };
})();