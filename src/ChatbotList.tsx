import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface ChatbotListProps {
  onSelectChatbot: (id: Id<"chatbots">) => void;
  onCreateChatbot: () => void;
  onEditChatbot: (id: Id<"chatbots">) => void;
  onChatWithBot: (id: Id<"chatbots">) => void;
  onViewWidget: (id: Id<"chatbots">) => void;
  onViewDetails: (id: Id<"chatbots">) => void;
}

export function ChatbotList({ 
  onSelectChatbot, 
  onCreateChatbot, 
  onEditChatbot,
  onChatWithBot,
  onViewWidget,
  onViewDetails
}: ChatbotListProps) {
  const chatbots = useQuery(api.chatbots.list) || [];
  const deleteChatbot = useMutation(api.chatbots.remove);

  const handleDeleteChatbot = async (id: Id<"chatbots">, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteChatbot({ id });
        toast.success("Chatbot deleted successfully");
      } catch (error) {
        toast.error("Failed to delete chatbot");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Chatbots</h2>
        <button
          onClick={onCreateChatbot}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Create New Chatbot
        </button>
      </div>

      {chatbots.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No chatbots yet</h3>
          <p className="text-gray-600 mb-6">Create your first chatbot to get started</p>
          <button
            onClick={onCreateChatbot}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your First Chatbot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((chatbot) => (
            <div
              key={chatbot._id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {chatbot.name}
                  </h3>
                  {chatbot.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {chatbot.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEditChatbot(chatbot._id)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded"
                    title="Edit chatbot"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteChatbot(chatbot._id, chatbot.name)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Delete chatbot"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Created {new Date(chatbot._creationTime).toLocaleDateString()}</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onChatWithBot(chatbot._id)}
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    💬 Test Chat
                  </button>
                  <button
                    onClick={() => onViewWidget(chatbot._id)}
                    className="bg-purple-50 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-100 transition-colors font-medium text-sm"
                  >
                    🔧 Widget
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onViewDetails(chatbot._id)}
                    className="bg-green-50 text-green-700 px-3 py-2 rounded-md hover:bg-green-100 transition-colors font-medium text-sm"
                  >
                    📊 Analytics
                  </button>
                  <button
                    onClick={() => onSelectChatbot(chatbot._id)}
                    className="bg-gray-50 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-sm"
                  >
                    ⚙️ Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
