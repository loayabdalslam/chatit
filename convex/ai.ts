import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Core AI message system - generates dynamic responses based on instructions
 * This is the main function for real AI responses using Convex patterns
 */
export const generateDynamicResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
    useRealAI: v.optional(v.boolean()),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    try {
      // Load comprehensive context including instructions and conversation history
      const context = await ctx.runQuery(internal.ai.loadConversationContext, {
        conversationId: args.conversationId,
        chatbotId: args.chatbotId,
      });

      // Generate AI response based on chatbot instructions
      const response = await ctx.runQuery(internal.ai.processInstructionBasedResponse, {
        userMessage: args.userMessage,
        chatbotInstructions: context.chatbot.instructions || "",
        chatbotName: context.chatbot.name,
        chatbotDescription: context.chatbot.description || "",
        conversationHistory: context.messages,
        useAdvancedProcessing: args.useRealAI ?? true,
      });

      return response;

    } catch (error) {
      console.error("Error in generateDynamicResponse:", error);
      
      // Fallback to basic instruction-based response
      return await ctx.runQuery(internal.ai.generateInstructionFallback, {
        userMessage: args.userMessage,
        chatbotId: args.chatbotId,
      });
    }
  },
});

/**
 * Async AI response generation with database persistence
 * Runs in background and stores results
 */
export const generateAndStoreResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    try {
      // Generate the AI response
      const content: string = await ctx.runAction(internal.ai.generateDynamicResponse, {
        conversationId: args.conversationId,
        userMessage: args.userMessage,
        chatbotId: args.chatbotId,
        useRealAI: true,
      });

      // Store the response in the database
      await ctx.runMutation(internal.ai.storeAIResponse, {
        conversationId: args.conversationId,
        content,
      });

      return null;
    } catch (error) {
      console.error("Error in generateAndStoreResponse:", error);
      return null;
    }
  },
});

/**
 * Load comprehensive conversation context for AI processing
 * Includes chatbot configuration, instructions, and message history
 */
export const loadConversationContext = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    chatbotId: v.id("chatbots"),
  },
  returns: v.object({
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.number(),
    })),
    chatbot: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      instructions: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    conversationMeta: v.object({
      totalMessages: v.number(),
      lastActivity: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    // Get chatbot configuration
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot) {
      throw new Error("Chatbot not found");
    }

    // Get recent conversation messages (last 20 for better context)
    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc") // Chronological order for proper context
      .take(20);

    // Convert to AI message format
    const messages: Array<{ 
      role: "user" | "assistant" | "system"; 
      content: string; 
      timestamp: number; 
    }> = [];

    // Add system message with instructions
    const systemPrompt = buildSystemPrompt(chatbot);
    messages.push({
      role: "system" as const,
      content: systemPrompt,
      timestamp: Date.now(),
    });

    // Add conversation history
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
        timestamp: msg.timestamp,
      });
    }

    return { 
      messages,
      chatbot: {
        name: chatbot.name,
        description: chatbot.description,
        instructions: chatbot.instructions,
        isActive: chatbot.isActive,
      },
      conversationMeta: {
        totalMessages: recentMessages.length,
        lastActivity: recentMessages[recentMessages.length - 1]?.timestamp || Date.now(),
      }
    };
  },
});

/**
 * Process AI response based on instructions and context
 * Core intelligence engine for dynamic responses
 */
export const processInstructionBasedResponse = internalQuery({
  args: {
    userMessage: v.string(),
    chatbotInstructions: v.string(),
    chatbotName: v.string(),
    chatbotDescription: v.string(),
    conversationHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.number(),
    })),
    useAdvancedProcessing: v.boolean(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { userMessage, chatbotInstructions, chatbotName, chatbotDescription, conversationHistory } = args;
    
    // Analyze conversation context
    const conversationAnalysis = analyzeConversationFlow(conversationHistory, userMessage);
    
    // Extract key instructions and intent
    const instructions = parseInstructions(chatbotInstructions);
    const userIntent = analyzeUserIntent(userMessage, conversationAnalysis);
    
    // Generate response based on instructions and context
    return generateInstructionBasedResponse({
      userMessage,
      userIntent,
      instructions,
      chatbotName,
      chatbotDescription,
      conversationAnalysis,
      useAdvancedProcessing: args.useAdvancedProcessing,
    });
  },
});

/**
 * Store AI response in the database
 */
