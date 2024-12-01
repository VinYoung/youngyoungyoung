document.addEventListener('DOMContentLoaded', function () {
    // ===== 轮播图功能 =====
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentSlide = 0;
    let slideInterval;

    // 创建轮播点
    if (slides.length && dots) {
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dots.appendChild(dot);
        });
    }

    const allDots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        allDots[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        allDots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }

    function prevSlide() {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }

    function startAutoPlay() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (slideInterval) clearInterval(slideInterval);
    }

    // 添加轮播图按钮事件监听
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });

        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }

    // 开始自动播放
    startAutoPlay();

    // ===== 聊天功能 =====
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // 调用 Kimi API
    async function callKimiAPI(message) {
        try {
            const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer sk-KgEigGxxVREz6ZHpScEaGDWMQmS6sYK5pLhtPh3GGxqmfF7r'
                },
                body: JSON.stringify({
                    model: "moonshot-v1-8k",
                    messages: [
                        {
                            "role": "system",
                            "content": "你是一个AI助手，负责回答关于羊羊羊的问题。她是一名设计师，精通UI设计和平面设计。请用简洁专业的语气回答问题，突出她的专业能力和项目经验。"
                        },
                        {
                            "role": "user",
                            "content": message
                        }
                    ],
                    temperature: 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error:', error);
            return '抱歉，我现在无法回答你的问题。请稍后再试。';
        }
    }

    // 添加消息到聊天框
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 处理发送消息
    async function handleSendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(message, true);
        chatInput.value = '';

        // 显示正在输入状态
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.innerHTML = '<div class="message-content">正在思考...</div>';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // 获取 AI 回复
            const aiResponse = await callKimiAPI(message);

            // 移除加载消息
            loadingDiv.remove();

            // 添加 AI 回复
            addMessage(aiResponse);
        } catch (error) {
            loadingDiv.remove();
            addMessage('抱歉，我现在无法回答你的问题。请稍后再试。');
        }
    }

    // 发送消息事件监听
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }

    // 回车发送消息
    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }

    // ===== PDF 查看功能 =====
    const pdfUrl = 'https://oss.mrtree.vip:8443/young-core/files/youngyoungyoung/杨群 设计作品集.pdf';

    // 检测是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // 初始化 PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // 获取元素
    const pdfPreview = document.getElementById('pdfPreview');
    const viewPortfolioBtn = document.getElementById('viewPortfolio');
    const pdfModal = document.getElementById('pdfModal');
    const closePdfModal = document.getElementById('closePdfModal');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfCanvas = document.getElementById('pdfCanvas');

    // 渲染预览
    async function renderPreview() {
        try {
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');

            const viewport = page.getViewport({ scale: 1.0 });
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
            console.error('Error rendering preview:', error);
        }
    }

    // 处理 PDF 查看
    function handlePdfAction() {
        if (isMobile) {
            // 移动端：创建一个新的查看页面
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>设计作品集</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            background: #f0f0f0;
                            display: flex;
                            flex-direction: column;
                        }
                        #pageContainer {
                            flex: 1;
                            overflow-y: auto;
                            padding: 20px;
                            box-sizing: border-box;
                        }
                        .pdf-page {
                            background: white;
                            margin: 10px auto;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .controls {
                            position: fixed;
                            bottom: 20px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: rgba(0,0,0,0.7);
                            padding: 10px 20px;
                            border-radius: 20px;
                            display: flex;
                            gap: 10px;
                            align-items: center;
                            color: white;
                        }
                        button {
                            background: none;
                            border: none;
                            color: white;
                            cursor: pointer;
                            padding: 5px 10px;
                        }
                    </style>
                </head>
                <body>
                    <div id="pageContainer"></div>
                    <div class="controls">
                        <button id="prev">上一页</button>
                        <span id="pageNum"></span>
                        <button id="next">下一页</button>
                    </div>
                    <script>
                        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                        
                        const url = '${pdfUrl}';
                        let pdfDoc = null;
                        let pageNum = 1;
                        const container = document.getElementById('pageContainer');
                        const pageNumSpan = document.getElementById('pageNum');
                        
                        async function renderPage(num) {
                            const page = await pdfDoc.getPage(num);
                            const viewport = page.getViewport({ scale: 1.0 });
                            
                            // 计算缩放比例以适应屏幕宽度
                            const scale = (container.clientWidth - 40) / viewport.width;
                            const scaledViewport = page.getViewport({ scale });
                            
                            const canvas = document.createElement('canvas');
                            canvas.className = 'pdf-page';
                            const context = canvas.getContext('2d');
                            canvas.height = scaledViewport.height;
                            canvas.width = scaledViewport.width;
                            
                            container.innerHTML = '';
                            container.appendChild(canvas);
                            
                            await page.render({
                                canvasContext: context,
                                viewport: scaledViewport
                            }).promise;
                            
                            pageNumSpan.textContent = num + ' / ' + pdfDoc.numPages;
                        }
                        
                        pdfjsLib.getDocument(url).promise.then(doc => {
                            pdfDoc = doc;
                            renderPage(pageNum);
                            
                            document.getElementById('prev').onclick = () => {
                                if (pageNum <= 1) return;
                                pageNum--;
                                renderPage(pageNum);
                            };
                            
                            document.getElementById('next').onclick = () => {
                                if (pageNum >= pdfDoc.numPages) return;
                                pageNum++;
                                renderPage(pageNum);
                            };
                        });
                    </script>
                </body>
                </html>
            `);
            newWindow.document.close();
        } else {
            // PC端：使用模态框查看
            if (pdfModal && pdfViewer) {
                const viewerUrl = 'https://mozilla.github.io/pdf.js/web/viewer.html';
                pdfViewer.src = `${viewerUrl}?file=${encodeURIComponent(pdfUrl)}`;
                pdfModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }
    }

    // 关闭 PDF（仅 PC 端需要）
    function closePdfViewer() {
        if (!isMobile && pdfModal && pdfViewer) {
            pdfModal.classList.remove('show');
            document.body.style.overflow = '';
            pdfViewer.src = '';
        }
    }

    // 初始化预览
    if (pdfCanvas) {
        renderPreview();
        window.addEventListener('resize', debounce(renderPreview, 250));
    }

    // 绑定事件
    if (pdfPreview) {
        pdfPreview.addEventListener('click', handlePdfAction);
    }

    if (viewPortfolioBtn) {
        viewPortfolioBtn.addEventListener('click', handlePdfAction);
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

    // ESC 键关闭模态框（仅 PC 端）
    document.addEventListener('keydown', function (e) {
        if (!isMobile && e.key === 'Escape' && pdfModal && pdfModal.classList.contains('show')) {
            closePdfViewer();
        }
    });

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}); 