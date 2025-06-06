// Tree-powered Chat Widget - Modular AI Integration
(function() {
  'use strict';

  // Configuration - Following Tree patterns
  const CONFIG = {
    defaults: {
      theme: 'light',
      primaryColor: '#2563eb',
      position: 'bottom-right',
      welcomeMessage: 'Hi! How can I help you today?',
      placeholder: 'Type your message...',
      showBranding: true,
      borderRadius: 12,
      fontFamily: 'system-ui',
      animation: 'bounce',
      chatbotName: 'Assistant'
    },
    api: {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000
    }
  };

  // Utilities - RORO pattern
  const utils = {
    generateSessionId: () => `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    
    formatTime: (timestamp) => new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp)),

    adjustColor: ({ color, amount = 0 }) => {
      const num = parseInt(color.replace('#', ''), 16);
      const r = Math.min(255, Math.max(0, (num >> 16) + amount));
      const g = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amount));
      const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
      return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    },

    sanitize: (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    debounce: (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    }
  };

  // API Manager
  class APIManager {
    constructor({ apiUrl, chatbotId }) {
      this.apiUrl = apiUrl;
      this.chatbotId = chatbotId;
      this.sessionId = utils.generateSessionId();
    }

    async request({ endpoint, method = 'GET', data = null }) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);

      try {
        const options = {
          method,
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        };

        if (data) options.body = JSON.stringify(data);

        const response = await fetch(`${this.apiUrl}${endpoint}`, options);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        throw error;
      }
    }

    async getChatbotInfo() {
      return this.request({ endpoint: `/api/chatbot/${this.chatbotId}` });
    }

    async sendMessage({ message }) {
      return this.request({
        endpoint: '/api/chat',
        method: 'POST',
        data: { chatbotId: this.chatbotId, message, sessionId: this.sessionId }
      });
    }
  }

  // Message Manager
  class MessageManager {
    constructor() {
      this.messages = [];
    }

    add({ content, sender, timestamp = Date.now() }) {
      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        content, sender, timestamp
      };
      this.messages.push(message);
      return message;
    }

    getAll() {
      return [...this.messages];
    }

    save(sessionId) {
      try {
        localStorage.setItem(`widget-messages-${sessionId}`, JSON.stringify(this.messages));
      } catch (e) {
        console.warn('Failed to save messages:', e);
      }
    }

    load(sessionId) {
      try {
        const saved = localStorage.getItem(`widget-messages-${sessionId}`);
        if (saved) this.messages = JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load messages:', e);
      }
    }
  }

  // UI Manager
  class UIManager {
    constructor({ config }) {
      this.config = config;
      this.isOpen = false;
      this.container = null;
      this.messagesEl = null;
      this.inputEl = null;
    }

    createStyles() {
      if (document.getElementById('tree-widget-styles')) return;

      const style = document.createElement('style');
      style.id = 'tree-widget-styles';
      
      const { primaryColor, theme, fontFamily, borderRadius, position } = this.config;
      const isDark = theme === 'dark';
      
      style.textContent = `
        .tree-widget {
          position: fixed;
          z-index: 999999;
          font-family: ${fontFamily}, system-ui, sans-serif;
          ${this.getPositionCSS(position)}
        }
        
        .tree-widget-btn {
          width: 60px; height: 60px;
          border-radius: ${borderRadius}px;
          background: linear-gradient(135deg, ${primaryColor}, ${utils.adjustColor({ color: primaryColor, amount: -20 })});
          border: none; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 24px;
          transition: all 0.3s ease;
        }
        
        .tree-widget-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 32px rgba(0,0,0,0.2);
        }
        
        .tree-widget-btn.bounce {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .tree-widget-window {
          position: absolute;
          width: 380px; height: 580px;
          background: ${isDark ? '#1f2937' : 'white'};
          border-radius: ${borderRadius}px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.2);
          display: none; flex-direction: column;
          overflow: hidden;
          transform: scale(0.9); opacity: 0;
          transition: all 0.3s ease;
          ${this.getWindowPositionCSS(position)}
        }
        
        .tree-widget-window.open {
          transform: scale(1); opacity: 1;
        }
        
        .tree-widget-header {
          background: linear-gradient(135deg, ${primaryColor}, ${utils.adjustColor({ color: primaryColor, amount: -20 })});
          color: white; padding: 20px;
          display: flex; justify-content: space-between; align-items: center;
        }
        
        .tree-widget-title {
          font-size: 18px; font-weight: 600;
        }
        
        .tree-widget-close {
          background: rgba(255,255,255,0.1);
          border: none; color: white; font-size: 20px;
          cursor: pointer; padding: 8px;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: all 0.2s;
        }
        
        .tree-widget-close:hover {
          background: rgba(255,255,255,0.2);
          transform: rotate(90deg);
        }
        
        .tree-widget-messages {
          flex: 1; padding: 20px;
          overflow-y: auto;
          background: ${isDark ? '#374151' : '#f8fafc'};
          scroll-behavior: smooth;
        }
        
        .tree-message {
          margin-bottom: 16px;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .tree-message.user {
          text-align: right;
        }
        
        .tree-message-bubble {
          display: inline-block; max-width: 80%;
          padding: 12px 16px; border-radius: 18px;
          font-size: 14px; line-height: 1.4;
          word-wrap: break-word;
        }
        
        .tree-message.user .tree-message-bubble {
          background: ${primaryColor}; color: white;
          border-bottom-right-radius: 4px;
        }
        
        .tree-message.bot .tree-message-bubble {
          background: ${isDark ? '#4b5563' : 'white'};
          color: ${isDark ? 'white' : '#374151'};
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .tree-message-time {
          font-size: 11px;
          color: ${isDark ? '#9ca3af' : '#6b7280'};
          margin-top: 4px;
        }
        
        .tree-typing {
          display: flex; align-items: center;
          padding: 12px 16px;
          background: ${isDark ? '#4b5563' : 'white'};
          border-radius: 18px; border-bottom-left-radius: 4px;
          max-width: 80px; margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .tree-typing-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${isDark ? '#9ca3af' : '#6b7280'};
          margin: 0 2px; animation: typing 1.4s infinite;
        }
        
        .tree-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .tree-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
        .tree-widget-input-area {
          padding: 20px;
          background: ${isDark ? '#1f2937' : 'white'};
          border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
        }
        
        .tree-input-wrapper {
          display: flex; gap: 12px; align-items: flex-end;
        }
        
        .tree-widget-input {
          flex: 1; padding: 12px 16px;
          border: 2px solid ${isDark ? '#374151' : '#e5e7eb'};
          border-radius: 24px;
          background: ${isDark ? '#374151' : 'white'};
          color: ${isDark ? 'white' : '#374151'};
          font-size: 14px; resize: none; outline: none;
          transition: all 0.2s;
          max-height: 120px; min-height: 44px;
        }
        
        .tree-widget-input:focus {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 3px ${primaryColor}20;
        }
        
        .tree-send-btn {
          width: 44px; height: 44px; border-radius: 50%;
          background: ${primaryColor}; border: none; color: white;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        
        .tree-send-btn:hover:not(:disabled) {
          background: ${utils.adjustColor({ color: primaryColor, amount: -20 })};
          transform: scale(1.05);
        }
        
        .tree-send-btn:disabled {
          opacity: 0.5; cursor: not-allowed;
        }
        
        .tree-widget-branding {
          text-align: center; padding: 12px; font-size: 12px;
          color: ${isDark ? '#9ca3af' : '#6b7280'};
          background: ${isDark ? '#374151' : '#f9fafb'};
        }
        
        .tree-widget-branding a {
          color: ${primaryColor}; text-decoration: none;
        }
        
        .tree-error {
          background: #fef2f2; color: #dc2626;
          padding: 12px 16px; border-radius: 8px;
          margin: 12px; font-size: 14px; text-align: center;
          border: 1px solid #fecaca;
        }
        
        @media (max-width: 480px) {
          .tree-widget-window {
            width: calc(100vw - 20px);
            height: calc(100vh - 20px);
            max-width: 380px; max-height: 580px;
          }
        }
      `;
      
      document.head.appendChild(style);
    }

    getPositionCSS(position) {
      const positions = {
        'bottom-right': 'bottom: 20px; right: 20px;',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;'
      };
      return positions[position] || positions['bottom-right'];
    }

    getWindowPositionCSS(position) {
      const positions = {
        'bottom-right': 'bottom: 80px; right: 0;',
        'bottom-left': 'bottom: 80px; left: 0;',
        'top-right': 'top: 80px; right: 0;',
        'top-left': 'top: 80px; left: 0;'
      };
      return positions[position] || positions['bottom-right'];
    }

    create() {
      this.container = document.createElement('div');
      this.container.className = 'tree-widget';
      
      this.container.innerHTML = `
        <button class="tree-widget-btn ${this.config.animation}" aria-label="Open chat">
          💬
        </button>
        
        <div class="tree-widget-window">
          <div class="tree-widget-header">
            <div class="tree-widget-title">${utils.sanitize(this.config.chatbotName)}</div>
            <button class="tree-widget-close" aria-label="Close">×</button>
          </div>
          
          <div class="tree-widget-messages"></div>
          
          <div class="tree-widget-input-area">
            <div class="tree-input-wrapper">
              <textarea 
                class="tree-widget-input" 
                placeholder="${utils.sanitize(this.config.placeholder)}"
                rows="1" maxlength="1000"
              ></textarea>
              <button class="tree-send-btn" aria-label="Send">➤</button>
            </div>
          </div>
          
          ${this.config.showBranding ? `
            <div class="tree-widget-branding">
              Powered by <a href="https://chatit.cloud" target="_blank">chatit.cloud</a>
            </div>
          ` : ''}
        </div>
      `;

      this.messagesEl = this.container.querySelector('.tree-widget-messages');
      this.inputEl = this.container.querySelector('.tree-widget-input');
      
      document.body.appendChild(this.container);
      this.attachEvents();
    }

    attachEvents() {
      const btn = this.container.querySelector('.tree-widget-btn');
      const closeBtn = this.container.querySelector('.tree-widget-close');
      const sendBtn = this.container.querySelector('.tree-send-btn');
      
      btn.addEventListener('click', () => this.toggle());
      closeBtn.addEventListener('click', () => this.close());
      sendBtn.addEventListener('click', () => this.handleSend());
      
      this.inputEl.addEventListener('input', utils.debounce(() => this.autoResize(), 100));
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });
    }

    autoResize() {
      this.inputEl.style.height = 'auto';
      this.inputEl.style.height = `${Math.min(this.inputEl.scrollHeight, 120)}px`;
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      if (this.isOpen) return;
      
      const window = this.container.querySelector('.tree-widget-window');
      const btn = this.container.querySelector('.tree-widget-btn');
      
      window.style.display = 'flex';
      btn.classList.remove('bounce');
      
      requestAnimationFrame(() => {
        window.classList.add('open');
      });
      
      this.isOpen = true;
      this.inputEl.focus();
      this.scrollToBottom();
    }

    close() {
      if (!this.isOpen) return;
      
      const window = this.container.querySelector('.tree-widget-window');
      const btn = this.container.querySelector('.tree-widget-btn');
      
      window.classList.remove('open');
      
      setTimeout(() => {
        window.style.display = 'none';
        if (this.config.animation === 'bounce') {
          btn.classList.add('bounce');
        }
      }, 300);
      
      this.isOpen = false;
    }

    showMessage({ content, sender, timestamp }) {
      const messageEl = document.createElement('div');
      messageEl.className = `tree-message ${sender}`;
      
      messageEl.innerHTML = `
        <div class="tree-message-bubble">
          ${utils.sanitize(content)}
        </div>
        <div class="tree-message-time">
          ${utils.formatTime(timestamp)}
        </div>
      `;
      
      this.messagesEl.appendChild(messageEl);
      this.scrollToBottom();
    }

    showTyping() {
      if (this.container.querySelector('.tree-typing')) return;
      
      const typingEl = document.createElement('div');
      typingEl.className = 'tree-typing';
      typingEl.innerHTML = `
        <div class="tree-typing-dot"></div>
        <div class="tree-typing-dot"></div>
        <div class="tree-typing-dot"></div>
      `;
      
      this.messagesEl.appendChild(typingEl);
      this.scrollToBottom();
    }

    hideTyping() {
      const typingEl = this.container.querySelector('.tree-typing');
      if (typingEl) typingEl.remove();
    }

    showError(message) {
      const errorEl = document.createElement('div');
      errorEl.className = 'tree-error';
      errorEl.textContent = message;
      
      this.messagesEl.appendChild(errorEl);
      this.scrollToBottom();
      
      setTimeout(() => {
        if (errorEl.parentNode) errorEl.remove();
      }, 5000);
    }

    scrollToBottom() {
      requestAnimationFrame(() => {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      });
    }

    enableInput() {
      this.inputEl.disabled = false;
      this.container.querySelector('.tree-send-btn').disabled = false;
    }

    disableInput() {
      this.inputEl.disabled = true;
      this.container.querySelector('.tree-send-btn').disabled = true;
    }

    clearInput() {
      this.inputEl.value = '';
      this.autoResize();
    }

    handleSend() {
      const message = this.inputEl.value.trim();
      if (message && this.onSend) {
        this.onSend(message);
      }
    }
  }

  // Main Widget Class
  class TreeChatWidget {
    constructor({ chatbotId, apiUrl, ...customConfig }) {
      if (!chatbotId || !apiUrl) {
        throw new Error('TreeChatWidget: chatbotId and apiUrl required');
      }

      this.config = { ...CONFIG.defaults, ...customConfig };
      this.api = new APIManager({ apiUrl, chatbotId });
      this.messages = new MessageManager();
      this.ui = new UIManager({ config: this.config });
      
      this.isReady = false;
      this.init();
    }

    async init() {
      try {
        await this.loadConfig();
        
        this.ui.createStyles();
        this.ui.create();
        this.ui.onSend = (message) => this.sendMessage(message);
        
        this.loadMessages();
        
        if (this.messages.getAll().length === 0) {
          const welcome = this.messages.add({
            content: this.config.welcomeMessage,
            sender: 'bot'
          });
          this.ui.showMessage(welcome);
        } else {
          this.restoreMessages();
        }
        
        this.isReady = true;
        
      } catch (error) {
        console.error('TreeWidget init failed:', error);
        this.ui.showError('Failed to initialize chat');
      }
    }

    async loadConfig() {
      try {
        const info = await this.api.getChatbotInfo();
        
        if (info.widgetConfig) {
          this.config = { ...this.config, ...info.widgetConfig };
        }
        
        if (info.name) {
          this.config.chatbotName = info.name;
        }
        
      } catch (error) {
        console.warn('Failed to load config, using defaults:', error);
      }
    }

    async sendMessage(content) {
      if (!content.trim() || !this.isReady) return;

      try {
        this.ui.disableInput();
        
        const userMsg = this.messages.add({ content, sender: 'user' });
        this.ui.showMessage(userMsg);
        this.ui.clearInput();
        
        this.ui.showTyping();
        
        const response = await this.sendWithRetry(content);
        
        this.ui.hideTyping();
        
        const botMsg = this.messages.add({
          content: response.response || 'Thank you for your message!',
          sender: 'bot'
        });
        
        this.ui.showMessage(botMsg);
        this.saveMessages();
        
      } catch (error) {
        this.ui.hideTyping();
        this.ui.showError('Failed to send message. Please try again.');
        console.error('Send error:', error);
      } finally {
        this.ui.enableInput();
      }
    }

    async sendWithRetry(content, attempt = 1) {
      try {
        return await this.api.sendMessage({ message: content });
      } catch (error) {
        if (attempt < CONFIG.api.retries) {
          await new Promise(resolve => 
            setTimeout(resolve, CONFIG.api.retryDelay * attempt)
          );
          return this.sendWithRetry(content, attempt + 1);
        }
        throw error;
      }
    }

    saveMessages() {
      this.messages.save(this.api.sessionId);
    }

    loadMessages() {
      this.messages.load(this.api.sessionId);
    }

    restoreMessages() {
      this.messages.getAll().forEach(message => {
        this.ui.showMessage(message);
      });
    }

    open() { this.ui.open(); }
    close() { this.ui.close(); }
    toggle() { this.ui.toggle(); }
  }

  // Initialize
  function init() {
    const script = document.currentScript || document.querySelector('script[data-chatbot-id]');
    
    if (!script) {
      console.error('TreeWidget: initialization script not found');
      return;
    }

    const config = {
      chatbotId: script.dataset.chatbotId,
      apiUrl: script.dataset.apiUrl,
      chatbotName: script.dataset.chatbotName,
      primaryColor: script.dataset.primaryColor,
      position: script.dataset.position,
      welcomeMessage: script.dataset.welcomeMessage,
      placeholder: script.dataset.placeholder,
      showBranding: script.dataset.showBranding !== 'false',
      borderRadius: parseInt(script.dataset.borderRadius) || 12,
      fontFamily: script.dataset.fontFamily,
      animation: script.dataset.animation,
      theme: script.dataset.theme
    };

    // Filter undefined values
    Object.keys(config).forEach(key => {
      if (config[key] === undefined) delete config[key];
    });

    try {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new TreeChatWidget(config));
      } else {
        new TreeChatWidget(config);
      }
    } catch (error) {
      console.error('TreeWidget init error:', error);
    }
  }

  // Auto-initialize
  init();

  // Export for manual use
  window.TreeChatWidget = TreeChatWidget;

})(); 