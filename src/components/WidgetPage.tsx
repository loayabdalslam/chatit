import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
// Using simple SVG icons instead of lucide-react for better compatibility

interface WidgetPageProps {
  chatbotId: Id<"chatbots">;
  primaryColor?: string;
  position?: string;
  size?: string;
  welcomeMessage?: string;
  placeholder?: string;
  showBranding?: boolean;
  borderRadius?: number;
  fontFamily?: string;
  animation?: string;
  apiKey?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function WidgetPage({
  chatbotId,
  primaryColor = "#2563eb",
  position = "bottom-right",
  size = "medium",
  welcomeMessage = "Hi! How can I help you today?",
  placeholder = "Type your message...",
  showBranding = true,
  borderRadius = 12,
  fontFamily = "system-ui",
  animation = "bounce",
  apiKey
}: WidgetPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotInfo, setChatbotInfo] = useState<any>(null);
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Try to get chatbot info from Convex (if authenticated)
  const chatbot = useQuery(api.chatbots.get, { id: chatbotId });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chatbot info when component mounts
  useEffect(() => {
    const fetchChatbotInfo = async () => {
      try {
        setConnectionStatus('connecting');
        // Try to get chatbot info from public API
        const response = await fetch(`/api/chatbot/${chatbotId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'X-API-Key': apiKey })
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setChatbotInfo(data);
          setConnectionStatus('connected');
          setIsInitialized(true);
        } else {
          console.warn('Failed to fetch chatbot info from public API');
          setConnectionStatus('offline');
          // Set basic fallback info
          setChatbotInfo({
            name: 'Assistant',
            description: 'AI Assistant',
            widgetConfig: {}
          });
          setIsInitialized(true);
        }
      } catch (error) {
        console.warn('Error fetching chatbot info:', error);
        setConnectionStatus('offline');
        // Set basic fallback info
        setChatbotInfo({
          name: 'Assistant',
          description: 'AI Assistant',
          widgetConfig: {}
        });
        setIsInitialized(true);
      }
    };

    // If we don't have chatbot info from Convex, try the public API
    if (!chatbot) {
      fetchChatbotInfo();
    } else {
      setChatbotInfo(chatbot);
      setConnectionStatus('connected');
      setIsInitialized(true);
    }
  }, [chatbotId, chatbot, apiKey]);

  // Handle sending messages via public API
  const sendMessageViaAPI = async (message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-API-Key': apiKey })
        },
        body: JSON.stringify({
          chatbotId,
          message,
          sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('API chat error:', error);
      // Fallback to basic response
      return generateFallbackResponse(message);
    }
  };

  // Generate a basic fallback response when API is not available
  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const chatbotName = chatbotInfo?.name || 'your assistant';
    
    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      const greetings = [
        `Hello! I'm ${chatbotName}. How can I help you today?`,
        `Hi there! Welcome! I'm ${chatbotName}, and I'm here to assist you.`,
        `Hey! Great to see you. I'm ${chatbotName}. What can I do for you?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Help and support
    if (lowerMessage.includes("help") || lowerMessage.includes("support") || lowerMessage.includes("assist")) {
      return `I'm here to help! As ${chatbotName}, I can assist you with questions about our products, services, and general inquiries. What specific help do you need?`;
    }
    
    // Pricing and cost inquiries
    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("fee") || lowerMessage.includes("payment")) {
      return "For detailed pricing information and current rates, I'd recommend contacting our sales team directly or visiting our pricing page. They can provide you with the most up-to-date information tailored to your needs.";
    }
    
    // Product or service questions
    if (lowerMessage.includes("product") || lowerMessage.includes("service") || lowerMessage.includes("feature")) {
      return `I'd be happy to help you learn more about our products and services! Could you tell me specifically what you're interested in? That way I can provide you with the most relevant information.`;
    }
    
    // Contact and hours
    if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("email") || lowerMessage.includes("hours")) {
      return "For direct contact information and business hours, please check our contact page or the footer of our website. Our team is always ready to help during business hours!";
    }
    
    // Technical issues
    if (lowerMessage.includes("problem") || lowerMessage.includes("issue") || lowerMessage.includes("error") || lowerMessage.includes("bug")) {
      return "I understand you're experiencing some difficulties. For technical issues, our support team can provide the best assistance. In the meantime, try refreshing the page or checking our FAQ section.";
    }
    
    // Location and availability
    if (lowerMessage.includes("location") || lowerMessage.includes("where") || lowerMessage.includes("available")) {
      return "For information about our locations and service availability in your area, please visit our locations page or contact our team directly. We're expanding our reach all the time!";
    }
    
    // Account related
    if (lowerMessage.includes("account") || lowerMessage.includes("login") || lowerMessage.includes("signup") || lowerMessage.includes("register")) {
      return "For account-related questions, including login issues or creating a new account, our support team can assist you directly. You can also check our help documentation for step-by-step guides.";
    }
    
    // Gratitude responses
    if (lowerMessage.includes("thank") || lowerMessage.includes("appreciate")) {
      const thankYouResponses = [
        "You're very welcome! I'm glad I could help. Is there anything else you'd like to know?",
        "My pleasure! Feel free to reach out if you have any more questions.",
        "Happy to help! Don't hesitate to ask if you need anything else."
      ];
      return thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
    }
    
    // Farewell responses
    if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye") || lowerMessage.includes("see you")) {
      const farewells = [
        "Goodbye! Feel free to reach out anytime if you have more questions. Have a great day!",
        "Take care! I'm always here if you need assistance in the future.",
        "See you later! Don't hesitate to come back if you need help with anything."
      ];
      return farewells[Math.floor(Math.random() * farewells.length)];
    }
    
    // Question indicators
    if (lowerMessage.includes("?") || lowerMessage.includes("how") || lowerMessage.includes("what") || lowerMessage.includes("when") || lowerMessage.includes("why")) {
      return `That's a great question! I understand you're asking about "${userMessage}". For the most accurate and detailed answer, I'd recommend contacting our expert team who can provide you with comprehensive information.`;
    }
    
    // Negative sentiment
    if (lowerMessage.includes("bad") || lowerMessage.includes("terrible") || lowerMessage.includes("awful") || lowerMessage.includes("hate")) {
      return `I'm sorry to hear you're having a negative experience. Your feedback is valuable to us, and I'd like to help make things better. Could you tell me more about what's concerning you?`;
    }
    
    // Compliments
    if (lowerMessage.includes("good") || lowerMessage.includes("great") || lowerMessage.includes("awesome") || lowerMessage.includes("love")) {
      return `Thank you so much for the positive feedback! It's wonderful to hear that. We're committed to providing excellent service, and comments like yours make our day!`;
    }
    
    // Default intelligent response
    const keywords = userMessage.split(' ').filter(word => word.length > 3);
    const relevantKeywords = keywords.slice(0, 3).join(', ');
    
    if (keywords.length > 0) {
      return `I see you're interested in ${relevantKeywords}. While I'd love to give you a detailed response right now, I want to make sure you get the most accurate information. Our team of experts would be the best people to help you with this specific inquiry.`;
    }
    
    // Fallback
    return `Thank you for your message! I'm ${chatbotName}, and while I'm currently running in demonstration mode, I want to make sure you get the best possible help. For detailed assistance with your inquiry about "${userMessage}", please don't hesitate to contact our support team.`;
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    const messageText = inputValue.trim();
    setInputValue("");

    // Add user message immediately
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Try to send via API first
      const response = await sendMessageViaAPI(messageText);
      
      // Add bot response
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error("Failed to send message:", error);
      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle chat and notify parent about resize
  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // Notify parent iframe about resize
    window.parent.postMessage({
      type: 'CHATBOT_WIDGET_RESIZE',
      width: newIsOpen ? 350 : (size === 'small' ? 60 : size === 'large' ? 80 : 70),
      height: newIsOpen ? 500 : (size === 'small' ? 60 : size === 'large' ? 80 : 70),
      expanded: newIsOpen
    }, '*');
  };