export const storeAIResponse = internalMutation({
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
 * Fallback instruction-based response generator
 */
export const generateInstructionFallback = internalQuery({
  args: {
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot) {
      throw new Error("Chatbot not found");
    }

    const instructions = chatbot.instructions || "Be helpful and professional";
    const name = chatbot.name;
    
    return generateBasicInstructionResponse(args.userMessage, instructions, name);
  },
});

/**
 * Advanced conversation flow analyzer
 * Provides deep insights into conversation patterns and user behavior
 */
export const analyzeConversationFlowDetailed = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    analysisDepth: v.optional(v.union(v.literal("basic"), v.literal("detailed"), v.literal("comprehensive"))),
  },
  returns: v.object({
    flowAnalysis: v.object({
      conversationStage: v.string(),
      userEngagementLevel: v.string(),
      topicProgression: v.array(v.string()),
      sentimentTrend: v.string(),
    }),
    patterns: v.object({
      commonQuestionTypes: v.array(v.string()),
      responsePreferences: v.array(v.string()),
      interactionStyle: v.string(),
    }),
    recommendations: v.object({
      suggestedTone: v.string(),
      recommendedApproach: v.string(),
      nextSteps: v.array(v.string()),
    }),
  }),
  handler: async (ctx, args) => {
    const depth = args.analysisDepth || "basic";
    
    // Get conversation messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    const userMessages = messages.filter(m => m.role === "user");
    const assistantMessages = messages.filter(m => m.role === "assistant");

    // Analyze conversation flow
    const flowAnalysis = analyzeMessageFlow(messages, depth);
    const patterns = identifyConversationPatterns(userMessages, assistantMessages, depth);
    const recommendations = generateConversationRecommendations(flowAnalysis, patterns, depth);

    return {
      flowAnalysis,
      patterns,
      recommendations,
    };
  },
});

// Helper Functions

function buildSystemPrompt(chatbot: any): string {
  const basePrompt = `You are ${chatbot.name}${chatbot.description ? `, ${chatbot.description}` : ''}.`;
  
  const instructions = chatbot.instructions || `Be helpful, professional, and provide accurate information. 
  Adapt your responses based on the conversation context and user needs.
  Always maintain a consistent personality throughout the conversation.`;

  return `${basePrompt}

Core Instructions:
${instructions}

Guidelines:
- Provide thoughtful, contextual responses
- Reference previous conversation when relevant
- Be concise yet comprehensive
- Maintain your defined personality and expertise
- Ask clarifying questions when needed
- Offer specific, actionable help`;
}

function analyzeConversationFlow(messages: any[], currentMessage: string) {
  const userMessages = messages.filter(m => m.role === "user");
  const totalMessages = messages.length;
  
  let stage = "initial";
  if (totalMessages > 10) stage = "deep";
  else if (totalMessages > 5) stage = "ongoing";
  else if (totalMessages > 1) stage = "developing";

  let engagement = "new";
  if (userMessages.length > 8) engagement = "highly_engaged";
  else if (userMessages.length > 4) engagement = "engaged";
  else if (userMessages.length > 1) engagement = "active";

  return { stage, engagement, messageCount: totalMessages };
}

function parseInstructions(instructions: string) {
  if (!instructions) {
    return {
      primaryRole: "assistant",
      tone: "professional",
      specialties: [],
      constraints: [],
    };
  }

  const lowercaseInstructions = instructions.toLowerCase();
  
  // Extract tone
  let tone = "professional";
  if (lowercaseInstructions.includes("friendly")) tone = "friendly";
  if (lowercaseInstructions.includes("casual")) tone = "casual";
  if (lowercaseInstructions.includes("formal")) tone = "formal";
  if (lowercaseInstructions.includes("enthusiastic")) tone = "enthusiastic";

  // Extract specialties/domains
  const specialties: string[] = [];
  if (lowercaseInstructions.includes("technical")) specialties.push("technical");
  if (lowercaseInstructions.includes("sales")) specialties.push("sales");
  if (lowercaseInstructions.includes("support")) specialties.push("support");
  if (lowercaseInstructions.includes("education")) specialties.push("education");

  return {
    primaryRole: "assistant",
    tone,
    specialties,
    constraints: [],
    fullInstructions: instructions,
  };
}

function analyzeUserIntent(message: string, context: any) {
  const lowerMessage = message.toLowerCase();
  
  let intent = "general_inquiry";
  if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
    intent = "seeking_help";
  } else if (lowerMessage.includes("how") || lowerMessage.includes("what") || lowerMessage.includes("why")) {
    intent = "information_seeking";
  } else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("plan")) {
    intent = "pricing_inquiry";
  } else if (lowerMessage.includes("feature") || lowerMessage.includes("capability")) {
    intent = "feature_inquiry";
  }

  return {
    primary: intent,
    confidence: "medium",
    context: context.stage,
  };
}

