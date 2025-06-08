import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, action, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * CONVEX NATIVE AI SYSTEM
 * Maximizing built-in Convex capabilities to minimize external dependencies
 * Uses Convex's text search, pattern matching, and intelligent rule-based responses
 * NO EXTERNAL API KEYS REQUIRED - 100% Convex Built-in Features
 */

// Interface for message structure
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

// Interface for conversation thread
interface ConversationThread {
  threadId: string;
  chatbotId: Id<"chatbots">;
  userId?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  title?: string;
  metadata?: Record<string, any>;
}

/**
 * CONVEX NATIVE PATTERN MATCHING SYSTEM
 * Uses built-in text search and pattern recognition
 */

// Common greeting patterns
const GREETING_PATTERNS = [
  /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/i,
  /^(what'?s\s+up|how\s+are\s+you|how\s+do\s+you\s+do)/i,
  /^(start|begin|help|assist)/i,
];

// Question patterns
const QUESTION_PATTERNS = [
  /^(what|how|when|where|why|who|which|can\s+you|could\s+you|would\s+you)/i,
  /\?$/,
  /^(tell\s+me|show\s+me|explain|describe)/i,
];

// Help patterns
const HELP_PATTERNS = [
  /^(help|support|assist|guide)/i,
  /^(i\s+need|i\s+want|i'm\s+looking\s+for)/i,
  /^(how\s+to|how\s+do\s+i|how\s+can\s+i)/i,
];

/**
 * CONVEX NATIVE TEXT SEARCH AND RESPONSE GENERATION
 */
export const generateResponseWithConvexSearch = internalAction({
  args: {
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
    threadId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ text: string; confidence: number; sources: string[] }> => {
    // Step 1: Get chatbot configuration
    const chatbot = await ctx.runQuery(internal.ai.getChatbotInfo, {
      chatbotId: args.chatbotId,
    });

    if (!chatbot) {
      return {
        text: "I'm sorry, but I couldn't find the chatbot configuration. Please contact support.",
        confidence: 0,
        sources: [],
      };
    }

    // Step 2: Use Convex text search to find relevant documents
    const searchResults = await ctx.runQuery(internal.ai.searchDocumentsByQuery, {
      chatbotId: args.chatbotId,
      query: args.userMessage,
      limit: 10,
    });

    // Step 3: Pattern-based response classification
    const messageType = classifyMessage(args.userMessage);
    
    // Step 4: Generate response using Convex's built-in capabilities
    const response = generateConvexNativeResponse({
      userMessage: args.userMessage,
      messageType,
      chatbot,
      searchResults,
      threadId: args.threadId,
    });

    return response;
  },
});

/**
 * CONVEX NATIVE RESPONSE GENERATION
 * Uses pattern matching, text search, and rule-based logic
 */
function generateConvexNativeResponse(params: {
  userMessage: string;
  messageType: string;
  chatbot: any;
  searchResults: any[];
  threadId?: string;
}): { text: string; confidence: number; sources: string[] } {
  const { userMessage, messageType, chatbot, searchResults } = params;

  // Extract relevant content from search results
  const relevantContent = searchResults
    .filter((doc: any) => doc.content && doc.content.length > 20)
    .slice(0, 3);

  const sources = relevantContent.map((doc: any) => doc.name || doc.url || "Unknown source");

  // Generate response based on message type and available content
  switch (messageType) {
    case "greeting":
      return generateGreetingResponse(chatbot, relevantContent);
    
    case "question":
      return generateQuestionResponse(userMessage, chatbot, relevantContent);
    
    case "help":
      return generateHelpResponse(chatbot, relevantContent);
    
    case "general":
    default:
      return generateGeneralResponse(userMessage, chatbot, relevantContent);
  }
}

/**
 * MESSAGE CLASSIFICATION USING PATTERN MATCHING
 */
function classifyMessage(message: string): string {
  const normalizedMessage = message.toLowerCase().trim();

  if (GREETING_PATTERNS.some(pattern => pattern.test(normalizedMessage))) {
    return "greeting";
  }
  
  if (QUESTION_PATTERNS.some(pattern => pattern.test(normalizedMessage))) {
    return "question";
  }
  
  if (HELP_PATTERNS.some(pattern => pattern.test(normalizedMessage))) {
    return "help";
  }
  
  return "general";
}

/**
 * RESPONSE GENERATORS USING CONVEX DATA
 */
function generateGreetingResponse(chatbot: any, relevantContent: any[]): { text: string; confidence: number; sources: string[] } {
  const botName = chatbot.name || "AI Assistant";
  const description = chatbot.description || "I'm here to help you!";
  
  let response = `Hello! I'm ${botName}. ${description}`;
  
  if (relevantContent.length > 0) {
    const topics = relevantContent
      .map((doc: any) => extractKeyTopics(doc.content))
      .flat()
      .slice(0, 3);
    
    if (topics.length > 0) {
      response += `\n\nI can help you with topics like: ${topics.join(", ")}.`;
    }
  }
  
  response += "\n\nWhat would you like to know?";
  
  return {
    text: response,
    confidence: 0.9,
    sources: relevantContent.map((doc: any) => doc.name || "Knowledge base"),
  };
}

function generateQuestionResponse(userMessage: string, chatbot: any, relevantContent: any[]): { text: string; confidence: number; sources: string[] } {
  const botName = chatbot.name || "AI Assistant";
  
  if (relevantContent.length === 0) {
    return {
      text: `I understand you're asking about something, but I don't have specific information about that topic in my knowledge base. Could you provide more details or ask about something else I might be able to help with?`,
      confidence: 0.3,
      sources: [],
    };
  }

  // Find the most relevant content based on keyword matching
  const keywords = extractKeywords(userMessage);
  const bestMatch = findBestContentMatch(relevantContent, keywords);
  
  if (bestMatch) {
    const summary = generateContentSummary(bestMatch.content, keywords);
    let response = `Based on my knowledge base, here's what I found:\n\n${summary}`;
    
    if (bestMatch.url) {
      response += `\n\nFor more details, you can check: ${bestMatch.url}`;
    }
    
    // Add related suggestions
    const relatedTopics = relevantContent
      .filter((doc: any) => doc !== bestMatch)
      .slice(0, 2)
      .map((doc: any) => doc.name || "related topic");
    
    if (relatedTopics.length > 0) {
      response += `\n\nYou might also be interested in: ${relatedTopics.join(", ")}.`;
    }
    
    return {
      text: response,
      confidence: 0.8,
      sources: [bestMatch.name || bestMatch.url || "Knowledge base"],
    };
  }
  
  return {
    text: `I found some related information, but I'm not sure if it directly answers your question. Could you be more specific about what you're looking for?`,
    confidence: 0.5,
    sources: relevantContent.map((doc: any) => doc.name || "Knowledge base").slice(0, 2),
  };
}

function generateHelpResponse(chatbot: any, relevantContent: any[]): { text: string; confidence: number; sources: string[] } {
  const botName = chatbot.name || "AI Assistant";
  
  let response = `I'm ${botName} and I'm here to help! `;
  
  if (relevantContent.length > 0) {
    const capabilities = relevantContent
      .map((doc: any) => extractCapabilities(doc.content))
      .flat()
      .slice(0, 5);
    
    if (capabilities.length > 0) {
      response += `Here are some things I can help you with:\n\n`;
      capabilities.forEach((capability, index) => {
        response += `${index + 1}. ${capability}\n`;
      });
    } else {
      response += `I have access to information about various topics in my knowledge base.`;
    }
  } else {
    response += `I'm ready to answer your questions and provide assistance based on my knowledge.`;
  }
  
  response += `\n\nFeel free to ask me anything, and I'll do my best to help!`;
  
  return {
    text: response,
    confidence: 0.9,
    sources: relevantContent.map((doc: any) => doc.name || "Knowledge base").slice(0, 3),
  };
}

function generateGeneralResponse(userMessage: string, chatbot: any, relevantContent: any[]): { text: string; confidence: number; sources: string[] } {
  if (relevantContent.length === 0) {
    return {
      text: `I understand what you're saying, but I don't have specific information about that in my current knowledge base. Is there something else I can help you with?`,
      confidence: 0.2,
      sources: [],
    };
  }

  // Use the most relevant content
  const bestContent = relevantContent[0];
  const keywords = extractKeywords(userMessage);
  const summary = generateContentSummary(bestContent.content, keywords);
  
  let response = `Here's some relevant information I found:\n\n${summary}`;
  
  if (relevantContent.length > 1) {
    response += `\n\nI also have information about related topics if you'd like to explore further.`;
  }
  
  return {
    text: response,
    confidence: 0.7,
    sources: [bestContent.name || bestContent.url || "Knowledge base"],
  };
}

/**
 * UTILITY FUNCTIONS FOR CONTENT PROCESSING
 */
function extractKeywords(text: string): string[] {
  // Remove common stop words and extract meaningful keywords
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 10); // Limit to top 10 keywords
}

function extractKeyTopics(content: string): string[] {
  // Extract potential topics from content (headers, emphasized text, etc.)
  const topics: string[] = [];
  
  // Look for headers (## Topic or # Topic)
  const headers = content.match(/^#+\s+(.+)$/gm);
  if (headers) {
    topics.push(...headers.map(h => h.replace(/^#+\s+/, '').trim()));
  }
  
  // Look for emphasized text (**text** or *text*)
  const emphasized = content.match(/\*\*([^*]+)\*\*|\*([^*]+)\*/g);
  if (emphasized) {
    topics.push(...emphasized.map(e => e.replace(/\*/g, '').trim()));
  }
  
  // Extract first sentences as potential topics
  const sentences = content.split(/[.!?]\s+/).slice(0, 3);
  topics.push(...sentences.map(s => s.trim()).filter(s => s.length > 10 && s.length < 100));
  
  return topics.slice(0, 5); // Limit to 5 topics
}

function extractCapabilities(content: string): string[] {
  const capabilities: string[] = [];
  
  // Look for action words and capabilities
  const actionPatterns = [
    /(?:can|able to|help with|provide|offer|support)\s+([^.!?]{10,80})/gi,
    /(?:how to|steps to|way to)\s+([^.!?]{10,80})/gi,
  ];
  
  actionPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      capabilities.push(...matches.map(m => m.trim()));
    }
  });
  
  return capabilities.slice(0, 5);
}

function findBestContentMatch(content: any[], keywords: string[]): any | null {
  if (content.length === 0 || keywords.length === 0) {
    return content[0] || null;
  }
  
  // Score each content piece based on keyword matches
  const scoredContent = content.map((doc: any) => {
    const docText = (doc.content || '').toLowerCase();
    const score = keywords.reduce((acc, keyword) => {
      const keywordCount = (docText.match(new RegExp(keyword, 'g')) || []).length;
      return acc + keywordCount;
    }, 0);
    return { ...doc, score };
  });
  
  // Return the highest scoring content
  scoredContent.sort((a, b) => b.score - a.score);
  return scoredContent[0].score > 0 ? scoredContent[0] : content[0];
}

function generateContentSummary(content: string, keywords: string[]): string {
  // Find the most relevant sentences based on keywords
  const sentences = content.split(/[.!?]\s+/).filter(s => s.length > 20);
  
  if (keywords.length === 0) {
    return sentences.slice(0, 2).join('. ') + '.';
  }
  
  // Score sentences based on keyword matches
  const scoredSentences = sentences.map(sentence => {
    const sentenceLower = sentence.toLowerCase();
    const score = keywords.reduce((acc, keyword) => {
      return acc + (sentenceLower.includes(keyword) ? 1 : 0);
    }, 0);
    return { sentence, score };
  });
  
  // Get top scoring sentences
  scoredSentences.sort((a, b) => b.score - a.score);
  const topSentences = scoredSentences
    .slice(0, 3)
    .filter(s => s.score > 0)
    .map(s => s.sentence);
  
  if (topSentences.length === 0) {
    return sentences.slice(0, 2).join('. ') + '.';
  }
  
  return topSentences.join('. ') + '.';
}

/**
 * CONVERSATION THREAD MANAGEMENT
 * Using existing conversations table structure
 */
export const createConversationThread = mutation({
  args: {
    chatbotId: v.id("chatbots"),
    userId: v.id("users"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ threadId: string }> => {
    const threadId = await ctx.db.insert("conversations", {
      chatbotId: args.chatbotId,
      userId: args.userId,
      title: args.title || "New Conversation",
      status: "active",
      sessionId: crypto.randomUUID(),
      source: "convex_native_ai",
    });

    return { threadId: threadId as string };
  },
});

export const addMessageToThread = mutation({
  args: {
    threadId: v.id("conversations"),
    message: v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.optional(v.number()),
      metadata: v.optional(v.record(v.string(), v.any())),
    }),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    // Add message to messages table
    await ctx.db.insert("messages", {
      conversationId: args.threadId,
      content: args.message.content,
      role: args.message.role,
      timestamp: args.message.timestamp || Date.now(),
      sentiment: undefined,
    });

    return { success: true };
  },
});

export const getConversationThread = query({
  args: { threadId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.threadId);
    if (!conversation) return null;

    // Get messages for this conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.threadId))
      .order("asc")
      .collect();

    return {
      ...conversation,
      messages: messages.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };
  },
});

