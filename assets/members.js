// 会员名录 - 4 分类展示 + 模糊搜索（仅显示企业名称）
(function () {
  const ROLE_ORDER = ['理事长', '副理事长', '理事', '会员'];
  const ROLE_META = {
    '理事长': { label: '理事长', sub: 'PRESIDENT', tag: 'principal' },
    '副理事长': { label: '副理事长', sub: 'VICE PRESIDENT', tag: 'vice' },
    '理事': { label: '理事', sub: 'COUNCIL MEMBER', tag: 'council' },
    '会员': { label: '会员', sub: 'MEMBER UNIT', tag: 'member' }
  };

  let members = [];
  const counts = { all: 0, '理事长': 0, '副理事长': 0, '理事': 0, '会员': 0 };
  let activeRole = 'all';
  let activeKeyword = '';

  const $groups = document.getElementById('members-groups');
  const $empty = document.getElementById('members-empty');
  const $filter = document.getElementById('member-filter');
  const $resultCount = document.getElementById('result-count');
  const $total = document.getElementById('member-total');
  const $search = document.getElementById('member-search');

  // 加载数据
  fetch('data/members.json')
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then((data) => {
      members = data.members || [];
      $total.textContent = members.length;
      counts.all = members.length;
      ROLE_ORDER.forEach((r) => {
        counts[r] = members.filter((m) => m.role === r).length;
      });
      updateFilterUI();
      render();
    })
    .catch((err) => {
      console.error('会员数据加载失败:', err);
      $groups.innerHTML = '<p style="padding:60px 0;text-align:center;color:#8696a8;">会员名录数据加载失败，请稍后重试。</p>';
    });

  function updateFilterUI() {
    $filter.querySelectorAll('.filter-chip').forEach((chip) => {
      const role = chip.getAttribute('data-role');
      const num = chip.querySelector('.filter-num');
      num.textContent = counts[role] || 0;
    });
  }

  // 过滤
  function getFiltered() {
    let list = members;
    if (activeRole !== 'all') {
      list = list.filter((m) => m.role === activeRole);
    }
    if (activeKeyword) {
      const k = activeKeyword.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(k));
    }
    return list;
  }

  // 高亮匹配关键字
  function highlight(text, keyword) {
    if (!keyword) return escapeHTML(text);
    const lower = text.toLowerCase();
    const k = keyword.toLowerCase();
    const idx = lower.indexOf(k);
    if (idx < 0) return escapeHTML(text);
    return (
      escapeHTML(text.slice(0, idx)) +
      '<mark>' + escapeHTML(text.slice(idx, idx + keyword.length)) + '</mark>' +
      escapeHTML(text.slice(idx + keyword.length))
    );
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  // 渲染
  function render() {
    const list = getFiltered();
    $resultCount.textContent = list.length;

    if (list.length === 0) {
      $groups.innerHTML = '';
      $empty.hidden = false;
      return;
    }
    $empty.hidden = true;

    // 按角色分组
    const grouped = {};
    list.forEach((m) => {
      if (!grouped[m.role]) grouped[m.role] = [];
      grouped[m.role].push(m);
    });

    // 角色顺序
    const displayRoles = activeRole === 'all' ? ROLE_ORDER : [activeRole];

    const html = displayRoles
      .filter((r) => grouped[r] && grouped[r].length > 0)
      .map((role) => {
        const meta = ROLE_META[role];
        const items = grouped[role];
        const cards = items
          .map(
            (m) => `
              <div class="member-card tag-${meta.tag}">
                <span class="member-badge">${escapeHTML(meta.sub)}</span>
                <span class="member-name">${highlight(m.name, activeKeyword)}</span>
              </div>`
          )
          .join('');

        return `
          <section class="member-group" data-role="${escapeHTML(role)}">
            <header class="member-group-head">
              <div class="member-group-mark tag-${meta.tag}" aria-hidden="true"><b>${escapeHTML(role)}</b></div>
              <div class="member-group-text">
                <p class="member-group-kicker">${escapeHTML(meta.sub)}</p>
                <h2>${escapeHTML(meta.label)}<span class="member-count">${items.length} 家</span></h2>
              </div>
            </header>
            <div class="member-grid">${cards}</div>
          </section>`;
      })
      .join('');

    $groups.innerHTML = html;
  }

  // 事件 - 分类切换
  $filter.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    $filter.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    activeRole = chip.getAttribute('data-role');
    render();
    const content = document.querySelector('.members-content');
    if (content) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // 事件 - 搜索
  let searchTimer = null;
  $search.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const val = e.target.value.trim();
    searchTimer = setTimeout(() => {
      activeKeyword = val;
      render();
    }, 120);
  });

  $search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $search.value) {
      $search.value = '';
      activeKeyword = '';
      render();
    }
  });
})();
