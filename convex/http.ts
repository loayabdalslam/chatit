import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Add auth routes
auth.addHttpRoutes(http);

// Helper function for CORS headers
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
}

// Handle preflight requests
http.route({
  path: "/api/*",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Chat endpoint - handles real AI responses
http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { chatbotId, message, sessionId } = body;

      if (!chatbotId || !message || !sessionId) {
        return new Response(JSON.stringify({ 
          error: "Missing required fields: chatbotId, message, sessionId" 
        }), {
          status: 400,
          headers: getCorsHeaders(),
        });
      }

      // Validate chatbot exists and is active
      const chatbot = await ctx.runQuery(internal.chatbots.getPublicInfo, {
        chatbotId: chatbotId as any,
      });

      if (!chatbot) {
        return new Response(JSON.stringify({ 
          error: "Chatbot not found or inactive" 
        }), {
          status: 404,
          headers: getCorsHeaders(),
        });
      }

      // Use the complete chat handling action for real AI responses
      const aiResponse = await ctx.runAction(internal.chat.handleChatMessage, {
        chatbotId: chatbotId as any,
        message,
        sessionId,
      });

      return new Response(JSON.stringify({ 
        message: aiResponse,
        success: true 
      }), {
        headers: getCorsHeaders(),
      });

    } catch (error) {
      console.error("Chat API error:", error);
      return new Response(JSON.stringify({ 
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: getCorsHeaders(),
      });
    }
  }),
});

// Get chatbot info for widget initialization
http.route({
  path: "/api/chatbot/:chatbotId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const chatbotId = url.pathname.split('/').pop();
      
      if (!chatbotId) {
        return new Response(JSON.stringify({ 
          error: "Chatbot ID is required" 
        }), {
          status: 400,
          headers: getCorsHeaders(),
        });
      }

      // Get chatbot details
      const chatbot = await ctx.runQuery(internal.chatbots.getPublicInfo, {
        chatbotId: chatbotId as any,
      });

      if (!chatbot) {
        return new Response(JSON.stringify({ 
          error: "Chatbot not found" 
        }), {
          status: 404,
          headers: getCorsHeaders(),
        });
      }

      const defaultWidgetConfig = {
        primaryColor: '#2563eb',
        position: 'bottom-right',
        size: 'medium',
        welcomeMessage: `Hi! I'm ${chatbot.name}. How can I help you today?`,
        placeholder: 'Type your message...',
        showBranding: true,
        borderRadius: 12,
        fontFamily: 'system-ui',
        animation: 'bounce',
        theme: 'light',
      };

      return new Response(JSON.stringify({
        id: chatbot._id,
        name: chatbot.name,
        description: chatbot.description,
        widgetConfig: { ...defaultWidgetConfig, ...chatbot.widgetConfig }
      }), {
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Chatbot info API error:", error);
      return new Response(JSON.stringify({ 
        error: "Failed to get chatbot info" 
      }), {
        status: 500,
        headers: getCorsHeaders(),
      });
    }
  }),
});

// Demo chatbot creation for testing (optional)
http.route({
  path: "/api/demo/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { name = "Demo Bot", description = "AI-powered demo chatbot" } = body;

      // Create a demo chatbot using internal mutation
      const chatbotId = await ctx.runMutation(internal.testData.createDemoChatbot, {
        name,
        description,
      });

      return new Response(JSON.stringify({
        chatbotId,
        message: "Demo chatbot created successfully",
        embedCode: `<div data-chatit-widget="${chatbotId}"></div>`
      }), {
        headers: getCorsHeaders(),
      });

    } catch (error) {
      console.error("Demo creation error:", error);
      return new Response(JSON.stringify({ 
        error: "Failed to create demo chatbot",
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: getCorsHeaders(),
      });
    }
  }),
});

export default http;
