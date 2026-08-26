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
  // publicDir 用项目内 public/，vite 会自动拷贝到 dist 根
  // （老配置是仓库外 ../public，不走 git，已弃用）
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2018',
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/pages/index.html'),
        page: resolve(__dirname, 'src/pages/page.html'),
        detail: resolve(__dirname, 'src/pages/detail.html')
      }
    }
  },
  plugins: [
    {
      // 复制仓库根 data/news/ 目录 (表单备份) → dist/data/news/
      // 让前端 fetch https://www.jsbeva.cn/data/news/news_N_ts.json 能访问
      name: 'copy-data-news',
      closeBundle() {
        const srcDir = resolve(__dirname, 'data/news');
        const destDir = resolve(__dirname, 'dist/data/news');
        if (fs.existsSync(srcDir)) {
          fs.mkdirSync(destDir, { recursive: true });
          for (const file of fs.readdirSync(srcDir)) {
            const srcPath = resolve(srcDir, file);
            const destPath = resolve(destDir, file);
            if (fs.statSync(srcPath).isFile()) {
              fs.copyFileSync(srcPath, destPath);
            }
          }
          console.log('[copy-data-news] 复制了 ' + fs.readdirSync(srcDir).length + ' 个表单备份文件到 dist/data/news/');
        }
      }
    },
    {
      // 复制 dist/data/news/ 下生成一个动态的 index.json
      // 列出所有 news_*.json 文件名（前端用这个 list 来 bulk fetch）
      name: 'generate-news-index',
      closeBundle() {
        const srcDir = resolve(__dirname, 'data/news');
        const destDir = resolve(__dirname, 'dist/data/news');
        if (fs.existsSync(srcDir)) {
          fs.mkdirSync(destDir, { recursive: true });
          const files = fs.readdirSync(srcDir)
            .filter((f) => /^news_\d+_\d+\.json$/.test(f))
            .sort();
          const indexData = { generatedAt: new Date().toISOString(), count: files.length, files: files };
          fs.writeFileSync(resolve(destDir, 'index.json'), JSON.stringify(indexData, null, 2));
        }
      }
    },
    {
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
        // 复制 admin/data 全部内容（递归，包括 news-detail/ 子目录）
        const srcData = resolve(__dirname, 'src/admin/data');
        const destData = resolve(__dirname, 'dist/admin/data');
        if (fs.existsSync(srcData)) {
            fs.mkdirSync(destData, { recursive: true });
            // 使用 cpSync 递归复制 — 可含子目录
            fs.cpSync(srcData, destData, { recursive: true });
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