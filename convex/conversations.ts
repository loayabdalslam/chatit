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

    // Generate AI response immediately using the chatbase-clone approach
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

    // Generate AI response immediately using the chatbase-clone approach
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

// Helper function to generate AI responses using chatbase-clone approach
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

    // Get recent messages for context (last 10 messages)
    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", conversationId))
      .order("desc")
      .take(10);

    // Enhanced rule-based responses with chatbot personalization
    const lowerMessage = userMessage.toLowerCase();
    const botName = chatbot.name || "AI Assistant";
    const instructions = chatbot.instructions || "";
    
    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      let greeting = `Hello! I'm ${botName}.`;
      if (instructions.includes("helpful")) {
        greeting += " I'm here to help you with any questions you might have.";
      } else if (instructions.includes("friendly")) {
        greeting += " Nice to meet you!";
      } else {
        greeting += " How can I assist you today?";
      }
      return greeting;
    }
    
    // Help responses
    if (lowerMessage.includes("help") || lowerMessage.includes("assist") || lowerMessage.includes("support")) {
      let helpResponse = "I'm here to help! ";
      if (instructions.includes("product")) {
        helpResponse += "I can answer questions about our products and services.";
      } else if (instructions.includes("technical")) {
        helpResponse += "I can help with technical questions and troubleshooting.";
      } else {
        helpResponse += "Feel free to ask me any questions.";
      }
      return helpResponse;
    }
    
    // Price/cost related questions
    if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("pricing") || lowerMessage.includes("payment")) {
      return "For detailed pricing information, please contact our sales team or check our pricing page. I'd be happy to help you understand our different options.";
    }
    
    // Features/capabilities questions
    if (lowerMessage.includes("feature") || lowerMessage.includes("capability") || lowerMessage.includes("what can") || lowerMessage.includes("what do")) {
      let featureResponse = `${botName} can help you with various tasks. `;
      if (instructions.includes("customer service")) {
        featureResponse += "I specialize in customer support and can help resolve issues.";
      } else if (instructions.includes("sales")) {
        featureResponse += "I can help you learn about our products and guide you through the purchasing process.";
      } else {
        featureResponse += "I'm designed to be helpful and provide information based on your needs.";
      }
      return featureResponse;
    }
    
    // Contact/human requests
    if (lowerMessage.includes("human") || lowerMessage.includes("person") || lowerMessage.includes("agent") || lowerMessage.includes("representative")) {
      return "I understand you'd like to speak with a human representative. While I'm an AI assistant, I'm here to help you right now. If you need further assistance, please let me know what specific help you need, or you can contact our support team directly.";
    }
    
    // Thank you responses
    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      return "You're very welcome! I'm glad I could help. Is there anything else you'd like to know?";
    }
    
    // Goodbye responses
    if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye") || lowerMessage.includes("see you")) {
      return "Goodbye! Thank you for chatting with me. Feel free to return anytime if you have more questions. Have a great day!";
    }

    // Question detection (contains question words or ends with ?)
    if (lowerMessage.includes("what") || lowerMessage.includes("how") || lowerMessage.includes("when") || 
        lowerMessage.includes("where") || lowerMessage.includes("why") || lowerMessage.includes("who") || 
        lowerMessage.endsWith("?")) {
      return `That's a great question! While I'd love to give you a detailed answer about "${userMessage}", I might need a bit more specific information to provide the most helpful response. Could you provide more details about what you're looking for?`;
    }

    // Default response with chatbot personality
    let defaultResponse = `Thank you for your message about "${userMessage}". `;
    
    if (instructions.includes("professional")) {
      defaultResponse += "I appreciate you reaching out. How may I assist you further with this matter?";
    } else if (instructions.includes("casual") || instructions.includes("friendly")) {
      defaultResponse += "I'd be happy to help you with this! What would you like to know more about?";
    } else {
      defaultResponse += `As ${botName}, I'm here to help. Could you tell me more about what you're looking for so I can assist you better?`;
    }
    
    return defaultResponse;
    
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";
  }
}
