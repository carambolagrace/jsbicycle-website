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
    function login(username, password) {
        const ok = VALID.some(v => v.u === username && v.p === password);
        if (ok) sessionStorage.setItem(KEY, '1');
        return ok;
    }
    function logout() {
        sessionStorage.removeItem(KEY);
        location.href = '../admin/index.html';
    }
    function guard() {
        if (!isLoggedIn()) {
            location.href = '../admin/index.html';
        }
    }
    return { isLoggedIn, login, logout, guard };
})();