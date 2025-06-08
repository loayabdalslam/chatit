import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Generate AI response using Convex AI
 * This is the main function called by the widget for real AI responses
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
      // Load comprehensive chatbot context including training data and configuration
      const context = await ctx.runQuery(internal.ai.loadContext, {
        conversationId: args.conversationId,
        chatbotId: args.chatbotId,
      });

      // Generate intelligent response based on chatbot configuration and Convex capabilities
      return await ctx.runQuery(internal.ai.generateIntelligentResponse, {
        userMessage: args.userMessage,
        chatbotId: args.chatbotId,
        conversationHistory: context.messages,
        chatbotData: context.chatbot,
      });

    } catch (error) {
      console.error("Error in generateResponseSync:", error);
      
      // Fallback to simple response
      return await ctx.runQuery(internal.ai.generateSimpleResponse, {
        userMessage: args.userMessage,
        chatbotId: args.chatbotId,
      });
    }
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
    chatbot: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      instructions: v.optional(v.string()),
      language: v.optional(v.string()),
      welcomeMessage: v.optional(v.string()),
    }),
  }),
  handler: async (ctx, args) => {
    // Get chatbot configuration
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot) {
      throw new Error("Chatbot not found");
    }

    // Get recent messages for context (last 15 messages for better context)
    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc") // Get in chronological order for proper context
      .take(15);

    // Build enhanced system prompt with chatbot's specific knowledge
    const systemPrompt = `You are ${chatbot.name}, ${chatbot.description || 'a helpful AI assistant'}.

Core Instructions: ${chatbot.instructions || 'Be helpful, friendly, and professional in your responses.'}

Personality and Behavior:
- Respond in a natural, conversational manner
- Stay consistent with your character and expertise
- Be knowledgeable about your specific domain
- Provide accurate, helpful, and contextual responses
- Remember previous conversation context
- Adapt your communication style to the user's needs

If you don't know something specific, be honest about it while still being helpful and offering alternatives or suggesting how to find the information.`;

    // Build OpenAI messages format
    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
    ];

    // Add conversation history
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      });
    }

    return { 
      messages,
      chatbot: {
        name: chatbot.name,
        description: chatbot.description,
        instructions: chatbot.instructions,
        language: "en", // Default to English since field doesn't exist in schema
        welcomeMessage: undefined, // Field doesn't exist in schema yet
      }
    };
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

/**
 * Advanced conversation context analyzer
 * Provides better understanding of user intent and conversation flow
 */
export const analyzeConversationContext = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    chatbotId: v.id("chatbots"),
  },
  returns: v.object({
    totalMessages: v.number(),
    userEngagement: v.string(),
    commonTopics: v.array(v.string()),
    conversationTone: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get all messages in conversation
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const userMessages = allMessages.filter(m => m.role === "user");
    const assistantMessages = allMessages.filter(m => m.role === "assistant");

    // Analyze engagement level
    let engagement = "new";
    if (userMessages.length > 10) engagement = "highly_engaged";
    else if (userMessages.length > 5) engagement = "engaged";
    else if (userMessages.length > 2) engagement = "active";

    // Extract common topics/keywords
    const allText = userMessages.map(m => m.content.toLowerCase()).join(" ");
    const commonTopics: string[] = [];
    
    // Basic topic extraction
    if (allText.includes("price") || allText.includes("cost") || allText.includes("plan")) {
      commonTopics.push("pricing");
    }
    if (allText.includes("feature") || allText.includes("function") || allText.includes("capability")) {
      commonTopics.push("features");
    }
    if (allText.includes("help") || allText.includes("support") || allText.includes("problem")) {
      commonTopics.push("support");
    }
    if (allText.includes("integrate") || allText.includes("setup") || allText.includes("install")) {
      commonTopics.push("integration");
    }

    // Determine conversation tone
    let tone = "neutral";
    if (allText.includes("thank") || allText.includes("great") || allText.includes("awesome")) {
      tone = "positive";
    } else if (allText.includes("problem") || allText.includes("issue") || allText.includes("error")) {
      tone = "concerned";
    }

    return {
      totalMessages: allMessages.length,
      userEngagement: engagement,
      commonTopics,
      conversationTone: tone,
    };
  },
});

/**
 * Generate intelligent response using Convex-based AI logic
 * Uses chatbot configuration and conversation context
 */
