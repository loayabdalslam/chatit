import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

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

const ChatbotPage: React.FC = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const [chatbot, setChatbot] = useState<ChatbotInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chatbot info
  useEffect(() => {
    const loadChatbot = async () => {
      if (!chatbotId) return;

      try {
        setConnectionStatus('connecting');
        const response = await fetch(`/api/chatbot/${chatbotId}`);
        
        if (response.ok) {
          const data = await response.json();
          setChatbot(data);
          setConnectionStatus('connected');
          
          // Add welcome message
          setMessages([{
            id: 'welcome',
            text: data.widgetConfig.welcomeMessage,
            isUser: false,
            timestamp: new Date()
          }]);
        } else {
          throw new Error('Failed to load chatbot');
        }
      } catch (error) {
        console.error('Error loading chatbot:', error);
        setConnectionStatus('offline');
        
        // Fallback chatbot info
        setChatbot({
          _id: chatbotId,
          name: 'AI Assistant',
          description: 'Your helpful AI assistant',
          widgetConfig: {
            primaryColor: '#2563eb',
            position: 'bottom-right',
            welcomeMessage: 'Hi! How can I help you today?',
            placeholder: 'Type your message...',
            showBranding: true,
            borderRadius: 12,
            fontFamily: 'system-ui',
            animation: 'bounce'
          }
        });
        
        setMessages([{
          id: 'welcome',
          text: 'Hi! How can I help you today? (Demo mode)',
          isUser: false,
          timestamp: new Date()
        }]);
      }
    };

    loadChatbot();
  }, [chatbotId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setInputValue('');
    setIsLoading(true);

    try {
      if (connectionStatus === 'connected') {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatbotId,
            message: inputValue,
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
            text: getFallbackResponse(inputValue),
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
        text: getFallbackResponse(inputValue),
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

  if (!chatbot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: chatbot.widgetConfig.fontFamily }}
    >
      {/* Header */}
      <div 
        className="bg-white shadow-sm px-6 py-4"
        style={{ borderBottom: `2px solid ${chatbot.widgetConfig.primaryColor}` }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{chatbot.name}</h1>
              <p className="text-gray-600">{chatbot.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {connectionStatus === 'connecting' && (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    Connecting...
                  </>
                )}
                {connectionStatus === 'connected' && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connected
                  </>
                )}
                {connectionStatus === 'offline' && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Demo Mode
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col bg-white shadow-lg my-4 rounded-lg overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block p-4 rounded-lg max-w-[80%] ${
                  message.isUser
                    ? 'text-white'
                    : 'bg-white border text-gray-800 shadow-sm'
                }`}
                style={message.isUser ? { 
                  backgroundColor: chatbot.widgetConfig.primaryColor,
                  borderRadius: `${chatbot.widgetConfig.borderRadius}px`
                } : {
                  borderRadius: `${chatbot.widgetConfig.borderRadius}px`
                }}
              >
                {message.text}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-left mb-4">
              <div 
                className="inline-block p-4 rounded-lg bg-white border shadow-sm"
                style={{ borderRadius: `${chatbot.widgetConfig.borderRadius}px` }}
              >
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={chatbot.widgetConfig.placeholder}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                borderColor: chatbot.widgetConfig.primaryColor,
                borderRadius: `${chatbot.widgetConfig.borderRadius}px`
              }}
              onFocus={(e) => e.target.style.borderColor = chatbot.widgetConfig.primaryColor}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: chatbot.widgetConfig.primaryColor,
                borderRadius: `${chatbot.widgetConfig.borderRadius}px`
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Branding */}
        {chatbot.widgetConfig.showBranding && (
          <div className="px-4 py-2 bg-gray-50 border-t text-center">
            <p className="text-xs text-gray-500">
              Powered by{' '}
              <a
                href="https://chatit.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: chatbot.widgetConfig.primaryColor }}
              >
                Chatit
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage; 