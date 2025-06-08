const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://academic-mammoth-217.convex.site");

async function createDemoChatbot() {
  try {
    console.log("Creating demo chatbot...");
    
    const chatbotId = await client.mutation("chatbots:create", {
      name: "Demo Support Bot",
      description: "A helpful customer support chatbot powered by AI for demonstrations",
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
    });

    console.log(`✅ Demo chatbot created successfully!`);
    console.log(`🆔 Chatbot ID: ${chatbotId}`);
    console.log(`🔗 Test URL: http://localhost:5173/chat/${chatbotId}`);
    console.log(`📋 Widget HTML:`);
    console.log(`<div data-chatit-widget="${chatbotId}" data-primary-color="#e74c3c" data-position="bottom-right"></div>`);
    console.log(`<script src="http://localhost:5173/widget.js"></script>`);
    
    return chatbotId;
  } catch (error) {
    console.error("❌ Error creating demo chatbot:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createDemoChatbot()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { createDemoChatbot }; 