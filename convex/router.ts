import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// CORS headers helper
const getCorsHeaders = () => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-Requested-With",
  "Access-Control-Allow-Credentials": "false",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin"
});

// Chat API endpoint for widget
http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Check for API key authentication (only in production)
      const apiKey = request.headers.get("X-API-Key") || request.headers.get("Authorization")?.replace("Bearer ", "");
      
      if (!apiKey && process.env.NODE_ENV === "production") {
        return new Response(JSON.stringify({ 
          error: "API key required. Please include X-API-Key header." 
        }), {
          status: 401,
          headers: getCorsHeaders(),
        });
      }

      const { chatbotId, message, sessionId } = await request.json();
      
      // Get or create conversation for this session
      let conversation = await ctx.runQuery(internal.conversations.getBySessionInternal, {
        sessionId
      });
      
      if (!conversation) {
        const newConversationId = await ctx.runMutation(internal.conversations.createWidgetInternal, {
          chatbotId: chatbotId as any,
          sessionId
        });
        conversation = await ctx.runQuery(internal.conversations.getBySessionInternal, {
          sessionId
        });
      }
      
      if (!conversation) {
        throw new Error("Failed to create conversation");
      }
      
      // Send message and get response
      const response = await ctx.runMutation(internal.conversations.sendMessageInternal, {
        conversationId: conversation._id,
        content: message
      });
      
      return new Response(JSON.stringify({ 
        response: response || "Thank you for your message! This is a demo response." 
      }), {
        headers: getCorsHeaders(),
      });
    } catch (error) {
      console.error("Chat API error:", error);
      return new Response(JSON.stringify({ 
        error: "Failed to process message" 
      }), {
        status: 500,
        headers: getCorsHeaders(),
      });
    }
  }),
});

// Handle CORS preflight requests
http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

export default http;
