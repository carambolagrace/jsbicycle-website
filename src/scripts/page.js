/**
 * 栏目页脚本 — 渲染对应 ?page= 内容、筛选器交互
 * 数据驱动的栏目：standards / events / branches / wuxi-office / magazines / services
 */
import { qs, qsa, renderLayout, initNavigation, initSearch, initActionButtons, showToast } from '../utils/dom.js';
import { pageTemplates } from '../data/pages.js';
import { newsList } from '../data/news.js';
import { standardsList } from '../data/standards.js';
import { eventsList } from '../data/events.js';
import { branchesData } from '../data/branches.js';
import { wuxiOfficeData } from '../data/wuxiOffice.js';
import { magazinesList } from '../data/magazines.js';
import { downloadsList } from '../data/downloads.js';

/* HTML 转义工具 */
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
const escAttr = (s) => esc(s);

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

qs(`[data-nav="${pageKey}"]`)?.classList.add('active');

/* ---------- 数据驱动渲染：政策标准 ---------- */
function renderStandards(container) {
  const items = standardsList.map((std) => {
    const typeClass = std.type === '团体标准' ? 'amber'
      : std.type === '认证规则' ? 'green'
      : std.type === '政策法规' ? 'blue'
      : '';
    const dateText = std.publishedAt
      ? `发布日期：${esc(std.publishedAt)} · 状态：${esc(std.status || '')}`
      : esc(std.status || '');
    return `
      <a href="./detail.html?type=standard&id=${escAttr(std.id)}">
        <span class="doc-type ${typeClass}">${esc(std.type)}</span>
        <div>
          <h3>${esc(std.title)}</h3>
          <p>${dateText}</p>
        </div>
        <b>查看文件 ↗</b>
      </a>
    `;
  }).join('');

  container.innerHTML = `
    <div class="document-tool"><div><p class="block-label">DOCUMENT SEARCH</p><h2>政策与标准文件检索</h2></div><form id="document-filter"><input type="search" placeholder="输入标准编号或关键词" /><select><option>全部类型</option><option>国家标准</option><option>团体标准</option><option>认证规则</option><option>政策法规</option></select><button type="submit">查询</button></form></div>
    <div class="category-cards category-cards-3col"><a href="#standard-list"><span>01</span><b>政策法规</b><small>POLICY</small></a><a href="#standard-list"><span>02</span><b>国家标准</b><small>NATIONAL</small></a><a href="#standard-list"><span>03</span><b>团体标准</b><small>GROUP</small></a></div>
    <div class="standard-list-full" id="standard-list">
      <div class="list-title"><h2>最新文件</h2><span>按发布时间排序</span></div>
      ${items}
    </div>
  `;
}

/* ---------- 数据驱动渲染：展会活动（数据源：后端接口，失败时回退本地数据） ---------- */
// 后端接口地址：本地联调指向 Spring Boot (8080)，生产上线时替换为正式域名
const EVENTS_API = 'http://localhost:8080/api/events';

async function renderEvents(container) {
  let list = eventsList;
  try {
    const res = await fetch(EVENTS_API);
    if (res.ok) list = await res.json();
  } catch (err) {
    console.warn('[events] 后端接口不可用，使用本地数据', err);
  }
  const items = list.map((evt) => {
    const stats = evt.stats || {};
    const statusClass = evt.status === '报名中' ? 'open' : '';
    return `
      <a class="exhibition-card" href="./detail.html?type=event&id=${escAttr(evt.id)}">
        <div class="exhibition-card-top">
          <span class="exhibition-label">${esc(evt.series)} - ${esc(evt.edition)}</span>
          <span class="expo-status ${statusClass}">${esc(evt.status)}</span>
        </div>
        <div class="exhibition-card-body">
          <h2>${esc(evt.title)}</h2>
          <p class="expo-meta"><span>${esc(evt.date)}</span><span>${esc(evt.location)}</span><span>${esc(evt.halls)}</span></p>
          <div class="expo-stats">
            ${stats.area ? `<div><strong>${esc(stats.area)}<small>㎡</small></strong><span>展出面积</span></div>` : ''}
            ${stats.exhibitors ? `<div><strong>${esc(stats.exhibitors)}</strong><span>参展企业</span></div>` : ''}
            ${stats.visitors ? `<div><strong>${esc(stats.visitors)}</strong><span>参观人次</span></div>` : ''}
            ${stats.booths ? `<div><strong>${esc(stats.booths)}</strong><span>标准展位</span></div>` : ''}
          </div>
          <p>${esc(evt.description)}</p>
          <span class="expo-action">查看详情 / 报名 <span>↗</span></span>
        </div>
      </a>
    `;
  }).join('');

  container.innerHTML = `
    <div class="filter-bar"><div class="filter-tabs"><span class="filter-chip active">品牌展会</span></div><span>共 ${list.length} 项展会</span></div>
    <div class="exhibition-list">
      ${items}
    </div>
  `;
}

