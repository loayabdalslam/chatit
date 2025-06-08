import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Create demo chatbot for testing (internal use only)
 * This bypasses authentication to create test data
 */
export const createDemoChatbot = internalMutation({
  args: {
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.id("chatbots"),
  handler: async (ctx, args): Promise<Id<"chatbots">> => {
    const chatbotName = args.name || "Demo Support Bot";
    const chatbotDescription = args.description || "A helpful customer support chatbot powered by AI for demonstrations";
    
    // Create a demo user first if it doesn't exist
    let demoUserId: Id<"users"> | null = null;
    
    // Try to find existing demo user
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "demo@chatit.cloud"))
      .first();
    
    if (existingUser) {
      demoUserId = existingUser._id;
    } else {
      // Create demo user
      demoUserId = await ctx.db.insert("users", {
        name: "Demo User",
        email: "demo@chatit.cloud",
        emailVerificationTime: Date.now(),
        isAnonymous: false,
      });
    }
    
    // Check if demo chatbot with this name already exists
    const existingChatbot = await ctx.db
      .query("chatbots")
      .filter((q) => q.eq(q.field("name"), chatbotName))
      .first();
    
    if (existingChatbot) {
      return existingChatbot._id;
    }
    
    // Create demo chatbot
    const chatbotId = await ctx.db.insert("chatbots", {
      userId: demoUserId,
      name: chatbotName,
      description: chatbotDescription,
      instructions: `You are a friendly and helpful customer support assistant for ChatIt.cloud, an AI chatbot platform. Your role is to:

1. Greet users warmly and professionally
2. Answer questions about our chatbot platform and services
3. Help with integration, setup, and technical questions
4. Provide information about pricing and features
5. Assist with widget customization and embedding
6. If you don't know something specific, offer to connect them with our team

About ChatIt.cloud:
- We provide AI-powered chatbots that can be embedded on any website
- Our platform supports intelligent responses for customer support
- We offer customizable widgets with CORS support for universal embedding
- Features include real-time chat, analytics, sentiment analysis, and more
- Easy integration with just a few lines of HTML code

Maintain a friendly, professional tone and be concise in your responses. Always try to be helpful and demonstrate the capabilities of our platform.

Key information:
- Free trial available with demo chatbots
- 24/7 platform availability
- Full customization options for widget appearance
- Real-time analytics and conversation insights
- Technical support available for integration help`,
      isActive: true,
      widgetConfig: {
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
    });
    
    return chatbotId;
  },
});

/**
 * Get demo chatbot ID (internal use only)
 */
export const getDemoChatbotId = internalMutation({
  args: {},
  returns: v.union(v.id("chatbots"), v.null()),
  handler: async (ctx) => {
    const demoChatbot = await ctx.db
      .query("chatbots")
      .filter((q) => q.eq(q.field("name"), "Demo Support Bot"))
      .first();
    
    return demoChatbot?._id || null;
  },
}); 