import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Type definition for widget configuration
type WidgetConfig = {
  primaryColor: string;
  position: string;
  size: string;
  welcomeMessage: string;
  placeholder: string;
  showBranding: boolean;
  borderRadius: number;
  fontFamily: string;
  animation: string;
  theme: string;
};

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

      const defaultWidgetConfig: WidgetConfig = {
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
      
      if (!chatbotId || !message || !sessionId) {
        return new Response(JSON.stringify({ 
          error: "Missing required fields: chatbotId, message, sessionId" 
        }), {
          status: 400,
          headers: getCorsHeaders(),
        });
      }
      
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

// Widget embed endpoint - returns HTML/JS for embedding
http.route({
  path: "/api/embed/:chatbotId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const chatbotId = url.pathname.split('/').pop();
      
      if (!chatbotId) {
        return new Response("Chatbot ID is required", { 
          status: 400,
          headers: { "Content-Type": "text/plain" }
        });
      }

      // Get chatbot details
      const chatbot = await ctx.runQuery(internal.chatbots.getPublicInfo, {
        chatbotId: chatbotId as any,
      });

      if (!chatbot) {
        return new Response("Chatbot not found", { 
          status: 404,
          headers: { "Content-Type": "text/plain" }
        });
      }

      const defaultWidgetConfig: WidgetConfig = {
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

      const widgetConfig: WidgetConfig = { ...defaultWidgetConfig, ...chatbot.widgetConfig };
      const embedCode = `
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${url.origin}/widget.js';
  script.setAttribute('data-chatbot-id', '${chatbotId}');
  script.setAttribute('data-api-url', '${url.origin}');
  script.setAttribute('data-chatbot-name', '${chatbot.name}');
  script.setAttribute('data-primary-color', '${widgetConfig.primaryColor || '#2563eb'}');
  script.setAttribute('data-position', '${widgetConfig.position || 'bottom-right'}');
  script.setAttribute('data-size', '${widgetConfig.size || 'medium'}');
  script.setAttribute('data-welcome-message', '${widgetConfig.welcomeMessage || `Hi! I'm ${chatbot.name}. How can I help you today?`}');
  script.setAttribute('data-placeholder', '${widgetConfig.placeholder || 'Type your message...'}');
  script.setAttribute('data-show-branding', '${widgetConfig.showBranding !== false}');
  script.setAttribute('data-border-radius', '${widgetConfig.borderRadius || 12}');
  script.setAttribute('data-font-family', '${widgetConfig.fontFamily || 'system-ui'}');
  script.setAttribute('data-animation', '${widgetConfig.animation || 'bounce'}');
  script.setAttribute('data-theme', '${widgetConfig.theme || 'light'}');
  document.head.appendChild(script);
})();
</script>`;

      return new Response(embedCode, {
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Embed API error:", error);
      return new Response("Failed to generate embed code", { 
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }),
});

// Universal CORS preflight handler
http.route({
  path: "/api/*",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(),
    });
  }),
});

// Legacy CORS handler for /api/chat
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
