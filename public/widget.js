// ChatIt Widget - Direct Convex Integration with Real AI
(function() {
  'use strict';

  // Auto-detect Convex deployment URL
  const getConvexUrl = () => {
    // Check if we're in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000'; // Local Convex dev server
    }
    
    // Production - Use environment variable or default
    return window.CONVEX_URL || 'https://chatit.cloud';
  };

  // Configuration with dynamic Convex URL
  const CONFIG = {
    convexUrl: getConvexUrl(),
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
    },
    version: '2.1.0',
    fallbackApiUrl: 'https://api.chatit.cloud',
    maxRetries: 3,
    retryDelay: 1000,
    requestTimeout: 15000,
    fallbackEnabled: true,
    debug: false
  };

  // Logging utility
  const logger = {
    debug: (...args) => CONFIG.debug && console.log('[ChatIt Debug]', ...args),
    warn: (...args) => console.warn('[ChatIt Warning]', ...args),
    error: (...args) => console.error('[ChatIt Error]', ...args),
    info: (...args) => console.info('[ChatIt Info]', ...args)
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

    // Create CORS-enabled request headers for Convex
    getCorsHeaders: () => ({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Convex-Client': 'widget-js-v1.0',
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
    },

    // Enhanced error detection
    isNetworkError: (error) => {
      return error instanceof TypeError && 
             (error.message.includes('Failed to fetch') || 
              error.message.includes('Network request failed') ||
              error.message.includes('net::ERR_'));
    },

    isCorsError: (error) => {
      return error.message && 
             (error.message.includes('CORS') || 
              error.message.includes('Cross-Origin') ||
              error.message.includes('Access-Control-Allow-Origin'));
    },

    // Smart retry logic
    shouldRetry: (error, attempt) => {
      if (attempt >= CONFIG.maxRetries) return false;
      return utils.isNetworkError(error) || 
             utils.isCorsError(error) || 
             (error.status >= 500 && error.status < 600);
    },

    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
  };

  // Direct Convex API Manager - Real AI Integration
  class ConvexAPIManager {
    constructor({ convexUrl, chatbotId }) {
      this.convexUrl = convexUrl || CONFIG.convexUrl;
      this.chatbotId = chatbotId;
      this.sessionId = utils.generateSessionId();
      this.connected = false;
      this.initConnection();
    }

    async initConnection() {
      try {
        // Test connection to Convex
        await this.testConnection();
        this.connected = true;
        console.log('✅ Connected to Convex backend');
      } catch (error) {
        console.warn('⚠️ Convex connection failed, will retry:', error.message);
        this.connected = false;
      }
    }

    async testConnection() {
      const response = await fetch(`${this.convexUrl}/api/health`, {
        method: 'GET',
        headers: utils.getCorsHeaders(),
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }
    }

    async makeConvexRequest({ endpoint, method = 'POST', data = null }) {
      const url = `${this.convexUrl}${endpoint}`;
      
      const options = {
        method,
        headers: utils.getCorsHeaders(),
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Convex API Error ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    }

    async getChatbotInfo() {
      try {
        console.log(`📡 Fetching chatbot info for: ${this.chatbotId}`);
        
        const response = await this.makeConvexRequest({
          endpoint: `/api/chatbot/${this.chatbotId}`,
          method: 'GET'
        });

        console.log('✅ Chatbot info received:', response);
        return response;
        
      } catch (error) {
        console.error('❌ Failed to get chatbot info:', error);
        // Return minimal fallback config - no fake responses
        return {
          name: 'AI Assistant',
          description: 'AI-powered assistant',
          widgetConfig: {
            primaryColor: '#3b82f6',
            position: 'bottom-right',
            welcomeMessage: 'Hi! How can I help you today?',
            placeholder: 'Type your message...',
            showBranding: true
          }
        };
      }
    }

    async sendMessage({ message }) {
      if (!this.isOnline && !CONFIG.fallbackEnabled) {
        return this.getFallbackResponse(message);
      }

      try {
        console.log(`💬 Sending message to Convex: "${message}"`);
        
        const response = await this.makeConvexRequest({
          endpoint: '/api/chat',
          method: 'POST',
          data: { 
            chatbotId: this.chatbotId, 
            message: message.trim(), 
            sessionId: this.sessionId 
          }
        });

        console.log('✅ AI response received:', response);

        if (response && response.message) {
          return { 
            message: response.message, 
            success: true,
            source: 'convex'
          };
        } else if (typeof response === 'string') {
          return { 
            message: response, 
            success: true,
            source: 'convex'
          };
        }
        
        throw new Error('Invalid response format from Convex');
        
      } catch (error) {
        console.error('❌ Convex chat error:', error);
        
        // For real AI chatbot - show connection error, no fake responses
        throw new Error(`Connection failed: ${error.message}`);
      }
    }

    // Health check method
    async isHealthy() {
      try {
        await this.testConnection();
        return true;
      } catch {
        return false;
      }
    }
  }

  // Message Manager with local storage
  class MessageManager {
    constructor(sessionId) {
      this.messages = [];
      this.sessionId = sessionId;
      this.storageKey = `chatit-messages-${sessionId}`;
      this.retryQueue = [];
      this.maxRetryQueueSize = 50;
    }

    add({ content, sender, timestamp = Date.now(), fallback = false, retryable = false }) {
      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        content: utils.sanitize(content), 
        sender, 
        timestamp,
        fallback,
        retryable
      };
      this.messages.push(message);
      this.save();
      return message;
    }

    addToRetryQueue(message) {
      if (this.retryQueue.length >= this.maxRetryQueueSize) {
        this.retryQueue.shift(); // Remove oldest
      }
      this.retryQueue.push({
        ...message,
        retryCount: (message.retryCount || 0) + 1,
        retryTimestamp: Date.now()
      });
      this.saveRetryQueue();
    }

    getRetryQueue() {
      return [...this.retryQueue];
    }

    clearRetryQueue() {
      this.retryQueue = [];
      this.saveRetryQueue();
    }

    getAll() {
      return [...this.messages];
    }

    save() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
      } catch (e) {
        logger.warn('Failed to save messages:', e);
      }
    }

    saveRetryQueue() {
      try {
        localStorage.setItem(`${this.storageKey}-retry`, JSON.stringify(this.retryQueue));
      } catch (e) {
        logger.warn('Failed to save retry queue:', e);
      }
    }

    load() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.messages = JSON.parse(saved);
        }
        
        const retryQueue = localStorage.getItem(`${this.storageKey}-retry`);
        if (retryQueue) {
          this.retryQueue = JSON.parse(retryQueue);
        }
      } catch (e) {
        logger.warn('Failed to load messages:', e);
        this.messages = [];
        this.retryQueue = [];
      }
    }

    // Mark fallback messages as resolved when real response arrives
    resolveFallbackMessage(originalMessageId, realResponse) {
      const messageIndex = this.messages.findIndex(msg => msg.id === originalMessageId);
      if (messageIndex !== -1 && this.messages[messageIndex].fallback) {
        this.messages[messageIndex] = {
          ...this.messages[messageIndex],
          content: realResponse,
          fallback: false,
          resolved: true,
          resolvedAt: Date.now()
        };
        this.save();
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

        .chatit-message-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          justify-content: flex-end;
        }

        .chatit-message.bot .chatit-message-meta {
          justify-content: flex-start;
        }

        .chatit-message-time {
          font-size: 11px;
          opacity: 0.6;
        }

        .offline-indicator {
          font-size: 12px;
          color: #f59e0b;
          cursor: help;
          animation: pulse 2s infinite;
        }

        .retry-button {
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 10px;
          color: #6b7280;
          transition: all 0.2s ease;
          padding: 0;
        }

        .retry-button:hover {
          background-color: #f3f4f6;
          color: #374151;
          transform: rotate(180deg);
        }

        .fallback-message .chatit-message-content {
          border-left: 3px solid #f59e0b;
          padding-left: 12px;
          background-color: rgba(251, 191, 36, 0.1);
        }

        .retryable-message.user .chatit-message-content {
          border-left: 3px solid #ef4444;
          padding-left: 12px;
          background-color: rgba(239, 68, 68, 0.1);
        }

        .chatit-connection-status {
          padding: 8px 12px;
          margin: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
          display: none;
          transition: all 0.3s ease;
        }

        .chatit-connection-status.offline {
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #fbbf24;
          display: block;
        }

        .chatit-connection-status.online {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #34d399;
          display: block;
          animation: slideIn 0.3s ease;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
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
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          margin: 10px 0;
          font-size: 13px;
          overflow: hidden;
        }

        .chatit-error-content {
          color: #ef4444;
          padding: 12px 16px;
        }

        .chatit-retry-btn {
          width: 100%;
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }

        .chatit-retry-btn:hover {
          background: #dc2626;
        }

        .chatit-connection-status {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 6px;
          padding: 8px 12px;
          margin: 8px 0;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #92400e;
        }

        .chatit-connection-status.offline {
          animation: pulse 2s infinite;
        }

        .status-icon {
          font-size: 14px;
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
      messageEl.setAttribute('data-message-id', message.id);
      
      // Add classes for fallback and retryable messages
      if (message.fallback) {
        messageEl.classList.add('fallback-message');
      }
      if (message.retryable) {
        messageEl.classList.add('retryable-message');
      }

      const timeString = utils.formatTime(message.timestamp);
      const statusIcon = message.fallback ? '<span class="offline-indicator" title="Offline response">⚡</span>' : '';
      const retryButton = message.retryable && message.sender === 'user' ? 
        '<button class="retry-button" onclick="window.retryMessage(\'' + message.id + '\')" title="Retry message">↻</button>' : '';

      messageEl.innerHTML = `
        <div class="chatit-message-content">${message.content}</div>
        <div class="chatit-message-meta">
          <span class="chatit-message-time">${timeString}</span>
          ${statusIcon}
          ${retryButton}
        </div>
      `;
      
      messagesContainer.appendChild(messageEl);
      this.scrollToBottom();

      // Add animation
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateY(10px)';
      requestAnimationFrame(() => {
        messageEl.style.transition = 'all 0.3s ease';
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
      });

      return messageEl;
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

    showError(message, showRetry = true) {
      const messagesContainer = this.container.querySelector('.chatit-messages');
      const errorEl = document.createElement('div');
      errorEl.className = 'chatit-error';
      
      const errorContent = document.createElement('div');
      errorContent.className = 'chatit-error-content';
      errorContent.textContent = message;
      
      errorEl.appendChild(errorContent);
      
      if (showRetry) {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'chatit-retry-btn';
        retryBtn.textContent = 'Try Again';
        retryBtn.onclick = () => {
          errorEl.remove();
          // Trigger reconnection attempt
          if (this.onRetry) {
            this.onRetry();
          }
        };
        errorEl.appendChild(retryBtn);
      }
      
      messagesContainer.appendChild(errorEl);
      this.scrollToBottom();
      
      return errorEl;
    }

    showConnectionStatus(isConnected) {
      // Remove existing status
      const existingStatus = this.container.querySelector('.chatit-connection-status');
      if (existingStatus) {
        existingStatus.remove();
      }
      
      if (!isConnected) {
        const messagesContainer = this.container.querySelector('.chatit-messages');
        const statusEl = document.createElement('div');
        statusEl.className = 'chatit-connection-status offline';
        statusEl.innerHTML = `
          <span class="status-icon">⚠️</span>
          <span>Connection lost. Trying to reconnect...</span>
        `;
        messagesContainer.appendChild(statusEl);
        this.scrollToBottom();
      }
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

  // Main ChatIt Widget Class - Real AI Integration
  class ChatItWidget {
    constructor({ chatbotId, convexUrl, ...customConfig }) {
      if (!chatbotId) {
        console.error('❌ ChatItWidget: chatbotId is required');
        return;
      }

      console.log(`🚀 Initializing ChatIt Widget for chatbot: ${chatbotId}`);
      
      this.config = { ...CONFIG.defaults, ...customConfig, chatbotId };
      this.api = new ConvexAPIManager({ 
        convexUrl: convexUrl || CONFIG.convexUrl, 
        chatbotId 
      });
      this.messages = new MessageManager(this.api.sessionId);
      this.ui = new UIManager({ config: this.config });
      
      this.isReady = false;
      this.connectionRetryCount = 0;
      this.maxRetries = 3;
      
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

    async sendMessage(messageText, isRetry = false) {
      if (!messageText.trim()) return;

      let userMessage;
      if (!isRetry) {
        // Add user message to UI
        userMessage = this.messages.add({
          content: messageText,
          sender: 'user',
          retryable: true
        });
        this.ui.showMessage(userMessage);
      }

      // Show typing indicator
      this.ui.showTyping();

      try {
        // Check connection health first
        const isHealthy = await this.api.isHealthy();
        if (!isHealthy) {
          throw new Error('Connection to AI service is not available');
        }

        // Send message to Convex for real AI response
        const response = await this.api.sendMessage({ message: messageText });
        
        // Hide typing indicator
        this.ui.hideTyping();
        
        if (response && response.message) {
          // Add real AI response to UI
          const botMessage = this.messages.add({
            content: response.message,
            sender: 'bot',
            fallback: response.fallback || false,
            retryable: response.retryable || false
          });
          this.ui.showMessage(botMessage);
          
          // Reset retry count on success
          this.connectionRetryCount = 0;
          
          // Dispatch success event
          window.dispatchEvent(new CustomEvent('chatit-message-sent', {
            detail: { 
              chatbotId: this.config.chatbotId,
              message: messageText,
              response: response.message,
              source: response.source || 'convex'
            }
          }));
          
        } else {
          throw new Error('Invalid response from AI service');
        }
        
      } catch (error) {
        console.error('❌ Failed to get AI response:', error);
        this.ui.hideTyping();
        
        // Handle connection errors
        this.handleConnectionError(error, messageText);
      }
    }

    async handleConnectionError(error, originalMessage) {
      this.connectionRetryCount++;
      
      let errorMessage = 'Connection failed. ';
      let showRetry = true;
      
      if (this.connectionRetryCount >= this.maxRetries) {
        errorMessage += 'Please check your internet connection and try again.';
        showRetry = false;
      } else {
        errorMessage += `Attempting to reconnect... (${this.connectionRetryCount}/${this.maxRetries})`;
      }
      
      // Show error with retry option
      const errorEl = this.ui.showError(errorMessage, showRetry);
      
      // Set up retry functionality
      this.ui.onRetry = async () => {
        console.log('🔄 Retrying connection...');
        
        // Remove any connection status indicators
        this.ui.showConnectionStatus(false);
        
        // Attempt to reinitialize connection
        await this.api.initConnection();
        
        // Retry the original message
        if (originalMessage && this.connectionRetryCount < this.maxRetries) {
          setTimeout(() => {
            this.sendMessage(originalMessage);
          }, 1000);
        }
      };
      
      // Show connection status
      this.ui.showConnectionStatus(false);
      
      // Auto-retry if under limit
      if (this.connectionRetryCount < this.maxRetries) {
        setTimeout(() => {
          this.ui.onRetry();
        }, 2000);
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

  // Global retry function for message retry buttons
  window.retryMessage = function(messageId) {
    const widgets = document.querySelectorAll('[data-chatit-widget]');
    widgets.forEach(element => {
      if (element.chatItWidget) {
        element.chatItWidget.retryMessage(messageId);
      }
    });
  };

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
              customConfig[attr] = parseInt(value, 10) || CONFIG.borderRadius;
            } else {
              customConfig[attr] = value;
            }
          }
        });

        // Check for custom Convex URL
        const customConvexUrl = element.getAttribute('data-convex-url');
        if (customConvexUrl) {
          customConfig.convexUrl = customConvexUrl;
        }

        // Create widget instance with Convex integration
        const widget = new ChatItWidget({
          chatbotId,
          ...customConfig
        });

        // Store reference
        element.chatItWidget = widget;
        element.dataset.initialized = 'true';
      }
    });
  }

  // Auto-retry failed messages when connection is restored
  window.addEventListener('online', () => {
    logger.info('Connection restored, attempting to retry failed messages');
    setTimeout(() => {
      const widgets = document.querySelectorAll('[data-chatit-widget]');
      widgets.forEach(element => {
        if (element.chatItWidget) {
          element.chatItWidget.retryAllFailedMessages();
        }
      });
    }, 2000); // Wait 2 seconds before retrying
  });

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