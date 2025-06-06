import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const analyzeSentiment = internalAction({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
    messageContent: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Simple sentiment analysis based on keywords
      const content = args.messageContent.toLowerCase();
      
      const positiveWords = [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
        'love', 'perfect', 'awesome', 'brilliant', 'outstanding', 'superb', 
        'thanks', 'thank you', 'helpful', 'useful', 'satisfied', 'happy', 
        'pleased', 'nice', 'cool', 'impressive', 'solid', 'works', 'working'
      ];
      
      const negativeWords = [
        'bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'useless', 
        'frustrated', 'angry', 'disappointed', 'annoyed', 'confused', 'problem', 
        'issue', 'error', 'broken', 'wrong', 'failed', 'slow', 'poor', 'sucks',
        'stupid', 'dumb', 'ridiculous', 'waste', 'garbage'
      ];
      
      const hasPositive = positiveWords.some(word => content.includes(word));
      const hasNegative = negativeWords.some(word => content.includes(word));
      
      let sentiment: "positive" | "negative" | "neutral" = "neutral";
      let score = 0;
      
      if (hasPositive && !hasNegative) {
        sentiment = "positive";
        score = 0.7;
      } else if (hasNegative && !hasPositive) {
        sentiment = "negative";
        score = -0.7;
      } else if (hasPositive && hasNegative) {
        sentiment = "neutral";
        score = 0;
      }
      
      // Store sentiment analysis result
      await ctx.runMutation(internal.sentiment.storeSentimentAnalysis, {
        conversationId: args.conversationId,
        messageId: args.messageId,
        sentiment,
        score,
      });
      
    } catch (error) {
      console.error("Sentiment analysis failed:", error);
    }
  },
});

export const storeSentimentAnalysis = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
    sentiment: v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral")),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sentimentAnalysis", {
      conversationId: args.conversationId,
      messageId: args.messageId,
      sentiment: args.sentiment,
      score: args.score,
      analyzedAt: Date.now(),
    });
  },
});