/**
 * MAIN PUBLIC INTERFACE - BACKWARD COMPATIBLE
 */

// Main function for generating responses - now uses Convex native capabilities
export const generateResponse = internalAction({
  args: {
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
    threadId: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    confidence: number;
    sources: string[];
    method: string;
  }> => {
    try {
      // Try Convex native response first
      const nativeResponse = await ctx.runAction(internal.ai.generateResponseWithConvexSearch, {
        userMessage: args.userMessage,
        chatbotId: args.chatbotId,
        threadId: args.threadId,
        userId: args.userId,
      });

      return {
        response: nativeResponse.text,
        confidence: nativeResponse.confidence,
        sources: nativeResponse.sources,
        method: "convex_native",
      };
    } catch (error) {
      console.error("Convex native response failed:", error);
      
      // Fallback to pattern-based response
      const chatbot = await ctx.runQuery(internal.ai.getChatbotInfo, {
        chatbotId: args.chatbotId,
      });

      const fallbackResponse = generateInstructionBasedFallback(
        args.userMessage,
        chatbot?.instructions || "Be helpful and friendly.",
        chatbot?.name || "AI Assistant"
      );

      return {
        response: fallbackResponse,
        confidence: 0.6,
        sources: [],
        method: "pattern_fallback",
      };
    }
  },
});

