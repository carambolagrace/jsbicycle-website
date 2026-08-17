const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const menuToggle = qs('.menu-toggle');
const mainNav = qs('.main-nav');
menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.classList.toggle('is-open');
  mainNav.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

qsa('.nav-link, .main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle?.classList.remove('is-open');
    mainNav?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

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
  heroTitle.innerHTML = slide.title;
  heroDescription.textContent = slide.description;
  heroDots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
  heroBackgrounds.forEach((background, backgroundIndex) => {
    background.style.opacity = backgroundIndex === index % 2 ? '1' : '0';
    background.style.transform = backgroundIndex === index % 2 ? 'scale(1.04)' : 'scale(1)';
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

const newsTabs = qsa('.news-tab');
const newsLists = qsa('.news-list');
newsTabs.forEach((tab) => tab.addEventListener('click', () => {
  const category = tab.dataset.category;
  newsTabs.forEach((item) => item.classList.toggle('active', item === tab));
  newsLists.forEach((list) => list.classList.toggle('hidden', list.dataset.list !== category));
}));

const searchModal = qs('.search-modal');
const searchInput = qs('.search-form input');
const openSearch = () => {
  searchModal.classList.add('is-open');
  searchModal.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => searchInput?.focus(), 180);
};
const closeSearch = () => {
  searchModal.classList.remove('is-open');
  searchModal.setAttribute('aria-hidden', 'true');
};
qs('.search-button')?.addEventListener('click', openSearch);
qs('.modal-close')?.addEventListener('click', closeSearch);
qs('.search-modal-backdrop')?.addEventListener('click', closeSearch);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSearch();
});

const toast = qs('.toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}
qs('.search-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const keyword = searchInput.value.trim();
  if (!keyword) {
    showToast('请输入要搜索的关键词');
    return;
  }
  closeSearch();
  showToast(`已为你准备“${keyword}”的搜索结果`);
});
qs('.document-search')?.addEventListener('click', openSearch);

qsa('a[href="#news"], a[href="#standards"], a[href="#events"], a[href="#membership"], a[href="#services"]').forEach((link) => {
  link.addEventListener('click', () => {
    const target = link.getAttribute('href');
    if (link.closest('.nav-link')) return;
    if (target === '#news' || target === '#standards' || target === '#events' || target === '#membership' || target === '#services') {
      window.setTimeout(() => showToast('演示页面已定位到对应服务模块'), 450);
    }
  });
});

const backToTop = qs('.back-to-top');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 480);
}, { passive: true });
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const currentYear = qs('#current-year');
if (currentYear) currentYear.textContent = String(new Date().getFullYear());
