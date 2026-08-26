/**
 * 首页脚本 — Hero 轮播 / 新闻分类切换 / 锚点 toast
 * 首页内容（重要声明、Hero 文案、快捷链接）从 homepageData 读取，后台"首页内容"编辑器一键发布可更新
 */
import { qs, qsa, renderLayout, initNavigation, initSearch, showToast } from '../utils/dom.js';
import { homepageData } from '../data/homepage.js';

renderLayout();
initNavigation();
initSearch();

/* ---------- 从 homepageData 填充关键字段 ---------- */
const hero = homepageData?.hero || {};
const focus = homepageData?.focus || {};
const quickLinks = homepageData?.quickLinks || [];

const eyebrowText = qs('#hero-eyebrow-text');
if (eyebrowText && hero.eyebrow) eyebrowText.textContent = hero.eyebrow;

const heroTitleEl = qs('#hero-title');
if (heroTitleEl && hero.title) heroTitleEl.innerHTML = hero.title;

const heroDescEl = qs('#hero-description');
if (heroDescEl && hero.description) heroDescEl.textContent = hero.description;

const focusTag = qs('#hero-focus-tag');
if (focusTag && focus.tag) focusTag.textContent = focus.tag;

const focusTitle = qs('#hero-focus-title');
if (focusTitle && focus.title) focusTitle.textContent = focus.title;

const focusBody = qs('#hero-focus-body');
if (focusBody && focus.body) focusBody.textContent = focus.body;

const focusLink = qs('#hero-focus-link');
if (focusLink) {
  if (focus.url) focusLink.setAttribute('href', focus.url);
  if (focus.linkText) {
    focusLink.innerHTML = `${focus.linkText} <span>↗</span>`;
  }
}

/* ---------- 快捷链接动态渲染 ---------- */
const quickLinksSection = qs('#quick-links-section');
const ICONS = {
  member: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 19c.7-3.1 2.9-4.7 6.5-4.7s5.8 1.6 6.5 4.7"></path></svg>',
  standard: '<svg viewBox="0 0 24 24"><path d="M5 4.5h14v15H5z"></path><path d="M8.5 8h7M8.5 12h7M8.5 16h4"></path></svg>',
  event: '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="1.5"></rect><path d="M8 3.5v4M16 3.5v4M4 10h16"></path></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 4v11M8.5 11.5 12 15l3.5-3.5M5 19.5h14"></path></svg>',
  contact: '<svg viewBox="0 0 24 24"><path d="M5.5 5.5h13v10h-7l-4 3v-3h-2z"></path><path d="M8.5 9.5h7M8.5 12.5h4"></path></svg>'
};
const ICON_KEY_BY_HINT = (link) => {
  const t = `${link.title || ''} ${link.sub || ''}`;
  if (/会员|入会/.test(t)) return 'member';
  if (/标准|法规/.test(t)) return 'standard';
  if (/展会|活动|报名|会议/.test(t)) return 'event';
  if (/下载|资料|文件/.test(t)) return 'download';
  if (/联系|电话|邮箱|地址/.test(t)) return 'contact';
  return 'member';
};
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
if (quickLinksSection && quickLinks.length) {
  quickLinksSection.innerHTML = quickLinks.map((l) => {
    const key = ICON_KEY_BY_HINT(l);
    return `
      <a class="quick-link" href="${esc(l.href || '#')}">
        <span class="quick-icon icon-${key}">${ICONS[key]}</span>
        <span><strong>${esc(l.title)}</strong><small>${esc(l.sub || '')}</small></span><b>↗</b>
      </a>
    `;
  }).join('');
}

/* ---------- Hero 焦点图轮播 ---------- */
const slides = [
  {
    title: '以标准凝聚产业<br /><em>向绿色出行</em>的未来',
    description: '立足江苏、服务行业，链接政府、企业与市场，为自行车和电动车产业的高质量发展提供专业支撑。'
  },
  {
    title: '让行业连接更高效<br /><em>让会员服务更近</em>',
    description: '从入会申请到标准协同，从行业会议到品牌展会，协会为会员企业提供更清晰、更专业的服务入口。'
  },
  {
    title: '共建安全有序<br /><em>共享绿色出行</em>',
    description: '坚持行业自律与开放协作，推动产业向安全、智能、低碳与高质量方向持续升级。'
  }
];
const heroTitle = qs('#hero-title');
const heroDescription = qs('#hero-description');
const heroDots = qsa('.hero-dot');
const heroBackgrounds = qsa('.hero-background');
let currentSlide = 0;
let slideTimer;

