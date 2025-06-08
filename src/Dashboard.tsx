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

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatTime(performanceMetrics.avgResponseTime * 1000)}
              </div>
              <div className="text-sm text-gray-600">Average Response Time</div>
              <div className={`mt-2 text-sm ${
                performanceMetrics.avgResponseTime < 2 ? 'text-green-600' : 
                performanceMetrics.avgResponseTime < 4 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {performanceMetrics.avgResponseTime < 2 ? '✓ Excellent' : 
                 performanceMetrics.avgResponseTime < 4 ? '⚠ Good' : '⚠ Needs Improvement'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {performanceMetrics.satisfactionRate}%
              </div>
              <div className="text-sm text-gray-600">User Satisfaction Rate</div>
              <div className={`mt-2 text-sm ${
                performanceMetrics.satisfactionRate > 85 ? 'text-green-600' : 
                performanceMetrics.satisfactionRate > 70 ? 'text-yellow-600' : 'text-red-600'
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Sentiment Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{sentimentAnalysis.positivePercentage}%</div>
              <div className="text-sm text-gray-600">Positive</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${sentimentAnalysis.positivePercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 mb-2">{sentimentAnalysis.neutralPercentage}%</div>
              <div className="text-sm text-gray-600">Neutral</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${sentimentAnalysis.neutralPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{sentimentAnalysis.negativePercentage}%</div>
              <div className="text-sm text-gray-600">Negative</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${sentimentAnalysis.negativePercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                sentimentAnalysis.overallSentiment > 0 ? 'text-green-600' : 
                sentimentAnalysis.overallSentiment < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {sentimentAnalysis.overallSentiment > 0 ? '+' : ''}{sentimentAnalysis.overallSentiment}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>

          {sentimentAnalysis.trendData && sentimentAnalysis.trendData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">7-Day Sentiment Trend</h4>
              <div className="grid grid-cols-7 gap-2">
                {sentimentAnalysis.trendData.map((trend, index) => (
                  <div key={index} className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(trend.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm font-bold ${
                      trend.sentiment > 0 ? 'text-green-600' : 
                      trend.sentiment < 0 ? 'text-red-600' : 'text-gray-600'
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Chatbot Categories</h3>
          <div className="space-y-4">
            {Object.entries(categories).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-3 ${
                    category === 'Customer Support' ? 'bg-blue-500' :
                    category === 'Sales' ? 'bg-green-500' :
                    category === 'FAQ' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></span>
                  <span className="text-gray-700">{category}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-900 font-semibold">{count}</span>
                  <span className="text-gray-500 ml-2">({Math.round(count / chatbots.length * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity && recentActivity.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-900">{activity.description}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
