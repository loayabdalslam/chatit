import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

// CORS configuration for ChatIt Widget
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins for widget integration
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Convex-Client",
  "Access-Control-Max-Age": "86400", // 24 hours
};

// Helper function to add CORS headers to responses
const addCorsHeaders = (response: Response): Response => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};

// Health check endpoint for widget connection testing
const healthCheck = httpAction(async (ctx, request) => {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return addCorsHeaders(new Response(null, { status: 200 }));
  }

  try {
    const response = new Response(
      JSON.stringify({ 
        status: "healthy", 
        timestamp: Date.now(),
        service: "convex-chatit-widget"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
    
    return addCorsHeaders(response);
  } catch (error) {
    const response = new Response(
      JSON.stringify({ 
        status: "error", 
        message: "Health check failed" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
    
    return addCorsHeaders(response);
  }
});

// Chat endpoint for widget message handling
const chatEndpoint = httpAction(async (ctx, request) => {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return addCorsHeaders(new Response(null, { status: 200 }));
  }

  if (request.method !== "POST") {
    const response = new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
    return addCorsHeaders(response);
  }

  try {
    const body = await request.json();
    const { chatbotId, message, sessionId } = body;

    if (!chatbotId || !message) {
      const response = new Response(
        JSON.stringify({ 
          error: "Missing required fields: chatbotId and message" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
      return addCorsHeaders(response);
    }

         // Call the internal chat action
     const result = await ctx.runAction(internal.chat.handleChatMessage, {
       chatbotId: chatbotId as any,
       message,
       sessionId: sessionId || "anonymous",
     });

    const response = new Response(
      JSON.stringify({ 
                 message: result,
         success: true,
         timestamp: Date.now()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Chat endpoint error:", error);
    
    const response = new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: "Failed to process chat message"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );

    return addCorsHeaders(response);
  }
});

// Chatbot info endpoint for widget configuration
const chatbotEndpoint = httpAction(async (ctx, request) => {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return addCorsHeaders(new Response(null, { status: 200 }));
  }

  try {
    const url = new URL(request.url);
    const chatbotId = url.searchParams.get("id");

    if (!chatbotId) {
      const response = new Response(
        JSON.stringify({ error: "Chatbot ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
      return addCorsHeaders(response);
    }

         // Get chatbot configuration  
     const chatbot = await ctx.runQuery(internal.chatbots.getPublicInfo, {
       chatbotId: chatbotId as any,
     });

    if (!chatbot) {
      const response = new Response(
        JSON.stringify({ 
          error: "Chatbot not found",
          chatbotId 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
      return addCorsHeaders(response);
    }

         const response = new Response(
       JSON.stringify({
         name: chatbot.name || "AI Assistant",
         description: chatbot.description || "AI-powered assistant",
         widgetConfig: chatbot.widgetConfig || {
           primaryColor: "#3b82f6",
           position: "bottom-right",
           welcomeMessage: "Hi! How can I help you today?",
           placeholder: "Type your message...",
           showBranding: true,
           borderRadius: 16,
           fontFamily: "system-ui",
         },
         success: true
       }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Chatbot endpoint error:", error);
    
    const response = new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: "Failed to get chatbot information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );

    return addCorsHeaders(response);
  }
});

// Create the HTTP router
const http = httpRouter();

// Register routes with CORS support
http.route({
  path: "/api/health",
  method: "GET",
  handler: healthCheck,
});

http.route({
  path: "/api/health",
  method: "OPTIONS",
  handler: healthCheck,
});

http.route({
  path: "/api/chat",
  method: "POST",
  handler: chatEndpoint,
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: chatEndpoint,
});

http.route({
  path: "/api/chatbot/*",
  method: "GET",
  handler: chatbotEndpoint,
});

http.route({
  path: "/api/chatbot/*",
  method: "OPTIONS", 
  handler: chatbotEndpoint,
});

// Widget-specific routes (alternative paths)
http.route({
  path: "/widget/health",
  method: "GET",
  handler: healthCheck,
});

http.route({
  path: "/widget/health",
  method: "OPTIONS",
  handler: healthCheck,
});

http.route({
  path: "/widget/chat",
  method: "POST",
  handler: chatEndpoint,
});

http.route({
  path: "/widget/chat",
  method: "OPTIONS",
  handler: chatEndpoint,
});

http.route({
  path: "/widget/chatbot",
  method: "GET",
  handler: chatbotEndpoint,
});

http.route({
  path: "/widget/chatbot",
  method: "OPTIONS", 
  handler: chatbotEndpoint,
});

export default http;
