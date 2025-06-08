import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function Dashboard() {
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-black mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your ChatIt performance.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {generalStats && (
          <>
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
                  <p className="text-3xl font-bold text-black">{generalStats.totalChatbots}</p>
                </div>
                <div className="text-black text-2xl">🤖</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-3xl font-bold text-black">{generalStats.totalConversations}</p>
                </div>
                <div className="text-black text-2xl">💬</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-black">{generalStats.totalMessages}</p>
                </div>
                <div className="text-black text-2xl">📨</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Messages/Chat</p>
                  <p className="text-3xl font-bold text-black">
                    {generalStats.totalConversations > 0 
                      ? Math.round(generalStats.totalMessages / generalStats.totalConversations) 
                      : 0}
                  </p>
                </div>
                <div className="text-black text-2xl">📊</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-black mb-6">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-black mb-2">
                {formatTime(performanceMetrics.avgResponseTime * 1000)}
              </div>
              <div className="text-sm text-gray-600 mb-2">Average Response Time</div>
              <div className={`text-sm ${
                performanceMetrics.avgResponseTime < 2 ? 'text-black font-medium' : 
                performanceMetrics.avgResponseTime < 4 ? 'text-gray-600' : 'text-gray-800'
              }`}>
                {performanceMetrics.avgResponseTime < 2 ? '✓ Excellent' : 
                 performanceMetrics.avgResponseTime < 4 ? '⚠ Good' : '⚠ Needs Improvement'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-black mb-2">
                {performanceMetrics.satisfactionRate}%
              </div>
              <div className="text-sm text-gray-600 mb-2">User Satisfaction Rate</div>
              <div className={`text-sm ${
                performanceMetrics.satisfactionRate > 85 ? 'text-black font-medium' : 
                performanceMetrics.satisfactionRate > 70 ? 'text-gray-600' : 'text-gray-800'
              }`}>
                {performanceMetrics.satisfactionRate > 85 ? '✓ High Satisfaction' : 
                 performanceMetrics.satisfactionRate > 70 ? '⚠ Average' : '⚠ Needs Attention'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Analysis */}
      {sentimentAnalysis && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-black mb-6">Sentiment Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-black mb-2">{sentimentAnalysis.positivePercentage}%</div>
              <div className="text-sm text-gray-600 mb-2">Positive</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full transition-all" 
                  style={{ width: `${sentimentAnalysis.positivePercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-black mb-2">{sentimentAnalysis.neutralPercentage}%</div>
              <div className="text-sm text-gray-600 mb-2">Neutral</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full transition-all" 
                  style={{ width: `${sentimentAnalysis.neutralPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-black mb-2">{sentimentAnalysis.negativePercentage}%</div>
              <div className="text-sm text-gray-600 mb-2">Negative</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-800 h-2 rounded-full transition-all" 
                  style={{ width: `${sentimentAnalysis.negativePercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold mb-2 ${
                sentimentAnalysis.overallSentiment > 0 ? 'text-black' : 
                sentimentAnalysis.overallSentiment < 0 ? 'text-gray-800' : 'text-gray-600'
              }`}>
                {sentimentAnalysis.overallSentiment > 0 ? '+' : ''}{sentimentAnalysis.overallSentiment}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>

          {sentimentAnalysis.trendData && sentimentAnalysis.trendData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-black mb-4">7-Day Sentiment Trend</h4>
              <div className="grid grid-cols-7 gap-2">
                {sentimentAnalysis.trendData.map((trend, index) => (
                  <div key={index} className="text-center p-2 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(trend.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm font-bold ${
                      trend.sentiment > 0 ? 'text-black' : 
                      trend.sentiment < 0 ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {trend.sentiment > 0 ? '+' : ''}{trend.sentiment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-black mb-6">Chatbot Categories</h3>
          <div className="space-y-4">
            {Object.entries(categories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-3 ${
                    category === 'Customer Support' ? 'bg-black' :
                    category === 'Sales' ? 'bg-gray-600' :
                    category === 'FAQ' ? 'bg-gray-400' : 'bg-gray-300'
                  }`}></span>
                  <span className="text-sm font-medium text-gray-900">{category}</span>
                </div>
                <span className="text-sm font-bold text-black">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-black mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-black mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-black text-xl mb-2">➕</div>
            <div className="font-medium text-gray-900">Create New Chatbot</div>
            <div className="text-sm text-gray-600">Build a new AI assistant</div>
          </button>
          
          <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-black text-xl mb-2">📊</div>
            <div className="font-medium text-gray-900">View Analytics</div>
            <div className="text-sm text-gray-600">Check detailed performance</div>
          </button>
          
          <button className="p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-black text-xl mb-2">⚙️</div>
            <div className="font-medium text-gray-900">Settings</div>
            <div className="text-sm text-gray-600">Configure your account</div>
          </button>
        </div>
      </div>
    </div>
  );
}