function setSlide(index) {
  currentSlide = index;
  const slide = slides[index];
  if (heroTitle) heroTitle.innerHTML = slide.title;
  if (heroDescription) heroDescription.textContent = slide.description;
  heroDots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
  heroBackgrounds.forEach((background, backgroundIndex) => {
    const visible = backgroundIndex === index % 2;
    background.style.opacity = visible ? '1' : '0';
    background.style.transform = visible ? 'scale(1.04)' : 'scale(1)';
  });
}
function startSlideTimer() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(() => setSlide((currentSlide + 1) % slides.length), 7000);
}
heroDots.forEach((dot) => dot.addEventListener('click', () => {
  setSlide(Number(dot.dataset.slide));
  startSlideTimer();
}));
if (heroTitle && heroDescription && heroDots.length) startSlideTimer();

/* ---------- 新闻分类切换 ---------- */
const newsTabs = qsa('.news-tab');
const newsLists = qsa('.news-list');
newsTabs.forEach((tab) => tab.addEventListener('click', () => {
  const category = tab.dataset.category;
  newsTabs.forEach((item) => item.classList.toggle('active', item === tab));
  newsLists.forEach((list) => list.classList.toggle('hidden', list.dataset.list !== category));
}));

/* ---------- 锚点滚动提示 ---------- */
qsa('a[href="#news"], a[href="#standards"], a[href="#events"], a[href="#membership"], a[href="#services"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (link.closest('.nav-link')) return;
    window.setTimeout(() => showToast('演示页面已定位到对应服务模块'), 450);
  });
});

/* ---------- CEB 展会矩阵：后端接口取数（失败回退本地静态数据） ---------- */
import { eventsList } from '../data/events.js';
// 后端接口地址：本地联调指向 Spring Boot (8080)，生产上线时替换为正式域名
const EVENTS_API = 'http://localhost:8080/api/events';
const expoCards = qs('#expo-cards');
const STAT_LABELS = { area: '展出面积', exhibitors: '参展企业', visitors: '参观人次', booths: '标准展位' };

// 长标题在“及/与”处断行，与原有卡片排版保持一致
function expoTitleHtml(shortTitle) {
  const t = esc(shortTitle);
  return t.length > 12 ? t.replace(/(及|与)/, '$1<br/>') : t;
}

function renderExpoCards(list) {
  if (!expoCards) return;
  if (!list || !list.length) {
    expoCards.innerHTML = '<p class="empty" style="padding:24px;text-align:center;color:#8a97a8">暂无展会信息</p>';
    return;
  }
  expoCards.innerHTML = list.map((ev) => {
    const stats = ev.stats || {};
    const statKeys = Object.keys(STAT_LABELS).filter((k) => stats[k]);
    const statsHtml = statKeys.map((k) => {
      const v = String(stats[k]);
      const m = v.match(/^([\d,.]+[+]?)(.*)$/);
      const num = m ? m[1] : v;
      const unit = m ? m[2] : '';
      return `<div><strong>${esc(num)}${unit ? '<small>' + esc(unit) + '</small>' : ''}</strong><span>${STAT_LABELS[k]}</span></div>`;
    }).join('');
    const status = esc(ev.status || '');
    return `
      <a class="expo-card" href="./detail.html?type=event&id=${esc(ev.id)}">
        <div class="expo-card-left">
          <span class="expo-label">${esc(ev.series || '')} · 第${esc(ev.edition || '')}</span>
          <h3>${expoTitleHtml(ev.short_title || ev.title || '')}</h3>
          ${ev.theme ? `<p class="expo-theme">${esc(ev.theme)}</p>` : ''}
          <div class="expo-meta"><span>${esc(ev.date || '')}</span><span>${esc(ev.location || '')}</span></div>
          <span class="expo-status${status === '报名中' ? ' open' : ''}">${status}</span>
        </div>
        <div class="expo-card-right">
          <div class="expo-stats">${statsHtml}</div>
          <p>${esc(ev.description || '')}</p>
          <span class="expo-action">查看展会详情 <span>↗</span></span>
        </div>
      </a>
    `;
  }).join('');
}

(async () => {
  try {
    const res = await fetch(EVENTS_API);
    if (res.ok) {
      renderExpoCards(await res.json());
      return;
    }
    throw new Error('HTTP ' + res.status);
  } catch (err) {
    console.warn('[expo] 后端接口不可用，使用本地数据', err);
    renderExpoCards(eventsList);
  }
})();