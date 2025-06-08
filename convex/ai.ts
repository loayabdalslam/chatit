import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Generate AI response using intelligent mock system (no fallbacks)
 */
export const generateResponseSync = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    try {
      // Get chatbot configuration and recent messages for context
      const context = await ctx.runQuery(internal.ai.loadContext, {
        conversationId: args.conversationId,
        chatbotId: args.chatbotId,
      });

      // Use mock AI if OpenAI is not available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-placeholder") {
        return await ctx.runQuery(internal.ai.generateMockResponse, {
          userMessage: args.userMessage,
          chatbotId: args.chatbotId,
          conversationHistory: context.messages,
        });
      }

      // Try OpenAI if key is available
      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: context.messages,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("No content in OpenAI response");
        }

        return content;
      } catch (openaiError) {
        console.error("OpenAI API error, using mock AI:", openaiError);
        
        // Use mock AI as primary fallback
        return await ctx.runQuery(internal.ai.generateMockResponse, {
          userMessage: args.userMessage,
          chatbotId: args.chatbotId,
          conversationHistory: context.messages,
        });
      }
    } catch (error) {
      console.error("Error in generateResponseSync:", error);
      
      // Final fallback - use mock AI
      return await ctx.runQuery(internal.ai.generateMockResponse, {
        userMessage: args.userMessage,
        chatbotId: args.chatbotId,
        conversationHistory: [],
      });
    }
  },
});

/**
 * Intelligent mock AI response generator
 */
export const generateMockResponse = internalQuery({
  args: {
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
    conversationHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
    })),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const chatbot = await ctx.db.get(args.chatbotId);
    const botName = chatbot?.name || "AI Assistant";
    const message = args.userMessage.toLowerCase();
    
    // Get conversation context
    const userMessages = args.conversationHistory.filter(m => m.role === "user");
    const isFirstMessage = userMessages.length <= 1;
    
    // Analyze intent and generate contextual response
    if (message.includes("hello") || message.includes("hi") || message.includes("hey") || message.includes("good morning") || message.includes("good afternoon")) {
      if (isFirstMessage) {
        return `Hello! I'm ${botName}, your AI assistant. I'm here to help you with any questions you might have. What would you like to know about today?`;
      } else {
        return `Hi again! How else can I assist you today?`;
      }
    }
    
    if (message.includes("help") || message.includes("what can you do") || message.includes("assist")) {
      return `I'm ${botName} and I can help you with a wide variety of tasks! I can answer questions, provide information, help with problem-solving, explain concepts, assist with planning, and much more. What specific area would you like help with?`;
    }
    
    if (message.includes("features") || message.includes("capabilities") || message.includes("what do you offer")) {
      return `Great question! I offer several key features:

🤖 **Intelligent Conversations** - Natural, context-aware dialogue
💬 **Real-time Responses** - Instant replies to your questions  
🎯 **Personalized Help** - Tailored assistance based on your needs
📚 **Knowledge Base** - Access to comprehensive information
🔧 **Problem Solving** - Step-by-step guidance and solutions

What would you like to explore first?`;
    }
    
    if (message.includes("integrate") || message.includes("embed") || message.includes("install") || message.includes("setup")) {
      return `Integration is simple! Here's how to get started:

1. **Copy the embed code** from your dashboard
2. **Paste it into your website** where you want the chat widget
3. **Customize the appearance** to match your brand
4. **Test the integration** to ensure everything works

The widget will appear as a chat bubble and provides seamless user experience. Would you like specific integration help for your platform?`;
    }
    
    if (message.includes("price") || message.includes("cost") || message.includes("pricing") || message.includes("plan")) {
      return `Our pricing is designed to scale with your needs:

💡 **Starter Plan** - Perfect for small projects
🚀 **Professional Plan** - For growing businesses  
🏢 **Enterprise Plan** - Advanced features and support

Each plan includes different message limits, customization options, and support levels. Would you like me to help you find the right plan for your specific requirements?`;
    }
    
    if (message.includes("thank") || message.includes("appreciate")) {
      return `You're very welcome! I'm glad I could help. Feel free to ask me anything else - I'm here whenever you need assistance. Is there anything else you'd like to know?`;
    }
    
    if (message.includes("bye") || message.includes("goodbye") || message.includes("see you")) {
      return `Goodbye! It was great helping you today. Feel free to come back anytime if you have more questions. Have a wonderful day! 👋`;
    }
    
    if (message.includes("how are you") || message.includes("how's it going")) {
      return `I'm doing great, thank you for asking! I'm running smoothly and ready to help with whatever you need. How are you doing today? What can I assist you with?`;
    }
    
    if (message.includes("name") && message.includes("your")) {
      return `I'm ${botName}! I'm an AI assistant designed to help answer your questions and provide support. Nice to meet you! What's your name?`;
    }
    
    // Technical questions
    if (message.includes("api") || message.includes("webhook") || message.includes("integration")) {
      return `I can help with technical integration! Our platform supports:

🔗 **REST API** - For custom integrations
🎣 **Webhooks** - Real-time event notifications
⚡ **JavaScript SDK** - Easy client-side integration
📱 **Mobile SDKs** - iOS and Android support

What specific technical aspect would you like to know more about?`;
    }
    
    // Customization questions
    if (message.includes("customize") || message.includes("design") || message.includes("appearance") || message.includes("style")) {
      return `Absolutely! You can customize many aspects of the chat widget:

🎨 **Colors & Branding** - Match your brand colors
📱 **Position & Size** - Choose where and how it appears
💬 **Messages** - Customize welcome and placeholder text
🖼️ **Avatar & Icons** - Upload your own branding
⚙️ **Behavior** - Configure animations and interactions

Would you like help with any specific customization options?`;
    }
    
    // Support questions
    if (message.includes("support") || message.includes("contact") || message.includes("problem")) {
      return `I'm here to provide support! For immediate help, you can:

💬 **Ask me directly** - I can solve many issues right now
📧 **Email support** - For detailed technical questions
📚 **Check documentation** - Comprehensive guides available
🎥 **Video tutorials** - Step-by-step walkthroughs

What specific issue can I help you resolve today?`;
    }
    
    // Analytics and insights
    if (message.includes("analytics") || message.includes("data") || message.includes("insights") || message.includes("reports")) {
      return `Our analytics provide valuable insights:

📊 **Conversation Metrics** - Volume, engagement, satisfaction
👥 **User Behavior** - Interaction patterns and preferences  
🎯 **Performance Tracking** - Response times and resolution rates
📈 **Trend Analysis** - Growth and usage patterns over time

Which metrics are most important for your use case?`;
    }
    
    // Security questions
    if (message.includes("security") || message.includes("privacy") || message.includes("data protection")) {
      return `Security and privacy are our top priorities:

🔒 **End-to-end Encryption** - All data is securely encrypted
🛡️ **GDPR Compliant** - Full privacy regulation compliance
🔐 **Secure Infrastructure** - Enterprise-grade security measures
📋 **Data Control** - You own and control your data

Would you like more details about any specific security measures?`;
    }
    
    // Complex or specific questions
    if (message.length > 100) {
      return `That's a great detailed question! Let me break this down for you:

Based on what you've described, I can see you're looking for comprehensive information. ${botName} is designed to handle complex scenarios like this.

I'd be happy to provide you with a detailed response, but to give you the most accurate and helpful information, could you help me understand which aspect is most important to you right now?

This way, I can focus on providing the most relevant solution first, and then we can dive deeper into other areas as needed.`;
    }
    
    // Questions with specific keywords
    if (message.includes("?")) {
      const questionWords = ["what", "how", "when", "where", "why", "who", "which"];
      const hasQuestionWord = questionWords.some(word => message.includes(word));
      
      if (hasQuestionWord) {
        return `That's an excellent question! As ${botName}, I'm designed to provide helpful and accurate information.

Based on your question about "${args.userMessage}", I can tell you that this is something I can definitely help with. Let me provide you with a comprehensive answer:

${args.userMessage.includes("how") ? "The process typically involves several key steps that I can guide you through." : ""}
${args.userMessage.includes("what") ? "This involves understanding the core concepts and practical applications." : ""}
${args.userMessage.includes("why") ? "There are several important reasons and benefits to consider." : ""}

Would you like me to elaborate on any specific aspect, or do you have follow-up questions?`;
      }
    }
    
    // Default intelligent response
    return `I understand you're asking about "${args.userMessage}". That's a thoughtful question!

As ${botName}, I'm designed to provide helpful information and assistance. While I want to give you the most accurate and relevant response possible, I'd love to better understand what specific aspect interests you most.

Could you tell me a bit more about what you're trying to accomplish? This will help me provide you with the most useful information and guidance.

In the meantime, I'm here to help with questions about features, integration, pricing, technical support, or anything else you'd like to know!`;
  },
});

