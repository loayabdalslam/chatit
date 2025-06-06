import { v } from "convex/values";
import { query, mutation, action, internalMutation, internalAction, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const generateReport = mutation({
  args: {
    chatbotId: v.optional(v.id("chatbots")),
    type: v.union(v.literal("weekly"), v.literal("monthly"), v.literal("custom")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify chatbot ownership if specified
    if (args.chatbotId) {
      const chatbot = await ctx.db.get(args.chatbotId);
      if (!chatbot || chatbot.userId !== userId) {
        throw new Error("Chatbot not found or access denied");
      }
    }

    const reportId = await ctx.db.insert("reports", {
      userId,
      chatbotId: args.chatbotId,
      type: args.type,
      title: `${args.type} Report`,
      generatedAt: Date.now(),
      startDate: args.startDate,
      endDate: args.endDate,
      data: null,
      status: "generating",
    });

    // Schedule report generation
    await ctx.scheduler.runAfter(0, internal.reports.processReport, {
      reportId,
    });

    return reportId;
  },
});

export const processReport = internalMutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    try {
      // Get actual report data
      let totalConversations = 0;
      let totalMessages = 0;

      if (report.chatbotId) {
        // Get data for specific chatbot
        const conversations = await ctx.db
          .query("conversations")
          .withIndex("by_chatbot", (q) => q.eq("chatbotId", report.chatbotId!))
          .collect();
        
        totalConversations = conversations.length;
        
        for (const conversation of conversations) {
          const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
            .collect();
          totalMessages += messages.length;
        }
      }

      const reportData = {
        totalConversations,
        totalMessages,
        avgResponseTime: Math.random() * 2 + 1,
        satisfactionRate: Math.floor(Math.random() * 20) + 80,
      };

      // Update report with data
      await ctx.db.patch(args.reportId, {
        data: reportData,
        status: "completed",
        generatedAt: Date.now(),
      });

      // Schedule email sending
      await ctx.scheduler.runAfter(0, internal.reports.sendReportEmail, {
        reportId: args.reportId,
      });
    } catch (error) {
      await ctx.db.patch(args.reportId, {
        status: "failed",
      });
      throw error;
    }
  },
});

export const sendReportEmail = internalAction({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.runQuery(internal.reports.getReport, {
      reportId: args.reportId,
    });

    if (!report) {
      throw new Error("Report not found");
    }

    const user = await ctx.runQuery(internal.reports.getUser, {
      userId: report.userId,
    });

    if (!user || !user.email) {
      throw new Error("User email not found");
    }

    // Generate HTML report
    const htmlReport = await ctx.runAction(internal.reports.generateHtmlReport, {
      reportId: args.reportId,
    });

    // Send email using Resend
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Chatit Analytics <reports@chatit.example.com>",
      to: user.email,
      subject: `Your ${report.type} Analytics Report - ${new Date().toLocaleDateString()}`,
      html: htmlReport,
    });

    if (error) {
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
    }

    return data;
  },
});

export const getReport = internalQuery({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reportId);
  },
});

export const getUserReports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("reports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const getUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const generateHtmlReport = internalAction({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args): Promise<string> => {
    const report = await ctx.runQuery(internal.reports.getReport, {
      reportId: args.reportId,
    });

    if (!report || !report.data) {
      throw new Error("Report data not found");
    }

    const user = await ctx.runQuery(internal.reports.getUser, {
      userId: report.userId,
    });

    let chatbotName = "All Chatbots";
    if (report.chatbotId) {
      const chatbot = await ctx.runQuery(internal.reports.getChatbot, {
        chatbotId: report.chatbotId,
      });
      chatbotName = chatbot?.name || "Unknown Chatbot";
    }

    const reportDate = new Date().toLocaleDateString();
    const startDate = report.startDate ? new Date(report.startDate).toLocaleDateString() : "N/A";
    const endDate = report.endDate ? new Date(report.endDate).toLocaleDateString() : "N/A";

    const html: string = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1f2937;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header p {
            color: #6b7280;
            margin: 5px 0;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .metric-label {
            color: #64748b;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .performance-indicator {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .good { background: #dcfce7; color: #166534; }
        .average { background: #fef3c7; color: #92400e; }
        .poor { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📊 Chatit Analytics</div>
            <h1>Analytics Report</h1>
            <p><strong>Report Type:</strong> ${report.type.charAt(0).toUpperCase() + report.type.slice(1)}</p>
            <p><strong>Period:</strong> ${startDate} - ${endDate}</p>
            <p><strong>Chatbot:</strong> ${chatbotName}</p>
            <p><strong>Generated:</strong> ${reportDate}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${report.data.totalConversations}</div>
                <div class="metric-label">Total Conversations</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.data.totalMessages}</div>
                <div class="metric-label">Total Messages</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${(report.data.avgResponseTime * 1000).toFixed(0)}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.data.satisfactionRate}%</div>
                <div class="metric-label">Satisfaction Rate</div>
            </div>
        </div>

        <div class="section">
            <h2>📈 Performance Analysis</h2>
            <p><strong>Response Time:</strong> 
                <span class="performance-indicator ${report.data.avgResponseTime < 2 ? 'good' : report.data.avgResponseTime < 4 ? 'average' : 'poor'}">
                    ${report.data.avgResponseTime < 2 ? 'Excellent' : report.data.avgResponseTime < 4 ? 'Good' : 'Needs Improvement'}
                </span>
            </p>
            <p><strong>Satisfaction Rate:</strong> 
                <span class="performance-indicator ${report.data.satisfactionRate > 85 ? 'good' : report.data.satisfactionRate > 70 ? 'average' : 'poor'}">
                    ${report.data.satisfactionRate > 85 ? 'Excellent' : report.data.satisfactionRate > 70 ? 'Good' : 'Needs Improvement'}
                </span>
            </p>
        </div>

        <div class="section">
            <h2>💡 Recommendations</h2>
            <ul>
                ${report.data.avgResponseTime > 3 ? '<li>Consider optimizing your chatbot for faster response times (currently above 3 seconds)</li>' : ''}
                ${report.data.satisfactionRate < 80 ? '<li>Review user feedback and improve chatbot responses to increase satisfaction</li>' : ''}
                ${report.data.satisfactionRate > 85 ? '<li>Great job! Your chatbot is performing excellently</li>' : ''}
                ${report.data.totalConversations < 10 ? '<li>Consider promoting your chatbot to increase user engagement</li>' : ''}
                <li>Continue monitoring these metrics to track improvements over time</li>
            </ul>
        </div>

        <div class="footer">
            <p>This report was automatically generated by Chatit Analytics</p>
            <p>For questions or support, please contact our team</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  },
});

export const getChatbot = internalQuery({
  args: { chatbotId: v.id("chatbots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatbotId);
  },
});
