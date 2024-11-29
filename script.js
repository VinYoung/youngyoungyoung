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

    // ===== AI 聊天功能 =====
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // AI回复模板
    const aiResponses = {
        '技能': '我擅长UI设计、平面设计和品牌设计。在UI设计方面，我特别注重用户体验和界面美观性；在平面设计领域，我可以处理各类印刷品和数字媒体的设计需求；在品牌设计方面，我能够帮助企业建立统一的视觉识别系统。',
        '经历': '我有多年的设计经验，曾参与过多个成功的商业项目。我的作品集中展示了一些代表性的项目案例，你可以通过查看作品集了解更多详情。',
        '风格': '我的设计风格注重简约现代，同时保持独特的创意表现。我善于运用色彩和排版来传达设计理念，始终追求设计的实用性和美观性的平衡。',
        '你好': '你好！我是羊羊羊的AI助手，很高兴为你介绍她的相关信息。你可以问我关于她的专业技能、工作经历或设计风格等问题。',
        '联系': '你可以通过页面上显示的社交媒体链接与羊羊羊取得联系。',
    };

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getAIResponse(message) {
        message = message.toLowerCase();
        let response = '抱歉，我可能没有理解你的问题。你可以试着问我关于专业技能、工作经历或设计风格方面的问题。';

        for (let key in aiResponses) {
            if (message.includes(key)) {
                response = aiResponses[key];
                break;
            }
        }
        return response;
    }

    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // 添加用户消息
            addMessage(message, true);
            chatInput.value = '';

            // 添加AI回复
            setTimeout(() => {
                const aiResponse = getAIResponse(message);
                addMessage(aiResponse);
            }, 500);
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