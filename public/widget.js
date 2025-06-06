// Enhanced Chatbot Widget Script
(function() {
  'use strict';

  const DEFAULT_CONFIG = {
    chatbotId: '',
    apiUrl: '',
    theme: 'light',
    primaryColor: '#2563eb',
    position: 'bottom-right',
    size: 'medium',
    welcomeMessage: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    showBranding: true,
    borderRadius: 12,
    fontFamily: 'system-ui',
    animation: 'bounce'
  };

  class ChatWidget {
    constructor(config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.isOpen = false;
      this.sessionId = 'widget-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      this.messages = [];
      this.isTyping = false;
      this.init();
    }

    init() {
      this.createStyles();
      this.createWidget();
      this.attachEventListeners();
      this.loadPreviousMessages();
    }

    createStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .chatbot-widget-container {
          position: fixed;
          z-index: 9999;
          font-family: ${this.config.fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .chatbot-widget-button {
          width: ${this.getSizePixels()};
          height: ${this.getSizePixels()};
          border-radius: ${this.config.borderRadius}px;
          background: ${this.config.primaryColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${this.getFontSize()};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .chatbot-widget-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }
        
        .chatbot-widget-button:hover::before {
          transform: translateX(100%);
        }
        
        .chatbot-widget-button:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        
        .chatbot-widget-window {
          position: absolute;
          width: 380px;
          height: 520px;
          background: ${this.config.theme === 'dark' ? '#1f2937' : 'white'};
          border-radius: ${this.config.borderRadius}px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.95);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .chatbot-widget-window.open {
          transform: scale(1);
          opacity: 1;
        }
        
        .chatbot-widget-header {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, -20)});
          color: white;
          padding: 20px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .chatbot-widget-close {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        
        .chatbot-widget-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }
        
        .chatbot-widget-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: ${this.config.theme === 'dark' ? '#374151' : '#f8fafc'};
          scroll-behavior: smooth;
        }
        
        .chatbot-widget-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        .chatbot-widget-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chatbot-widget-messages::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        
        .chatbot-widget-input-container {
          padding: 20px;
          border-top: 1px solid ${this.config.theme === 'dark' ? '#4b5563' : '#e2e8f0'};
          background: ${this.config.theme === 'dark' ? '#1f2937' : 'white'};
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        
        .chatbot-widget-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid ${this.config.theme === 'dark' ? '#4b5563' : '#e2e8f0'};
          border-radius: 25px;
          background: ${this.config.theme === 'dark' ? '#374151' : 'white'};
          color: ${this.config.theme === 'dark' ? 'white' : 'black'};
          outline: none;
          font-family: inherit;
          resize: none;
          min-height: 20px;
          max-height: 100px;
          transition: border-color 0.2s;
        }
        
        .chatbot-widget-input:focus {
          border-color: ${this.config.primaryColor};
        }
        
        .chatbot-widget-send {
          padding: 12px;
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .chatbot-widget-send:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .chatbot-widget-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .chatbot-widget-message {
          margin-bottom: 16px;
          animation: messageSlideIn 0.3s ease-out;
        }
        
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .chatbot-widget-message-user {
          text-align: right;
        }
        
        .chatbot-widget-message-bot {
          text-align: left;
        }
        
        .chatbot-widget-message-bubble {
          display: inline-block;
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 85%;
          word-wrap: break-word;
          position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .chatbot-widget-message-user .chatbot-widget-message-bubble {
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.adjustColor(this.config.primaryColor, -10)});
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .chatbot-widget-message-bot .chatbot-widget-message-bubble {
          background: ${this.config.theme === 'dark' ? '#4b5563' : 'white'};
          color: ${this.config.theme === 'dark' ? 'white' : '#1f2937'};
          border-bottom-left-radius: 4px;
          border: 1px solid ${this.config.theme === 'dark' ? '#6b7280' : '#e2e8f0'};
        }
        
        .chatbot-widget-timestamp {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
        }
        
        .chatbot-widget-branding {
          padding: 12px 20px;
          text-align: center;
          font-size: 11px;
          color: ${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
          background: ${this.config.theme === 'dark' ? '#1f2937' : 'white'};
          border-top: 1px solid ${this.config.theme === 'dark' ? '#4b5563' : '#e2e8f0'};
        }
        
        .chatbot-widget-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 0;
        }
        
        .chatbot-widget-typing-dot {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: chatbot-typing 1.4s infinite ease-in-out;
        }
        
        .chatbot-widget-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .chatbot-widget-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes chatbot-typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        .chatbot-animation-bounce {
          animation: chatbot-bounce 2s infinite;
        }
        
        .chatbot-animation-pulse {
          animation: chatbot-pulse 2s infinite;
        }
        
        .chatbot-animation-shake {
          animation: chatbot-shake 0.5s ease-in-out infinite alternate;
        }
        
        @keyframes chatbot-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes chatbot-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes chatbot-shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }
      `;
      document.head.appendChild(style);
    }

    adjustColor(color, amount) {
      const usePound = color[0] === '#';
      const col = usePound ? color.slice(1) : color;
      const num = parseInt(col, 16);
      let r = (num >> 16) + amount;
      let g = (num >> 8 & 0x00FF) + amount;
      let b = (num & 0x0000FF) + amount;
      r = r > 255 ? 255 : r < 0 ? 0 : r;
      g = g > 255 ? 255 : g < 0 ? 0 : g;
      b = b > 255 ? 255 : b < 0 ? 0 : b;
      return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    }

    getSizePixels() {
      const sizes = { small: '56px', medium: '64px', large: '72px' };
      return sizes[this.config.size] || sizes.medium;
    }

    getFontSize() {
      const sizes = { small: '20px', medium: '24px', large: '28px' };
      return sizes[this.config.size] || sizes.medium;
    }

    getPosition() {
      const positions = {
        'bottom-right': { bottom: '24px', right: '24px' },
        'bottom-left': { bottom: '24px', left: '24px' },
        'top-right': { top: '24px', right: '24px' },
        'top-left': { top: '24px', left: '24px' }
      };
      return positions[this.config.position] || positions['bottom-right'];
    }

    getWindowPosition() {
      const isBottom = this.config.position.includes('bottom');
      const isRight = this.config.position.includes('right');
      
      return {
        [isBottom ? 'bottom' : 'top']: '90px',
        [isRight ? 'right' : 'left']: '0'
      };
    }

    createWidget() {
      this.container = document.createElement('div');
      this.container.className = 'chatbot-widget-container';
      
      const position = this.getPosition();
      Object.assign(this.container.style, position);

      this.button = document.createElement('button');
      this.button.className = `chatbot-widget-button ${this.config.animation !== 'none' ? `chatbot-animation-${this.config.animation}` : ''}`;
      this.button.innerHTML = '💬';

      this.window = document.createElement('div');
      this.window.className = 'chatbot-widget-window';
      
      const windowPosition = this.getWindowPosition();
      Object.assign(this.window.style, windowPosition);

      const header = document.createElement('div');
      header.className = 'chatbot-widget-header';
      
      const headerTitle = document.createElement('span');
      headerTitle.textContent = 'Chat with us';
      
      const closeButton = document.createElement('button');
      closeButton.className = 'chatbot-widget-close';
      closeButton.innerHTML = '×';
      closeButton.onclick = () => this.toggle();
      
      header.appendChild(headerTitle);
      header.appendChild(closeButton);

      this.messagesContainer = document.createElement('div');
      this.messagesContainer.className = 'chatbot-widget-messages';

      const inputContainer = document.createElement('div');
      inputContainer.className = 'chatbot-widget-input-container';

      this.input = document.createElement('textarea');
      this.input.className = 'chatbot-widget-input';
      this.input.placeholder = this.config.placeholder;
      this.input.rows = 1;

      this.sendButton = document.createElement('button');
      this.sendButton.className = 'chatbot-widget-send';
      this.sendButton.innerHTML = '→';
      this.sendButton.onclick = () => this.handleSend();

      inputContainer.appendChild(this.input);
      inputContainer.appendChild(this.sendButton);

      this.window.appendChild(header);
      this.window.appendChild(this.messagesContainer);
      this.window.appendChild(inputContainer);

      if (this.config.showBranding) {
        const branding = document.createElement('div');
        branding.className = 'chatbot-widget-branding';
        branding.textContent = 'Powered by Chatit';
        this.window.appendChild(branding);
      }

      this.container.appendChild(this.button);
      this.container.appendChild(this.window);
      document.body.appendChild(this.container);

      window.chatbotWidget = this;
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => this.toggle());
      
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });

      this.input.addEventListener('input', () => {
        this.autoResize();
      });
    }

    autoResize() {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
    }

    handleSend() {
      const message = this.input.value.trim();
      if (message && !this.isTyping) {
        this.sendMessage(message);
        this.input.value = '';
        this.autoResize();
      }
    }

    toggle() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.window.style.display = 'flex';
        setTimeout(() => {
          this.window.classList.add('open');
        }, 10);
        
        if (this.messages.length === 0) {
          this.addMessage(this.config.welcomeMessage, 'bot');
        }
        
        setTimeout(() => {
          this.input.focus();
        }, 300);
      } else {
        this.window.classList.remove('open');
        setTimeout(() => {
          this.window.style.display = 'none';
        }, 300);
      }
    }

    addMessage(content, sender, timestamp = Date.now()) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chatbot-widget-message chatbot-widget-message-${sender}`;
      
      const bubbleDiv = document.createElement('div');
      bubbleDiv.className = 'chatbot-widget-message-bubble';
      bubbleDiv.textContent = content;
      
      const timestampDiv = document.createElement('div');
      timestampDiv.className = 'chatbot-widget-timestamp';
      timestampDiv.textContent = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      messageDiv.appendChild(bubbleDiv);
      messageDiv.appendChild(timestampDiv);
      this.messagesContainer.appendChild(messageDiv);
      
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      
      this.messages.push({ content, sender, timestamp });
      this.saveMessages();
    }

    showTyping() {
      if (document.getElementById('chatbot-typing-indicator')) return;
      
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chatbot-widget-message chatbot-widget-message-bot';
      typingDiv.id = 'chatbot-typing-indicator';
      
      const bubbleDiv = document.createElement('div');
      bubbleDiv.className = 'chatbot-widget-message-bubble';
      
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'chatbot-widget-typing';
      typingIndicator.innerHTML = `
        <div class="chatbot-widget-typing-dot"></div>
        <div class="chatbot-widget-typing-dot"></div>
        <div class="chatbot-widget-typing-dot"></div>
      `;
      
      bubbleDiv.appendChild(typingIndicator);
      typingDiv.appendChild(bubbleDiv);
      this.messagesContainer.appendChild(typingDiv);
      
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTyping() {
      const typingIndicator = document.getElementById('chatbot-typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }

    async sendMessage(content) {
      this.addMessage(content, 'user');
      this.showTyping();
      this.isTyping = true;
      this.sendButton.disabled = true;
      
      try {
        const response = await fetch(`${this.config.apiUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatbotId: this.config.chatbotId,
            message: content,
            sessionId: this.sessionId
          })
        });

        const data = await response.json();
        
        this.hideTyping();
        
        if (data.response) {
          this.addMessage(data.response, 'bot');
        } else {
          this.addMessage('Sorry, I could not process your request.', 'bot');
        }
      } catch (error) {
        console.error('Chat error:', error);
        this.hideTyping();
        this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'bot');
      } finally {
        this.isTyping = false;
        this.sendButton.disabled = false;
      }
    }

    saveMessages() {
      try {
        localStorage.setItem(`chatbot_messages_${this.config.chatbotId}`, JSON.stringify(this.messages));
      } catch (e) {
        console.warn('Could not save messages to localStorage');
      }
    }

    loadPreviousMessages() {
      try {
        const saved = localStorage.getItem(`chatbot_messages_${this.config.chatbotId}`);
        if (saved) {
          const messages = JSON.parse(saved);
          messages.forEach(msg => {
            if (msg.sender !== 'bot' || msg.content !== this.config.welcomeMessage) {
              this.addMessage(msg.content, msg.sender, msg.timestamp);
            }
          });
        }
      } catch (e) {
        console.warn('Could not load previous messages');
      }
    }
  }

  function initWidget() {
    const scripts = document.querySelectorAll('script[data-chatbot-id]');
    
    scripts.forEach(script => {
      const config = {
        chatbotId: script.getAttribute('data-chatbot-id'),
        apiUrl: script.getAttribute('data-api-url') || window.location.origin,
        theme: script.getAttribute('data-theme') || 'light',
        primaryColor: script.getAttribute('data-primary-color') || '#2563eb',
        position: script.getAttribute('data-position') || 'bottom-right',
        size: script.getAttribute('data-size') || 'medium',
        welcomeMessage: script.getAttribute('data-welcome-message') || 'Hi! How can I help you today?',
        placeholder: script.getAttribute('data-placeholder') || 'Type your message...',
        showBranding: script.getAttribute('data-show-branding') !== 'false',
        borderRadius: parseInt(script.getAttribute('data-border-radius')) || 12,
        fontFamily: script.getAttribute('data-font-family') || 'system-ui',
        animation: script.getAttribute('data-animation') || 'bounce'
      };
      
      if (config.chatbotId) {
        new ChatWidget(config);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  window.ChatWidget = ChatWidget;
})();
