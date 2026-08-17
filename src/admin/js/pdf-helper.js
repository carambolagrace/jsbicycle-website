/**
 * Admin 端 PDF 处理工具
 * 客户端 PDF 压缩（保留画质、移除冗余数据）+ 上传辅助
 *
 * 依赖：pdf-lib（通过 CDN 引入到 Admin 页面）
 */
const PDFHelper = (() => {
    /**
     * 加载 PDFDocument（动态 import pdf-lib）
     */
    async function loadPdfLib() {
        return await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
    }

    /**
     * 客户端压缩 PDF — 保持画质、减小文件
     * 策略：
     *   1. 移除元数据（标题、作者、生产者、关键字等）
     *   2. 启用对象流（useObjectStreams = true）
     *   3. 不重新渲染每页（保证画质）
     */
    async function compressPdf(arrayBuffer, options = {}) {
        const { PDFDocument } = await loadPdfLib();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        // 清理元数据
        try {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('jbbea-admin');
            pdfDoc.setCreator('jbbea-admin');
            pdfDoc.removePageRefs && pdfDoc.removePageRefs();
        } catch (e) {
            // 某些 PDF 可能没设置这些字段
        }

        // 保存（启用对象流压缩）
        const bytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50,
            updateFieldAppearances: false
        });
        return bytes;
    }

    /**
     * 进一步压缩 — 重新渲染每页为 JPEG（适合扫描版或大量图片的 PDF）
     * 保留画质（quality: 0.92 — 接近原画质）
     * 注意：这个比较慢（每页 ~100-200ms），仅在 compressPdf 后仍 > 5 MB 时使用
     */
    async function recompressPdf(arrayBuffer, quality = 0.92, scale = 1.5) {
        // 用 pdf.js 渲染每一页 → Canvas → JPEG → 重新打包
        const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm');
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

        const { PDFDocument } = await loadPdfLib();

        // 1. 加载原 PDF
        const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise;
        const pageCount = pdf.numPages;
        console.log(`Recompressing ${pageCount} pages at quality ${quality}...`);

        // 2. 创建新 PDF
        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= pageCount; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;

            // 转 JPEG
            const jpegBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));
            const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
            const jpegImage = await newPdf.embedJpg(jpegBytes);

            // 添加新页面
            const newPage = newPdf.addPage([viewport.width / scale * 1.4, viewport.height / scale * 1.4]);
            // 注意：viewport 的 width 是按 scale 缩放后的像素，但 PDF 页面尺寸单位是点 (1pt = 1/72 inch)
            // 这里直接用 viewport 像素对应 PDF 点（简化）
            newPage.drawImage(jpegImage, {
                x: 0, y: 0,
                width: newPage.getWidth(),
                height: newPage.getHeight()
            });
            console.log(`  Page ${i}/${pageCount} done`);
        }

        return await newPdf.save({ useObjectStreams: true });
    }

    /**
     * 智能压缩：先尝试轻度压缩，仍太大时深度压缩
     */
    async function smartCompress(arrayBuffer) {
        const originalSize = arrayBuffer.byteLength;
        console.log(`原始大小: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

        // 阶段 1: 轻度压缩（移除元数据 + 启用对象流）
        let result = await compressPdf(arrayBuffer);
        let ratio = result.byteLength / originalSize;
        console.log(`轻度压缩后: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB (${(ratio * 100).toFixed(0)}%)`);

        // 阶段 2: 如果仍然 > 5 MB，用图像重渲染
        if (result.byteLength > 5 * 1024 * 1024) {
            console.log('文件仍较大，启动深度压缩...');
            result = await recompressPdf(arrayBuffer, 0.92, 1.5);
            ratio = result.byteLength / originalSize;
            console.log(`深度压缩后: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB (${(ratio * 100).toFixed(0)}%)`);
        }

        // 阶段 3: 如果仍然 > 5 MB，降低画质
        if (result.byteLength > 5 * 1024 * 1024) {
            console.log('再次降低画质...');
            result = await recompressPdf(arrayBuffer, 0.85, 1.3);
            console.log(`最终: ${(result.byteLength / 1024 / 1024).toFixed(2)} MB`);
        }

        return result;
    }

    /**
     * 读取文件为 ArrayBuffer
     */
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