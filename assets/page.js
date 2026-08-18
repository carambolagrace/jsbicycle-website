/**
 * 栏目页脚本 — 渲染对应 ?page= 内容、筛选器交互
 */
import { qs, qsa, renderLayout, initNavigation, initSearch, initActionButtons, showToast } from '../utils/dom.js';
import { pageTemplates } from '../data/pages.js';
import { newsList } from '../data/news.js';

renderLayout();
initNavigation();
initSearch();
initActionButtons();

const pageKey = new URLSearchParams(window.location.search).get('page') || 'news';
const pageData = pageTemplates[pageKey] || pageTemplates.news;
document.title = `${pageData.title}｜江苏省自行车电动车协会`;

const breadcrumbTitle = qs('#breadcrumb-title');
const pageKicker = qs('#page-kicker');
const pageTitle = qs('#page-title');
const pageDescription = qs('#page-description');
const pageMark = qs('#page-mark');
const pageContent = qs('#page-content');

if (breadcrumbTitle) breadcrumbTitle.textContent = pageData.title;
if (pageKicker) pageKicker.textContent = pageData.kicker;
if (pageTitle) pageTitle.textContent = pageData.title;
if (pageDescription) pageDescription.textContent = pageData.description;
if (pageMark) pageMark.textContent = pageData.mark;
if (pageContent) pageContent.innerHTML = pageData.content;

qs(`[data-nav="${pageKey}"]`)?.classList.add('active');

/* ---------- 新闻动态列表渲染 ---------- */
if (pageKey === 'news') {
  const articleList = qs('#article-list');
  if (articleList) {
    const allNews = [
      ...newsList.association.map((item) => ({ ...item, type: 'association' })),
      ...newsList.industry.map((item) => ({ ...item, type: 'industry' })),
      ...newsList.policy.map((item) => ({ ...item, type: 'policy' })),
      ...newsList.notice.map((item) => ({ ...item, type: 'notice' }))
    ];
    articleList.innerHTML = allNews.map((item) => {
      const detailType = item.type === 'notice' ? 'notice' : 'news';
      return `
      <a data-type="${item.type}" href="./detail.html?type=${detailType}&id=${item.id}">
        <time><b>${item.date.split('.')[1]}</b><span>${item.iso.slice(0, 4) + '.' + item.date.split('.')[0]}</span></time>
        <div><i>${item.type === 'notice' ? item.category : item.type}</i><h3>${item.title}</h3><p>${item.category} · ${item.iso}</p></div>
        <strong>↗</strong>
      </a>
    `;
    }).join('');
  }
}

/* ---------- 新闻分类筛选 ---------- */
qsa('.filter-chip').forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  qsa('.filter-chip').forEach((item) => item.classList.toggle('active', item === button));
  qsa('#article-list > a').forEach((item) => {
    item.style.display = filter === 'all' || item.dataset.type === filter ? 'grid' : 'none';
  });
}));

/* ---------- 标准检索提交 ---------- */
qs('#document-filter')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const keyword = qs('input', event.currentTarget).value.trim();
  showToast(keyword ? `正在检索"${keyword}"相关文件` : '请输入标准编号或关键词');
});