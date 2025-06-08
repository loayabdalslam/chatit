import { v } from "convex/values";
import { query } from "./_generated/server";

export const getLandingStats = query({
  args: {},
  returns: v.object({
    totalUsers: v.number(),
    totalConversations: v.number(),
    totalMessages: v.number(),
    satisfactionScore: v.number(),
  }),
  handler: async (ctx) => {
    // Count all users
    const users = await ctx.db.query("users").collect();
    // Count all conversations
    const conversations = await ctx.db.query("conversations").collect();
    // Count all messages
    const messages = await ctx.db.query("messages").collect();
    // Sentiment analysis for satisfaction
    const sentiments = await ctx.db.query("sentimentAnalysis").collect();
    
    let satisfactionScore = 85; // Default fallback
    if (sentiments.length > 0) {
      const positive = sentiments.filter(s => s.sentiment === "positive").length;
      const neutral = sentiments.filter(s => s.sentiment === "neutral").length;
      satisfactionScore = Math.round(((positive + neutral * 0.5) / sentiments.length) * 100);
    }
    
    return {
      totalUsers: users.length,
      totalConversations: conversations.length,
      totalMessages: messages.length,
      satisfactionScore,
    };
  },
}); 