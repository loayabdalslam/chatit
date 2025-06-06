import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ReportGeneratorProps {
  chatbotId?: Id<"chatbots">;
}

export function ReportGenerator({ chatbotId }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<"weekly" | "monthly" | "custom">("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const chatbots = useQuery(api.chatbots.list) || [];
  const generalStats = useQuery(api.analytics.getGeneralStats);
  const sentimentAnalysis = useQuery(api.analytics.getSentimentAnalysis, { chatbotId });
  const performanceMetrics = useQuery(api.analytics.getPerformanceMetrics, { chatbotId });
  const recentActivity = useQuery(api.analytics.getRecentActivity, { chatbotId });
  const userReports = useQuery(api.reports.getUserReports) || [];

  const generateReportMutation = useMutation(api.reports.generateReport);

  const generateReport = () => {
    const now = new Date();
    const reportDate = now.toLocaleDateString();
    const reportTime = now.toLocaleTimeString();

    let report = `# Chatbot Analytics Report\n\n`;
    report += `**Generated on:** ${reportDate} at ${reportTime}\n`;
    report += `**Report Type:** ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}\n\n`;

    if (chatbotId) {
      const selectedBot = chatbots.find(bot => bot._id === chatbotId);
      report += `**Chatbot:** ${selectedBot?.name || 'Unknown'}\n\n`;
    } else {
      report += `**Scope:** All Chatbots\n\n`;
    }

    // General Statistics
    report += `## 📊 General Statistics\n\n`;
    if (generalStats) {
      report += `- **Total Chatbots:** ${generalStats.totalChatbots}\n`;
      report += `- **Total Conversations:** ${generalStats.totalConversations}\n`;
      report += `- **Total Messages:** ${generalStats.totalMessages}\n`;
      report += `- **Average Conversations per Chatbot:** ${generalStats.totalChatbots > 0 ? Math.round(generalStats.totalConversations / generalStats.totalChatbots) : 0}\n\n`;
    }

    // Performance Metrics
    if (performanceMetrics) {
      report += `## ⚡ Performance Metrics\n\n`;
      report += `- **Average Response Time:** ${(performanceMetrics.avgResponseTime * 1000).toFixed(0)}ms\n`;
      report += `- **Satisfaction Rate:** ${performanceMetrics.satisfactionRate}%\n\n`;
    }

    // Sentiment Analysis
    if (sentimentAnalysis && (sentimentAnalysis.positivePercentage + sentimentAnalysis.neutralPercentage + sentimentAnalysis.negativePercentage > 0)) {
      report += `## 😊 Sentiment Analysis\n\n`;
      report += `- **Positive:** ${sentimentAnalysis.positivePercentage}%\n`;
      report += `- **Neutral:** ${sentimentAnalysis.neutralPercentage}%\n`;
      report += `- **Negative:** ${sentimentAnalysis.negativePercentage}%\n`;
      report += `- **Overall Sentiment Score:** ${sentimentAnalysis.overallSentiment}\n\n`;

      if (sentimentAnalysis.trendData && sentimentAnalysis.trendData.length > 0) {
        report += `### Sentiment Trend (Last 7 Days)\n\n`;
        sentimentAnalysis.trendData.forEach(trend => {
          report += `- **${trend.date}:** ${trend.sentiment}\n`;
        });
        report += `\n`;
      }
    }

    // Peak Hours Analysis
    report += `## 🕐 Peak Hours Analysis\n\n`;
    if (recentActivity && recentActivity.length > 0) {
      const hourCounts: Record<number, number> = {};
      recentActivity.forEach(activity => {
        const hour = new Date(activity.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const sortedHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      report += `**Top 5 Most Active Hours:**\n\n`;
      sortedHours.forEach(([hour, count], index) => {
        const hourStr = `${hour.padStart(2, '0')}:00`;
        report += `${index + 1}. **${hourStr}** - ${count} activities\n`;
      });
      report += `\n`;
    } else {
      report += `No activity data available for peak hours analysis.\n\n`;
    }

    // Categories Analysis
    report += `## 📂 Categories Analysis\n\n`;
    if (chatbots.length > 0) {
      const categories: Record<string, number> = {};
      chatbots.forEach(bot => {
        // Simple categorization based on name/description keywords
        const text = (bot.name + ' ' + (bot.description || '')).toLowerCase();
        if (text.includes('support') || text.includes('help')) {
          categories['Customer Support'] = (categories['Customer Support'] || 0) + 1;
        } else if (text.includes('sales') || text.includes('product')) {
          categories['Sales'] = (categories['Sales'] || 0) + 1;
        } else if (text.includes('faq') || text.includes('question')) {
          categories['FAQ'] = (categories['FAQ'] || 0) + 1;
        } else {
          categories['General'] = (categories['General'] || 0) + 1;
        }
      });

      Object.entries(categories).forEach(([category, count]) => {
        report += `- **${category}:** ${count} chatbots\n`;
      });
      report += `\n`;
    }

    // Recent Activity
    if (recentActivity && recentActivity.length > 0) {
      report += `## 📈 Recent Activity\n\n`;
      recentActivity.slice(0, 10).forEach((activity, index) => {
        const date = new Date(activity.timestamp).toLocaleDateString();
        report += `${index + 1}. ${activity.description} - ${date}\n`;
      });
      report += `\n`;
    }

    // Recommendations
    report += `## 💡 Recommendations\n\n`;
    if (sentimentAnalysis) {
      if (sentimentAnalysis.negativePercentage > 30) {
        report += `- **High negative sentiment detected (${sentimentAnalysis.negativePercentage}%).** Consider reviewing chatbot responses and improving training data.\n`;
      }
      if (sentimentAnalysis.positivePercentage > 70) {
        report += `- **Excellent positive sentiment (${sentimentAnalysis.positivePercentage}%).** Your chatbot is performing well!\n`;
      }
    }
    if (performanceMetrics) {
      if (performanceMetrics.avgResponseTime > 3) {
        report += `- **Response time is above 3 seconds.** Consider optimizing your chatbot for faster responses.\n`;
      }
      if (performanceMetrics.satisfactionRate < 80) {
        report += `- **Satisfaction rate is below 80%.** Review user feedback and improve chatbot responses.\n`;
      }
    }

    report += `\n---\n\n*Report generated by Chatit Analytics Dashboard*`;

    setGeneratedReport(report);
  };

  const generateAndEmailReport = async () => {
    setIsGenerating(true);
    try {
      const now = Date.now();
      let startTime: number;
      let endTime: number = now;

      if (reportType === "weekly") {
        startTime = now - (7 * 24 * 60 * 60 * 1000);
      } else if (reportType === "monthly") {
        startTime = now - (30 * 24 * 60 * 60 * 1000);
      } else {
        if (!startDate || !endDate) {
          toast.error("Please select start and end dates for custom report");
          return;
        }
        startTime = new Date(startDate).getTime();
        endTime = new Date(endDate).getTime();
      }

      const reportId = await generateReportMutation({
        chatbotId,
        type: reportType,
        startDate: startTime,
        endDate: endTime,
      });

      toast.success("Report generated successfully! Check your email for the detailed report.");
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Report Generator</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as "weekly" | "monthly" | "custom")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {reportType === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Generate Preview
          </button>
          <button
            onClick={generateAndEmailReport}
            disabled={isGenerating}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                Generate & Email Report
              </>
            )}
          </button>
          {generatedReport && (
            <button
              onClick={downloadReport}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors font-medium"
            >
              Download Preview
            </button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📧 Email Reports</h4>
          <p className="text-sm text-blue-800">
            Click "Generate & Email Report" to receive a professionally formatted HTML report in your email. 
            The email report includes detailed analytics, charts, and actionable insights.
          </p>
        </div>
      </div>

      {/* Recent Reports */}
      {userReports.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {userReports.slice(0, 5).map((report) => (
              <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                  </div>
                  <div className="text-sm text-gray-600">
                    {report.startDate ? new Date(report.startDate).toLocaleDateString() : "N/A"} - {report.endDate ? new Date(report.endDate).toLocaleDateString() : "N/A"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === "completed" ? "bg-green-100 text-green-800" :
                    report.status === "generating" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(report._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatedReport && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Report Preview</h3>
          <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {generatedReport}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
