import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Dashboard() {
  const chatbots = useQuery(api.chatbots.list) || [];
  const generalStats = useQuery(api.analytics.getGeneralStats) || null;
  const performanceMetrics = useQuery(api.analytics.getPerformanceMetrics, {}) || null;
  const sentimentAnalysis = useQuery(api.analytics.getSentimentAnalysis, {}) || null;
  const recentActivity = useQuery(api.analytics.getRecentActivity, {}) || [];

  const getChatbotCategory = (chatbot: any) => {
    const text = (chatbot.name + ' ' + (chatbot.description || '')).toLowerCase();
    if (text.includes('support') || text.includes('help')) return 'Customer Support';
    if (text.includes('sales') || text.includes('product')) return 'Sales';
    if (text.includes('faq') || text.includes('question')) return 'FAQ';
    return 'General';
  };

  const categories = chatbots.reduce((acc: Record<string, number>, bot) => {
    const category = getChatbotCategory(bot);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your chatbots and their performance</p>
      </div>

      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {generalStats && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
                    <p className="text-3xl font-bold text-blue-600">{generalStats.totalChatbots}</p>
                  </div>
                  <div className="text-blue-600 text-2xl">🤖</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                    <p className="text-3xl font-bold text-green-600">{generalStats.totalConversations}</p>
                  </div>
                  <div className="text-green-600 text-2xl">💬</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Messages</p>
                    <p className="text-3xl font-bold text-purple-600">{generalStats.totalMessages}</p>
                  </div>
                  <div className="text-purple-600 text-2xl">📨</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Messages/Chat</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {generalStats.totalConversations > 0 
                        ? Math.round(generalStats.totalMessages / generalStats.totalConversations) 
                        : 0}
                    </p>
                  </div>
                  <div className="text-orange-600 text-2xl">📊</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <a 
              href="/create" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Chatbot
            </a>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              View Analytics
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Export Data
            </button>
          </div>
        </div>

        {/* Recent Chatbots */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Chatbots</h3>
          {chatbots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🤖</div>
              <p className="text-gray-600 mb-4">No chatbots yet</p>
              <a 
                href="/create" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Chatbot
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.slice(0, 6).map((chatbot) => (
                <div key={chatbot._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 truncate">{chatbot.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      chatbot.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chatbot.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{chatbot.description || 'No description'}</p>
                  <div className="text-xs text-gray-500 mb-3">
                    Created {new Date(chatbot._creationTime).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={`/chatbot/${chatbot._id}`}
                      className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                    >
                      View Details
                    </a>
                    <a 
                      href={`/chatbot/${chatbot._id}`}
                      className="text-gray-600 text-sm hover:text-gray-800 transition-colors"
                    >
                      Test Chat
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 