/* ---------- 数据驱动渲染：分支机构 ---------- */
function renderBranches(container) {
  const ch = branchesData.charging;
  const sh = branchesData.sharing;
  const renderTable = (td) => `
    <table class="committee-table">
      <thead><tr>${td.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>
        ${td.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = `
    <div class="inner-split branches-detail">
      <aside class="side-nav"><b>分支机构</b><a href="#charging">充换电专业委员会</a><a href="#sharing">共享电单车专业委员会</a><a href="#regulations">分支机构管理办法</a></aside>
      <div class="inner-main">
        <section class="content-block" id="charging">
          <p class="block-label">CHARGING &amp; SWAPPING COMMITTEE</p>
          <h2>江苏省自行车电动车协会<br />充换电专业委员会</h2>
          <p class="lead">为落实电动自行车安全整治政策，江苏省自行车电动车协会筹备成立充换电专业委员会，旨在解决行业安全隐患、标准缺失等问题。</p>
          <h3 style="margin-top:28px;color:var(--navy);font-size:20px">背景</h3>
          <p>电动两轮车普及下，充换电行业存安全、标准、监管等问题，江苏亟需行业自律。</p>
          <h3 style="margin-top:24px;color:var(--navy);font-size:20px">目标</h3>
          <p>推动标准制定、安全评估、技术研发，普及"以换代充"，搭建政商桥梁。</p>
          <h3 style="margin-top:24px;color:var(--navy);font-size:20px">工作方向</h3>
          <ul style="margin:8px 0 24px;padding-left:22px;color:#405164;line-height:2">
            <li>制定技术 / 安全 / 服务标准</li>
            <li>加强行业协作与政策沟通</li>
            <li>推动新型充电技术应用</li>
            <li>提升服务效率与安全性</li>
          </ul>
          <h3 style="margin-top:30px;color:var(--navy);font-size:20px">主任、副主任名单</h3>
          ${renderTable(ch.leadership)}
          <h3 style="margin-top:36px;color:var(--navy);font-size:20px">常务会员名单</h3>
          ${renderTable(ch.members)}
          <div class="register-box" style="margin-top:24px"><div><p class="block-label">DOWNLOAD</p><h3>委员会成员名单</h3><p>含主任委员、副主任委员、常务委员单位与工作机构设置</p></div><a class="register-action" href="./assets/branches-charging-committee.xlsx" download>下载 XLSX ↓</a></div>
        </section>

        <section class="content-block" id="sharing">
          <p class="block-label">SHARED E-BIKE COMMITTEE</p>
          <h2>江苏省自行车电动车协会<br />共享电单车专业委员会</h2>
          <p class="lead">为落实电动自行车安全整治政策，江苏省自行车电动车协会筹备成立江苏省自行车电动车协会共享电单车专业委员会，旨在解决行业安全隐患、标准缺失等问题。</p>
          <h3 style="margin-top:28px;color:var(--navy);font-size:20px">背景</h3>
          <p>共享电单车普及下，行业存在定位不明、安全隐患、标准缺失等问题，江苏亟需行业自律。</p>
          <h3 style="margin-top:24px;color:var(--navy);font-size:20px">目标</h3>
          <p>推动标准制定、安全评估、完善监管、提升服务、技术研发，构建政府、企业、用户三方协同机制。</p>
          <h3 style="margin-top:24px;color:var(--navy);font-size:20px">筹备过程</h3>
          <p>2025年4月，滴滴青桔、美团、哈啰、雅迪、新日、爱玛等共享电单车相关企业与协会多次沟通，并召开三次座谈会，达成成立专委会的共识。7月17日，滴滴青桔作为主要牵头企业，正式提交成立"共享电单车专业委员会"的申请。次日，协会召开筹备会议，确定了组织架构及委员名单。</p>
          <p>专委会设名誉主任委员1位；主任委员单位由滴滴青桔、美团、哈啰三家两年轮值，首届由滴滴青桔担任；副主任委员单位21家；办公室主任1位、副主任2位；常务委员单位8家。首批自愿加入单位共30家。此外，从事共享电单车配套产品的协会会员单位可增列为常务委员，参与相关活动。</p>
          <h3 style="margin-top:24px;color:var(--navy);font-size:20px">工作方向</h3>
          <p>以"安全为先、技术引领、协同发展"为核心，推动共享电单车行业规范、有序、可持续发展，助力"双碳"目标实现。</p>
          <h3 style="margin-top:30px;color:var(--navy);font-size:20px">委员会名单</h3>
          <p style="margin-bottom:14px"><strong>名誉主任委员：</strong>江苏省自行车电动车协会名誉理事长 陆金龙</p>
          <p style="margin-bottom:14px"><strong>主任委员单位：</strong>由滴滴青桔、美团、哈啰三家单位两年一轮值</p>
          <p style="margin-bottom:14px">经省协会八届三次理事会审议通过江苏省自行车电动车协会共享电单车专业委员会组织架构及名单。</p>
          ${renderTable(sh.members)}
          <p style="margin-top:14px;color:var(--muted);font-size:11px;text-align:right">（排名不分先后）</p>
          <div class="register-box" style="margin-top:24px"><div><p class="block-label">DOWNLOAD</p><h3>委员会成员名单</h3><p>含主任委员单位、副主任委员单位、常务委员单位与工作机构</p></div><a class="register-action" href="./assets/branches-sharing-committee.xlsx" download>下载 XLSX ↓</a></div>
        </section>

        <section class="content-block" id="regulations">
          <p class="block-label">MANAGEMENT REGULATIONS</p>
          <h2>江苏省自行车电动车协会<br />分支机构管理办法</h2>
          <p class="lead">为规范协会分支机构的管理与运作，确保各专委会依法依规开展工作，依据协会章程及相关法律法规，制定本办法。</p>
          <p>本页适用于协会下设的各专业委员会，包括但不限于充换电专业委员会、共享电单车专业委员会等分支机构。详细条款、设立程序、职责权限、考核监督等内容，请查阅完整管理办法。</p>
          <div class="register-box" style="margin-top:24px"><div><p class="block-label">DOWNLOAD</p><h3>分支机构管理办法（PDF）</h3><p>经八届三次理事会会议审议 · 26.04.28</p></div><a class="register-action" href="./assets/branches-regulations.pdf" download>下载 PDF ↓</a></div>
        </section>
      </div>
    </div>
  `;
}

/* ---------- 数据驱动渲染：无锡办公室 ---------- */
function renderWuxiOffice(container) {
  const roster = wuxiOfficeData.roster;
  const tableHTML = `
    <table class="committee-table">
      <thead><tr>${roster.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>
        ${roster.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = `
    <div class="inner-split branches-detail">
      <aside class="side-nav"><b>无锡市办公室</b><a href="#roster">办公室成员名单</a></aside>
      <div class="inner-main">
        <section class="content-block" id="roster">
          <p class="block-label">WUXI OFFICE ROSTER</p>
          <h2>江苏省自行车电动车协会<br />无锡市电动车行业办公室</h2>
          <p class="lead">为加强无锡地区电动自行车行业管理与服务，江苏省自行车电动车协会设立无锡市电动车行业办公室，承担区域行业协调、政企沟通与会员服务等职能。</p>
          <h3 style="margin-top:30px;color:var(--navy);font-size:20px">办公室成员名单</h3>
          ${tableHTML}
        </section>
      </div>
    </div>
  `;
}

/* ---------- 数据驱动渲染：行业杂志 ---------- */
function renderMagazines(container) {
  const magLinks = magazinesList.map((m) =>
    `<a href="./magazine-viewer.html?id=${escAttr(m.key)}">${esc(m.title)}</a>`
  ).join('');

  container.innerHTML = `
    <div class="inner-split magazine-detail">
      <aside class="side-nav"><b>行业杂志</b><a class="active" href="#all">全部期刊</a>${magLinks}<a href="#subscribe">订阅与提示</a></aside>
      <div class="inner-main">
        <section class="content-block" id="all"><p class="block-label">DIGEST &amp; MAGAZINES</p><h2>两本电子双月刊，<br />一站式汇集行业阅读</h2><p class="lead">《江苏省自行车》与《中国电动自行车网》均由江苏省自行车电动车协会主办，是面向会员与行业读者的电子双月刊。</p></section>
        <section class="content-block" id="jsbicycle"><p class="block-label">JSBEVA REVIEW</p><h2>《江苏省自行车》｜江苏自行车产业链深度月刊</h2><p>聚焦江苏自行车产业链上下游的政策、趋势、企业与会员故事，记录企业成长与政策变迁。</p><a class="button button-primary" href="./magazine-viewer.html?id=jsbicycle">在线阅读最新一期 <span>→</span></a></section>
        <section class="content-block" id="chinabike"><p class="block-label">CHINA E-BIKE WEB</p><h2>《中国电动自行车网》｜电动两轮车资讯与渠道观察</h2><p>关注电动两轮车产业新闻、产品趋势、消费者渠道、品牌运营等内容，提供面向市场一线的综合资讯。</p><a class="button button-primary" href="./magazine-viewer.html?id=chinabike">在线阅读最新一期 <span>→</span></a></section>
        <section class="content-block" id="subscribe"><p class="block-label">SUBSCRIBE</p><h2>订阅与提示</h2><p>会员单位默认同步接收电子双月刊。如需变更接收邮箱或加入行业读者名单，可联系协会秘书处协助处理。</p></section>
        <section class="content-block magazine-ad-section" id="advertising"><div class="magazine-ad-block"><div class="magazine-ad-cover"><span class="block-label">MAGAZINE ADVERTISING</span><h2>协会会刊广告投放</h2><p class="magazine-ad-sub">在协会会刊投放广告，可精准触达江苏省乃至全国自行车电动车产业链企业。欢迎联系秘书处咨询广告位、报价及合作方案，获取契合品牌的行业曝光机会。</p></div><h2>为什么选择协会会刊？</h2><p class="lead">协会会刊为双月刊，免费邮寄给全体会员单位及行业相关机构。刊物内容专业、受众精准，是企业展示品牌形象、发布新品信息、拓展行业资源的优质媒介。</p><div class="event-highlights magazine-ad-benefits"><div><span>01</span><h3>精准触达</h3><p>近 300 家会员单位及产业链关键决策者</p></div><div><span>02</span><h3>长期留存</h3><p>纸质刊物长期留存，品牌曝光周期长</p></div><div><span>03</span><h3>活动联动</h3><p>与协会活动、展会、培训联动推广</p></div><div><span>04</span><h3>专业可信</h3><p>内容专业可信，提升品牌公信力</p></div></div><h2>广告位类型</h2><div class="magazine-ad-types"><div class="ad-type-card"><span>01 / COVER</span><h3>封面广告</h3><ul><li>封面拉页</li><li>封二</li><li>封三</li><li>封底</li></ul></div><div class="ad-type-card"><span>02 / INNER</span><h3>内页广告</h3><ul><li>内页整版</li><li>跨页广告</li></ul></div><div class="ad-type-card"><span>03 / CONTENT</span><h3>内容合作</h3><ul><li>企业专访</li><li>技术专题合作</li></ul></div></div><div class="register-box magazine-ad-cta"><div><p class="block-label">CONTACT SECRETARIAT</p><h3>广告合作咨询</h3><p>欢迎联系协会秘书处获取详细报价、版面规格与档期信息。</p></div><a class="register-action" href="#subscribe">联系秘书处 ↗</a></div></div></section>
      </div>
    </div>
  `;
}

/* ---------- 数据驱动渲染：服务大厅（下载资料） ---------- */
function renderServices(container) {
  const categories = [...new Set(downloadsList.map((d) => d.category))];
  const groupedHTML = categories.map((cat) => {
    const items = downloadsList.filter((d) => d.category === cat);
    return `
      <div class="download-category">
        <h3>${esc(cat)}</h3>
        <div class="download-list">
          ${items.map((d) => `
            <a href="${escAttr(d.url)}" download="${escAttr(d.filename)}">
              <span class="download-label">${esc(d.category)}</span>
              <div>
                <h4>${esc(d.title)}</h4>
                <p>${esc(d.description)}</p>
                <small>${esc(d.size)}</small>
              </div>
              <b>下载 ↓</b>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="service-center-grid">
      <a href="#downloads-list"><span>01</span><div><h3>资料下载</h3><p>表格、文件、会议与申报资料</p></div><b>↗</b></a>
      <a href="./detail.html?type=notice&id=latest"><span>02</span><div><h3>通知公告</h3><p>公示、通知、倡议与重要信息</p></div><b>↗</b></a>
      <a href="./page.html?page=standards"><span>03</span><div><h3>政策标准</h3><p>查找行业最新标准与法规</p></div><b>↗</b></a>
      <a href="./page.html?page=membership"><span>04</span><div><h3>会员申请</h3><p>加入协会获取专业服务</p></div><b>↗</b></a>
    </div>
    <div class="download-section" id="downloads-list">
      <div class="list-title"><h2>资料下载</h2><span>按类别查看</span></div>
      ${groupedHTML}
    </div>
  `;
}

/* ---------- 渲染入口分发 ---------- */
const renderers = {
  standards: renderStandards,
  events: renderEvents,
  branches: renderBranches,
  'wuxi-office': renderWuxiOffice,
  magazines: renderMagazines,
  services: renderServices
};

if (renderers[pageKey]) {
  renderers[pageKey](pageContent);
} else if (pageContent) {
  pageContent.innerHTML = pageData.content;
}

/* ---------- 新闻动态列表渲染 ---------- */
if (pageKey === 'news') {
  const articleList = qs('#article-list');
  if (articleList) {
    // exhibition 类型的 data-type 使用 item.exhibition（如 ceb-nanjing / ceb-wuxi）
    const allNews = [
      ...newsList.association.map((item) => ({ ...item, type: 'association' })),
      ...newsList.industry.map((item) => ({ ...item, type: 'industry' })),
      ...newsList.exhibition.map((item) => ({ ...item, type: item.exhibition })),
      ...newsList.policy.map((item) => ({ ...item, type: 'policy' })),
      ...newsList.notice.map((item) => ({ ...item, type: 'notice' }))
    ];
    articleList.innerHTML = allNews.map((item) => {
      const detailType = item.type === 'notice' ? 'notice' : 'news';
      return `
      <a data-type="${esc(item.type)}" href="./detail.html?type=${detailType}&id=${esc(item.id)}">
        <time><b>${item.date.split('.')[1]}</b><span>${item.iso.slice(0, 4) + '.' + item.date.split('.')[0]}</span></time>
        <div><i>${item.type === 'notice' ? item.category : item.type}</i><h3>${esc(item.title)}</h3><p>${esc(item.category)} · ${esc(item.iso)}</p></div>
        <strong>↗</strong>
      </a>
    `;
    }).join('');
    // 同步右上角“共 X 条”统计
    const countLabel = qs('.filter-bar > span');
    if (countLabel) countLabel.textContent = `共 ${allNews.length} 条内容`;
  }
}

/* ---------- 新闻分类筛选 ---------- */
function applyNewsFilter(filter) {
  // 仅对存在的 chip 过滤，防非法 hash
  const chip = qs(`.filter-chip[data-filter="${filter}"]`);
  if (!chip) return false;
  qsa('.filter-chip').forEach((item) => item.classList.toggle('active', item === chip));
  qsa('#article-list > a').forEach((item) => {
    item.style.display = filter === 'all' || item.dataset.type === filter ? 'grid' : 'none';
  });
  return true;
}
qsa('.filter-chip').forEach((button) => button.addEventListener('click', () => {
  applyNewsFilter(button.dataset.filter);
}));

/* ---------- 根据 URL hash 自动触发筛选（例如 ?page=news#policy） ---------- */
if (pageKey === 'news' && window.location.hash) {
  const targetFilter = window.location.hash.slice(1); // 例如 'policy' / 'notice'
  if (applyNewsFilter(targetFilter)) {
    // 滚动到筛选区，让用户能看到过滤后的列表
    window.setTimeout(() => {
      const bar = qs('.filter-bar');
      if (bar) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }
}

/* ---------- 标准检索提交 ---------- */
qs('#document-filter')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const keyword = qs('input', event.currentTarget).value.trim();
  showToast(keyword ? `正在检索"${keyword}"相关文件` : '请输入标准编号或关键词');
});