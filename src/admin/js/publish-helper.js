/**
 * 单模块发布助手（后台各编辑页共用）
 *
 * 用法（页面 inline）：
 *   <button class="btn btn-publish-XXX" onclick="publishModule({...})">🚀 发布</button>
 *
 * 自动行为：
 *   - 检查 GitHub 配置（未配置则跳转到配置页）
 *   - 二次确认弹窗
 *   - 调用页面提供的 saveLocal() 把当前编辑保存到 Store
 *   - 调用 GitHub.publishXxx() 推到 GitHub
 *   - 显示成功/失败 toast
 *
 * 必需依赖：UI, Store, GitHub（已通过 ../js/ui.js, ../js/store.js, ../js/github.js 加载）
 */
(function () {
    // Store key → GitHub.publish 函数名映射
    const PUBLISH_FN_MAP = {
        'news': 'publishNews',
        'pages': 'publishPages',
        'site': 'publishSite',
        'navigation': 'publishNavigation',
        'footer': 'publishFooter',
        'standards': 'publishStandards',
        'events': 'publishEvents',
        'magazines': 'publishMagazines',
        'branches': 'publishBranches',
        'wuxiOffice': 'publishWuxiOffice',
        'downloads': 'publishDownloads',
        'homepage': 'publishHomepage'
    };

    /**
     * 发布当前页对应的模块到网站
     * @param {Object} cfg
     *   - key:    Store key (如 'standards')
     *   - label:  中文标签 (如 '政策标准')
     *   - saveFn: 可选；'function'，由页面提供，用于发布前把当前表单数据保存到 Store。
     *             不传则跳过保存（仅在 Store 已有数据时有效）。
     */
    async function publishModule(cfg) {
        const { key, label, saveFn } = cfg;
        const btn = document.querySelector('.btn-publish-' + key);
        if (!GitHub || !GitHub.isConfigured || !GitHub.isConfigured()) {
            UI.toast('请先在 “⚙ GitHub 自动部署” 配置仓库信息', 'error');
            window.location.href = '../github-config.html';
            return;
        }
        if (!confirm('确认仅发布【' + label + '】模块到网站？其他模块不受影响。\n\nCloudflare Pages 将在 1-3 分钟内构建部署，请稍后刷新网站查看。')) return;

        // 发布前保存到 Store（如果页面提供 saveFn）
        if (typeof saveFn === 'function') {
            try { saveFn(); } catch (e) { console.warn('[publishModule] saveFn failed:', e); }
        }

        const fnName = PUBLISH_FN_MAP[key];
        if (!fnName) { UI.toast('未知的模块 key：' + key, 'error'); return; }
        const fn = GitHub[fnName];
        if (typeof fn !== 'function') {
            UI.toast('GitHub.' + fnName + ' 函数不存在（请检查 src/admin/js/github.js）', 'error');
            return;
        }

        const oldText = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = '⏳ 发布中…'; }
        try {
            await fn();
            UI.toast('🎉【' + label + '】发布成功！1-3 分钟后前台生效', 'success');
            if (btn) btn.textContent = '✅ 已发布（再点可重新发布）';
        } catch (e) {
            console.error('[publishModule] ' + label + ' 失败：', e);
            UI.toast('❌ 发布失败：' + (e.message || e), 'error');
            if (btn) btn.textContent = oldText;
        } finally {
            if (btn) setTimeout(() => { btn.disabled = false; }, 1500);
        }
    }

    // 挂到 window 供 inline onclick 使用
    window.publishModule = publishModule;
})();