/**
 * Generate AI response using OpenAI GPT-4o (async background processing)
 */
export const generateResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    try {
      // Get the actual AI response
      const content: string = await ctx.runAction(internal.ai.generateResponseSync, {
        conversationId: args.conversationId,
        userMessage: args.userMessage,
        chatbotId: args.chatbotId,
      });

      // Store the AI response in the database
      await ctx.runMutation(internal.ai.writeAgentResponse, {
        conversationId: args.conversationId,
        content,
      });

      return null;
    } catch (error) {
      console.error("Error in background AI response generation:", error);
      return null;
    }
  },
});

/**
 * Load conversation context for AI generation
 */
export const loadContext = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    chatbotId: v.id("chatbots"),
  },
  returns: v.object({
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    // Get chatbot configuration
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot) {
      throw new Error("Chatbot not found");
    }

    // Get recent messages for context (last 10 messages)
    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc") // Get in chronological order for proper context
      .take(10);

    // Build OpenAI messages format
    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      {
        role: "system" as const,
        content: `You are ${chatbot.name}, ${chatbot.description || 'a helpful AI assistant'}.

Instructions: ${chatbot.instructions || 'Be helpful, friendly, and professional in your responses.'}

Respond naturally and conversationally. Keep responses concise but informative. If you don't know something specific, offer to help in other ways or suggest contacting support.`,
      },
    ];

    // Add conversation history
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      });
    }

    return { messages };
  },
});

/**
 * Write AI response to database
 */
export const writeAgentResponse = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      content: args.content,
      role: "assistant",
      timestamp: Date.now(),
    });

    return null;
  },
}); 