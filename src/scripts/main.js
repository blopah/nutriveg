document.addEventListener('DOMContentLoaded', function () {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Mensagem inicial do bot
    appendMessage('Bot', 'Olá! Como posso ajudar você hoje?');

    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('chat-form').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
        }
    });

    chatForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const userMsg = chatInput.value.trim();
        if (!userMsg) return;

        appendMessage('Você', userMsg);
        chatInput.value = '';

        try {
            console.log('Enviando mensagem para a API:', userMsg);

            let userId = localStorage.getItem('userId');
            if (!userId) {
                userId = crypto.randomUUID();
                localStorage.setItem('userId', userId);
            }

            const response = await fetch('https://gestor-n8n.em3gpa.easypanel.host/webhook/7eceea62-4646-41d7-95b7-d60b8658e1f5', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    userId: userId
                })
            });

            console.log('Resposta recebida:', response);

            if (!response.ok) {
                console.log('Resposta não OK:', response.status, response.statusText);
                appendMessage('Bot', `Erro: ${response.status} ${response.statusText}`);
                return;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('Dados do JSON:', data);
                appendMessage('Bot', data.reply || 'Desculpe, não entendi.');
            } else {
                const text = await response.text();
                console.log('Resposta não-JSON:', text);
                appendMessage('Bot', text || 'Desculpe, não entendi.');
            }

        } catch (error) {
            console.log('Erro no try/catch:', error);
            appendMessage('Bot', 'Erro ao conectar à API.');
        }
    });

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message');
        if (sender === 'Você') {
            msgDiv.classList.add('user');
        } else {
            msgDiv.classList.add('bot');
        }
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- MOBILE SLIDE CHAT ---
    const slideWrapper = document.querySelector('.mobile-slide-wrapper');
    const slideInner = document.querySelector('.mobile-slide-inner');
    const showChatBtn = document.querySelector('.show-chat-btn');
    let startX = null;
    let currentX = null;
    let isDragging = false;

    function isMobile() {
        return window.innerWidth <= 600;
    }

    if (slideWrapper && slideInner) {
        slideWrapper.addEventListener('touchstart', function(e) {
            if (!isMobile()) return;
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        slideWrapper.addEventListener('touchmove', function(e) {
            if (!isMobile() || !isDragging) return;
            currentX = e.touches[0].clientX;
        });

        slideWrapper.addEventListener('touchend', function(e) {
            if (!isMobile() || !isDragging) return;
            let deltaX = currentX - startX;
            // Se o usuário arrasta para a esquerda
            if (!slideWrapper.classList.contains('show-chat') && deltaX < -60) {
                slideWrapper.classList.add('show-chat');
            }
            // Se o usuário arrasta para a direita
            if (slideWrapper.classList.contains('show-chat') && deltaX > 60) {
                slideWrapper.classList.remove('show-chat');
            }
            isDragging = false;
            startX = null;
            currentX = null;
        });
    }

    if (showChatBtn && slideWrapper) {
        showChatBtn.addEventListener('click', function() {
            if (!slideWrapper.classList.contains('show-chat')) {
                slideWrapper.classList.add('show-chat');
            }
        });
    }
});