// Synchronous version for immediate responses
export const generateResponseSync = internalQuery({
  args: {
    userMessage: v.string(),
    chatbotId: v.id("chatbots"),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    confidence: number;
    method: string;
  }> => {
    // For sync responses, use pattern matching only
    const chatbot = await ctx.runQuery(internal.ai.getChatbotInfo, {
      chatbotId: args.chatbotId,
    });

    const messageType = classifyMessage(args.userMessage);
    
    // Quick pattern-based response
    let response: string;
    
    switch (messageType) {
      case "greeting":
        response = `Hello! I'm ${chatbot?.name || "AI Assistant"}. ${chatbot?.description || "How can I help you today?"}`;
        break;
      case "question":
        response = "That's a great question! Let me search for information to give you the best answer.";
        break;
      case "help":
        response = `I'm here to help! I'm ${chatbot?.name || "your AI assistant"} and I can assist you with various topics. What specifically would you like help with?`;
        break;
      default:
        response = "I understand. Let me process that and provide you with the most helpful response I can.";
        break;
    }
    
    return {
      response,
      confidence: 0.7,
      method: "sync_pattern",
    };
  },
});

// Process instruction-based responses (legacy support)
export const processInstructionBasedResponse = internalQuery({
  args: {
    userMessage: v.string(),
    instructions: v.string(),
    botName: v.string(),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    confidence: number;
    method: string;
  }> => {
    const response = generateInstructionBasedFallback(
      args.userMessage,
      args.instructions,
      args.botName
    );
    
    return {
      response,
      confidence: 0.6,
      method: "instruction_based",
    };
  },
});

