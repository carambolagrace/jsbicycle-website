/**
 * Admin 端 PDF 处理工具
 * 客户端 PDF 压缩（保留画质、移除冗余数据）+ 上传辅助
 *
 * 依赖：pdf-lib + pdf.js（通过 CDN 引入到 Admin 页面）
 */
const PDFHelper = (() => {
    // CDN URLs - 使用稳定的 pdf-lib 和 pdf.js 版本
    const PDFLIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.esm.js';
    const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    const PDFJS_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

    /**
     * 加载 pdf-lib
     */
    async function loadPdfLib() {
        return await import(PDFLIB_URL);
    }

    /**
     * 加载 pdf.js 全局对象（通过 CDN script 标签）
     */
    async function loadPdfJs() {
        return new Promise((resolve, reject) => {
            if (window.pdfjsLib) {
                resolve(window.pdfjsLib);
                return;
            }
            const script = document.createElement('script');
            script.src = PDFJS_URL;
            script.onload = () => {
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                    resolve(window.pdfjsLib);
                } else {
                    reject(new Error('pdfjsLib not loaded'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load pdf.js script'));
            document.head.appendChild(script);
        });
    }

    /**
     * 阶段 1：轻度压缩（移除元数据 + 启用对象流）
     * 适用于所有 PDF。保留画质。
     */
    async function compressPdf(arrayBuffer) {
        const { PDFDocument } = await loadPdfLib();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        try {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('jbbea-admin');
            pdfDoc.setCreator('jbbea-admin');
        } catch (e) { /* 忽略元数据错误 */ }

        return await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50
        });
    }

    /**
     * 阶段 2：深度压缩（重新渲染为 JPEG 图像）
     * 仅在阶段 1 后仍 > 5 MB 时使用
     * 注意：缓慢（每页 ~200-500ms），但压缩比好
     */
    async function recompressPdf(arrayBuffer, quality = 0.92, scale = 1.5) {
        const pdfjs = await loadPdfJs();
        const { PDFDocument } = await loadPdfLib();

        // 加载 PDF
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        console.log(`[PDF] 共 ${pageCount} 页，开始重渲染（quality=${quality}）...`);

        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= pageCount; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });

            // 创建离屏 canvas
            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext('2d');

            // 渲染（使用 pdf.js 3.x 标准 API：仅传 canvasContext + viewport）
            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            // 转 JPEG
            const jpegBlob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', quality);
            });
            const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
            const jpegImage = await newPdf.embedJpg(jpegBytes);

            // 添加新页面（用原 viewport 尺寸，单位 pt）
            const newPage = newPdf.addPage([viewport.width, viewport.height]);
            newPage.drawImage(jpegImage, {
                x: 0, y: 0,
                width: viewport.width,
                height: viewport.height
            });

            console.log(`[PDF] 第 ${i}/${pageCount} 页完成`);
        }

        return await newPdf.save({ useObjectStreams: true });
    }

    /**
     * 智能压缩策略：
     *   1. 轻度压缩（保画质）
     *   2. 如果仍 > 5MB → 重渲染为 JPEG（92% 画质）
     *   3. 如果仍 > 5MB → 重渲染为 JPEG（85% 画质）
     */
    async function smartCompress(arrayBuffer) {
        const originalSize = arrayBuffer.byteLength;
        console.log(`[PDF] 原始大小: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

        // 阶段 1
        let result;
        try {
            result = await compressPdf(arrayBuffer);
            console.log(`[PDF] 轻度压缩后: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB`);
        } catch (e) {
            console.warn('[PDF] 轻度压缩失败，跳过:', e);
            result = new Uint8Array(arrayBuffer);
        }

        // 阶段 2：仅在 > 5 MB 时
        if (result.byteLength > 5 * 1024 * 1024) {
            try {
                console.log('[PDF] 文件仍较大，深度压缩（92% 画质）...');
                result = await recompressPdf(arrayBuffer, 0.92, 1.5);
                console.log(`[PDF] 深度压缩后: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB`);
            } catch (e) {
                console.warn('[PDF] 深度压缩失败，使用轻度压缩结果:', e);
            }
        }

        // 阶段 3：仍 > 5 MB 时降低画质
        if (result.byteLength > 5 * 1024 * 1024) {
            try {
                console.log('[PDF] 仍较大，降低画质到 85%...');
                result = await recompressPdf(arrayBuffer, 0.85, 1.3);
                console.log(`[PDF] 最终: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB`);
            } catch (e) {
                console.warn('[PDF] 二次压缩失败:', e);
            }
        }

        return result;
    }

    async function fileToArrayBuffer(file) {
        return await file.arrayBuffer();
    }

    return {
        compressPdf,
        recompressPdf,
        smartCompress,
        fileToArrayBuffer
    };
})();