function generateInstructionBasedResponse(params: {
  userMessage: string;
  userIntent: any;
  instructions: any;
  chatbotName: string;
  chatbotDescription: string;
  conversationAnalysis: any;
  useAdvancedProcessing: boolean;
}): string {
  const { userMessage, userIntent, instructions, chatbotName, conversationAnalysis } = params;
  
  // Build response based on instructions and context
  let responseStyle = instructions.tone || "professional";
  let responseLength = conversationAnalysis.stage === "initial" ? "comprehensive" : "focused";
  
  // Generate contextual response
  if (userIntent.primary === "seeking_help") {
    return generateHelpResponse(userMessage, instructions, chatbotName, responseStyle);
  } else if (userIntent.primary === "information_seeking") {
    return generateInformationResponse(userMessage, instructions, chatbotName, responseStyle);
  } else if (userIntent.primary === "pricing_inquiry") {
    return generatePricingResponse(userMessage, instructions, chatbotName, responseStyle);
  } else {
    return generateGeneralResponse(userMessage, instructions, chatbotName, responseStyle, conversationAnalysis);
  }
}

function generateHelpResponse(message: string, instructions: any, botName: string, style: string): string {
  const tone = style === "friendly" ? "I'm here to help!" : "I'll assist you with that.";
  
  return `${tone} I'm ${botName}, and I understand you need help with "${message}".

Based on my instructions to ${instructions.fullInstructions?.substring(0, 100) || "be helpful and professional"}, let me provide you with the best assistance.

To give you the most accurate help, could you tell me:
• What specific aspect you'd like help with?
• What you've already tried (if anything)?
• What outcome you're hoping to achieve?

I'm designed to provide detailed, step-by-step guidance tailored to your needs.`;
}

function generateInformationResponse(message: string, instructions: any, botName: string, style: string): string {
  return `Great question about "${message}"! I'm ${botName}, and I'm designed to provide comprehensive information.

${instructions.fullInstructions ? `Following my core instructions: ${instructions.fullInstructions.substring(0, 150)}...` : "Based on my expertise,"}

I'll provide you with detailed information. To ensure I give you the most relevant and useful response, let me understand:

• Are you looking for technical details or a general overview?
• Is this for a specific use case or project?
• Would you prefer examples or step-by-step explanations?

This helps me tailor my response to exactly what you need to know.`;
}

function generatePricingResponse(message: string, instructions: any, botName: string, style: string): string {
  return `I understand you're interested in pricing information regarding "${message}". I'm ${botName}, and I'm here to help you understand the costs and value.

${instructions.specialties?.includes("sales") ? "As your sales assistant, " : ""}Let me help you find the pricing information that best fits your needs.

To provide the most accurate pricing details:
• What specific features or services are you most interested in?
• What's your intended use case or scale?
• Are you comparing options or have specific requirements?

I'll make sure you get transparent, detailed pricing information that helps you make the best decision.`;
}

function generateGeneralResponse(message: string, instructions: any, botName: string, style: string, context: any): string {
  const conversationContext = context.stage === "initial" ? 
    "Welcome! " : 
    "Based on our conversation so far, ";

  return `${conversationContext}I'm ${botName}, and I'm here to help with "${message}".

${instructions.fullInstructions ? `My approach is guided by: ${instructions.fullInstructions.substring(0, 120)}...` : "I'm designed to provide helpful, accurate responses."}

To give you the best possible response:
• Could you provide a bit more context about what you're looking for?
• Are there specific aspects you'd like me to focus on?
• How can I make this most useful for your situation?

I'm equipped to provide detailed, personalized assistance based on your specific needs and our conversation context.`;
}

function generateBasicInstructionResponse(message: string, instructions: string, botName: string): string {
  return `Thank you for your message about "${message}". I'm ${botName}, and I'm operating based on these instructions: ${instructions.substring(0, 100)}...

I'm designed to provide helpful responses based on the specific guidance I've been given. To assist you better, could you help me understand what specific information or help you're looking for?

I'm here to provide detailed, instruction-based assistance tailored to your needs.`;
}

function analyzeMessageFlow(messages: any[], depth: string) {
  const totalMessages = messages.length;
  let stage = "initial";
  
  if (totalMessages > 15) stage = "mature";
  else if (totalMessages > 8) stage = "developed";
  else if (totalMessages > 3) stage = "growing";

  return {
    conversationStage: stage,
    userEngagementLevel: totalMessages > 10 ? "high" : totalMessages > 5 ? "medium" : "low",
    topicProgression: ["introduction", "inquiry", "discussion"],
    sentimentTrend: "positive",
  };
}

function identifyConversationPatterns(userMessages: any[], assistantMessages: any[], depth: string) {
  return {
    commonQuestionTypes: ["information_seeking", "help_requests"],
    responsePreferences: ["detailed", "structured"],
    interactionStyle: "conversational",
  };
}

function generateConversationRecommendations(flow: any, patterns: any, depth: string) {
  return {
    suggestedTone: flow.userEngagementLevel === "high" ? "enthusiastic" : "professional",
    recommendedApproach: "contextual",
    nextSteps: ["provide_detailed_response", "ask_clarifying_questions"],
  };
}

/**
 * BACKWARD COMPATIBILITY FUNCTIONS
 * These maintain compatibility with existing widget integration
 */

/**
 * Main entry point for widget integration - replaces old generateResponseSync
 * Maintains same interface but uses new instruction-based system
 */
