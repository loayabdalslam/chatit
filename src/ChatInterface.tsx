import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface ChatInterfaceProps {
  chatbotId: Id<"chatbots">;
  onBack?: () => void;
}

export function ChatInterface({ chatbotId }: ChatInterfaceProps) {
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatbot = useQuery(api.chatbots.get, { id: chatbotId });
  const conversations = useQuery(api.conversations.list, { chatbotId });
  const messages = useQuery(
    api.conversations.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.conversations.sendMessage);

  useEffect(() => {
    if (conversations && conversations.length > 0 && !conversationId) {
      setConversationId(conversations[0]._id);
    }
  }, [conversations, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Stop loading when we get a new assistant message
  useEffect(() => {
    if (!isLoading || !messages) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleStartNewChat = async () => {
    try {
      const newConversationId = await createConversation({
        chatbotId,
        title: `Chat ${new Date().toLocaleString()}`,
      });
      setConversationId(newConversationId);
    } catch (error) {
      toast.error("Failed to start new chat");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationId || isLoading) return;

    setIsLoading(true);
    const messageText = message;
    setMessage("");

    try {
      await sendMessage({
        conversationId,
        content: messageText,
      });
      
      // Don't show success toast, just wait for response
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      setMessage(messageText); // Restore message on error
      setIsLoading(false);
    }
  };

  if (!chatbot) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{chatbot.name}</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartNewChat}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            New Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!conversationId ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">💬</div>
              <p className="text-gray-600">Start a new conversation to begin chatting</p>
            </div>
          ) : messages && messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">👋</div>
              <p className="text-gray-600">Say hello to start the conversation!</p>
            </div>
          ) : (
            messages?.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className={`flex items-center justify-between text-xs mt-1 ${
                    msg.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    <span>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : new Date(msg._creationTime).toLocaleTimeString()}
                    </span>
                    {msg.role === "user" && (
                      <span className="ml-2">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className="text-xs text-gray-500 italic">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isLoading ? "AI is responding..." : "Type your message..."}
              disabled={!conversationId || isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() || !conversationId || isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
