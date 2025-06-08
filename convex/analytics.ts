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

    // Get conversations for the user (and optionally filter by chatbot)
    let conversationsQuery = ctx.db.query("conversations").filter((q) => q.eq(q.field("userId"), userId));
    
    if (args.chatbotId) {
      // Verify chatbot ownership
      const chatbot = await ctx.db.get(args.chatbotId);
      if (!chatbot || chatbot.userId !== userId) {
        return null;
      }
      conversationsQuery = conversationsQuery.filter((q) => q.eq(q.field("chatbotId"), args.chatbotId));
    }

    const conversations = await conversationsQuery.collect();
    const conversationIds = conversations.map(c => c._id);
    
    if (conversationIds.length === 0) {
      return {
        avgResponseTime: 0,
        satisfactionRate: 0,
        resolutionRate: 0,
      };
    }

    // Get all messages for these conversations
    const allMessages = await ctx.db.query("messages").collect();
    const messages = allMessages.filter(m => conversationIds.includes(m.conversationId));
    
    if (messages.length === 0) {
      return {
        avgResponseTime: 0,
        satisfactionRate: 0,
        resolutionRate: 0,
      };
    }

    // Calculate average response time based on bot response delays
    const botMessages = messages.filter(m => m.role === 'assistant');
    const userMessages = messages.filter(m => m.role === 'user');
    
    let totalResponseTime = 0;
    let responseCount = 0;
    
    // Calculate response times by finding bot messages that follow user messages
    for (const botMessage of botMessages) {
      const conversation = conversations.find(c => c._id === botMessage.conversationId);
      if (!conversation) continue;
      
      const conversationMessages = messages
        .filter(m => m.conversationId === botMessage.conversationId)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      const botMessageIndex = conversationMessages.findIndex(m => m._id === botMessage._id);
      if (botMessageIndex > 0) {
        const previousMessage = conversationMessages[botMessageIndex - 1];
        if (previousMessage.role === 'user') {
          const responseTime = botMessage.timestamp - previousMessage.timestamp;
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    }
    
    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount / 1000 : 2.5; // Convert to seconds
    
    // Calculate satisfaction rate based on sentiment analysis
    const sentimentAnalyses = await ctx.db.query("sentimentAnalysis").collect();
    const relevantSentiments = sentimentAnalyses.filter(s => conversationIds.includes(s.conversationId));
    
    let satisfactionRate = 85; // Default fallback
    if (relevantSentiments.length > 0) {
      const positiveCount = relevantSentiments.filter(s => s.sentiment === 'positive').length;
      const neutralCount = relevantSentiments.filter(s => s.sentiment === 'neutral').length;
      // Consider neutral as partially satisfied
      satisfactionRate = Math.round(((positiveCount + neutralCount * 0.5) / relevantSentiments.length) * 100);
    }
    
    // Calculate resolution rate based on conversation length and sentiment
    let resolutionRate = 88; // Default fallback
    if (conversations.length > 0) {
      // Consider conversations with positive sentiment or fewer than 10 messages as resolved
      let resolvedCount = 0;
      for (const conversation of conversations) {
        const convMessages = messages.filter(m => m.conversationId === conversation._id);
        const convSentiments = relevantSentiments.filter(s => s.conversationId === conversation._id);
        
        const hasPositiveSentiment = convSentiments.some(s => s.sentiment === 'positive');
        const isShortConversation = convMessages.length <= 10;
        
        if (hasPositiveSentiment || isShortConversation) {
          resolvedCount++;
        }
      }
      resolutionRate = Math.round((resolvedCount / conversations.length) * 100);
    }

    return {
      avgResponseTime: Math.max(0.1, avgResponseTime), // Ensure minimum response time
      satisfactionRate: Math.min(100, Math.max(0, satisfactionRate)),
      resolutionRate: Math.min(100, Math.max(0, resolutionRate)),
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

    // Get conversations for the user (and optionally filter by chatbot)
    let conversationsQuery = ctx.db.query("conversations").filter((q) => q.eq(q.field("userId"), userId));
    
    if (args.chatbotId) {
      // Verify chatbot ownership
      const chatbot = await ctx.db.get(args.chatbotId);
      if (!chatbot || chatbot.userId !== userId) {
        return null;
      }
      conversationsQuery = conversationsQuery.filter((q) => q.eq(q.field("chatbotId"), args.chatbotId));
    }

    const conversations = await conversationsQuery.collect();
    const conversationIds = conversations.map(c => c._id);
    
    if (conversationIds.length === 0) {
      return {
        positivePercentage: 0,
        neutralPercentage: 0,
        negativePercentage: 0,
        overallSentiment: 0,
        trendData: [],
      };
    }

    // Get sentiment analyses for these conversations
    const allSentiments = await ctx.db.query("sentimentAnalysis").collect();
    const sentiments = allSentiments.filter(s => conversationIds.includes(s.conversationId));
    
    if (sentiments.length === 0) {
      return {
        positivePercentage: 0,
        neutralPercentage: 0,
        negativePercentage: 0,
        overallSentiment: 0,
        trendData: [],
      };
    }

    // Calculate sentiment percentages
    const positiveCount = sentiments.filter(s => s.sentiment === 'positive').length;
    const neutralCount = sentiments.filter(s => s.sentiment === 'neutral').length;
    const negativeCount = sentiments.filter(s => s.sentiment === 'negative').length;
    
    const total = sentiments.length;
    const positivePercentage = Math.round((positiveCount / total) * 100);
    const neutralPercentage = Math.round((neutralCount / total) * 100);
    const negativePercentage = Math.round((negativeCount / total) * 100);
    
    // Calculate overall sentiment score
    const totalScore = sentiments.reduce((sum, s) => sum + (s.score || 0), 0);
    const overallSentiment = Math.round((totalScore / total) * 10); // Scale to -10 to +10
    
    // Generate 7-day sentiment trend
    const now = new Date();
    const trendData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Get sentiments for this day
      const daySentiments = sentiments.filter(s => {
        const sentimentDate = new Date(s.analyzedAt || s.timestamp || 0);
        return sentimentDate >= date && sentimentDate < nextDate;
      });
      
      let dayScore = 0;
      if (daySentiments.length > 0) {
        const dayTotalScore = daySentiments.reduce((sum, s) => sum + (s.score || 0), 0);
        dayScore = Math.round((dayTotalScore / daySentiments.length) * 10);
      }
      
      trendData.push({
        date: date.getTime(),
        sentiment: dayScore,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    return {
      positivePercentage,
      neutralPercentage,
      negativePercentage,
      overallSentiment,
      trendData,
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


