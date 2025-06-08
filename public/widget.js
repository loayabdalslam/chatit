// ChatIt Widget - Intelligent AI Chat Widget
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: 'https://chatit.cloud',
    defaults: {
      primaryColor: '#3b82f6',
      position: 'bottom-right',
      size: 'medium',
      welcomeMessage: 'Hi! How can I help you today?',
      placeholder: 'Type your message...',
      showBranding: true,
      borderRadius: 16,
      fontFamily: 'system-ui',
      animation: 'bounce',
      theme: 'light',
    }
  };

  // Utilities for widget functionality
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
    },

    // Extract chatbot ID from widget data attribute
    extractChatbotId: (element) => {
      const widgetId = element.getAttribute('data-chatit-widget');
      return widgetId || null;
    },

    // Create CORS-enabled request headers
    getCorsHeaders: () => ({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }),

    // Check if device is mobile
    isMobile: () => window.innerWidth <= 768,

    // Get safe viewport dimensions
    getViewportDimensions: () => ({
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    }),

    // Calculate safe widget dimensions
    getSafeWidgetDimensions: () => {
      const viewport = utils.getViewportDimensions();
      const isMobile = utils.isMobile();
      
      if (isMobile) {
        return {
          width: Math.min(360, viewport.width - 20),
          height: Math.min(500, viewport.height - 100),
          margin: 10
        };
      } else {
        return {
          width: Math.min(380, viewport.width - 40),
          height: Math.min(500, viewport.height - 120),
          margin: 20
        };
      }
    },

    // Enhanced color utilities
    hexToRgb: (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    // Create gradient backgrounds
    createGradient: (color) => {
      const rgb = utils.hexToRgb(color);
      if (!rgb) return color;
      return `linear-gradient(135deg, ${color} 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8) 100%)`;
    }
  };

  // API Manager for Convex integration
  class APIManager {
    constructor({ apiUrl, chatbotId }) {
      this.apiUrl = apiUrl || CONFIG.apiUrl;
      this.chatbotId = chatbotId;
      this.sessionId = utils.generateSessionId();
    }

    async request({ endpoint, method = 'GET', data = null }) {
      const url = `${this.apiUrl}${endpoint}`;
      const options = {
        method,
        headers: utils.getCorsHeaders(),
        mode: 'cors',
        credentials: 'omit',
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    }

    async getChatbotInfo() {
      return await this.request({
        endpoint: `/api/chatbot/${this.chatbotId}`,
        method: 'GET'
      });
    }

    async sendMessage({ message }) {
      try {
        const response = await this.request({
          endpoint: '/api/chat',
          method: 'POST',
          data: { 
            chatbotId: this.chatbotId, 
            message, 
            sessionId: this.sessionId 
          }
        });
        
        if (response && response.message) {
          return { message: response.message, success: true };
        } else if (typeof response === 'string') {
          return { message: response, success: true };
        }
        
        throw new Error('Invalid response format');
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error; // Re-throw to handle in the calling code
      }
    }
  }

  // Message Manager with local storage
  class MessageManager {
    constructor(sessionId) {
      this.messages = [];
      this.sessionId = sessionId;
      this.storageKey = `chatit-messages-${sessionId}`;
    }

    add({ content, sender, timestamp = Date.now() }) {
      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        content: utils.sanitize(content), 
        sender, 
        timestamp
      };
      this.messages.push(message);
      this.save();
      return message;
    }

    getAll() {
      return [...this.messages];
    }

    save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
      } catch (e) {
        console.warn('Failed to save messages:', e);
      }
    }

    load() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.messages = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load messages:', e);
        this.messages = [];
      }
    }
  }

  // UI Manager with enhanced UX
  class UIManager {
    constructor({ config }) {
      this.config = config;
      this.container = null;
      this.isOpen = false;
      this.isTyping = false;
      this.typingIndicator = null;
      this.onSend = null;
      this.messageQueue = [];
      this.isAnimating = false;
    }

    createStyles() {
      if (document.getElementById('chatit-widget-styles')) return;

      const style = document.createElement('style');
      style.id = 'chatit-widget-styles';
      style.textContent = `
        .chatit-widget-container {
          position: fixed;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.4;
          color: #333;
        }

        .chatit-widget-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .chatit-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          position: relative;
        }

        .chatit-toggle:hover {
          background: ${utils.adjustColor({ color: this.config.primaryColor, amount: -20 })};
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .chatit-toggle:active {
          transform: translateY(0);
        }

        .chatit-toggle svg {
          width: 24px;
          height: 24px;
          fill: white;
          transition: transform 0.3s ease;
        }

        .chatit-toggle.open svg {
          transform: rotate(45deg);
        }

        .chatit-chat {
          position: absolute;
          bottom: 80px;
          width: min(380px, calc(100vw - 40px));
          height: min(500px, calc(100vh - 120px));
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px) scale(0.95);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 120px);
        }

        .chatit-chat.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .chatit-widget-container.bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .chatit-widget-container.bottom-right .chatit-chat {
          right: 0;
        }

        .chatit-widget-container.bottom-left {
          bottom: 20px;
          left: 20px;
        }

        .chatit-widget-container.bottom-left .chatit-chat {
          left: 0;
          right: auto;
        }

        .chatit-widget-container.top-right {
          top: 20px;
          right: 20px;
        }

        .chatit-widget-container.top-right .chatit-chat {
          top: 80px;
          bottom: auto;
          right: 0;
        }

        .chatit-widget-container.top-left {
          top: 20px;
          left: 20px;
        }

        .chatit-widget-container.top-left .chatit-chat {
          top: 80px;
          bottom: auto;
          left: 0;
          right: auto;
        }

        .chatit-header {
          background: ${this.config.primaryColor};
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px 16px 0 0;
        }

        .chatit-header-info h3 {
          margin: 0 0 2px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .chatit-header-info p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .chatit-status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          opacity: 0.9;
        }

        .chatit-status-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .chatit-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatit-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .chatit-close svg {
          width: 20px;
          height: 20px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        .chatit-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f9fafb;
        }

        .chatit-message {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          opacity: 0;
          animation: slideIn 0.3s ease forwards;
        }

        .chatit-message.user {
          flex-direction: row-reverse;
        }

        .chatit-message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
          line-height: 1.4;
        }

        .chatit-message.bot .chatit-message-content {
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
          margin-right: 8px;
        }

        .chatit-message.user .chatit-message-content {
          background: ${this.config.primaryColor};
          color: white;
          margin-left: 8px;
        }

        .chatit-message-time {
          font-size: 11px;
          opacity: 0.6;
          margin-top: 4px;
          text-align: center;
        }

        .chatit-typing {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          opacity: 0;
          animation: slideIn 0.3s ease forwards;
        }

        .chatit-typing-content {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 12px 16px;
          border-radius: 18px;
          margin-right: 8px;
          display: flex;
          align-items: center;
        }

        .chatit-typing-dots {
          display: flex;
          gap: 4px;
        }

        .chatit-typing-dot {
          width: 6px;
          height: 6px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typingBounce 1.4s infinite ease-in-out;
        }

        .chatit-typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .chatit-typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typingBounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .chatit-input-area {
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          background: white;
          border-radius: 0 0 16px 16px;
        }

        .chatit-input-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .chatit-input {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 20px;
          padding: 10px 16px;
          outline: none;
          resize: none;
          max-height: 100px;
          min-height: 40px;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.4;
          transition: border-color 0.2s ease;
        }

        .chatit-input:focus {
          border-color: ${this.config.primaryColor};
        }

        .chatit-input::placeholder {
          color: #9ca3af;
        }

        .chatit-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .chatit-send:hover:not(:disabled) {
          background: ${utils.adjustColor({ color: this.config.primaryColor, amount: -20 })};
          transform: scale(1.05);
        }

        .chatit-send:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }

        .chatit-send svg {
          width: 18px;
          height: 18px;
          fill: white;
        }

        .chatit-branding {
          padding: 8px 16px;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
        }

        .chatit-branding a {
          color: ${this.config.primaryColor};
          text-decoration: none;
          font-weight: 500;
        }

        .chatit-branding a:hover {
          text-decoration: underline;
        }

        .chatit-error {
          color: #ef4444;
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 10px 0;
          font-size: 13px;
        }

        .chatit-status {
          padding: 8px 16px;
          text-align: center;
          font-size: 12px;
          background: #f3f4f6;
          color: #6b7280;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
          60% {
            transform: translateY(-2px);
          }
        }

        .chatit-toggle.bounce {
          animation: bounce 2s infinite;
        }

        @media (max-width: 768px) {
          .chatit-chat {
            width: calc(100vw - 40px) !important;
            height: calc(100vh - 120px) !important;
            max-width: calc(100vw - 40px) !important;
            max-height: calc(100vh - 120px) !important;
            border-radius: 12px;
          }

          .chatit-widget-container.bottom-right .chatit-chat {
            right: 0 !important;
            left: auto !important;
          }

          .chatit-widget-container.bottom-left .chatit-chat {
            left: 0 !important;
            right: auto !important;
          }

          .chatit-widget-container.top-right .chatit-chat {
            right: 0 !important;
            left: auto !important;
            top: 80px !important;
            bottom: auto !important;
          }

          .chatit-widget-container.top-left .chatit-chat {
            left: 0 !important;
            right: auto !important;
            top: 80px !important;
            bottom: auto !important;
          }
        }

        @media (max-width: 480px) {
          .chatit-widget-container {
            bottom: 10px !important;
            right: 10px !important;
            left: auto !important;
            top: auto !important;
          }

          .chatit-widget-container.bottom-left {
            left: 10px !important;
            right: auto !important;
          }

          .chatit-widget-container.top-right {
            top: 10px !important;
            bottom: auto !important;
            right: 10px !important;
            left: auto !important;
          }

          .chatit-widget-container.top-left {
            top: 10px !important;
            bottom: auto !important;
            left: 10px !important;
            right: auto !important;
          }

          .chatit-chat {
            width: calc(100vw - 20px) !important;
            height: calc(100vh - 100px) !important;
            max-width: calc(100vw - 20px) !important;
            max-height: calc(100vh - 100px) !important;
            bottom: 70px !important;
            border-radius: 8px;
          }

          .chatit-widget-container .chatit-chat {
            right: 0 !important;
            left: 0 !important;
          }

          .chatit-widget-container.top-right .chatit-chat,
          .chatit-widget-container.top-left .chatit-chat {
            top: 70px !important;
            bottom: auto !important;
          }

          .chatit-toggle {
            width: 50px !important;
            height: 50px !important;
          }

          .chatit-toggle svg {
            width: 20px !important;
            height: 20px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    create() {
      this.container = document.createElement('div');
      this.container.className = `chatit-widget-container ${this.config.position}`;
      
      this.container.innerHTML = `
        <div class="chatit-chat">
          <div class="chatit-header">
            <div class="chatit-header-info">
              <h3>${this.config.chatbotName || 'Assistant'}</h3>
              <p>We typically reply instantly</p>
            </div>
            <button class="chatit-close" aria-label="Close chat">
              <svg viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="chatit-messages" id="chatit-messages"></div>
          <div class="chatit-input-area">
            <div class="chatit-input-wrapper">
              <textarea 
                class="chatit-input" 
                placeholder="${this.config.placeholder}"
                maxlength="1000"
                rows="1"
              ></textarea>
              <button class="chatit-send" aria-label="Send message">
                <svg viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                </svg>
              </button>
            </div>
          </div>
          ${this.config.showBranding ? `
            <div class="chatit-branding">
              Powered by <a href="https://chatit.cloud" target="_blank">ChatIt.cloud</a>
            </div>
          ` : ''}
        </div>
        <button class="chatit-toggle ${this.config.animation}" aria-label="Open chat">
          <svg viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </button>
      `;

      document.body.appendChild(this.container);
      this.bindEvents();
    }

    bindEvents() {
      const toggle = this.container.querySelector('.chatit-toggle');
      const close = this.container.querySelector('.chatit-close');
      const input = this.container.querySelector('.chatit-input');
      const send = this.container.querySelector('.chatit-send');

      toggle.addEventListener('click', () => this.toggle());
      close.addEventListener('click', () => this.close());
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      input.addEventListener('input', () => {
        this.autoResize(input);
        this.updateSendButton();
      });

      send.addEventListener('click', () => this.sendMessage());

      // Handle clicks outside to close
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.container.contains(e.target)) {
          this.close();
        }
      });

      // Handle window resize to ensure widget stays in bounds
      window.addEventListener('resize', utils.debounce(() => {
        this.adjustPosition();
      }, 250));

      // Initial position adjustment
      setTimeout(() => this.adjustPosition(), 100);
    }

    adjustPosition() {
      if (!this.container) return;
      
      const chat = this.container.querySelector('.chatit-chat');
      if (!chat) return;

      const viewport = utils.getViewportDimensions();
      const dimensions = utils.getSafeWidgetDimensions();
      
      // Apply safe dimensions
      chat.style.maxWidth = `${dimensions.width}px`;
      chat.style.maxHeight = `${dimensions.height}px`;
      
      // Ensure container doesn't go outside viewport
      const containerRect = this.container.getBoundingClientRect();
      const position = this.config.position;
      
      if (position.includes('right')) {
        if (containerRect.right > viewport.width) {
          this.container.style.right = `${dimensions.margin}px`;
        }
      }
      
      if (position.includes('left')) {
        if (containerRect.left < 0) {
          this.container.style.left = `${dimensions.margin}px`;
        }
      }
      
      if (position.includes('top')) {
        if (containerRect.top < 0) {
          this.container.style.top = `${dimensions.margin}px`;
        }
      }
      
      if (position.includes('bottom')) {
        if (containerRect.bottom > viewport.height) {
          this.container.style.bottom = `${dimensions.margin}px`;
        }
      }
    }

    autoResize(textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 100);
      textarea.style.height = newHeight + 'px';
    }

    updateSendButton() {
      const input = this.container.querySelector('.chatit-input');
      const send = this.container.querySelector('.chatit-send');
      const hasText = input.value.trim().length > 0;
      
      send.disabled = !hasText || this.isTyping;
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      const chat = this.container.querySelector('.chatit-chat');
      const toggle = this.container.querySelector('.chatit-toggle');
      
      chat.classList.add('open');
      toggle.classList.add('open');
      
      // Focus input
      setTimeout(() => {
        const input = this.container.querySelector('.chatit-input');
        input?.focus();
      }, 300);
    }

    close() {
      this.isOpen = false;
      const chat = this.container.querySelector('.chatit-chat');
      const toggle = this.container.querySelector('.chatit-toggle');
      
      chat.classList.remove('open');
      toggle.classList.remove('open');
    }

    showMessage(message) {
      const messagesContainer = this.container.querySelector('.chatit-messages');
      const messageEl = document.createElement('div');
      messageEl.className = `chatit-message ${message.sender}`;
      
      messageEl.innerHTML = `
        <div class="chatit-message-content">${message.content}</div>
        <div class="chatit-message-time">${utils.formatTime(message.timestamp)}</div>
      `;
      
      messagesContainer.appendChild(messageEl);
      this.scrollToBottom();
    }

    showTyping() {
      if (this.isTyping) return;
      
      this.isTyping = true;
      const messagesContainer = this.container.querySelector('.chatit-messages');
      
      this.typingIndicator = document.createElement('div');
      this.typingIndicator.className = 'chatit-typing';
      this.typingIndicator.innerHTML = `
        <div class="chatit-typing-content">
          <div class="chatit-typing-dots">
            <div class="chatit-typing-dot"></div>
            <div class="chatit-typing-dot"></div>
            <div class="chatit-typing-dot"></div>
          </div>
        </div>
      `;
      
      messagesContainer.appendChild(this.typingIndicator);
      this.scrollToBottom();
      this.updateSendButton();
    }

    hideTyping() {
      if (!this.isTyping) return;
      
      this.isTyping = false;
      if (this.typingIndicator) {
        this.typingIndicator.remove();
        this.typingIndicator = null;
      }
      this.updateSendButton();
    }

    showError(message) {
      const messagesContainer = this.container.querySelector('.chatit-messages');
      const errorEl = document.createElement('div');
      errorEl.className = 'chatit-error';
      errorEl.textContent = message;
      messagesContainer.appendChild(errorEl);
      this.scrollToBottom();
    }

    scrollToBottom() {
      const messagesContainer = this.container.querySelector('.chatit-messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendMessage() {
      const input = this.container.querySelector('.chatit-input');
      const message = input.value.trim();
      
      if (!message || this.isTyping) return;
      
      input.value = '';
      input.style.height = 'auto';
      this.updateSendButton();
      
      if (this.onSend) {
        this.onSend(message);
      }
    }
  }

  // Main ChatIt Widget Class
  class ChatItWidget {
    constructor({ chatbotId, apiUrl, ...customConfig }) {
      if (!chatbotId) {
        console.error('ChatItWidget: chatbotId is required');
        return;
      }

      this.config = { ...CONFIG.defaults, ...customConfig, chatbotId };
      this.api = new APIManager({ apiUrl: apiUrl || CONFIG.apiUrl, chatbotId });
      this.messages = new MessageManager(this.api.sessionId);
      this.ui = new UIManager({ config: this.config });
      
      this.isReady = false;
      this.init();
    }

    async init() {
      try {
        // Load saved messages
        this.messages.load();
        
        // Create UI
        this.ui.createStyles();
        this.ui.create();
        this.ui.onSend = (message) => this.sendMessage(message);
        
        // Try to load chatbot config
        await this.loadConfig();
        
        // Show welcome message if no previous conversation
        if (this.messages.getAll().length === 0) {
          const welcome = this.messages.add({
            content: this.config.welcomeMessage,
            sender: 'bot'
          });
          this.ui.showMessage(welcome);
        } else {
          // Restore previous messages
          this.restoreMessages();
        }
        
        this.isReady = true;
        
        // Store widget instance on the element for external access
        if (this.element) {
          this.element.chatItWidget = this;
        }
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('chatit-widget-ready', {
          detail: { chatbotId: this.config.chatbotId }
        }));
        
      } catch (error) {
        console.error('ChatItWidget init failed:', error);
        this.ui?.showError('Failed to initialize chat widget');
      }
    }

    async loadConfig() {
      try {
        const info = await this.api.getChatbotInfo();
        
        if (info && info.widgetConfig) {
          this.config = { ...this.config, ...info.widgetConfig };
        }
        
        if (info && info.name) {
          this.config.chatbotName = info.name;
        }
        
      } catch (error) {
        console.warn('Failed to load chatbot config, using defaults:', error);
      }
    }

    async sendMessage(messageText) {
      if (!messageText.trim()) return;

      // Add user message to UI
      const userMessage = this.messages.add({
        content: messageText,
        sender: 'user'
      });
      this.ui.showMessage(userMessage);

      // Show typing indicator
      this.ui.showTyping();

      try {
        // Send message to API
        const response = await this.api.sendMessage({ message: messageText });
        
        // Hide typing indicator
        this.ui.hideTyping();
        
        if (response && response.message) {
          // Add AI response to UI
          const botMessage = this.messages.add({
            content: response.message,
            sender: 'bot'
          });
          this.ui.showMessage(botMessage);
        } else {
          throw new Error('No response from AI');
        }
        
      } catch (error) {
        console.error('Failed to get AI response:', error);
        this.ui.hideTyping();
        
        // Show error message
        this.ui.showError('Sorry, I\'m having trouble connecting to the server. Please try again later.');
      }
    }

    restoreMessages() {
      this.messages.getAll().forEach(message => {
        this.ui.showMessage(message);
      });
    }

    // Public API
    open() {
      this.ui?.open();
    }

    close() {
      this.ui?.close();
    }

    toggle() {
      this.ui?.toggle();
    }

    destroy() {
      if (this.ui?.container) {
        this.ui.container.remove();
      }
    }
  }

  // Auto-initialization for embedded widgets
  function initializeWidgets() {
    const widgets = document.querySelectorAll('[data-chatit-widget]');
    
    widgets.forEach(element => {
      const chatbotId = utils.extractChatbotId(element);
      
      if (chatbotId && !element.chatItWidget) {
        const customConfig = {};
        
        // Extract configuration from data attributes
        const configAttributes = [
          'primaryColor', 'position', 'size', 'welcomeMessage', 
          'placeholder', 'showBranding', 'borderRadius', 'fontFamily', 'animation'
        ];
        
        configAttributes.forEach(attr => {
          const value = element.getAttribute(`data-${attr.toLowerCase()}`);
          if (value !== null) {
            if (attr === 'showBranding') {
              customConfig[attr] = value === 'true';
            } else if (attr === 'borderRadius') {
              customConfig[attr] = parseInt(value, 10) || CONFIG.defaults[attr];
            } else {
              customConfig[attr] = value;
            }
          }
        });

        // Create widget instance
        const widget = new ChatItWidget({
          chatbotId,
          ...customConfig
        });

        // Store reference
        element.chatItWidget = widget;
      }
    });
  }

  // Initialize widgets when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidgets);
  } else {
    initializeWidgets();
  }

  // Watch for new widgets added dynamically
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.hasAttribute && node.hasAttribute('data-chatit-widget')) {
              initializeWidgets();
            } else if (node.querySelectorAll) {
              const widgets = node.querySelectorAll('[data-chatit-widget]');
              if (widgets.length > 0) {
                initializeWidgets();
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Global API
  window.ChatItWidget = ChatItWidget;

  // jQuery-style initialization
  window.chatIt = function(selector, options = {}) {
    const elements = typeof selector === 'string' 
      ? document.querySelectorAll(selector)
      : [selector];
    
    const widgets = [];
    
    elements.forEach(element => {
      if (element && !element.chatItWidget) {
        const chatbotId = options.chatbotId || utils.extractChatbotId(element);
        
        if (chatbotId) {
          const widget = new ChatItWidget({
            chatbotId,
            ...options
          });
          
          element.chatItWidget = widget;
          widgets.push(widget);
        }
      }
    });
    
    return widgets.length === 1 ? widgets[0] : widgets;
  };

  // Expose utilities for external use
  window.ChatItWidget.utils = utils;

})(); 