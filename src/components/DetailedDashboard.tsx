import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface DetailedDashboardProps {
  chatbotId?: Id<"chatbots">;
}

export function DetailedDashboard({ chatbotId }: DetailedDashboardProps) {
  const chatbots = useQuery(api.chatbots.list) || [];
  const selectedChatbot = chatbotId ? chatbots.find(bot => bot._id === chatbotId) : null;
  
  const chatbotStats = useQuery(
    api.analytics.getChatbotStats,
    chatbotId ? { chatbotId } : "skip"
  );
  const performanceMetrics = useQuery(api.analytics.getPerformanceMetrics, { chatbotId });
  const sentimentAnalysis = useQuery(api.analytics.getSentimentAnalysis, { chatbotId });
  const recentActivity = useQuery(api.analytics.getRecentActivity, { chatbotId });

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getPeakHours = () => {
    if (!recentActivity || recentActivity.length === 0) return [];
    
    const hourCounts: Record<number, number> = {};
    recentActivity.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({
        hour: `${hour.padStart(2, '0')}:00`,
        count
      }));
  };

  const getChatbotCategory = (chatbot: any) => {
    const text = (chatbot.name + ' ' + (chatbot.description || '')).toLowerCase();
    if (text.includes('support') || text.includes('help')) return 'Customer Support';
    if (text.includes('sales') || text.includes('product')) return 'Sales';
    if (text.includes('faq') || text.includes('question')) return 'FAQ';
    return 'General';
  };

  const peakHours = getPeakHours();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedChatbot ? `Detailed Analytics - ${selectedChatbot.name}` : "Detailed Analytics - All Chatbots"}
        </h2>
        <p className="text-gray-600">
          Comprehensive analytics and insights for your chatbot performance
        </p>
        {selectedChatbot && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Category:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {getChatbotCategory(selectedChatbot)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <span className="ml-2 text-sm text-gray-800">
                  {new Date(selectedChatbot._creationTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {chatbotStats && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-3xl font-bold text-blue-600">{chatbotStats.totalConversations}</p>
                </div>
                <div className="text-blue-600 text-2xl">💬</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-green-600">{chatbotStats.totalMessages}</p>
                </div>
                <div className="text-green-600 text-2xl">📨</div>
              </div>
            </div>
          </>
        )}

        {performanceMetrics && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatTime(performanceMetrics.avgResponseTime * 1000)}
                  </p>
                </div>
                <div className="text-purple-600 text-2xl">⚡</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                  <p className="text-3xl font-bold text-orange-600">{performanceMetrics.satisfactionRate}%</p>
                </div>
                <div className="text-orange-600 text-2xl">😊</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sentiment Analysis */}
      {sentimentAnalysis && sentimentAnalysis.positivePercentage + sentimentAnalysis.neutralPercentage + sentimentAnalysis.negativePercentage > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Sentiment Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
            <div>
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

      {/* Peak Hours */}
      {peakHours.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Peak Hours Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {peakHours.map((peak, index) => (
              <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">{peak.hour}</div>
                <div className="text-sm text-gray-600 mb-1">Peak #{index + 1}</div>
                <div className="text-lg font-semibold text-gray-900">{peak.count} activities</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.slice(0, 15).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-900">{activity.description}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Strengths</h4>
            <div className="space-y-2">
              {sentimentAnalysis && sentimentAnalysis.positivePercentage > 70 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">High positive sentiment ({sentimentAnalysis.positivePercentage}%)</span>
                </div>
              )}
              {performanceMetrics && performanceMetrics.avgResponseTime < 2 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Fast response time (&lt;2s)</span>
                </div>
              )}
              {performanceMetrics && performanceMetrics.satisfactionRate > 85 && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">High satisfaction rate ({performanceMetrics.satisfactionRate}%)</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Areas for Improvement</h4>
            <div className="space-y-2">
              {sentimentAnalysis && sentimentAnalysis.negativePercentage > 30 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">High negative sentiment ({sentimentAnalysis.negativePercentage}%)</span>
                </div>
              )}
              {performanceMetrics && performanceMetrics.avgResponseTime > 3 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Slow response time (&gt;3s)</span>
                </div>
              )}
              {performanceMetrics && performanceMetrics.satisfactionRate < 80 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Low satisfaction rate ({performanceMetrics.satisfactionRate}%)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
