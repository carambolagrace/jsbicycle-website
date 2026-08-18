(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(t){if(t.ep)return;t.ep=!0;const s=n(t);fetch(t.href,s)}})();const i=(e,a=document)=>a.querySelector(e),v=(e,a=document)=>[...a.querySelectorAll(e)];function f(){const e=`
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
              <a href="./page.html?page=news">行业动态</a>
              <a href="./page.html?page=standards">政策法规</a>
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
  `,a=`
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
  `,n=`
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
  `;document.body.insertAdjacentHTML("afterbegin",e),document.body.insertAdjacentHTML("beforeend",a),document.body.insertAdjacentHTML("beforeend",n)}function u(){const e=i(".menu-toggle"),a=i(".main-nav");e==null||e.addEventListener("click",()=>{const t=e.classList.toggle("is-open");a==null||a.classList.toggle("is-open",t),e.setAttribute("aria-expanded",String(t))}),v(".nav-link, .main-nav a").forEach(t=>{t.addEventListener("click",()=>{e==null||e.classList.remove("is-open"),a==null||a.classList.remove("is-open"),e==null||e.setAttribute("aria-expanded","false")})});const n=i(".back-to-top");window.addEventListener("scroll",()=>{n==null||n.classList.toggle("visible",window.scrollY>480)},{passive:!0}),n==null||n.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));const r=i("#current-year");r&&(r.textContent=String(new Date().getFullYear()))}function g(){var t,s,o,d,p;const e=i(".search-modal"),a=i(".search-form input"),n=()=>{e==null||e.classList.add("is-open"),e==null||e.setAttribute("aria-hidden","false"),window.setTimeout(()=>a==null?void 0:a.focus(),180)},r=()=>{e==null||e.classList.remove("is-open"),e==null||e.setAttribute("aria-hidden","true")};(t=i(".search-button"))==null||t.addEventListener("click",n),(s=i(".modal-close"))==null||s.addEventListener("click",r),(o=i(".search-modal-backdrop"))==null||o.addEventListener("click",r),document.addEventListener("keydown",c=>{c.key==="Escape"&&r()}),(d=i(".search-form"))==null||d.addEventListener("submit",c=>{c.preventDefault();const h=a==null?void 0:a.value.trim();if(!h){l("请输入要搜索的关键词");return}r(),l(`已为你准备"${h}"的搜索结果`)}),(p=i(".document-search"))==null||p.addEventListener("click",n)}let m;function l(e){const a=i(".toast");a&&(a.textContent=e,a.classList.add("show"),window.clearTimeout(m),m=window.setTimeout(()=>a.classList.remove("show"),2800))}function b(){v(".download-action, .register-action").forEach(e=>{e.addEventListener("click",()=>{l(e.classList.contains("download-action")?"演示版文件下载入口已触发":"参会或服务意向已登记")})})}export{g as a,b,v as c,u as i,i as q,f as r,l as s};