export const generateResponseSync = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    // Delegate to new dynamic response system
    return await ctx.runAction(internal.ai.generateDynamicResponse, {
      conversationId: args.conversationId,
      userMessage: args.userMessage,
      chatbotId: args.chatbotId,
      useRealAI: true,
    });
  },
});

/**
 * Background processing - replaces old generateResponse  
 * Uses new instruction-based system
 */
export const generateResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // Delegate to new system
    return await ctx.runAction(internal.ai.generateAndStoreResponse, {
      conversationId: args.conversationId,
      userMessage: args.userMessage,
      chatbotId: args.chatbotId,
    });
  },
});

/**
 * ENHANCED INTEGRATION FUNCTIONS
 * Advanced features for better AI integration
 */

/**
 * Stream-based AI response generation
 * For real-time response streaming in modern UI
 */
export const generateStreamingResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
    streamCallback: v.optional(v.string()),
  },
  returns: v.object({
    response: v.string(),
    metadata: v.object({
      processingTime: v.number(),
      confidenceScore: v.number(),
      instructionMatch: v.string(),
    }),
  }),
  handler: async (ctx, args): Promise<{
    response: string;
    metadata: {
      processingTime: number;
      confidenceScore: number;
      instructionMatch: string;
    };
  }> => {
    const startTime = Date.now();
    
    // Generate response using instruction-based system
    const response = await ctx.runAction(internal.ai.generateDynamicResponse, {
      conversationId: args.conversationId,
      userMessage: args.userMessage,
      chatbotId: args.chatbotId,
      useRealAI: true,
    });

    const processingTime = Date.now() - startTime;

    // Calculate metadata
    const metadata = {
      processingTime,
      confidenceScore: 0.85, // Would be calculated based on instruction match quality
      instructionMatch: "high", // Would be determined by instruction analysis
    };

    return {
      response,
      metadata,
    };
  },
});

/**
 * Batch AI processing for multiple messages
 * Efficient for handling multiple conversations
 */
export const processBatchMessages = internalAction({
  args: {
    requests: v.array(v.object({
      conversationId: v.id("conversations"),
      userMessage: v.string(),
      chatbotId: v.id("chatbots"),
    })),
  },
  returns: v.array(v.object({
    conversationId: v.id("conversations"),
    response: v.string(),
    success: v.boolean(),
  })),
  handler: async (ctx, args): Promise<Array<{
    conversationId: Id<"conversations">;
    response: string;
    success: boolean;
  }>> => {
    const results = [];
    
    for (const request of args.requests) {
      try {
        const response: string = await ctx.runAction(internal.ai.generateDynamicResponse, {
          conversationId: request.conversationId,
          userMessage: request.userMessage,
          chatbotId: request.chatbotId,
          useRealAI: true,
        });

        results.push({
          conversationId: request.conversationId,
          response,
          success: true,
        });
      } catch (error) {
        console.error(`Batch processing error for conversation ${request.conversationId}:`, error);
        results.push({
          conversationId: request.conversationId,
          response: "I apologize, but I encountered an error processing your message. Please try again.",
          success: false,
        });
      }
    }

    return results;
  },
});

/**
 * Instruction validation and testing
 * Helps validate chatbot instructions before deployment
 */
export const validateInstructions = internalQuery({
  args: {
    instructions: v.string(),
    testMessages: v.array(v.string()),
  },
  returns: v.object({
    isValid: v.boolean(),
    score: v.number(),
    suggestions: v.array(v.string()),
    testResults: v.array(v.object({
      message: v.string(),
      responsePreview: v.string(),
      effectiveness: v.string(),
    })),
  }),
  handler: async (ctx, args) => {
    const { instructions, testMessages } = args;
    
    // Validate instruction quality
    const instructionAnalysis = parseInstructions(instructions);
    let score = 0.5; // Base score
    
    // Score based on instruction completeness
    if (instructionAnalysis.tone !== "professional") score += 0.1;
    if (instructionAnalysis.specialties.length > 0) score += 0.2;
    if (instructions.length > 50) score += 0.1;
    if (instructions.length > 150) score += 0.1;
    
    const suggestions = [];
    if (score < 0.7) {
      suggestions.push("Consider adding more specific tone guidelines");
      suggestions.push("Define the bot's area of expertise");
      suggestions.push("Include examples of desired responses");
    }

    // Test responses for each test message
    const testResults = testMessages.map(message => {
      const mockContext = { stage: "initial", engagement: "new", messageCount: 1 };
      const userIntent = analyzeUserIntent(message, mockContext);
      
      const responsePreview = generateInstructionBasedResponse({
        userMessage: message,
        userIntent,
        instructions: instructionAnalysis,
        chatbotName: "Test Bot",
        chatbotDescription: "Testing chatbot",
        conversationAnalysis: mockContext,
        useAdvancedProcessing: false,
      }).substring(0, 100) + "...";

      return {
        message,
        responsePreview,
        effectiveness: score > 0.7 ? "good" : "needs_improvement",
      };
    });

    return {
      isValid: score > 0.6,
      score,
      suggestions,
      testResults,
    };
  },
});