/**
 * HELPER QUERIES FOR DATABASE OPERATIONS
 */
export const getChatbotInfo = internalQuery({
  args: { chatbotId: v.id("chatbots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatbotId);
  },
});

export const searchDocumentsByQuery = internalQuery({
  args: {
    chatbotId: v.id("chatbots"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Use Convex's built-in filtering since there's no search index defined
    const allDocuments = await ctx.db
      .query("documents")
      .withIndex("by_chatbot", (q) => q.eq("chatbotId", args.chatbotId))
      .filter((q) => q.eq(q.field("status"), "processed"))
      .take(100); // Get more documents to search through
    
    // Simple text search through content
    const queryLower = args.query.toLowerCase();
    const relevantDocs = allDocuments
      .filter(doc => {
        if (!doc.content) return false;
        const contentLower = doc.content.toLowerCase();
        return contentLower.includes(queryLower);
      })
      .slice(0, limit);
    
    return relevantDocs;
  },
});

/**
 * LEGACY PATTERN-BASED FALLBACK SYSTEM
 */
function generateInstructionBasedFallback(
  userMessage: string,
  instructions: string,
  botName: string
): string {
  const messageType = classifyMessage(userMessage);
  const messageLower = userMessage.toLowerCase();
  
  // Extract key concepts from instructions
  const instructionConcepts = extractKeywords(instructions);
  const messageConcepts = extractKeywords(userMessage);
  
  // Check for concept overlap
  const overlap = instructionConcepts.filter(concept => 
    messageConcepts.some(msgConcept => 
      msgConcept.includes(concept) || concept.includes(msgConcept)
    )
  );
  
  let response = `Hi! I'm ${botName}. `;
  
  if (messageType === "greeting") {
    response += `Nice to meet you! ${instructions.split('.')[0]}.`;
  } else if (messageType === "question") {
    if (overlap.length > 0) {
      response += `Great question about ${overlap[0]}! Based on my guidelines: ${instructions}`;
    } else {
      response += `That's an interesting question. While I'm designed to ${instructions.toLowerCase()}, I'd be happy to help you with that topic.`;
    }
  } else if (messageType === "help") {
    response += `I'm here to help! ${instructions}`;
  } else {
    if (overlap.length > 0) {
      response += `I understand you're asking about ${overlap[0]}. ${instructions}`;
    } else {
      response += `Thanks for your message. ${instructions} How can I assist you today?`;
    }
  }
  
  return response;
} 