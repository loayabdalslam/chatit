import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ConversationHistoryProps {
  chatbotId?: Id<"chatbots">;
}

export function ConversationHistory({ chatbotId }: ConversationHistoryProps) {
  const [selectedConversation, setSelectedConversation] = useState<Id<"conversations"> | null>(null);
  
  // Get all conversations for all user's chatbots if no specific chatbot is selected
  const userChatbots = useQuery(api.chatbots.list) || [];
  const allConversations = useQuery(api.conversations.getAllUserConversations) || [];
  const specificConversations = useQuery(
    api.conversations.list,
    chatbotId ? { chatbotId } : "skip"
  );
  
  const conversations = chatbotId ? specificConversations : allConversations;
  
  const messages = useQuery(
    api.conversations.getMessages,
    selectedConversation ? { conversationId: selectedConversation } : "skip"
  );

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Conversation History</h2>
        {chatbotId && (
          <p className="text-sm text-gray-600">
            Showing conversations for selected chatbot
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Conversations ({conversations?.length || 0})</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {conversations?.map((conversation: any) => (
                <button
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation._id)}
                  className={`w-full p-4 text-left border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                    selectedConversation === conversation._id ? "bg-blue-100 border-blue-200" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900 truncate">
                    {conversation.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(conversation._creationTime).toLocaleDateString()} at{' '}
                    {new Date(conversation._creationTime).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Source: {conversation.source || "dashboard"}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Status: {conversation.status || "active"}
                  </div>
                </button>
              ))}
              {conversations?.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-lg font-medium mb-2">No conversations yet</p>
                  <p className="text-sm">Start a conversation with your chatbot to see it here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {selectedConversation ? "Messages" : "Select a conversation"}
              </h3>
              {selectedConversation && messages && (
                <p className="text-sm text-gray-600 mt-1">
                  {messages.length} messages in this conversation
                </p>
              )}
            </div>
            <div className="p-4 max-h-96 overflow-y-auto bg-gray-50">
              {selectedConversation ? (
                messages?.length ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="max-w-xs lg:max-w-md">
                          <div
                            className={`px-4 py-3 rounded-lg shadow-sm ${
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-900"
                            }`}
                          >
                            <div className="text-sm leading-relaxed">{message.content}</div>
                          </div>
                          <div
                            className={`text-xs mt-1 px-1 ${
                              message.role === "user" ? "text-right text-blue-600" : "text-left text-gray-500"
                            }`}
                          >
                            {message.role === "user" ? "You" : "Assistant"} • {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-lg font-medium mb-2">No messages yet</p>
                    <p className="text-sm">This conversation hasn't started yet.</p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-xl font-medium mb-2">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to view its messages.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
