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
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date}>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatbot = useQuery(api.chatbots.get, { id: chatbotId });
  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.conversations.sendMessage);
  const conversationMessages = useQuery(
    api.conversations.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update messages when conversation messages change
  useEffect(() => {
    if (conversationMessages) {
      const formattedMessages = conversationMessages.map(msg => ({
        id: msg._id,
        text: msg.content,
        isUser: msg.role === "user",
        timestamp: new Date(msg._creationTime)
      }));
      setMessages(formattedMessages);
      setIsLoading(false);
    }
  }, [conversationMessages]);

  // Initialize conversation when chat is opened
  const initializeConversation = async () => {
    if (!conversationId && chatbot) {
      try {
        const newConversationId = await createConversation({
          chatbotId,
          title: "Widget Chat"
        });
        setConversationId(newConversationId);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Initialize conversation if not exists
    if (!conversationId) {
      await initializeConversation();
      return;
    }

    setIsLoading(true);
    const messageText = inputValue.trim();
    setInputValue("");

    try {
      await sendMessage({
        conversationId,
        content: messageText
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble connecting. Please try again.",
        isUser: false,
        timestamp: new Date()
      }]);
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

    if (newIsOpen && !conversationId) {
      initializeConversation();
    }

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
            <div>
              <h3 className="font-semibold text-sm">
                {chatbot?.name || 'Chatbot'}
              </h3>
              <p className="text-xs opacity-90">{welcomeMessage}</p>
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
            {messages.length === 0 && !conversationId && (
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
