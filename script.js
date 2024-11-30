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
    const pdfPreview = document.getElementById('pdfPreview');
    const previewOverlay = document.querySelector('.preview-overlay');
    const viewPortfolioBtn = document.getElementById('viewPortfolio');
    const pdfModal = document.getElementById('pdfModal');
    const closePdfModal = document.getElementById('closePdfModal');
    const pdfViewer = document.getElementById('pdfViewer');

    function openPdfViewer() {
        if (pdfModal && pdfViewer) {
            pdfViewer.src = 'file/杨群 设计作品集.pdf';
            pdfModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closePdfViewer() {
        if (pdfModal && pdfViewer) {
            pdfModal.classList.remove('show');
            document.body.style.overflow = '';
            pdfViewer.src = '';
        }
    }

    // 绑定 PDF 相关事件
    if (previewOverlay) {
        previewOverlay.addEventListener('click', function (e) {
            e.stopPropagation();
            openPdfViewer();
        });
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

    // ===== Kimi AI 聊天功能 =====
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // Kimi API 配置
    const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
    // API 密钥通过环境变量或配置文件管理会更安全
    const KIMI_API_KEY = 'sk-KgEigGxxVREz6ZHpScEaGDWMQmS6sYK5pLhtPh3GGxqmfF7r';

    // 添加消息到聊天框
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 调用 Kimi API
    async function callKimiAPI(message) {
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
            // 错误处理
            loadingDiv.remove();
            addMessage('抱歉，发生了一些错误，请稍后再试。');
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