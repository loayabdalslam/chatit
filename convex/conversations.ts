import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Public functions
export const create = mutation({
  args: {
    chatbotId: v.id("chatbots"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify the chatbot belongs to the user
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      throw new Error("Chatbot not found or access denied");
    }

    return await ctx.db.insert("conversations", {
      chatbotId: args.chatbotId,
      userId,
      title: args.title || "New Conversation",
      status: "active",
    });
  },
});

export const list = query({
  args: {
    chatbotId: v.optional(v.id("chatbots")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db.query("conversations").filter((q) => q.eq(q.field("userId"), userId));
    
    if (args.chatbotId) {
      query = query.filter((q) => q.eq(q.field("chatbotId"), args.chatbotId));
    }

    return await query.order("desc").collect();
  },
});

export const getAllUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const conversation = await ctx.db.get(args.id);
    if (!conversation || conversation.userId !== userId) {
      return null;
    }

    return conversation;
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify access to conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify access to conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found or access denied");
    }

    // Insert user message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "user",
      timestamp: Date.now(),
    });

    // Generate AI response
    const response = await generateAIResponse(ctx, args.conversationId, args.content);
    
    // Insert AI response
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: response,
      role: "assistant",
      timestamp: Date.now(),
    });

    return response;
  },
});

export const deleteConversation = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversation = await ctx.db.get(args.id);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found or access denied");
    }

    // Delete all messages in the conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the conversation
    await ctx.db.delete(args.id);
  },
});

// Internal functions for widget API
export const getBySessionInternal = internalQuery({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first();
    
    return conversation;
  },
});

export const createWidgetInternal = internalMutation({
  args: {
    chatbotId: v.id("chatbots"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot) {
      throw new Error("Chatbot not found");
    }

    return await ctx.db.insert("conversations", {
      chatbotId: args.chatbotId,
      userId: chatbot.userId, // Use chatbot owner's userId
      title: "Widget Conversation",
      status: "active",
      sessionId: args.sessionId,
    });
  },
});

export const sendMessageInternal = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Insert user message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "user",
      timestamp: Date.now(),
    });

    // Generate AI response
    const response = await generateAIResponse(ctx, args.conversationId, args.content);
    
    // Insert AI response
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: response,
      role: "assistant",
      timestamp: Date.now(),
    });

    return response;
  },
});

// Helper function to generate AI responses
async function generateAIResponse(ctx: any, conversationId: Id<"conversations">, userMessage: string): Promise<string> {
  try {
    // Get conversation context
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      return "I'm sorry, I couldn't process your request.";
    }

    // Get chatbot configuration
    const chatbot = await ctx.db.get(conversation.chatbotId);
    if (!chatbot) {
      return "I'm sorry, I couldn't process your request.";
    }

    // Get recent messages for context
    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", conversationId))
      .order("desc")
      .take(10);

    // Simple rule-based responses for demo
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return `Hello! I'm ${chatbot.name}. How can I help you today?`;
    }
    
    if (lowerMessage.includes("help")) {
      return "I'm here to help! You can ask me questions about our products and services.";
    }
    
    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) {
      return "For pricing information, please contact our sales team or visit our pricing page.";
    }
    
    if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    
    if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
      return "Goodbye! Feel free to reach out if you have any more questions.";
    }

    // Default response
    return "Thank you for your message. I understand you're asking about: " + userMessage + ". How can I assist you further?";
    
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again.";
  }
}
