import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface Chatbot {
  _id: Id<"chatbots">;
  name: string;
  description?: string;
}

interface AnalyticsDashboardProps {
  chatbotId?: Id<"chatbots"> | null;
  chatbots?: Chatbot[];
  onSelectChatbot?: (id: Id<"chatbots"> | null) => void;
}

export function AnalyticsDashboard({ chatbotId, chatbots = [], onSelectChatbot }: AnalyticsDashboardProps) {
  const generalStats = useQuery(api.analytics.getGeneralStats);
  const chatbotStats = useQuery(
    api.analytics.getChatbotStats,
    chatbotId ? { chatbotId } : "skip"
  );
  const recentActivity = useQuery(api.analytics.getRecentActivity, { chatbotId: chatbotId || undefined });
  const performanceMetrics = useQuery(api.analytics.getPerformanceMetrics, { chatbotId: chatbotId || undefined });
  const sentimentAnalysis = useQuery(api.analytics.getSentimentAnalysis, { chatbotId: chatbotId || undefined });

  const selectedChatbot = chatbotId ? chatbots.find(bot => bot._id === chatbotId) : null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">
            {selectedChatbot ? `Analytics for ${selectedChatbot.name}` : "Overview of all chatbots"}
          </p>
        </div>
        
        {onSelectChatbot && chatbots.length > 0 && (
          <div className="flex gap-2">
            <select
              value={chatbotId || ""}
              onChange={(e) => onSelectChatbot(e.target.value ? e.target.value as Id<"chatbots"> : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Chatbots</option>
              {chatbots.map((chatbot) => (
                <option key={chatbot._id} value={chatbot._id}>
                  {chatbot.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {chatbotId && chatbotStats ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(chatbotStats.totalConversations)}</p>
                </div>
                <div className="text-blue-600">💬</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(chatbotStats.totalMessages)}</p>
                </div>
                <div className="text-green-600">📨</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics ? formatTime(performanceMetrics.avgResponseTime * 1000) : "N/A"}</p>
                </div>
                <div className="text-purple-600">⚡</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{performanceMetrics ? `${performanceMetrics.satisfactionRate}%` : "N/A"}</p>
                </div>
                <div className="text-orange-600">😊</div>
              </div>
            </div>
          </>
        ) : generalStats ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
                  <p className="text-2xl font-bold text-gray-900">{generalStats.totalChatbots}</p>
                </div>
                <div className="text-blue-600">🤖</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(generalStats.totalConversations)}</p>
                </div>
                <div className="text-green-600">💬</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(generalStats.totalMessages)}</p>
                </div>
                <div className="text-purple-600">📨</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg per Chatbot</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {generalStats.totalChatbots > 0 
                      ? Math.round(generalStats.totalConversations / generalStats.totalChatbots)
                      : 0
                    }
                  </p>
                </div>
                <div className="text-orange-600">📊</div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading analytics...</p>
          </div>
        )}
      </div>

      {/* Performance Overview */}
      {performanceMetrics && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{formatTime(performanceMetrics.avgResponseTime * 1000)}</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Average Response Time</div>
              <div className="flex items-center text-sm">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                <span className="text-gray-600">
                  {performanceMetrics.avgResponseTime < 2 ? 'Excellent' : 
                   performanceMetrics.avgResponseTime < 3 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">{performanceMetrics.satisfactionRate}%</div>
              <div className="text-sm font-medium text-gray-600 mb-2">User Satisfaction Rate</div>
              <div className="flex items-center text-sm">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-green-600">High Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Analysis */}
      {sentimentAnalysis && sentimentAnalysis.positivePercentage + sentimentAnalysis.neutralPercentage + sentimentAnalysis.negativePercentage > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Analysis</h3>
          
          {/* Sentiment Percentages with Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">{sentimentAnalysis.positivePercentage}%</div>
              <div className="text-sm text-gray-600 mb-2">Positive</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sentimentAnalysis.positivePercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600 mb-1">{sentimentAnalysis.neutralPercentage}%</div>
              <div className="text-sm text-gray-600 mb-2">Neutral</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sentimentAnalysis.neutralPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-1">{sentimentAnalysis.negativePercentage}%</div>
              <div className="text-sm text-gray-600 mb-2">Negative</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sentimentAnalysis.negativePercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className={`text-3xl font-bold mb-1 ${
                sentimentAnalysis.overallSentiment > 0 ? 'text-green-600' : 
                sentimentAnalysis.overallSentiment < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {sentimentAnalysis.overallSentiment > 0 ? '+' : ''}{sentimentAnalysis.overallSentiment}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>

          {/* 7-Day Sentiment Trend */}
          {sentimentAnalysis.trendData && sentimentAnalysis.trendData.length > 0 && (
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-4">7-Day Sentiment Trend</h4>
                <div className="flex justify-between items-end space-x-4">
                  {sentimentAnalysis.trendData.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-1">{day.day}</div>
                      <div className={`text-sm font-bold mb-1 ${
                        day.sentiment > 0 ? 'text-green-600' : 
                        day.sentiment < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {day.sentiment > 0 ? '+' : ''}{day.sentiment}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                <span className="text-gray-900">{activity.description}</span>
                <span className="text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!generalStats && !chatbotStats && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No analytics data yet</h3>
          <p className="text-gray-600">
            {chatbotId 
              ? "Start chatting with your bot to see analytics data"
              : "Create and use chatbots to see analytics data"
            }
          </p>
        </div>
      )}
    </div>
  );
}
