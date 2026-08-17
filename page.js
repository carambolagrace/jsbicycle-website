const pageTemplates = {
  about: {
    title: '关于协会', kicker: 'ABOUT JBEA', mark: '01', description: '汇聚行业力量，推动江苏自行车与电动车产业健康、规范、可持续发展。',
    content: `
      <div class="inner-split about-detail">
        <aside class="side-nav"><b>关于协会</b><a class="active" href="#profile">协会简介</a><a href="#mission">使命愿景</a><a href="#organization">组织架构</a><a href="#contact-info">联系我们</a></aside>
        <div class="inner-main">
          <section class="content-block" id="profile"><p class="block-label">ASSOCIATION PROFILE</p><h2>连接政府、企业与市场的<br />省级行业服务平台</h2><p class="lead">江苏省自行车电动车协会立足江苏产业基础，围绕行业自律、政策传达、标准建设、产业协作、会员服务与绿色出行等重点工作，持续发挥桥梁纽带作用。</p><p>协会坚持服务行业、服务会员、服务政府，以专业化、规范化和开放协作推动自行车、电动车及产业链相关企业实现高质量发展。</p></section>
          <section class="content-block" id="mission"><p class="block-label">MISSION & VISION</p><h2>我们的使命与愿景</h2><div class="value-grid"><div><span>01</span><h3>服务行业</h3><p>传递政策声音，回应行业诉求，营造规范有序的产业环境。</p></div><div><span>02</span><h3>链接会员</h3><p>构建交流平台，促进上下游协同与跨区域产业合作。</p></div><div><span>03</span><h3>共建标准</h3><p>参与标准制修订，为行业安全和技术升级提供专业支撑。</p></div></div></section>
          <section class="content-block" id="organization"><p class="block-label">ORGANIZATION</p><h2>组织体系</h2><div class="organization-list"><div><b>理事会</b><span>协会决策与治理机构</span></div><div><b>秘书处</b><span>协会日常工作与会员服务</span></div><div><b>专业委员会</b><span>共享电单车、充换电等专业领域</span></div><div><b>行业办公室</b><span>地区产业服务与协调联络</span></div></div></section>
          <section class="content-block contact-panel" id="contact-info"><p class="block-label">CONTACT US</p><h2>联系我们</h2><div class="contact-grid"><div><small>联系电话</small><b>0510-85051427<br />0510-85032702</b></div><div><small>电子邮箱</small><b>jbea@jsbicycle.com</b></div><div><small>办公地址</small><b>江苏省无锡市清扬路七号11层</b></div></div></section>
        </div>
      </div>`
  },
  news: {
    title: '新闻动态', kicker: 'NEWS CENTER', mark: '02', description: '及时发布协会工作、公众号一线快讯、行业资讯、政策动态与重要通知。',
    content: `
      <div class="filter-bar"><div class="filter-tabs"><button class="filter-chip active" data-filter="all">全部</button><button class="filter-chip" data-filter="association">协会动态</button><button class="filter-chip" data-filter="industry">行业资讯</button><button class="filter-chip" data-filter="policy">政策动态</button></div><span>共 32 条内容</span></div>
      <a class="list-feature" href="detail.html?type=news&id=pa-running"><img src="../刘格格/协会公众号/6.27永祺/启动仪式.jpg" alt="奔跑无忧活动现场" /><div><p class="block-label">公众号文章 · 2026.07.22</p><h2>省协会联合多部门开展“奔跑无忧·平安配送”骑手交通安全主题活动</h2><p>协会与无锡交管、社工、市场监管等部门以及美团、淘宝闪购、京东三大平台共同推动骑手交通安全共治，协会秘书长宋金芸宣读《守护配送平安路 共筑文明交通城》倡议书。</p><span class="text-link">阅读详情 ↗</span></div></a>
      <div class="article-list">
        <a data-type="association" href="detail.html?type=news&id=pa-running"><time><b>22</b><span>2026.07</span></time><div><i>公众号文章</i><h3>省协会联合多部门开展“奔跑无忧·平安配送”骑手交通安全主题活动</h3><p>多部门联合推动骑手交通安全共治，签署《网约配送安全共治协议》。</p></div><strong>↗</strong></a>
        <a data-type="industry" href="detail.html?type=news&id=pa-equipment"><time><b>15</b><span>2026.10</span></time><div><i>公众号文章</i><h3>聚力装备升级——2026南京展5号馆专属智造装备展区持续报名中</h3><p>第43届南京展SVMT展区10月22—24日落地5号馆，联动800+整车企业。</p></div><strong>↗</strong></a>
        <a data-type="industry" href="detail.html?type=news&id=pa-foreign"><time><b>08</b><span>2026.10</span></time><div><i>公众号文章</i><h3>打破内贸天花板！2026南京电动车展重磅打造外贸特色“展中展”</h3><p>4号馆集结300余名海外采购商，搭建“国内产能—全球需求”对接平台。</p></div><strong>↗</strong></a>
        <a data-type="industry" href="detail.html?type=news&id=pa-buyers"><time><b>26</b><span>2026.09</span></time><div><i>公众号文章</i><h3>聚焦外贸专属展区，链接全球采购资源</h3><p>2026南京展国际买家邀约工作有序推进，目标确保300家国际采购商到场。</p></div><strong>↗</strong></a>
        <a data-type="industry" href="detail.html?type=news&id=pa-rider"><time><b>23</b><span>2026.06</span></time><div><i>公众号文章</i><h3>开放！骑手可以骑“电摩”送外卖啦！</h3><p>无锡发布“奔跑无忧”八项举措，倡导外卖骑手使用合规电摩、电轻摩，赋能骑手专属路权。</p></div><strong>↗</strong></a>
        <a data-type="association" href="detail.html?type=news&id=committee"><time><b>12</b><span>2026.06</span></time><div><i>协会动态</i><h3>江苏省自行车电动车协会共享电单车专业委员会成立大会圆满召开</h3><p>专业委员会将围绕行业治理、技术规范与绿色出行展开工作。</p></div><strong>↗</strong></a>
        <a data-type="policy" href="detail.html?type=news&id=statement"><time><b>30</b><span>2026.06</span></time><div><i>重要声明</i><h3>关于坚决抵制电动自行车行业各类违法违规行为的严正声明</h3><p>维护公平有序的市场环境，推动行业安全、规范、健康发展。</p></div><strong>↗</strong></a>
        <a data-type="industry" href="detail.html?type=news&id=intelligence"><time><b>23</b><span>2025.07</span></time><div><i>行业资讯</i><h3>电动自行车产业加速迈向智能化与品质化</h3><p>智能化、品质化升级成为行业转型发展方向。</p></div><strong>↗</strong></a>
        <a data-type="policy" href="detail.html?type=notice&id=certification"><time><b>23</b><span>2025.12</span></time><div><i>政策动态</i><h3>国家认监委关于产品强制性认证标志试点改革事项的公告</h3><p>及时了解认证政策变化与企业合规要求。</p></div><strong>↗</strong></a>
      </div>
      <div class="pagination"><button class="active">1</button><button>2</button><button>3</button><button>下一页 →</button></div>`
  },
  standards: {
    title: '政策标准', kicker: 'POLICY & STANDARDS', mark: '03', description: '集中呈现政策法规、国家标准、行业标准、团体标准与权威解读。',
    content: `
      <div class="document-tool"><div><p class="block-label">DOCUMENT SEARCH</p><h2>政策与标准文件检索</h2></div><form id="document-filter"><input type="search" placeholder="输入标准编号或关键词" /><select><option>全部类型</option><option>国家标准</option><option>行业标准</option><option>团体标准</option></select><button type="submit">查询</button></form></div>
      <div class="category-cards"><a href="#standard-list"><span>01</span><b>政策法规</b><small>POLICY</small></a><a href="#standard-list"><span>02</span><b>国家标准</b><small>NATIONAL</small></a><a href="#standard-list"><span>03</span><b>行业标准</b><small>INDUSTRY</small></a><a href="#standard-list"><span>04</span><b>团体标准</b><small>GROUP</small></a></div>
      <div class="standard-list-full" id="standard-list">
        <div class="list-title"><h2>最新文件</h2><span>按发布时间排序</span></div>
        <a href="detail.html?type=standard&id=battery"><span class="doc-type">国家标准</span><div><h3>GB 43854—2024《电动自行车用锂离子蓄电池安全技术规范》</h3><p>发布日期：2024-05-14 · 状态：现行有效</p></div><b>查看文件 ↗</b></a>
        <a href="detail.html?type=standard&id=certification"><span class="doc-type green">认证规则</span><div><h3>强制性产品认证实施规则《电动自行车》</h3><p>发布日期：2023-09-26 · 状态：现行有效</p></div><b>查看文件 ↗</b></a>
        <a href="detail.html?type=standard&id=charging"><span class="doc-type amber">团体标准</span><div><h3>电动自行车集中充换电设施安全管理规范</h3><p>标准制修订 · 征求意见阶段</p></div><b>查看文件 ↗</b></a>
      </div>`
  },
  membership: {
    title: '会员服务', kicker: 'MEMBERSHIP', mark: '04', description: '为会员企业提供政策、标准、交流、展会与品牌传播等专业服务。',
    content: `
      <section class="membership-landing"><div><p class="block-label">MEMBER BENEFITS</p><h2>加入协会，与行业共同成长</h2><p class="lead">成为协会会员，获取政策信息、标准协同、产业对接、展会活动和品牌传播等服务支持。</p><a class="button button-primary apply-button" href="detail.html?type=membership&id=apply">立即申请入会 <span>↗</span></a></div><div class="benefit-grid"><div><span>01</span><h3>政策服务</h3><p>政策传达、申报辅导与行业诉求反馈</p></div><div><span>02</span><h3>标准协同</h3><p>参与标准制修订与专题研讨</p></div><div><span>03</span><h3>产业连接</h3><p>会员交流、供需对接与跨区域合作</p></div><div><span>04</span><h3>品牌展示</h3><p>官网、公众号与行业活动传播</p></div></div></section>
      <section class="join-process"><p class="block-label">HOW TO JOIN</p><h2>入会流程</h2><div><article><b>01</b><h3>了解条件</h3><p>查看会员类型、入会条件与会费标准</p></article><article><b>02</b><h3>准备材料</h3><p>填写申请表并准备企业相关证明</p></article><article><b>03</b><h3>提交审核</h3><p>秘书处受理申请并完成资格审核</p></article><article><b>04</b><h3>成为会员</h3><p>完成相关手续，正式获得会员服务</p></article></div></section>
      <section class="download-panel"><div><p class="block-label">DOWNLOAD</p><h2>入会资料下载</h2></div><a href="detail.html?type=membership&id=apply">团体会员入会申请表 <span>下载文件 ↓</span></a><a href="detail.html?type=membership&id=fees">会员收费标准及说明 <span>查看详情 ↗</span></a></section>`
  },
  events: {
    title: '展会活动', kicker: 'EVENTS & EXHIBITIONS', mark: '05', description: '汇集品牌展会、行业会议、专业论坛与协会重点活动。',
    content: `
      <div class="event-feature-full"><img src="../刘格格/协会公众号/6.27永祺/1.jpg" alt="行业活动" /><div><span class="event-status">重点活动</span><p class="block-label">2026.10.25 · 南京</p><h2>第42届中国江苏国际自行车新能源电动车展览会</h2><p>连接产业资源，集中展示行业创新成果与品牌力量。</p><a class="button button-light" href="detail.html?type=event&id=nanjing">查看活动详情 <span>↗</span></a></div></div>
      <div class="event-list-grid">
        <a href="detail.html?type=event&id=seminar"><div class="event-date"><b>18</b><span>2026.09</span></div><span class="event-status open">即将报名</span><h3>江苏省自行车电动车行业专题研讨会</h3><p>无锡 · 政策标准与产业发展</p><i>查看详情 ↗</i></a>
        <a href="detail.html?type=event&id=charging"><div class="event-date"><b>06</b><span>2026.12</span></div><span class="event-status">行业会议</span><h3>充换电专业委员会年度工作会议</h3><p>南京 · 年度工作与标准研讨</p><i>查看详情 ↗</i></a>
        <a href="detail.html?type=event&id=green"><div class="event-date"><b>27</b><span>2026.06</span></div><span class="event-status ended">活动回顾</span><h3>绿色出行与行业协作交流活动</h3><p>江苏 · 行业交流与绿色发展</p><i>查看详情 ↗</i></a>
      </div>`
  },
  services: {
    title: '服务大厅', kicker: 'SERVICE HALL', mark: '06', description: '把通知、下载、申报、办事与咨询等高频服务集中到一个入口。',
    content: `
      <div class="service-center-grid"><a href="detail.html?type=notice&id=latest"><span>01</span><div><h3>通知公告</h3><p>公示、通知、倡议与重要信息</p></div><b>↗</b></a><a href="detail.html?type=service&id=download"><span>02</span><div><h3>资料下载</h3><p>表格、文件、会议与申报资料</p></div><b>↗</b></a><a href="detail.html?type=service&id=guide"><span>03</span><div><h3>办事指南</h3><p>会员、活动与行业服务指引</p></div><b>↗</b></a><a href="detail.html?type=service&id=local"><span>04</span><div><h3>地方服务</h3><p>江苏各地电动自行车办事指引</p></div><b>↗</b></a></div>
      <div class="notice-board"><div class="list-title"><h2>最新通知</h2><a href="detail.html?type=notice&id=latest">查看全部 ↗</a></div><a href="detail.html?type=notice&id=leader"><span class="notice-label">公示</span><h3>江苏省自行车电动车协会负责人人选公示</h3><time>2026.04.27</time></a><a href="detail.html?type=notice&id=certification"><span class="notice-label blue">公告</span><h3>国家认监委关于产品强制性认证标志试点改革事项的公告</h3><time>2025.12.23</time></a><a href="detail.html?type=notice&id=cases"><span class="notice-label green">征集</span><h3>关于征集自行车电动自行车行业品牌数智化典型案例的通知</h3><time>2024.09.27</time></a></div>`
  }
};

const pageKey = new URLSearchParams(window.location.search).get('page') || 'news';
const pageData = pageTemplates[pageKey] || pageTemplates.news;
document.title = `${pageData.title}｜江苏省自行车电动车协会`;
qs('#breadcrumb-title').textContent = pageData.title;
qs('#page-kicker').textContent = pageData.kicker;
qs('#page-title').textContent = pageData.title;
qs('#page-description').textContent = pageData.description;
qs('#page-mark').textContent = pageData.mark;
qs('#page-content').innerHTML = pageData.content;
qs(`[data-nav="${pageKey}"]`)?.classList.add('active');

qsa('.filter-chip').forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  qsa('.filter-chip').forEach((item) => item.classList.toggle('active', item === button));
  qsa('.article-list > a').forEach((item) => {
    item.style.display = filter === 'all' || item.dataset.type === filter ? 'grid' : 'none';
  });
}));

qs('#document-filter')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const keyword = qs('input', event.currentTarget).value.trim();
  showToast(keyword ? `正在检索“${keyword}”相关文件` : '请输入标准编号或关键词');
});