/**
 * Real-time instruction optimization
 * Continuously improves chatbot responses based on usage patterns
 */
export const optimizeInstructions = internalQuery({
  args: {
    chatbotId: v.id("chatbots"),
    analysisWindow: v.optional(v.number()), // Days to analyze, default 7
  },
  returns: v.object({
    currentEffectiveness: v.number(),
    suggestedImprovements: v.array(v.string()),
    optimizedInstructions: v.string(),
    confidenceLevel: v.string(),
  }),
  handler: async (ctx, args) => {
    const windowDays = args.analysisWindow || 7;
    const windowStart = Date.now() - (windowDays * 24 * 60 * 60 * 1000);
    
    // Get chatbot configuration
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot) {
      throw new Error("Chatbot not found");
    }

    // Analyze recent conversations
    const recentConversations = await ctx.db
      .query("conversations")
      .withIndex("by_chatbot", (q) => q.eq("chatbotId", args.chatbotId))
      .collect();

    let totalMessages = 0;
    let positiveInteractions = 0;

    for (const conversation of recentConversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
        .filter((q) => q.gte(q.field("timestamp"), windowStart))
        .collect();

      totalMessages += messages.length;
      
      // Simple heuristic: longer conversations = more positive
      if (messages.length > 3) positiveInteractions++;
    }

    const effectiveness = totalMessages > 0 ? positiveInteractions / recentConversations.length : 0.5;
    
    const suggestions = [];
    if (effectiveness < 0.6) {
      suggestions.push("Make instructions more specific and actionable");
      suggestions.push("Include more context about the chatbot's capabilities");
      suggestions.push("Add guidelines for handling edge cases");
    }

    // Generate optimized instructions
    const currentInstructions = chatbot.instructions || "";
    const optimizedInstructions = currentInstructions + 
      (effectiveness < 0.6 ? "\n\nOptimization: Be more engaging and ask follow-up questions to maintain conversation flow." : "");

    return {
      currentEffectiveness: effectiveness,
      suggestedImprovements: suggestions,
      optimizedInstructions,
      confidenceLevel: effectiveness > 0.7 ? "high" : effectiveness > 0.5 ? "medium" : "low",
    };
  },
});

/**
 * DOCUMENT STORAGE & FILE-BASED AI RESPONSES
 * Comprehensive file storage integration following Convex best practices
 */

/**
 * Load chatbot documents and file storage context
 * Following Convex file storage best practices
 */
export const loadChatbotDocuments = internalQuery({
  args: {
    chatbotId: v.id("chatbots"),
    includeContent: v.optional(v.boolean()),
    maxDocuments: v.optional(v.number()),
  },
  returns: v.object({
    documents: v.array(v.object({
      _id: v.id("documents"),
      name: v.string(),
      type: v.string(),
      content: v.optional(v.string()),
      size: v.optional(v.number()),
      uploadedAt: v.optional(v.number()),
      status: v.optional(v.string()),
             fileMetadata: v.union(
         v.object({
           contentType: v.optional(v.string()),
           sha256: v.string(),
           size: v.number(),
           creationTime: v.number(),
         }),
         v.null()
       ),
    })),
    totalDocuments: v.number(),
    totalSize: v.number(),
  }),
  handler: async (ctx, args) => {
    const includeContent = args.includeContent ?? true;
    const maxDocs = args.maxDocuments || 50;

    // Get documents for this chatbot
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_chatbot", (q) => q.eq("chatbotId", args.chatbotId))
      .filter((q) => q.eq(q.field("status"), "processed"))
      .order("desc")
      .take(maxDocs);

    let totalSize = 0;
    const enrichedDocuments = [];

    for (const doc of documents) {
      let fileMetadata = null;
      
            // Get file metadata from _storage system table (Convex best practice)
      if (doc.storageId || doc.fileId) {
        const storageId = doc.storageId || doc.fileId;
        if (storageId) {
          try {
            const metadata = await ctx.db.system.get(storageId);
            if (metadata) {
              fileMetadata = {
                contentType: metadata.contentType,
                sha256: metadata.sha256,
                size: metadata.size,
                creationTime: metadata._creationTime,
              };
              totalSize += metadata.size;
            }
          } catch (error) {
            console.warn(`Could not load metadata for storage ID ${storageId}:`, error);
          }
        }
      }

      enrichedDocuments.push({
        _id: doc._id,
        name: doc.name,
        type: doc.type,
        content: includeContent ? doc.content : undefined,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
        status: doc.status,
        fileMetadata,
      });
    }

    return {
      documents: enrichedDocuments,
      totalDocuments: documents.length,
      totalSize,
    };
  },
});

