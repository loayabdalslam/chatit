import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    
    return await ctx.db
      .query("chatbots")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("chatbots") },
  handler: async (ctx, args) => {
    const chatbot = await ctx.db.get(args.id);
    if (!chatbot) {
      return null;
    }
    
    // Check if user owns the chatbot
    const userId = await getAuthUserId(ctx);
    if (chatbot.userId !== userId) {
      return null;
    }
    
    return chatbot;
  },
});

// Internal function to get public chatbot info for widgets
export const getPublicInfo = internalQuery({
  args: { chatbotId: v.id("chatbots") },
  handler: async (ctx, args) => {
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot || !chatbot.isActive) {
      return null;
    }
    
    return {
      _id: chatbot._id,
      name: chatbot.name,
      description: chatbot.description,
      widgetConfig: chatbot.widgetConfig,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    instructions: v.string(),
    trainingData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a chatbot");
    }
    
    return await ctx.db.insert("chatbots", {
      userId,
      name: args.name,
      description: args.description || "",
      instructions: args.instructions,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("chatbots"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    trainingData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }
    
    const chatbot = await ctx.db.get(args.id);
    if (!chatbot || chatbot.userId !== userId) {
      throw new Error("Chatbot not found or access denied");
    }
    
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("chatbots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }
    
    const chatbot = await ctx.db.get(args.id);
    if (!chatbot || chatbot.userId !== userId) {
      throw new Error("Chatbot not found or access denied");
    }
    
    await ctx.db.delete(args.id);
  },
});

// Public query for widget use (no authentication required)
export const getPublic = internalQuery({
  args: { id: v.id("chatbots") },
  handler: async (ctx, args) => {
    const chatbot = await ctx.db.get(args.id);
    if (!chatbot || !chatbot.isActive) {
      return null;
    }
    
    return {
      id: chatbot._id,
      name: chatbot.name,
      description: chatbot.description,
      widgetConfig: chatbot.widgetConfig || {
        primaryColor: "#e74c3c",
        position: "bottom-right",
        size: "medium",
        welcomeMessage: "Hi! How can I help you today?",
        placeholder: "Type your message...",
        showBranding: true,
        borderRadius: 12,
        fontFamily: "system-ui",
        animation: "bounce",
        theme: "light",
      },
    };
  },
});
