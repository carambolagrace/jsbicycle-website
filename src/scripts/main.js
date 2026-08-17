/**
 * 首页脚本 — Hero 轮播 / 新闻分类切换 / 锚点 toast
 * 依赖 utils/dom.js 中的通用工具
 */
import { qs, qsa, renderLayout, initNavigation, initSearch, showToast } from '../utils/dom.js';

renderLayout();
initNavigation();
initSearch();

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