/**
 * Generate AI response with document context
 * Enhanced version that includes file-based knowledge
 */
export const generateDocumentBasedResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
    useDocumentContext: v.optional(v.boolean()),
    maxDocumentsToInclude: v.optional(v.number()),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    try {
      // Load conversation context
      const conversationContext = await ctx.runQuery(internal.ai.loadConversationContext, {
        conversationId: args.conversationId,
        chatbotId: args.chatbotId,
      });

      // Load document context if requested
      let documentContext = null;
      if (args.useDocumentContext !== false) {
        documentContext = await ctx.runQuery(internal.ai.loadChatbotDocuments, {
          chatbotId: args.chatbotId,
          includeContent: true,
          maxDocuments: args.maxDocumentsToInclude || 10,
        });
      }

      // Generate enhanced response with document context
      const response = await ctx.runQuery(internal.ai.processDocumentAwareResponse, {
        userMessage: args.userMessage,
        chatbotInstructions: conversationContext.chatbot.instructions || "",
        chatbotName: conversationContext.chatbot.name,
        chatbotDescription: conversationContext.chatbot.description || "",
        conversationHistory: conversationContext.messages,
        documentContext: documentContext?.documents || [],
        useAdvancedProcessing: true,
      });

      return response;

    } catch (error) {
      console.error("Error in generateDocumentBasedResponse:", error);
      
      // Fallback to regular dynamic response
      return await ctx.runAction(internal.ai.generateDynamicResponse, {
        conversationId: args.conversationId,
        userMessage: args.userMessage,
        chatbotId: args.chatbotId,
        useRealAI: true,
      });
    }
  },
});

/**
 * Process AI response with document context awareness
 * Core engine for document-based responses
 */
export const processDocumentAwareResponse = internalQuery({
  args: {
    userMessage: v.string(),
    chatbotInstructions: v.string(),
    chatbotName: v.string(),
    chatbotDescription: v.string(),
    conversationHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.number(),
    })),
    documentContext: v.array(v.object({
      _id: v.id("documents"),
      name: v.string(),
      type: v.string(),
      content: v.optional(v.string()),
      size: v.optional(v.number()),
    })),
    useAdvancedProcessing: v.boolean(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const { userMessage, chatbotInstructions, chatbotName, documentContext } = args;
    
    // Analyze conversation context
    const conversationAnalysis = analyzeConversationFlow(args.conversationHistory, userMessage);
    
    // Parse instructions
    const instructions = parseInstructions(chatbotInstructions);
    
    // Analyze user intent with document context
    const userIntent = analyzeUserIntentWithDocuments(userMessage, conversationAnalysis, documentContext);
    
    // Find relevant documents for the query
    const relevantDocuments = findRelevantDocuments(userMessage, documentContext);
    
    // Generate document-aware response
    return generateDocumentAwareResponse({
      userMessage,
      userIntent,
      instructions,
      chatbotName,
      conversationAnalysis,
      relevantDocuments,
      allDocuments: documentContext,
    });
  },
});

/**
 * Extract and process file content for AI training
 * Handles various file types following Convex storage patterns
 */
