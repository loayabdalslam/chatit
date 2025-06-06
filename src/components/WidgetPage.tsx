import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface WidgetPageProps {
  chatbotId: Id<"chatbots">;
}

export function WidgetPage({ chatbotId }: WidgetPageProps) {
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

  const chatbot = useQuery(api.chatbots.get, { id: chatbotId });
  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.conversations.sendMessage);
  const conversationMessages = useQuery(
    api.conversations.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  // Get widget config with defaults
  const config = {
    primaryColor: chatbot?.widgetConfig?.primaryColor || "#2563eb",
    welcomeMessage: chatbot?.widgetConfig?.welcomeMessage || `Hi! I'm ${chatbot?.name || "Assistant"}. How can I help you today?`,
    placeholder: chatbot?.widgetConfig?.placeholder || "Type your message...",
    showBranding: chatbot?.widgetConfig?.showBranding !== false,
    borderRadius: chatbot?.widgetConfig?.borderRadius || 12,
    fontFamily: chatbot?.widgetConfig?.fontFamily || "system-ui",
  };

  // Initialize conversation on mount
  useEffect(() => {
    if (chatbot && !conversationId) {
      initializeConversation();
    }
  }, [chatbot]);

  // Update messages when conversation messages change
  useEffect(() => {
    if (conversationMessages) {
      const formattedMessages = conversationMessages.map(msg => ({
        id: msg._id,
        text: msg.content,
        isUser: msg.role === "user"
      }));
      setMessages(formattedMessages);
      setIsLoading(false);
    }
  }, [conversationMessages]);

  const initializeConversation = async () => {
    try {
      const newConversationId = await createConversation({
        chatbotId,
        title: "Widget Chat"
      });
      setConversationId(newConversationId);
    } catch (error) {
      console.error("Failed to initialize conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    setIsLoading(true);
    
    try {
      await sendMessage({
        conversationId,
        content: input
      });
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
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
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col bg-white"
      style={{ fontFamily: config.fontFamily }}
    >
      {/* Header */}
      <div
        className="p-4 text-white font-semibold flex items-center justify-between"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h1 className="font-semibold">{chatbot.name}</h1>
            <p className="text-sm opacity-90">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {/* Welcome message */}
        <div className="text-left mb-4">
          <div className="inline-block p-3 rounded-lg max-w-xs bg-gray-200 text-gray-800">
            {config.welcomeMessage}
          </div>
        </div>

        {/* Chat messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-xs ${
                message.isUser
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              style={message.isUser ? { backgroundColor: config.primaryColor } : {}}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={config.placeholder}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !conversationId}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || !conversationId}
            className="px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: config.primaryColor }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Branding */}
      {config.showBranding && (
        <div className="px-4 py-2 text-xs text-center text-gray-500 bg-gray-50 border-t border-gray-200">
          Powered by <a href="https://chatit.cloud" target="_blank" className="text-blue-600 hover:underline">chatit.cloud</a>
        </div>
      )}
    </div>
  );
}