  // Notify parent when widget is ready
  useEffect(() => {
    window.parent.postMessage({
      type: 'CHATBOT_WIDGET_READY',
      chatbotId,
      apiKey
    }, '*');
  }, [chatbotId, apiKey]);

  const buttonSize = size === 'small' ? 60 : size === 'large' ? 80 : 70;
  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;

  // Use chatbot info from either Convex or API
  const displayName = chatbotInfo?.name || 'Chatbot';
  const displayWelcomeMessage = chatbotInfo?.widgetConfig?.welcomeMessage || welcomeMessage;

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{ fontFamily }}>
        <div
          className="fixed pointer-events-auto bg-white shadow-2xl transition-all duration-300 ease-out flex items-center justify-center"
          style={{
            [position.includes('bottom') ? 'bottom' : 'top']: '20px',
            [position.includes('right') ? 'right' : 'left']: '20px',
            width: '200px',
            height: '100px',
            borderRadius: `${borderRadius}px`,
            border: '1px solid #e5e7eb',
            zIndex: 999998,
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto mb-2" style={{ borderColor: primaryColor }}></div>
            <p className="text-xs text-gray-600">Loading widget...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ fontFamily }}>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`
          fixed pointer-events-auto transition-all duration-300 shadow-lg hover:shadow-xl 
          ${isOpen ? 'scale-95' : 'scale-100 hover:scale-105'}
          ${animation === 'bounce' && !isOpen ? 'animate-bounce' : ''}
          ${animation === 'pulse' && !isOpen ? 'animate-pulse' : ''}
        `}
        style={{
          [position.includes('bottom') ? 'bottom' : 'top']: '20px',
          [position.includes('right') ? 'right' : 'left']: '20px',
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          backgroundColor: primaryColor,
          borderRadius: `${borderRadius}px`,
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999999,
          animation: animation === 'shake' && !isOpen ? 'shake 0.6s ease-in-out infinite' : undefined
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
          className="fixed pointer-events-auto bg-white shadow-2xl transition-all duration-300 ease-out"
          style={{
            [position.includes('bottom') ? 'bottom' : 'top']: '90px',
            [position.includes('right') ? 'right' : 'left']: '20px',
            width: '350px',
            height: '500px',
            borderRadius: `${borderRadius}px`,
            border: '1px solid #e5e7eb',
            zIndex: 999998,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">
                  {displayName}
                </h3>
                {/* Connection Status Indicator */}
                <div className="flex items-center">
                  {connectionStatus === 'connecting' && (
                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" title="Connecting..."></div>
                  )}
                  {connectionStatus === 'connected' && (
                    <div className="w-2 h-2 bg-green-300 rounded-full" title="Connected"></div>
                  )}
                  {connectionStatus === 'offline' && (
                    <div className="w-2 h-2 bg-red-300 rounded-full" title="Offline mode"></div>
                  )}
                </div>
              </div>
              <p className="text-xs opacity-90">{displayWelcomeMessage}</p>
              {connectionStatus === 'offline' && (
                <p className="text-xs opacity-75 mt-1">Running in demo mode</p>
              )}
            </div>
            <button
              onClick={toggleChat}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 opacity-50">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <p className="text-sm">Start a conversation!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[80%] text-sm ${
                    message.isUser
                      ? 'text-white'
                      : 'bg-white border text-gray-800'
                  }`}
                  style={message.isUser ? { backgroundColor: primaryColor } : {}}
                >
                  {message.text}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-left mb-3">
                <div className="inline-block p-3 rounded-lg bg-white border">
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
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
                style={{ borderColor: primaryColor }}
                onFocus={(e) => e.target.style.borderColor = primaryColor}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9"></polygon>
                </svg>
              </button>
            </div>
          </div>

          {/* Branding */}
          {showBranding && (
            <div className="px-4 py-2 bg-gray-50 border-t text-center">
              <p className="text-xs text-gray-500">
                Powered by{' '}
                <a
                  href="https://chatit.cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: primaryColor }}
                >
                  Chatit
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Shake animation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
