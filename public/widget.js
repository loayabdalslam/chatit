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
    animation: 'bounce',
    chatbotName: 'Assistant'
  };

  class ChatWidget {
    constructor(config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.isOpen = false;
      this.sessionId = 'widget-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      this.messages = [];
      this.isTyping = false;
      this.chatbotInfo = null;
      this.initWithConfig();
    }

    async initWithConfig() {
      try {
        // Fetch chatbot configuration
        await this.fetchChatbotInfo();
        this.init();
      } catch (error) {
        console.error('Failed to fetch chatbot config:', error);
        // Fallback to default config
        this.init();
      }
    }

    async fetchChatbotInfo() {
      if (!this.config.chatbotId) {
        throw new Error('Chatbot ID is required');
      }

      try {
        const response = await fetch(`${this.config.apiUrl}/api/chatbot/${this.config.chatbotId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        this.chatbotInfo = await response.json();
        
        // Update config with fetched data
        if (this.chatbotInfo.widgetConfig) {
          this.config = {
            ...this.config,
            ...this.chatbotInfo.widgetConfig,
            chatbotName: this.chatbotInfo.name,
            welcomeMessage: this.chatbotInfo.widgetConfig.welcomeMessage || `Hi! I'm ${this.chatbotInfo.name}. How can I help you today?`
          };
        } else {
          this.config.chatbotName = this.chatbotInfo.name;
          this.config.welcomeMessage = `Hi! I'm ${this.chatbotInfo.name}. How can I help you today?`;
        }
      } catch (error) {
        console.error('Error fetching chatbot info:', error);
        throw error;
      }
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
        
        .chatbot-widget-header-title {
          font-size: 16px;
          font-weight: 600;
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
        
        .chatbot-widget-input::placeholder {
          color: ${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
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
        
        .chatbot-widget-send:hover {
          background: ${this.adjustColor(this.config.primaryColor, -10)};
          transform: scale(1.05);
        }
        
        .chatbot-widget-send:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .chatbot-widget-message {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        
        .chatbot-widget-message-user {
          justify-content: flex-end;
        }
        
        .chatbot-widget-message-bot {
          justify-content: flex-start;
        }
        
        .chatbot-widget-message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
          animation: messageSlideIn 0.3s ease-out;
        }
        
        .chatbot-widget-message-user .chatbot-widget-message-bubble {
          background: ${this.config.primaryColor};
          color: white;
          border-bottom-right-radius: 6px;
        }
        
        .chatbot-widget-message-bot .chatbot-widget-message-bubble {
          background: ${this.config.theme === 'dark' ? '#4b5563' : 'white'};
          color: ${this.config.theme === 'dark' ? 'white' : '#1f2937'};
          border: ${this.config.theme === 'dark' ? 'none' : '1px solid #e2e8f0'};
          border-bottom-left-radius: 6px;
        }
        
        .chatbot-widget-timestamp {
          font-size: 11px;
          color: ${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
          margin-top: 4px;
          text-align: center;
        }
        
        .chatbot-widget-typing {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }
        
        .chatbot-widget-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
          animation: typingDot 1.4s infinite ease-in-out;
        }
        
        .chatbot-widget-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .chatbot-widget-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes messageSlideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes ${this.config.animation} {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -30px, 0); }
          70% { transform: translate3d(0, -15px, 0); }
          90% { transform: translate3d(0, -4px, 0); }
        }
        
        .chatbot-widget-button.${this.config.animation} {
          animation: ${this.config.animation} 2s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }

    adjustColor(color, amount) {
      return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

    getSizePixels() {
      const sizes = { small: '50px', medium: '60px', large: '70px' };
      return sizes[this.config.size] || sizes.medium;
    }

    getFontSize() {
      const sizes = { small: '18px', medium: '20px', large: '24px' };
      return sizes[this.config.size] || sizes.medium;
    }

    getPosition() {
      const positions = {
        'bottom-right': { bottom: '20px', right: '20px' },
        'bottom-left': { bottom: '20px', left: '20px' },
        'top-right': { top: '20px', right: '20px' },
        'top-left': { top: '20px', left: '20px' }
      };
      return positions[this.config.position] || positions['bottom-right'];
    }

    getWindowPosition() {
      const positions = {
        'bottom-right': { bottom: '80px', right: '20px' },
        'bottom-left': { bottom: '80px', left: '20px' },
        'top-right': { top: '80px', right: '20px' },
        'top-left': { top: '80px', left: '20px' }
      };
      return positions[this.config.position] || positions['bottom-right'];
    }

    createWidget() {
      // Create container
      this.container = document.createElement('div');
      this.container.className = 'chatbot-widget-container';
      Object.assign(this.container.style, this.getPosition());

      // Create button
      this.button = document.createElement('button');
      this.button.className = `chatbot-widget-button ${this.config.animation}`;
      this.button.innerHTML = '💬';
      this.button.setAttribute('aria-label', `Open ${this.config.chatbotName} chat`);

      // Create window
      this.window = document.createElement('div');
      this.window.className = 'chatbot-widget-window';
      Object.assign(this.window.style, this.getWindowPosition());

      // Create header
      this.header = document.createElement('div');
      this.header.className = 'chatbot-widget-header';
      this.header.innerHTML = `
        <div class="chatbot-widget-header-title">${this.config.chatbotName}</div>
        <button class="chatbot-widget-close" aria-label="Close chat">×</button>
      `;

      // Create messages container
      this.messagesContainer = document.createElement('div');
      this.messagesContainer.className = 'chatbot-widget-messages';

      // Create input container
      this.inputContainer = document.createElement('div');
      this.inputContainer.className = 'chatbot-widget-input-container';

      // Create input
      this.input = document.createElement('textarea');
      this.input.className = 'chatbot-widget-input';
      this.input.placeholder = this.config.placeholder;
      this.input.rows = 1;

      // Create send button
      this.sendButton = document.createElement('button');
      this.sendButton.className = 'chatbot-widget-send';
      this.sendButton.innerHTML = '➤';
      this.sendButton.setAttribute('aria-label', 'Send message');

      // Assemble widget
      this.inputContainer.appendChild(this.input);
      this.inputContainer.appendChild(this.sendButton);
      
      this.window.appendChild(this.header);
      this.window.appendChild(this.messagesContainer);
      this.window.appendChild(this.inputContainer);
      
      this.container.appendChild(this.button);
      this.container.appendChild(this.window);
      
      document.body.appendChild(this.container);
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => this.toggle());
      this.header.querySelector('.chatbot-widget-close').addEventListener('click', () => this.toggle());
      this.sendButton.addEventListener('click', () => this.handleSend());
      
      this.input.addEventListener('keydown', (e) => {
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

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        
        this.hideTyping();
        
        if (data.response) {
          this.addMessage(data.response, 'bot');
        } else if (data.error) {
          this.addMessage(`Error: ${data.error}`, 'bot');
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
        animation: script.getAttribute('data-animation') || 'bounce',
        chatbotName: script.getAttribute('data-chatbot-name') || 'Assistant'
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
