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

    // 添加按钮事件监听
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

    // ===== PDF 查看功能 =====
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfUrl = 'https://oss.mrtree.vip:8443/young-core/files/youngyoungyoung/杨群 设计作品集.pdf';
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');

    // 加载并渲染 PDF 预览
    function renderPdfPreview() {
        pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc => {
            pdfDoc.getPage(1).then(page => {
                const viewport = page.getViewport({ scale: 1.0 });
                const container = document.querySelector('.pdf-preview');
                const scale = container.clientWidth / viewport.width;
                const scaledViewport = page.getViewport({ scale });

                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };

                page.render(renderContext);
            });
        }).catch(error => {
            console.error('Error loading PDF:', error);
        });
    }

    // 初始渲染预览
    renderPdfPreview();
    window.addEventListener('resize', renderPdfPreview);

    // PDF 查看功能
    const pdfPreview = document.getElementById('pdfPreview');
    const viewPortfolioBtn = document.getElementById('viewPortfolio');
    const pdfModal = document.getElementById('pdfModal');
    const closePdfModal = document.getElementById('closePdfModal');
    const pdfViewer = document.getElementById('pdfViewer');

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.5;
    let isPaginationMode = false;

    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function (page) {
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = 'pdf-page';

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(function () {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });

            const container = document.createElement('div');
            container.className = 'pdf-container';
            container.appendChild(canvas);

            pdfViewer.innerHTML = '';
            pdfViewer.appendChild(container);

            if (isPaginationMode) {
                const controls = document.createElement('div');
                controls.className = 'pdf-controls';
                controls.innerHTML = `
                    <button class="prev-button">上一页</button>
                    <div class="page-navigation">
                        <input type="number" min="1" max="${pdfDoc.numPages}" value="${pageNum}" class="page-input">
                        <span>/ ${pdfDoc.numPages} 页</span>
                    </div>
                    <button class="next-button">下一页</button>
                `;

                const prevButton = controls.querySelector('.prev-button');
                const nextButton = controls.querySelector('.next-button');
                const pageInput = controls.querySelector('.page-input');

                prevButton.addEventListener('click', () => {
                    if (pageNum <= 1) return;
                    pageNum--;
                    queueRenderPage(pageNum);
                    pageInput.value = pageNum;
                });

                nextButton.addEventListener('click', () => {
                    if (pageNum >= pdfDoc.numPages) return;
                    pageNum++;
                    queueRenderPage(pageNum);
                    pageInput.value = pageNum;
                });

                pageInput.addEventListener('change', () => {
                    const newPage = parseInt(pageInput.value);
                    if (newPage >= 1 && newPage <= pdfDoc.numPages) {
                        pageNum = newPage;
                        queueRenderPage(pageNum);
                    } else {
                        pageInput.value = pageNum;
                    }
                });

                pdfViewer.appendChild(controls);
            }
        });
    }

    async function renderFullPdf() {
        try {
            pdfViewer.innerHTML = '';
            const loadingText = document.createElement('div');
            loadingText.textContent = '加载中...';
            loadingText.className = 'loading-text';
            pdfViewer.appendChild(loadingText);

            const doc = await pdfjsLib.getDocument(pdfUrl).promise;
            pdfDoc = doc;

            const container = document.createElement('div');
            container.className = 'pdf-pages-container';
            pdfViewer.innerHTML = '';
            pdfViewer.appendChild(container);

            for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
                const page = await doc.getPage(pageNum);
                const viewport = page.getViewport({ scale: scale });
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.className = 'pdf-page';

                await page.render({
                    canvasContext: ctx,
                    viewport: viewport
                }).promise;

                container.appendChild(canvas);
            }
        } catch (error) {
            console.error('Error rendering PDF:', error);
            pdfViewer.innerHTML = '<div class="error-message">PDF 加载失败，请重试</div>';
        }
    }

    function openPdfViewer() {
        if (pdfModal && pdfViewer) {
            pdfModal.classList.add('show');
            document.body.style.overflow = 'hidden';

            // 添加模式切换按钮
            const modeToggle = document.createElement('button');
            modeToggle.className = 'mode-toggle';
            modeToggle.textContent = isPaginationMode ? '切换到滚动模式' : '切换到分页模式';
            modeToggle.onclick = async function () {
                isPaginationMode = !isPaginationMode;
                this.textContent = isPaginationMode ? '切换到滚动模式' : '切换到分页模式';

                if (isPaginationMode) {
                    if (!pdfDoc) {
                        pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
                    }
                    pageNum = 1;
                    renderPage(pageNum);
                } else {
                    renderFullPdf();
                }
            };

            // 确保按钮在正确的位置
            const existingToggle = document.querySelector('.mode-toggle');
            if (existingToggle) {
                existingToggle.remove();
            }
            pdfModal.appendChild(modeToggle);

            // 初始渲染
            renderFullPdf();
        }
    }

    function closePdfViewer() {
        if (pdfModal && pdfViewer) {
            pdfModal.classList.remove('show');
            document.body.style.overflow = '';
            pdfViewer.innerHTML = '';
            pdfDoc = null;
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

    // 添加翻页按钮（隐藏但可点击）
    const prevButton = document.createElement('button');
    prevButton.id = 'prevPage';
    prevButton.style.display = 'none';
    document.body.appendChild(prevButton);
    prevButton.addEventListener('click', onPrevPage);

    const nextButton = document.createElement('button');
    nextButton.id = 'nextPage';
    nextButton.style.display = 'none';
    document.body.appendChild(nextButton);
    nextButton.addEventListener('click', onNextPage);

    // ESC 键关闭模态框
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && pdfModal && pdfModal.classList.contains('show')) {
            closePdfViewer();
        }
    });

    // ===== Kimi AI 聊天功能 =====
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // Kimi API 配置
    const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
    const KIMI_API_KEY = 'sk-KgEigGxxVREz6ZHpScEaGDWMQmS6sYK5pLhtPh3GGxqmfF7r';

    // 添加消息到聊天框
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // 流式处理响应
    async function handleStream(response, messageDiv) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let messageContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta.content;
                        if (content) {
                            messageContent += content;
                            messageDiv.querySelector('.message-content').innerHTML = messageContent;
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    } catch (e) {
                        console.error('Error parsing SSE:', e);
                    }
                }
            }
        }
    }

    // 调用 Kimi API
    async function callKimiAPI(message, messageDiv) {
        try {
            const response = await fetch(KIMI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${KIMI_API_KEY}`
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
                    stream: true  // 启用流式响应
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            await handleStream(response, messageDiv);
        } catch (error) {
            console.error('Error:', error);
            messageDiv.querySelector('.message-content').innerHTML =
                '抱歉，我现在无法回答你的问题。请稍后再试。';
        }
    }

    // 处理发送消息
    async function handleSendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(message, true);
        chatInput.value = '';

        // 创建 AI 回复消息框
        const aiMessageDiv = addMessage('', false);
        aiMessageDiv.querySelector('.message-content').innerHTML =
            '<div class="typing-indicator"><span></span><span></span><span></span></div>';

        try {
            // 获取 AI 回复
            await callKimiAPI(message, aiMessageDiv);
        } catch (error) {
            // 错误处理
            aiMessageDiv.querySelector('.message-content').innerHTML =
                '抱歉，发生了一些错误，请稍后再试。';
            console.error('Chat error:', error);
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
}); 