/**
 * 后台认证
 * 默认账号: admin / jsbicycle2026
 * 用 sessionStorage，关闭浏览器后失效
 */
const AUTH = (() => {
    const KEY = 'admin_auth';
    const VALID = [
        { u: 'admin', p: 'jsbicycle2026' }
    ];

    function isLoggedIn() {
        return sessionStorage.getItem(KEY) === '1';
    }
    // 动态定位后台登录页：兼容 /admin/ 下任意层级页面与子路径部署
    function loginPageUrl() {
        const path = location.pathname;
        const idx = path.indexOf('/admin/');
        return (idx >= 0 ? path.substring(0, idx) : '') + '/admin/index.html';
    }
    function login(username, password) {
        const ok = VALID.some(v => v.u === username && v.p === password);
        if (ok) sessionStorage.setItem(KEY, '1');
        return ok;
    }
    function logout() {
        sessionStorage.removeItem(KEY);
        location.href = loginPageUrl();
    }
    function guard() {
        if (!isLoggedIn()) {
            location.href = loginPageUrl();
        }
    }
    return { isLoggedIn, login, logout, guard };
})();