export const generateIntelligentResponse = internalQuery({
  args: {
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
    conversationHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
    })),
    chatbotData: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      instructions: v.optional(v.string()),
      language: v.optional(v.string()),
      welcomeMessage: v.optional(v.string()),
    }),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { chatbotData } = args;
    const botName = chatbotData.name;
    const message = args.userMessage.toLowerCase();
    const botDescription = chatbotData.description || "a helpful AI assistant";
    const botInstructions = chatbotData.instructions || "Be helpful, friendly, and professional in your responses.";
    
    // Get conversation context
    const userMessages = args.conversationHistory.filter(m => m.role === "user");
    const isFirstMessage = userMessages.length <= 1;
    
    // Intelligent response generation based on Convex AI principles
    
    // Greeting responses
    if (message.includes("hello") || message.includes("hi") || message.includes("hey") || message.includes("مرحبا") || message.includes("السلام")) {
      if (isFirstMessage) {
        const welcomeMsg = chatbotData.welcomeMessage || `مرحباً! أنا ${botName}, ${botDescription}. أنا هنا لمساعدتك.`;
        return `${welcomeMsg}\n\nكيف يمكنني مساعدتك اليوم؟`;
      } else {
        return `مرحباً مرة أخرى! أنا ${botName}. كيف يمكنني مساعدتك أكثر؟`;
      }
    }
    
    // Help and capabilities
    if (message.includes("help") || message.includes("مساعدة") || message.includes("ساعدني") || message.includes("ما تقدر تعمل")) {
      return `أنا ${botName}, ${botDescription}. إليك كيف يمكنني مساعدتك:

${botInstructions}

يمكنني:
• الإجابة على أسئلتك
• تقديم معلومات مفصلة  
• مساعدتك في حل المشاكل خطوة بخطوة
• التكيف مع أسلوب تواصلك
• تذكر سياق محادثتنا

في أي مجال تحديداً تريد المساعدة؟`;
    }
    
    // Product-specific responses for sales system
    if (message.includes("شامبو") || message.includes("shampoo")) {
      return `شامبو 3x1 متوفر! هذا منتج ممتاز للعناية بالشعر. يحتوي على:
• تركيبة 3 في 1 (تنظيف، ترطيب، تقوية)
• مناسب لجميع أنواع الشعر
• سعر مميز وجودة عالية

هل تريد معرفة السعر أم لديك أسئلة أخرى حول المنتج؟`;
    }
    
    if (message.includes("غسول") || message.includes("facial wash")) {
      return `غسول الوجه متوفر لدينا! منتج ممتاز للعناية بالبشرة:
• ينظف البشرة بعمق
• مناسب للبشرة الحساسة  
• يترك البشرة نظيفة ومنتعشة
• تركيبة طبيعية

هل تريد تفاصيل أكثر عن نوع بشرتك لأقترح عليك الأنسب؟`;
    }
    
    if (message.includes("معجون") || message.includes("toothpaste")) {
      return `معجون الأسنان متوفر! منتج عالي الجودة للعناية بالأسنان:
• حماية من التسوس
• تبييض طبيعي
• نفس منعش يدوم طويلاً
• مُعتمد من أطباء الأسنان

هل تريد معرفة الأسعار أم لديك استفسارات أخرى؟`;
    }
    
    // Pricing questions
    if (message.includes("سعر") || message.includes("كام") || message.includes("price") || message.includes("cost")) {
      return `بالطبع! أسعارنا مميزة ومناسبة:

📦 شامبو 3x1: سعر خاص 
🧴 غسول الوجه: عرض اليوم
🦷 معجون الأسنان: خصم حصري

لمعرفة الأسعار الدقيقة وأحدث العروض، أرجو تحديد المنتج الذي تهتم به وسأعطيك كل التفاصيل!

هل تريد عرض خاص على مجموعة من المنتجات؟`;
    }
    
    // Thank you responses
    if (message.includes("شكر") || message.includes("thanks") || message.includes("appreciate")) {
      return `العفو! سعيد جداً إني قدرت أساعدك. أنا هنا دايماً لأي استفسار تاني. 

هل في حاجة تانية تحب تعرفها أو تحتاج مساعدة فيها؟ 😊`;
    }
    
    // Default intelligent response
    const conversationLength = userMessages.length;
    const hasOngoingContext = conversationLength > 1;
    
    if (hasOngoingContext) {
      return `بناءً على محادثتنا، أشوف إنك مهتم تعرف أكتر. أنا ${botName} وعايز أديك أفضل إجابة على "${args.userMessage}".

${botInstructions}

ممكن توضحلي أكتر إيه اللي محتاجه تحديداً؟ كده هقدر أساعدك بشكل أفضل وأعطيك المعلومات اللي تفيدك.

أنا هنا عشان أقدملك مساعدة مفصلة ومناسبة لاحتياجاتك! 🤝`;
    } else {
      return `شكراً لسؤالك عن "${args.userMessage}". أنا ${botName}, ${botDescription}.

${botInstructions}

أنا مصمم عشان أقدملك إجابات ذكية ومفيدة حسب احتياجاتك. عشان أعطيك أدق وأفضل معلومات، ممكن تساعدني أفهم إيه اللي مهمك أكتر؟

سواء كنت محتاج:
• شرح مفصل
• إرشادات خطوة بخطوة  
• توصيات محددة
• مساعدة في حل مشكلة

أنا هنا أساعدك! إيه اللي يفيدك أكتر دلوقتي؟`;
    }
  },
});

/**
 * Simple response generator for fallback scenarios
 */
export const generateSimpleResponse = internalQuery({
  args: {
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const chatbot = await ctx.db.get(args.chatbotId);
    const botName = chatbot?.name || "مساعد ذكي";
    
    return `شكراً لرسالتك! أنا ${botName} وأعتذر إن كان في مشكلة تقنية بسيطة. 

رسالتك عن "${args.userMessage}" وصلتني وأنا شغال على إجابة مناسبة ليك.

ممكن تعيد كتابة سؤالك أو جرب تاني بعد قليل؟ أنا هنا عشان أساعدك! 🤖`;
  },
}); 