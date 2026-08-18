/**
 * 详情页脚本 — 通过 ?type=&id= 精准路由到正文
 */
import { qs, qsa, renderLayout, initNavigation, initSearch, initActionButtons } from '../utils/dom.js';
import { detailRecords, titleOverrides, contextualBodies } from '../data/details.js';
import { detailBodies } from '../data/news.js';

renderLayout();
initNavigation();
initSearch();
initActionButtons();

const params = new URLSearchParams(window.location.search);
const type = params.get('type') || 'news';
const id = params.get('id') || '';
const record = { ...(detailRecords[type] || detailRecords.news) };

if (titleOverrides[id]) record.title = titleOverrides[id];

const contextualBody = contextualBodies[`${type}:${id}`] || detailBodies[`${type}:${id}`];
if (contextualBody) record.body = contextualBody;

document.title = `${record.title}｜江苏省自行车电动车协会`;
qs('#detail-type').textContent = record.label;
qs('#detail-title').textContent = record.title;
qs('#detail-meta').innerHTML = `<span>江苏省自行车电动车协会</span><span>${record.date}</span><span>阅读 1280</span>`;
qs('#detail-content').innerHTML = record.body;

const parentLink = qs('#detail-parent-link');
parentLink.textContent = record.parent;
parentLink.href = `./page.html?page=${record.page}`;

const backLink = qs('#back-list-link');
backLink.href = `./page.html?page=${record.page}`;

qs(`[data-nav="${record.page}"]`)?.classList.add('active');

// 杂志详情 — 跳转翻页式电子书阅读器
if (type === 'magazine') {
  const targetMag = 'magazine-viewer.html?id=' + (id === 'chinabike' ? 'chinabike' : 'jsbicycle');
  qsa('.download-action, .register-action').forEach((button) => {
    button.addEventListener('click', () => { window.location.href = targetMag; });
  });
} else {
  qsa('.download-action, .register-action').forEach((button) => {
    button.addEventListener('click', () => {
      showToast(button.classList.contains('download-action') ? '演示版文件下载入口已触发' : '参会或服务意向已登记');
    });
  });
}