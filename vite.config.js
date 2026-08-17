import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

/**
 * 江苏省自行车电动车协会 — Vite 配置
 * 多页面应用 (MPA)：将三个 HTML 入口分别编译为独立页面，保留 ?type=&id= 等 URL 参数路由。
 */
export default defineConfig({
  root: 'src',
  base: './',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2018',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/pages/index.html'),
        page: resolve(__dirname, 'src/pages/page.html'),
        detail: resolve(__dirname, 'src/pages/detail.html'),
        'admin/index': resolve(__dirname, 'src/admin/index.html'),
        'admin/dashboard': resolve(__dirname, 'src/admin/dashboard.html'),
        'admin/github-config': resolve(__dirname, 'src/admin/github-config.html')
      }
    }
  },
  plugins: [
    {
      // build 后把 dist/pages/*.html 移到 dist/ 根目录（surge 部署需要）
      name: 'move-pages-html-to-root',
      closeBundle() {
        const pagesDir = resolve(__dirname, 'dist/pages');
        if (fs.existsSync(pagesDir)) {
          for (const file of fs.readdirSync(pagesDir)) {
            fs.renameSync(resolve(pagesDir, file), resolve(__dirname, 'dist', file));
          }
          fs.rmSync(pagesDir, { recursive: true, force: true });
        }
      }
    },
    {
      // 复制 admin/edit/*.html 到 dist/admin/edit/
      name: 'copy-admin-edit',
      closeBundle() {
        const srcDir = resolve(__dirname, 'src/admin/edit');
        const destDir = resolve(__dirname, 'dist/admin/edit');
        if (fs.existsSync(srcDir)) {
          fs.mkdirSync(destDir, { recursive: true });
          for (const file of fs.readdirSync(srcDir)) {
            fs.copyFileSync(resolve(srcDir, file), resolve(destDir, file));
          }
        }
        // 复制 admin/data/*.json
        const srcData = resolve(__dirname, 'src/admin/data');
        const destData = resolve(__dirname, 'dist/admin/data');
        if (fs.existsSync(srcData)) {
          fs.mkdirSync(destData, { recursive: true });
          for (const file of fs.readdirSync(srcData)) {
            fs.copyFileSync(resolve(srcData, file), resolve(destData, file));
          }
        }
        // 复制 admin/css 和 admin/js
        for (const sub of ['css', 'js']) {
          const sDir = resolve(__dirname, 'src/admin', sub);
          const dDir = resolve(__dirname, 'dist/admin', sub);
          if (fs.existsSync(sDir)) {
            fs.mkdirSync(dDir, { recursive: true });
            for (const file of fs.readdirSync(sDir)) {
              fs.copyFileSync(resolve(sDir, file), resolve(dDir, file));
            }
          }
        }
      }
    },
    {
      // 把 src/pages/magazine-viewer.html、src/pages/members.html 也复制到 dist 根目录
      name: 'copy-extra-html',
      closeBundle() {
        const extraPages = ['magazine-viewer.html', 'members.html'];
        for (const name of extraPages) {
          const srcPath = resolve(__dirname, 'src/pages', name);
          const distPath = resolve(__dirname, 'dist', name);
          if (fs.existsSync(srcPath) && !fs.existsSync(distPath)) {
            fs.copyFileSync(srcPath, distPath);
          }
        }
      }
    },
    {
      // 把 d:/LGG-办公/public 下的杂志图片复制到 dist/assets/magazines
      name: 'copy-magazines',
      closeBundle() {
        const src = resolve(__dirname, '../public/assets/magazines');
        const dest = resolve(__dirname, 'dist/assets/magazines');
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
          fs.cpSync(src, dest, { recursive: true });
        }
      }
    },
    {
      // 把 src 的静态资源复制到 dist/assets（保证 magazine-viewer.html 引用的 assets/* 可访问）
      name: 'copy-static-assets',
      closeBundle() {
        const assetsDest = resolve(__dirname, 'dist/assets');
        fs.mkdirSync(assetsDest, { recursive: true });
        // main.css
        const mainCss = resolve(__dirname, 'src/styles/main.css');
        if (fs.existsSync(mainCss)) {
          fs.copyFileSync(mainCss, resolve(assetsDest, 'main.css'));
        }
        // members.css
        const membersCss = resolve(__dirname, 'src/styles/members.css');
        if (fs.existsSync(membersCss)) {
          fs.copyFileSync(membersCss, resolve(assetsDest, 'members.css'));
        }
        // JS 脚本（src/scripts/main.js → dist/assets/script.js）
        const mainJs = resolve(__dirname, 'src/scripts/main.js');
        if (fs.existsSync(mainJs)) {
          fs.copyFileSync(mainJs, resolve(assetsDest, 'script.js'));
        }
        for (const js of ['page.js', 'detail.js', 'members.js']) {
          const src = resolve(__dirname, 'src/scripts', js);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, resolve(assetsDest, js));
          }
        }
        // 根目录图片
        for (const img of ['logo.jpg', 'qrcode.jpg', 'print-logo.jpg', 'venue-header.jpg']) {
          const src = resolve(__dirname, 'public', img);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, resolve(assetsDest, img));
          }
        }
      }
    }
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    open: false
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: false
  }
});