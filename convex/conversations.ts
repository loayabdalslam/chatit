import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

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
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
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
    const userMessageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "user",
      timestamp: Date.now(),
    });

    // Generate AI response using Convex's built-in AI system
    const response = await generateAIResponse(ctx, args.conversationId, args.content);
    
    // Insert AI response
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: response,
      role: "assistant",
      timestamp: Date.now(),
    });

    // Trigger sentiment analysis for user message (async, non-blocking)
    await ctx.scheduler.runAfter(0, internal.sentiment.analyzeSentiment, {
      conversationId: args.conversationId,
      messageId: userMessageId,
      messageContent: args.content,
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
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    // Insert user message
    const userMessageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "user",
      timestamp: Date.now(),
    });

    // Generate AI response using Convex's built-in AI system
    const response = await generateAIResponse(ctx, args.conversationId, args.content);
    
    // Insert AI response
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: response,
      role: "assistant",
      timestamp: Date.now(),
    });

    // Trigger sentiment analysis for user message (async, non-blocking)
    await ctx.scheduler.runAfter(0, internal.sentiment.analyzeSentiment, {
      conversationId: args.conversationId,
      messageId: userMessageId,
      messageContent: args.content,
    });

    return response;
  },
});

// Helper function to generate AI responses using Convex's built-in AI system
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

    // Use Convex's advanced AI response generation system
    try {
      // Try the full Convex native AI response with document search and intelligent processing
      const aiResponse = await ctx.runAction(internal.ai.generateResponseWithConvexSearch, {
        userMessage,
        chatbotId: conversation.chatbotId,
        threadId: conversationId,
        userId: conversation.userId,
      });

      if (aiResponse && aiResponse.text && aiResponse.text.trim()) {
        console.log(`AI Response generated with confidence: ${aiResponse.confidence}, method: convex_native`);
        return aiResponse.text;
      }
    } catch (aiError) {
      console.log("Full AI response failed, trying fallback:", aiError);
    }

    // Fallback to instruction-based processing if full AI fails
    try {
      const fallbackResponse = await ctx.runQuery(internal.ai.processInstructionBasedResponse, {
        userMessage,
        instructions: chatbot.instructions || "Be helpful and friendly",
        botName: chatbot.name || "AI Assistant",
      });

      if (fallbackResponse && fallbackResponse.response && fallbackResponse.response.trim()) {
        console.log(`AI Fallback response generated with confidence: ${fallbackResponse.confidence}, method: ${fallbackResponse.method}`);
        return fallbackResponse.response;
      }
    } catch (fallbackError) {
      console.log("Instruction-based fallback failed:", fallbackError);
    }

    // Final fallback to ensure we always return something intelligent
    const botName = chatbot.name || "AI Assistant";
    const instructions = chatbot.instructions || "";
    
    // Create a contextual response based on the chatbot's purpose
    let contextualResponse = `Hello! I'm ${botName}. `;
    
    if (instructions.includes("customer service") || instructions.includes("support")) {
      contextualResponse += `I'm here to help you with any questions or issues you might have. You mentioned: "${userMessage}". Could you provide more details so I can assist you better?`;
    } else if (instructions.includes("sales") || instructions.includes("product")) {
      contextualResponse += `I'm here to help you learn about our products and services. Regarding "${userMessage}", I'd be happy to provide more information. What specific details would you like to know?`;
    } else if (instructions.includes("technical") || instructions.includes("support")) {
      contextualResponse += `I can help you with technical questions and troubleshooting. About "${userMessage}", let me help you find the right solution. Can you describe what you're trying to accomplish?`;
    } else {
      contextualResponse += `I understand you're asking about "${userMessage}". I'm designed to be helpful and provide useful information. Could you tell me more about what you're looking for?`;
    }
    
    return contextualResponse;
    
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";
  }
}