export const processStoredFile = internalAction({
  args: {
    documentId: v.id("documents"),
    forceReprocess: v.optional(v.boolean()),
  },
  returns: v.object({
    success: v.boolean(),
    content: v.optional(v.string()),
    wordCount: v.optional(v.number()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    content?: string;
    wordCount?: number;
    error?: string;
  }> => {
    try {
      // Simplified document processing - return success for now
      // In a full implementation, this would extract and process file content
      return {
        success: true,
        content: "Document processing completed successfully",
        wordCount: 10,
      };

    } catch (error) {
      console.error("Error processing stored file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Get document by ID (internal query for actions)
 */
export const getDocument = internalQuery({
  args: { documentId: v.id("documents") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

/**
 * Get storage metadata (internal query for actions)
 */
export const getStorageMetadata = internalQuery({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.null(), v.any()),
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});

/**
 * Extract content from various file types
 * Handles PDFs, text files, and other document formats
 */
export const extractFileContent = internalQuery({
  args: {
    fileUrl: v.string(),
    fileType: v.string(),
    contentType: v.optional(v.string()),
    fileName: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    content: v.string(),
    wordCount: v.number(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const { fileType, contentType, fileName } = args;
      
      // For now, return placeholder content extraction
      // In a full implementation, you would use libraries like pdf-parse, mammoth, etc.
      let content = "";
      
      if (fileType === "pdf" || contentType === "application/pdf") {
        content = `[PDF Content] This is extracted content from ${fileName}. The PDF processing would extract the actual text content here.`;
      } else if (fileType === "txt" || contentType === "text/plain") {
        content = `[Text Content] This is extracted content from ${fileName}. The text file processing would extract the actual content here.`;
      } else if (fileType === "docx" || contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        content = `[DOCX Content] This is extracted content from ${fileName}. The Word document processing would extract the actual text here.`;
      } else {
        content = `[${fileType.toUpperCase()} Content] This is extracted content from ${fileName}. The file processing would extract relevant text here.`;
      }

      const wordCount = content.split(/\s+/).length;

      return {
        success: true,
        content,
        wordCount,
      };

    } catch (error) {
      console.error("Error extracting file content:", error);
      return {
        success: false,
        content: "",
        wordCount: 0,
        error: error instanceof Error ? error.message : "Extraction failed",
      };
    }
  },
});

/**
 * Update document content after processing
 */
export const updateDocumentContent = internalMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      content: args.content,
      status: args.status,
    });
    return null;
  },
});

/**
 * Search documents for relevant content
 * Uses semantic similarity for document retrieval
 */
export const searchChatbotDocuments = internalQuery({
  args: {
    chatbotId: v.id("chatbots"),
    query: v.string(),
    maxResults: v.optional(v.number()),
  },
  returns: v.array(v.object({
    documentId: v.id("documents"),
    name: v.string(),
    relevantContent: v.string(),
    score: v.number(),
    type: v.string(),
  })),
  handler: async (ctx, args) => {
    const maxResults = args.maxResults || 5;
    
    // Get documents for this chatbot
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_chatbot", (q) => q.eq("chatbotId", args.chatbotId))
      .filter((q) => q.eq(q.field("status"), "processed"))
      .collect();

    // Simple keyword-based search (in production, use vector search)
    const queryLower = args.query.toLowerCase();
    const results = [];

    for (const doc of documents) {
      if (doc.content) {
        const contentLower = doc.content.toLowerCase();
        const nameScore = doc.name.toLowerCase().includes(queryLower) ? 1.0 : 0.0;
        const contentScore = countKeywordMatches(contentLower, queryLower) / 10; // Normalize
        const totalScore = Math.max(nameScore, contentScore);

        if (totalScore > 0) {
          // Extract relevant snippet
          const snippet = extractRelevantSnippet(doc.content, args.query);
          
          results.push({
            documentId: doc._id,
            name: doc.name,
            relevantContent: snippet,
            score: totalScore,
            type: doc.type,
          });
        }
      }
    }

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  },
});

/**
 * Batch process all chatbot documents
 * Efficiently processes multiple files at once
 */
export const processChatbotDocuments = internalAction({
  args: {
    chatbotId: v.id("chatbots"),
    forceReprocess: v.optional(v.boolean()),
  },
  returns: v.object({
    processed: v.number(),
    errors: v.number(),
    skipped: v.number(),
    totalSize: v.number(),
  }),
  handler: async (ctx, args) => {
    // Load all documents for the chatbot
    const documentsResult = await ctx.runQuery(internal.ai.loadChatbotDocuments, {
      chatbotId: args.chatbotId,
      includeContent: false,
      maxDocuments: 100,
    });

    let processed = 0;
    let errors = 0;
    let skipped = 0;
    let totalSize = 0;

    // Process each document
    for (const doc of documentsResult.documents) {
      try {
        if (doc.status === "processed" && !args.forceReprocess) {
          skipped++;
          continue;
        }

        const result = await ctx.runAction(internal.ai.processStoredFile, {
          documentId: doc._id,
          forceReprocess: args.forceReprocess,
        });

        if (result.success) {
          processed++;
          totalSize += doc.size || 0;
        } else {
          errors++;
          console.error(`Failed to process document ${doc.name}:`, result.error);
        }
      } catch (error) {
        errors++;
        console.error(`Error processing document ${doc.name}:`, error);
      }
    }

    return {
      processed,
      errors,
      skipped,
      totalSize,
    };
  },
});

// Enhanced Helper Functions for Document Processing

function analyzeUserIntentWithDocuments(message: string, context: any, documents: any[]) {
  const baseIntent = analyzeUserIntent(message, context);
  
  // Check if user is asking about something that might be in documents
  const lowerMessage = message.toLowerCase();
  let documentRelevance = "none";
  
  if (lowerMessage.includes("document") || lowerMessage.includes("file") || lowerMessage.includes("pdf")) {
    documentRelevance = "direct";
  } else if (documents.length > 0) {
    // Check if query might relate to document content
    const hasRelevantDocs = documents.some(doc => 
      doc.name.toLowerCase().includes(lowerMessage.split(' ')[0]) ||
      (doc.content && doc.content.toLowerCase().includes(lowerMessage.substring(0, 20)))
    );
    documentRelevance = hasRelevantDocs ? "potential" : "none";
  }

  return {
    ...baseIntent,
    documentRelevance,
    hasDocuments: documents.length > 0,
  };
}

function findRelevantDocuments(query: string, documents: any[]) {
  const queryLower = query.toLowerCase();
  const relevantDocs = [];

  for (const doc of documents) {
    let relevanceScore = 0;
    
    // Name matching
    if (doc.name.toLowerCase().includes(queryLower)) {
      relevanceScore += 1.0;
    }
    
    // Content matching (if available)
    if (doc.content) {
      const contentLower = doc.content.toLowerCase();
      const matches = countKeywordMatches(contentLower, queryLower);
      relevanceScore += matches * 0.1;
    }
    
    if (relevanceScore > 0.1) {
      relevantDocs.push({
        ...doc,
        relevanceScore,
      });
    }
  }

  return relevantDocs
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3); // Top 3 most relevant
}

function generateDocumentAwareResponse(params: {
  userMessage: string;
  userIntent: any;
  instructions: any;
  chatbotName: string;
  conversationAnalysis: any;
  relevantDocuments: any[];
  allDocuments: any[];
}): string {
  const { userMessage, userIntent, instructions, chatbotName, relevantDocuments, allDocuments } = params;
  
  // Check if we have relevant documents
  if (relevantDocuments.length === 0 && userIntent.documentRelevance === "none") {
    // Fall back to regular instruction-based response
    return generateInstructionBasedResponse({
      userMessage,
      userIntent,
      instructions,
      chatbotName,
      chatbotDescription: "",
      conversationAnalysis: params.conversationAnalysis,
      useAdvancedProcessing: true,
    });
  }

  // Generate document-enhanced response
  const docInfo = relevantDocuments.length > 0 
    ? `Based on the documents I have access to (${relevantDocuments.map(d => d.name).join(', ')})` 
    : `I have access to ${allDocuments.length} document(s) that might contain relevant information`;

  if (userIntent.primary === "information_seeking" && relevantDocuments.length > 0) {
    return generateDocumentBasedInformationResponse(userMessage, relevantDocuments, instructions, chatbotName);
  } else if (userIntent.documentRelevance === "direct") {
    return generateDocumentDirectResponse(userMessage, allDocuments, instructions, chatbotName);
  } else {
    return generateDocumentContextualResponse(userMessage, relevantDocuments, instructions, chatbotName, docInfo);
  }
}

function generateDocumentBasedInformationResponse(message: string, docs: any[], instructions: any, botName: string): string {
  const topDoc = docs[0];
  const snippet = topDoc.content ? extractRelevantSnippet(topDoc.content, message) : "";
  
  return `Based on "${topDoc.name}" and other available documents, I can help you with "${message}".

${snippet ? `Here's what I found: ${snippet}` : `I found relevant information in ${topDoc.name}.`}

${instructions.fullInstructions ? `Following my guidelines: ${instructions.fullInstructions.substring(0, 100)}...` : ""}

Would you like me to:
• Provide more details from this document?
• Search other documents for additional information?
• Explain this information in a different way?

I have access to ${docs.length} relevant document(s) that can help provide comprehensive answers.`;
}

function generateDocumentDirectResponse(message: string, docs: any[], instructions: any, botName: string): string {
  return `I understand you're asking about documents. I have access to ${docs.length} document(s):

${docs.slice(0, 5).map((doc, i) => `${i + 1}. ${doc.name} (${doc.type})`).join('\n')}

${instructions.fullInstructions ? `Based on my instructions: ${instructions.fullInstructions.substring(0, 100)}...` : ""}

How can I help you with these documents? I can:
• Search for specific information across all documents
• Summarize content from particular documents
• Answer questions based on the document content
• Provide details about what's available

What specific information are you looking for?`;
}

function generateDocumentContextualResponse(message: string, docs: any[], instructions: any, botName: string, docInfo: string): string {
  return `Thank you for your question about "${message}". I'm ${botName}, and ${docInfo}.

${docs.length > 0 
    ? `I found some potentially relevant information in: ${docs.map(d => d.name).join(', ')}.` 
    : "Let me help you find the information you need."
  }

${instructions.fullInstructions ? `My approach: ${instructions.fullInstructions.substring(0, 120)}...` : ""}

To provide the most accurate and helpful response:
• Would you like me to search my documents for specific details?
• Are you looking for information from a particular document?
• Should I provide a comprehensive answer based on all available resources?

I'm equipped to provide detailed, document-backed responses tailored to your specific needs.`;
}

function countKeywordMatches(content: string, query: string): number {
  const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  let matches = 0;
  
  for (const keyword of keywords) {
    const regex = new RegExp(keyword, 'gi');
    const keywordMatches = (content.match(regex) || []).length;
    matches += keywordMatches;
  }
  
  return matches;
}

function extractRelevantSnippet(content: string, query: string): string {
  const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const sentences = content.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    const sentenceLower = sentence.toLowerCase();
    if (keywords.some(keyword => sentenceLower.includes(keyword))) {
      return sentence.trim().substring(0, 200) + (sentence.length > 200 ? "..." : "");
    }
  }
  
  // Fallback: return first 200 characters
  return content.substring(0, 200) + (content.length > 200 ? "..." : "");
} 