document.addEventListener('DOMContentLoaded', function () {
    const pdfUrl = 'https://oss.mrtree.vip:8443/young-core/files/youngyoungyoung/杨群 设计作品集.pdf';
    const viewerUrl = 'https://mozilla.github.io/pdf.js/web/viewer.html';

    // 获取元素
    const pdfPreview = document.getElementById('pdfPreview');
    const viewPortfolioBtn = document.getElementById('viewPortfolio');
    const pdfModal = document.getElementById('pdfModal');
    const closePdfModal = document.getElementById('closePdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfCanvas = document.getElementById('pdfCanvas');

    // 初始化 PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // 渲染预览
    async function renderPreview() {
        try {
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 1.0 });
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');

            // 根据容器宽度调整缩放
            const container = canvas.parentElement;
            const scale = container.clientWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale });

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
        } catch (error) {
            console.error('Error rendering PDF preview:', error);
        }
    }

    // 初始渲染预览
    if (pdfCanvas) {
        renderPreview();

        // 防抖函数
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // 监听窗口大小变化
        window.addEventListener('resize', debounce(() => {
            renderPreview();
        }, 250));
    }

    // 打开 PDF
    function openPdfViewer() {
        if (pdfModal && pdfViewer) {
            pdfViewer.src = `${viewerUrl}?file=${encodeURIComponent(pdfUrl)}`;
            pdfModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    // 关闭 PDF
    function closePdfViewer() {
        if (pdfModal && pdfViewer) {
            pdfModal.classList.remove('show');
            document.body.style.overflow = '';
            pdfViewer.src = '';
        }
    }

    // 绑定事件
    if (pdfPreview) {
        pdfPreview.addEventListener('click', openPdfViewer);
    }

    if (viewPortfolioBtn) {
        viewPortfolioBtn.addEventListener('click', openPdfViewer);
    }

    if (closePdfModal) {
        closePdfModal.addEventListener('click', closePdfViewer);
    }

    if (pdfModal) {
        pdfModal.addEventListener('click', function (e) {
            if (e.target === pdfModal) {
                closePdfViewer();
            }
        });
    }

    // ESC 键关闭模态框
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && pdfModal && pdfModal.classList.contains('show')) {
            closePdfViewer();
        }
    });
}); 