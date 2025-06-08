import React, { useState, useEffect, useRef } from 'react';

interface WidgetConfig {
  chatbotId: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  welcomeMessage?: string;
  placeholder?: string;
  showBranding?: boolean;
  borderRadius?: number;
  fontFamily?: string;
  animation?: 'bounce' | 'pulse' | 'shake' | 'none';
  apiUrl?: string;
}

interface ChatbotInfo {
  _id: string;
  name: string;
  description: string;
  widgetConfig: {
    primaryColor: string;
    position: string;
    welcomeMessage: string;
    placeholder: string;
    showBranding: boolean;
    borderRadius: number;
    fontFamily: string;
    animation: string;
  };
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ScriptWidgetProps {
  config: WidgetConfig;
}

const ScriptWidget: React.FC<ScriptWidgetProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatbot, setChatbot] = useState<ChatbotInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default configuration
  const defaultConfig = {
    primaryColor: '#2563eb',
    position: 'bottom-right' as const,
    size: 'medium' as const,
    welcomeMessage: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    showBranding: true,
    borderRadius: 12,
    fontFamily: 'system-ui',
    animation: 'bounce' as const,
    apiUrl: window.location.origin
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Size configurations
  const sizeMap = {
    small: { width: 60, height: 60, iconSize: 20 },
    medium: { width: 70, height: 70, iconSize: 24 },
    large: { width: 90, height: 90, iconSize: 28 }
  };

  const { width: buttonSize, height: buttonHeight, iconSize } = sizeMap[finalConfig.size];

  // Load chatbot info
  useEffect(() => {
    const loadChatbot = async () => {
      try {
        setConnectionStatus('connecting');
        const response = await fetch(`${finalConfig.apiUrl}/api/chatbot/${config.chatbotId}`);
        
        if (response.ok) {
          const data = await response.json();
          setChatbot(data);
          setConnectionStatus('connected');
        } else {
          throw new Error('Failed to load chatbot');
        }
      } catch (error) {
        console.error('Error loading chatbot:', error);
        setConnectionStatus('offline');
        
        // Fallback chatbot info
        setChatbot({
          _id: config.chatbotId,
          name: 'AI Assistant',
          description: 'Your helpful AI assistant',
          widgetConfig: {
            primaryColor: finalConfig.primaryColor,
            position: finalConfig.position,
            welcomeMessage: finalConfig.welcomeMessage,
            placeholder: finalConfig.placeholder,
            showBranding: finalConfig.showBranding,
            borderRadius: finalConfig.borderRadius,
            fontFamily: finalConfig.fontFamily,
            animation: finalConfig.animation
          }
        });
      }
    };

    loadChatbot();
  }, [config.chatbotId, finalConfig.apiUrl]);

  // Add welcome message when chatbot loads
  useEffect(() => {
    if (chatbot && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: chatbot.widgetConfig.welcomeMessage + (connectionStatus === 'offline' ? ' (Demo mode)' : ''),
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [chatbot, connectionStatus]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Fallback responses for demo mode
  const getFallbackResponse = (message: string): string => {
    const msg = message.toLowerCase();
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! I'm here to help you. What would you like to know?";
    }
    if (msg.includes('help') || msg.includes('support')) {
      return "I'm here to assist you! You can ask me about our services, features, or any questions you might have.";
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('pricing')) {
      return "Our pricing is competitive and tailored to your needs. Would you like me to connect you with someone who can provide detailed pricing information?";
    }
    if (msg.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    if (msg.includes('contact') || msg.includes('email') || msg.includes('phone')) {
      return "You can reach us through our contact form or email. I'd be happy to help you get in touch with the right department.";
    }
    if (msg.includes('feature') || msg.includes('function') || msg.includes('capability')) {
      return "We offer a wide range of features designed to meet your needs. What specific functionality are you interested in?";
    }
    
    return "Thank you for your message! I understand you're asking about: \"" + message + "\". Our team will get back to you with detailed information soon.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      if (connectionStatus === 'connected') {
        const response = await fetch(`${finalConfig.apiUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatbotId: config.chatbotId,
            message: messageToSend,
            sessionId
          })
        });

        if (response.ok) {
          const data = await response.json();
          const botMessage: Message = {
            id: `bot_${Date.now()}`,
            text: data.response,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          throw new Error('API request failed');
        }
      } else {
        // Fallback mode
        setTimeout(() => {
          const botMessage: Message = {
            id: `bot_${Date.now()}`,
            text: getFallbackResponse(messageToSend),
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: getFallbackResponse(messageToSend),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  if (!chatbot) {
    return (
      <div 
        style={{
          position: 'fixed',
          [finalConfig.position.includes('bottom') ? 'bottom' : 'top']: '20px',
          [finalConfig.position.includes('right') ? 'right' : 'left']: '20px',
          width: `${buttonSize}px`,
          height: `${buttonHeight}px`,
          backgroundColor: finalConfig.primaryColor,
          borderRadius: `${finalConfig.borderRadius}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 999999,
          fontFamily: finalConfig.fontFamily
        }}
      >
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid white',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'chatit-spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: chatbot.widgetConfig.fontFamily }}>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          [finalConfig.position.includes('bottom') ? 'bottom' : 'top']: '20px',
          [finalConfig.position.includes('right') ? 'right' : 'left']: '20px',
          width: `${buttonSize}px`,
          height: `${buttonHeight}px`,
          backgroundColor: chatbot.widgetConfig.primaryColor,
          borderRadius: `${chatbot.widgetConfig.borderRadius}px`,
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 8px 25px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.3s ease',
          zIndex: 999999,
          animation: !isOpen && finalConfig.animation !== 'none' ? 
            `chatit-${finalConfig.animation} 0.6s ease-in-out infinite` : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            [finalConfig.position.includes('bottom') ? 'bottom' : 'top']: '100px',
            [finalConfig.position.includes('right') ? 'right' : 'left']: '20px',
            width: '350px',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: `${chatbot.widgetConfig.borderRadius}px`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #e5e7eb',
            zIndex: 999998,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatit-slideUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: chatbot.widgetConfig.primaryColor,
              color: 'white',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {chatbot.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {connectionStatus === 'connecting' && (
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#fbbf24', 
                      borderRadius: '50%',
                      animation: 'chatit-pulse 2s infinite'
                    }} title="Connecting..."></div>
                  )}
                  {connectionStatus === 'connected' && (
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#10b981', 
                      borderRadius: '50%'
                    }} title="Connected"></div>
                  )}
                  {connectionStatus === 'offline' && (
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#ef4444', 
                      borderRadius: '50%'
                    }} title="Offline mode"></div>
                  )}
                </div>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '12px', 
                opacity: 0.9,
                color: 'white'
              }}>
                {chatbot.description}
              </p>
              {connectionStatus === 'offline' && (
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '11px', 
                  opacity: 0.75,
                  color: 'white'
                }}>
                  Running in demo mode
                </p>
              )}
            </div>
            <button
              onClick={toggleChat}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#f9fafb'
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 8px', opacity: 0.5 }}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <p style={{ fontSize: '14px', margin: 0 }}>Start a conversation!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '12px',
                  textAlign: message.isUser ? 'right' : 'left'
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '12px',
                    borderRadius: `${chatbot.widgetConfig.borderRadius}px`,
                    maxWidth: '80%',
                    fontSize: '14px',
                    backgroundColor: message.isUser ? chatbot.widgetConfig.primaryColor : 'white',
                    color: message.isUser ? 'white' : '#374151',
                    border: message.isUser ? 'none' : '1px solid #e5e7eb',
                    boxShadow: message.isUser ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                    wordWrap: 'break-word'
                  }}
                >
                  {message.text}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#9ca3af', 
                  marginTop: '4px' 
                }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ textAlign: 'left', marginBottom: '12px' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '12px',
                  borderRadius: `${chatbot.widgetConfig.borderRadius}px`,
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#9ca3af', 
                      borderRadius: '50%',
                      animation: 'chatit-bounce 1.4s ease-in-out infinite both'
                    }}></div>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#9ca3af', 
                      borderRadius: '50%',
                      animation: 'chatit-bounce 1.4s ease-in-out 0.16s infinite both'
                    }}></div>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: '#9ca3af', 
                      borderRadius: '50%',
                      animation: 'chatit-bounce 1.4s ease-in-out 0.32s infinite both'
                    }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ 
            padding: '16px', 
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={chatbot.widgetConfig.placeholder}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${chatbot.widgetConfig.primaryColor}`,
                  borderRadius: `${chatbot.widgetConfig.borderRadius}px`,
                  outline: 'none',
                  fontSize: '14px',
                  backgroundColor: isLoading ? '#f9fafb' : 'white'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  padding: '8px 12px',
                  backgroundColor: chatbot.widgetConfig.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: `${chatbot.widgetConfig.borderRadius}px`,
                  cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                  opacity: !inputValue.trim() || isLoading ? 0.5 : 1,
                  fontSize: '14px',
                  transition: 'opacity 0.2s'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9"></polygon>
                </svg>
              </button>
            </div>
          </div>

          {/* Branding */}
          {chatbot.widgetConfig.showBranding && (
            <div style={{ 
              padding: '8px 16px', 
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '11px', 
                color: '#6b7280'
              }}>
                Powered by{' '}
                <a
                  href="https://chatit.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: chatbot.widgetConfig.primaryColor,
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Chatit
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes chatit-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes chatit-bounce {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          } 
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes chatit-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes chatit-slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes chatit-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes chatit-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes chatit-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default ScriptWidget; 