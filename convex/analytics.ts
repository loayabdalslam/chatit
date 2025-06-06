import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getChatbotStats = query({
  args: { chatbotId: v.optional(v.id("chatbots")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    let conversationsQuery = ctx.db.query("conversations").filter((q) => q.eq(q.field("userId"), userId));
    let messagesQuery = ctx.db.query("messages");

    if (args.chatbotId) {
      // Verify chatbot ownership
      const chatbot = await ctx.db.get(args.chatbotId);
      if (!chatbot || chatbot.userId !== userId) {
        return null;
      }
      
      conversationsQuery = conversationsQuery.filter((q) => q.eq(q.field("chatbotId"), args.chatbotId));
      
      // Get conversations for this chatbot to filter messages
      const conversations = await conversationsQuery.collect();
      const conversationIds = conversations.map(c => c._id);
      
      if (conversationIds.length === 0) {
        return {
          totalConversations: 0,
          totalMessages: 0,
        };
      }

      // Count messages in these conversations
      const messages = await ctx.db.query("messages").collect();
      const filteredMessages = messages.filter(m => conversationIds.includes(m.conversationId));
      
      return {
        totalConversations: conversations.length,
        totalMessages: filteredMessages.length,
      };
    }

    // Get all user's conversations and messages
    const conversations = await conversationsQuery.collect();
    const conversationIds = conversations.map(c => c._id);
    
    if (conversationIds.length === 0) {
      return {
        totalConversations: 0,
        totalMessages: 0,
      };
    }

    const messages = await ctx.db.query("messages").collect();
    const userMessages = messages.filter(m => conversationIds.includes(m.conversationId));

    return {
      totalConversations: conversations.length,
      totalMessages: userMessages.length,
    };
  },
});

export const getPerformanceMetrics = query({
  args: { chatbotId: v.optional(v.id("chatbots")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Mock performance metrics for demo
    return {
      avgResponseTime: Math.random() * 3 + 0.5, // 0.5-3.5 seconds
      satisfactionRate: Math.floor(Math.random() * 20) + 80, // 80-100%
      resolutionRate: Math.floor(Math.random() * 15) + 85, // 85-100%
    };
  },
});

export const getSentimentAnalysis = query({
  args: { chatbotId: v.optional(v.id("chatbots")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Mock sentiment analysis for demo
    const positive = Math.floor(Math.random() * 30) + 50; // 50-80%
    const negative = Math.floor(Math.random() * 20) + 5; // 5-25%
    const neutral = 100 - positive - negative;

    return {
      positivePercentage: positive,
      neutralPercentage: neutral,
      negativePercentage: negative,
      overallSentiment: Math.floor(Math.random() * 20) - 10, // -10 to +10
      trendData: Array.from({ length: 7 }, (_, i) => ({
        date: Date.now() - (6 - i) * 24 * 60 * 60 * 1000,
        sentiment: Math.floor(Math.random() * 20) - 10,
      })),
    };
  },
});

export const getRecentActivity = query({
  args: { chatbotId: v.optional(v.id("chatbots")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let conversationsQuery = ctx.db.query("conversations").filter((q) => q.eq(q.field("userId"), userId));

    if (args.chatbotId) {
      // Verify chatbot ownership
      const chatbot = await ctx.db.get(args.chatbotId);
      if (!chatbot || chatbot.userId !== userId) {
        return [];
      }
      
      conversationsQuery = conversationsQuery.filter((q) => q.eq(q.field("chatbotId"), args.chatbotId));
    }

    const conversations = await conversationsQuery.order("desc").take(20);
    
    return conversations.map((conv: any) => ({
      description: `New conversation: ${conv.title}`,
      timestamp: conv._creationTime,
      type: "conversation",
    }));
  },
});

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const chatbots = await ctx.db
      .query("chatbots")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const conversationIds = conversations.map(c => c._id);
    const messages = await ctx.db.query("messages").collect();
    const userMessages = messages.filter(m => conversationIds.includes(m.conversationId));

    // Calculate messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = userMessages.filter(m => m.timestamp >= today.getTime());

    return {
      totalChatbots: chatbots.length,
      totalConversations: conversations.length,
      totalMessages: userMessages.length,
      messagesToday: todayMessages.length,
    };
  },
});

export const getGeneralStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const chatbots = await ctx.db
      .query("chatbots")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const conversationIds = conversations.map(c => c._id);
    const messages = await ctx.db.query("messages").collect();
    const userMessages = messages.filter(m => conversationIds.includes(m.conversationId));

    return {
      totalChatbots: chatbots.length,
      totalConversations: conversations.length,
      totalMessages: userMessages.length,
      activeChatbots: chatbots.filter(bot => bot.isActive).length,
    };
  },
});

export const getMonthlyMessageCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const conversationIds = conversations.map(c => c._id);
    const messages = await ctx.db.query("messages").collect();
    const userMessages = messages.filter(m => conversationIds.includes(m.conversationId));

    // Calculate messages this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyMessages = userMessages.filter(m => m.timestamp >= startOfMonth.getTime());

    return monthlyMessages.length;
  },
});
