/**
 * 详情页脚本 — 通过 ?type=&id= 精准路由到正文
 *
 * 【重构 2026-08】新闻 / 杂志正文已迁出到 src/admin/data/<category>/<id>.json。
 * 详情按 ID 异步拉取，避免一次性加载 1.5MB+ 的 detailBodies。
 */
import { qs, qsa, renderLayout, initNavigation, initSearch, initActionButtons, showToast } from '../utils/dom.js';
import { detailRecords, titleOverrides, contextualBodies } from '../data/details.js';
import { standardsList } from '../data/standards.js';

(async () => {
    try {
        renderLayout();
        initNavigation();
        initSearch();
        initActionButtons();

        const params = new URLSearchParams(window.location.search);
        const type = params.get('type') || 'news';
        const id = params.get('id') || '';
        const record = { ...(detailRecords[type] || detailRecords.news) };

        if (titleOverrides[id]) record.title = titleOverrides[id];

        // 上下文正文查找 — 优先从 contextualBodies（不变数据），然后按需 fetch 单文件
        const lookupKey = `${type}:${id}`;
        let contextualBody = contextualBodies[lookupKey] || contextualBodies[id];

        // 如果 contextualBodies 中没有，去 fetch /data/<category>/<id>.json
        if (!contextualBody && id) {
            try {
                const safeId = id.replace(/[\\/:*?"<>|]/g, '_');
                const r = await fetch(`./admin/data/${type}/${safeId}.json`, { cache: 'no-cache' });
                if (r.ok) {
                    const data = await r.json();
                    contextualBody = data.body;
                }
            } catch (e) {
                console.warn('[detail.js] fetch 详情失败:', e.message);
            }
        }

        if (contextualBody) record.body = contextualBody;

        // 标准详情 — 自动从 standards.js 生成摘要 + 文件下载区
        if (type === 'standard') {
            const std = standardsList.find(s => s.id === id);
            if (std) {
                record.title = std.title;
                // 优先 externalUrl（新窗口外部链接），fallback 到 fileUrl（内部 PDF）
                const pdfBlock = std.fileUrl
                    ? `<div class="pdf-viewer" style="margin:24px 0;border:1px solid #dde4ee;border-radius:8px;overflow:hidden"><div style="background:#fafbfc;padding:14px 20px;border-bottom:1px solid #e5ebf3;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><strong style="color:#1e3a5f;font-size:15px">📄 PDF 文件预览</strong><a href="${std.fileUrl}" download target="_blank" style="color:#c0382b;font-size:14px;text-decoration:none;font-weight:600">下载文件 ↓</a></div><iframe src="${std.fileUrl}" style="width:100%;height:780px;border:0;display:block" title="${std.title}"></iframe></div>`
                    : '';
                const externalBlock = std.externalUrl
                    ? `<div class="document-download" style="margin:24px 0;background:#1e3a5f;color:#fff;padding:24px 28px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px"><div style="flex:1;min-width:240px"><p style="font-size:12px;letter-spacing:2px;font-weight:700;margin:0 0 6px;color:#a9c2dd;text-transform:uppercase">DOCUMENT DOWNLOAD</p><h3 style="margin:0 0 6px;font-size:18px">标准文件与相关资料</h3><small style="font-size:13px;color:#9bb1c8;line-height:1.6;display:block">正式文件请以国家标准公开系统或主管部门发布版本为准</small></div><a href="${std.externalUrl}" target="_blank" rel="noopener" class="download-action" style="background:#fff;color:#1e3a5f;padding:14px 24px;text-decoration:none;font-weight:700;border:2px solid #fff;border-radius:2px;white-space:nowrap">获取文件 ↗</a></div>`
                    : '';
                const summaryBlock = std.summary ? `<p style="line-height:1.85;font-size:15.5px;color:#2b3a4d;margin-bottom:18px;padding:14px 18px;background:#f7faff;border-left:3px solid #1d4f8b;border-radius:4px">${std.summary}</p>` : '';
                const metaParts = [];
                if (std.publishedAt) metaParts.push(`<span><strong>发布日期：</strong>${std.publishedAt}</span>`);
                if (std.status) metaParts.push(`<span><strong>状态：</strong>${std.status}</span>`);
                const metaBlock = metaParts.length ? `<p style="color:#6c7a90;font-size:14px;margin-bottom:18px">${metaParts.join(' &nbsp;|&nbsp; ')}</p>` : '';
                // 顺序：摘要 → 元信息 → externalBlock（首选外部链接）→ pdfBlock（fallback 内部 PDF）
                record.body = `${summaryBlock}${metaBlock}${externalBlock}${pdfBlock}`;
            }
        }

        document.title = `${record.title}｜江苏省自行车电动车协会`;
        qs('#detail-type').textContent = record.label;
        qs('#detail-title').textContent = record.title;
        qs('#detail-meta').innerHTML = '';
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
    } catch (err) {
        console.error('[detail.js] 加载出错:', err);
        document.body.insertAdjacentHTML('afterbegin',
            '<div style="background:#fff3cd;color:#856404;padding:14px 18px;text-align:center;border-bottom:2px solid #f5a623;position:fixed;top:0;left:0;right:0;z-index:9999">⚠️ 详情加载失败：' + (err.message || '未知错误') + '</div>');
    }
})();
