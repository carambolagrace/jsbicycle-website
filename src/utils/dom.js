/**
 * 通用 DOM 工具与全站脚本初始化
 */

/* 元素查询 */
export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/* 站点信息注入 */
export const siteConfig = {
  name: '江苏省自行车电动车协会',
  foundedYear: 1985
};

/**
 * 渲染顶部联系条 + 品牌头 + 主导航 + 页脚
 * 调用后，所有页面共用相同的顶部与底部
 */
export function renderLayout() {
  const headerHTML = `
    <div class="topline">
      <div class="container topline-inner">
        <span>江苏省自行车电动车协会 · 中国自行车协会助力车专业委员会</span>
        <div class="topline-links">
          <a href="./page.html?page=about">协会简介</a>
          <span class="topline-separator"></span>
          <a href="./page.html?page=about#contact-info">联系我们</a>
          <span class="topline-separator"></span>
          <a href="./page.html?page=membership">会员入口</a>
        </div>
      </div>
    </div>

    <header class="site-header" id="top">
      <div class="container header-inner">
        <a class="brand" href="./index.html" aria-label="江苏省自行车电动车协会首页">
          <img src="./logo.jpg" alt="江苏省自行车电动车协会标志" />
          <span class="brand-text">
            <strong>江苏省自行车电动车协会</strong>
            <small>JIANGSU BICYCLE &amp; ELECTRIC VEHICLE ASSOCIATION</small>
          </span>
        </a>

        <button class="menu-toggle" type="button" aria-label="打开菜单" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>

        <nav class="main-nav" aria-label="主导航">
          <div class="nav-item"><a class="nav-link active" href="./index.html">首页</a></div>
          <div class="nav-item has-children">
            <a class="nav-link" href="./page.html?page=about">协会之窗<span class="chevron">▾</span></a>
            <div class="nav-sub">
              <a href="./detail.html?type=about&id=intro">协会简介</a>
              <a href="./detail.html?type=charter&id=charter">协会章程</a>
              <a href="./page.html?page=membership#members">会员名录</a>
              <a href="./page.html?page=branches#charging">分支机构</a>
              <a href="./page.html?page=wuxi-office">无锡市电动车行业办公室</a>
            </div>
          </div>
          <div class="nav-item has-children">
            <a class="nav-link" href="./page.html?page=standards">行业服务<span class="chevron">▾</span></a>
            <div class="nav-sub">
              <a href="./page.html?page=standards">政策标准</a>
              <a href="./page.html?page=events">展会资讯</a>
              <a href="./index.html#testing">CCC 检测认证</a>
            </div>
          </div>
          <div class="nav-item has-children">
            <a class="nav-link" href="./page.html?page=membership">会员服务<span class="chevron">▾</span></a>
            <div class="nav-sub">
              <a href="./page.html?page=membership#join">入会申请</a>
              <a href="./page.html?page=membership#process">入会流程</a>
              <a href="./detail.html?type=charter&id=charter">协会章程</a>
              <a href="./page.html?page=membership#members">会员单位</a>
            </div>
          </div>
          <div class="nav-item has-children">
            <a class="nav-link" href="./page.html?page=news">资讯动态<span class="chevron">▾</span></a>
            <div class="nav-sub">
              <a href="./page.html?page=news">协会动态</a>
              <a href="./page.html?page=news">行业资讯</a>
              <a href="./page.html?page=standards">政策动态</a>
              <a href="./page.html?page=services">通知公告</a>
            </div>
          </div>
          <div class="nav-item has-children">
            <a class="nav-link" href="./page.html?page=magazines">行业杂志<span class="chevron">▾</span></a>
            <div class="nav-sub">
              <a href="./detail.html?type=magazine&id=jsbicycle">《江苏省自行车》</a>
              <a href="./detail.html?type=magazine&id=chinabike">《中国电动自行车网》</a>
            </div>
          </div>
        </nav>

        <button class="search-button" type="button" aria-label="打开站内搜索">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 5 5"></path></svg>
        </button>
      </div>
    </header>
  `;

  const footerHTML = `
    <footer class="site-footer" id="contact">
      <div class="container footer-main">
        <div class="footer-brand"><div class="footer-mark">JBEA</div><h3>江苏省自行车电动车协会</h3><p>连接产业 · 服务会员 · 共创未来</p></div>
        <div class="footer-column"><h4>快速入口</h4>
          <a href="./page.html?page=about">协会之窗</a>
          <a href="./page.html?page=news">新闻动态</a>
          <a href="./page.html?page=standards">政策标准</a>
          <a href="./page.html?page=events">展会活动</a>
        </div>
        <div class="footer-column"><h4>会员服务</h4>
          <a href="./page.html?page=membership">入会申请</a>
          <a href="./page.html?page=membership">会员权益</a>
          <a href="./page.html?page=services">资料下载</a>
          <a href="./page.html?page=about#contact-info">联系协会</a>
        </div>
        <div class="footer-column"><h4>合作伙伴</h4>
          <a href="https://www.china-bicycle.com/" target="_blank" rel="noopener">中国自行车协会</a>
          <a href="https://www.jsbicycle.com/" target="_blank" rel="noopener">江苏省自行车有限公司</a>
          <a href="https://www.chinaebike.net/" target="_blank" rel="noopener">CEB中国电动车网</a>
          <a href="https://www.cti-cert.com/" target="_blank" rel="noopener">华测检测认证集团股份有限公司</a>
        </div>
        <div class="footer-contact"><h4>联系我们</h4>
          <p>0510-85055112 / 85051427</p>
          <p>jbea@jsbicycle.com</p>
          <p>江苏省无锡市清扬路七号11层</p>
        </div>
        <div class="footer-qr">
          <div class="qr-placeholder"><img src="./qrcode.jpg" alt="江苏省自行车电动车协会公众号二维码" /></div>
          <p>关注协会公众号</p>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© <span id="current-year">2026</span> 江苏省自行车电动车协会 版权所有</span>
        <span>苏ICP备2022003366号</span>
        <a href="#top">返回顶部 ↑</a>
      </div>
    </footer>
  `;

  const searchModalBlock = `
    <div class="search-modal" aria-hidden="true">
      <div class="search-modal-backdrop"></div>
      <div class="search-modal-card">
        <button class="modal-close" type="button" aria-label="关闭搜索">×</button>
        <p class="section-kicker">SEARCH / 站内搜索</p>
        <h2>查找协会内容</h2>
        <form class="search-form">
          <input type="search" placeholder="输入关键词，例如：新国标、入会、展会" aria-label="搜索关键词" />
          <button type="submit">搜索 <span>↗</span></button>
        </form>
        <p class="search-hint">建议搜索：电池安全 · 团体标准 · 无锡展 · 会员申请</p>
      </div>
    </div>
    <div class="toast" role="status" aria-live="polite"></div>
    <button class="back-to-top" type="button" aria-label="返回顶部">↑</button>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML);
  document.body.insertAdjacentHTML('beforeend', searchModalBlock);
}

/**
 * 初始化顶部导航、菜单切换、滚动行为
 */
export function initNavigation() {
  const menuToggle = qs('.menu-toggle');
  const mainNav = qs('.main-nav');
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.classList.toggle('is-open');
    mainNav?.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  qsa('.nav-link, .main-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle?.classList.remove('is-open');
      mainNav?.classList.remove('is-open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  const backToTop = qs('.back-to-top');
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 480);
  }, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const currentYear = qs('#current-year');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
}

/**
 * 初始化搜索弹窗
 */
export function initSearch() {
  const searchModal = qs('.search-modal');
  const searchInput = qs('.search-form input');
  const open = () => {
    searchModal?.classList.add('is-open');
    searchModal?.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => searchInput?.focus(), 180);
  };
  const close = () => {
    searchModal?.classList.remove('is-open');
    searchModal?.setAttribute('aria-hidden', 'true');
  };
  qs('.search-button')?.addEventListener('click', open);
  qs('.modal-close')?.addEventListener('click', close);
  qs('.search-modal-backdrop')?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  qs('.search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const keyword = searchInput?.value.trim();
    if (!keyword) { showToast('请输入要搜索的关键词'); return; }
    close();
    showToast(`已为你准备"${keyword}"的搜索结果`);
  });
  qs('.document-search')?.addEventListener('click', open);
}

/**
 * Toast 通知
 */
let toastTimer;
export function showToast(message) {
  const toast = qs('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

/**
 * 初始化动作按钮的 toast 提示（详情页下载/参会按钮）
 */
export function initActionButtons() {
  qsa('.download-action, .register-action').forEach((button) => {
    button.addEventListener('click', () => {
      showToast(button.classList.contains('download-action') ? '演示版文件下载入口已触发' : '参会或服务意向已登记');
    });
  });
}