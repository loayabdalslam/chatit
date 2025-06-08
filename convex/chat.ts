import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Complete chat action that handles user message and generates AI response
 * This is called from the HTTP API handler
 */
export const handleChatMessage = internalAction({
  args: {
    chatbotId: v.id("chatbots"),
    message: v.string(),
    sessionId: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    try {
      // Get or create conversation for this session
      let conversation = await ctx.runQuery(internal.conversations.getBySessionInternal, {
        sessionId: args.sessionId
      });
      
      if (!conversation) {
        const newConversationId = await ctx.runMutation(internal.conversations.createWidgetInternal, {
          chatbotId: args.chatbotId,
          sessionId: args.sessionId
        });
        conversation = await ctx.runQuery(internal.conversations.getBySessionInternal, {
          sessionId: args.sessionId
        });
      }
      
      if (!conversation) {
        throw new Error("Failed to create conversation");
      }

      // Use the same approach as conversations.ts - call sendMessageInternal
      const aiResponse = await ctx.runMutation(internal.conversations.sendMessageInternal, {
        conversationId: conversation._id,
        content: args.message,
      });

      // Sentiment analysis is already handled in sendMessageInternal

      return aiResponse;
      
    } catch (error) {
      console.error("Error in handleChatMessage:", error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again.";
    }
  },
});

/**
 * Insert user message into conversation
 */
export const insertUserMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args): Promise<Id<"messages">> => {
    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "user",
      timestamp: Date.now(),
    });
  },
});

/**
 * Insert AI message into conversation
 */
export const insertAIMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args): Promise<Id<"messages">> => {
    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "assistant",
      timestamp: Date.now(),
    });
  },
}); 