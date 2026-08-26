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
              <a href="./page.html?page=news&cat=association">协会动态</a>
              <a href="./page.html?page=news&cat=industry">行业资讯</a>
              <a href="./page.html?page=news&cat=policy">政策动态</a>
              <a href="./page.html?page=news&cat=notice">通知公告</a>
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
        <form class="search-form" autocomplete="off">
          <input type="search" placeholder="输入关键词，例如：新国标、入会、展会" aria-label="搜索关键词" />
          <button type="submit">搜索 <span>↗</span></button>
        </form>
        <p class="search-hint">建议搜索：电池安全 · 团体标准 · 无锡展 · 会员申请</p>
        <div class="search-status" id="search-status"></div>
        <div class="search-results" id="search-results" aria-live="polite"></div>
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
 * 初始化搜索弹窗（真正从各 admin/data JSON 索引搜索）
 */
let SEARCH_INDEX_CACHE = null;

async function buildSearchIndex() {
    if (SEARCH_INDEX_CACHE) return SEARCH_INDEX_CACHE;
    const sources = [
        { url: './admin/data/news.json', category: 'news', categoryLabel: '新闻动态' },
        { url: './admin/data/standards.json', category: 'standards', categoryLabel: '政策标准' },
        { url: './admin/data/events.json', category: 'events', categoryLabel: '展会活动' },
        { url: './admin/data/branches.json', category: 'branches', categoryLabel: '分支机构' },
        { url: './admin/data/magazines.json', category: 'magazines', categoryLabel: '行业杂志' },
        { url: './admin/data/downloads.json', category: 'downloads', categoryLabel: '资料下载' },
        { url: './admin/data/wuxiOffice.json', category: 'wuxiOffice', categoryLabel: '无锡办公室' },
        { url: './admin/data/pages.json', category: 'pages', categoryLabel: '栏目页' }
    ];
    const all = [];
    for (const src of sources) {
        try {
            const res = await fetch(src.url, { cache: 'no-cache' });
            if (!res.ok) continue;
            const data = await res.json();
            if (Array.isArray(data)) {
                data.forEach(item => {
                    const title = item.title || item.name || item.id || '(无标题)';
                    const summary = item.summary || item.description || item.content || '';
                    const id = item.id || item.key || title;
                    all.push({
                        title: String(title),
                        summary: String(summary).substring(0, 200),
                        url: item.url || ('./detail.html?type=' + src.category + '&id=' + encodeURIComponent(id)),
                        category: src.category,
                        categoryLabel: src.categoryLabel
                    });
                });
            }
        } catch (e) { /* ignore */ }
    }
    SEARCH_INDEX_CACHE = all;
    return all;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function highlight(text, keyword) {
    if (!keyword) return escapeHtml(text);
    const re = new RegExp('(' + keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + ')', 'gi');
    return escapeHtml(text).replace(re, '<mark>$1</mark>');
}

function searchIndex(index, keyword, maxResults) {
    if (!index || !keyword) return [];
    const k = keyword.toLowerCase();
    const results = [];
    for (const item of index) {
        const t = (item.title || '').toLowerCase();
        const s = (item.summary || '').toLowerCase();
        const inTitle = t.indexOf(k) >= 0;
        const inSummary = s.indexOf(k) >= 0;
        if (inTitle || inSummary) {
            const score = (inTitle ? 10 : 0) + (inSummary ? 1 : 0);
            results.push(Object.assign({}, item, { score: score }));
        }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxResults || 20);
}

function renderSearchResults(results, keyword) {
    const list = qs('#search-results');
    if (!list) return;
    if (results.length === 0) {
        list.innerHTML = '<div class="search-empty">未找到与 “' + escapeHtml(keyword) + '” 相关的内容，请尝试其他关键词。</div>';
        return;
    }
    list.innerHTML = results.map(r =>
        '<a class="search-result-item" href="' + r.url + '">' +
        '<span class="search-result-cat">' + escapeHtml(r.categoryLabel) + '</span>' +
        '<h3 class="search-result-title">' + highlight(r.title, keyword) + '</h3>' +
        '<p class="search-result-summary">' + highlight(r.summary, keyword) + '</p>' +
        '<span class="search-result-arrow">查看详情 ↗</span>' +
        '</a>'
    ).join('');
}

export function initSearch() {
    const searchModal = qs('.search-modal');
    const searchInput = qs('.search-form input');
    const searchForm = qs('.search-form');
    const resultsBox = qs('#search-results');
    const statusBox = qs('#search-status');
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
    qs('.document-search')?.addEventListener('click', open);

    let debounceTimer = null;
    const doSearch = async (raw) => {
        const keyword = (raw || '').trim();
        if (!keyword) {
            if (resultsBox) resultsBox.innerHTML = '';
            if (statusBox) statusBox.textContent = '提示：输入关键词后会从所有内容中搜索。';
            return;
        }
        if (keyword.length < 2) {
            if (resultsBox) resultsBox.innerHTML = '';
            if (statusBox) statusBox.textContent = '请输入至少 2 个字符…';
            return;
        }
        if (statusBox) statusBox.textContent = '搜索中…';
        const index = await buildSearchIndex();
        const results = searchIndex(index, keyword, 20);
        if (statusBox) statusBox.textContent = '共找到 ' + results.length + ' 条结果';
        renderSearchResults(results, keyword);
    };
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const v = e.target.value;
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => doSearch(v), 250);
        });
    }
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (searchInput) doSearch(searchInput.value);
        });
    }
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