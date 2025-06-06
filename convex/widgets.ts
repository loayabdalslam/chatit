import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveConfig = mutation({
  args: {
    chatbotId: v.id("chatbots"),
    config: v.object({
      primaryColor: v.string(),
      position: v.string(),
      size: v.string(),
      welcomeMessage: v.string(),
      placeholder: v.string(),
      showBranding: v.boolean(),
      borderRadius: v.number(),
      fontFamily: v.string(),
      animation: v.string(),
      theme: v.string(),
    }),
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

    // Update the chatbot with widget configuration
    await ctx.db.patch(args.chatbotId, {
      widgetConfig: args.config,
    });

    return { success: true };
  },
});

export const getConfig = query({
  args: { chatbotId: v.id("chatbots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return null;
    }

    return chatbot.widgetConfig || null;
  },
});
