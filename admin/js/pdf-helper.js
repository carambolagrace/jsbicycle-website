/**
 * Admin 端 PDF 处理工具
 * 客户端 PDF 压缩（保留画质、移除冗余数据）+ 上传辅助
 *
 * 依赖：pdf-lib + pdf.js（通过 CDN 引入到 Admin 页面）
 */
const PDFHelper = (() => {
    const PDFJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    const PDFJS_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    const PDFLIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.esm.js';

    async function loadPdfLib() {
        return await import(PDFLIB_URL);
    }

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
     * 通常对杂志类 PDF 可减小 20-40%
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
        } catch (e) { /* 忽略 */ }

        return await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50
        });
    }

    /**
     * 阶段 2：重渲染为 JPEG 图像（强制深度压缩）
     * 把 PDF 每一页渲染成低分辨率 JPEG，再打包成新 PDF
     * 目标：25 MB → 2-5 MB，画质接近原图
     *
     * @param arrayBuffer PDF 源文件
     * @param quality JPEG 质量 0.7-0.95
     * @param scale 渲染缩放比例 0.8-2.0（1.0 = 原始分辨率）
     */
    async function recompressPdf(arrayBuffer, quality = 0.85, scale = 1.0) {
        const pdfjs = await loadPdfJs();
        const { PDFDocument } = await loadPdfLib();

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        console.log(`[PDF] 共 ${pageCount} 页，开始重渲染（quality=${quality}, scale=${scale}）...`);

        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= pageCount; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext('2d');

            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            const jpegBlob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', quality);
            });
            const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
            const jpegImage = await newPdf.embedJpg(jpegBytes);

            // 注意：viewport 在 pdf.js 中默认单位是 pt（1/72 inch）
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
     * 智能压缩策略：始终先试轻度压缩，再判断是否需要深度压缩
     * 目标：让文件 ≤ 5 MB（GitHub Contents API 最稳定区间，画质较好）
     */
    async function smartCompress(arrayBuffer, opts = {}) {
        const targetMax = opts.targetMax || 5 * 1024 * 1024; // 目标 5MB
        const originalSize = arrayBuffer.byteLength;
        console.log(`[PDF] 原始大小: ${(originalSize / 1024 / 1024).toFixed(2)} MB (目标 < ${(targetMax / 1024 / 1024).toFixed(1)} MB)`);

        // 阶段 1：轻度压缩
        let result;
        try {
            result = await compressPdf(arrayBuffer);
            console.log(`[PDF] 轻度压缩后: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB`);
        } catch (e) {
            console.warn('[PDF] 轻度压缩失败:', e);
            result = new Uint8Array(arrayBuffer);
        }

        // 如果轻度压缩已达标
        if (result.byteLength <= targetMax) {
            return result;
        }

        // 阶段 2：深度压缩（高画质）
        try {
            console.log(`[PDF] 轻度压缩仍超目标，深度压缩（92% 画质）...`);
            result = await recompressPdf(arrayBuffer, 0.92, 1.0);
            console.log(`[PDF] 深度压缩后: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB`);
            if (result.byteLength <= targetMax) return result;
        } catch (e) {
            console.warn('[PDF] 深度压缩失败:', e);
        }

        // 阶段 3：再降画质
        try {
            console.log(`[PDF] 再降画质到 85%...`);
            result = await recompressPdf(arrayBuffer, 0.85, 0.9);
            console.log(`[PDF] 最终: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB`);
        } catch (e) {
            console.warn('[PDF] 二次压缩失败:', e);
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