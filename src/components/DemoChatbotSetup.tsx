import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface DemoChatbotSetupProps {
  onChatbotCreated: (chatbotId: string) => void;
}

export function DemoChatbotSetup({ onChatbotCreated }: DemoChatbotSetupProps) {
  const [isCreating, setIsCreating] = useState(false);
  const createChatbot = useMutation(api.chatbots.create);

  const createDemoChatbot = async () => {
    setIsCreating(true);
    try {
      const chatbotId = await createChatbot({
        name: "Demo Support Bot",
        description: "A helpful customer support chatbot powered by OpenAI GPT-4 for demonstrations",
        instructions: `You are a friendly and helpful customer support assistant for ChatIt.cloud, an AI chatbot platform. Your role is to:

1. Greet users warmly and professionally
2. Answer questions about our chatbot platform and services
3. Help with integration, setup, and technical questions
4. Provide information about pricing and features
5. Assist with widget customization and embedding
6. If you don't know something specific, offer to connect them with our team

About ChatIt.cloud:
- We provide AI-powered chatbots that can be embedded on any website
- Our platform supports OpenAI GPT-4 integration for intelligent responses
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

      toast.success("Demo chatbot created successfully!");
      onChatbotCreated(chatbotId);
    } catch (error) {
      console.error("Error creating demo chatbot:", error);
      toast.error("Failed to create demo chatbot");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Set Up Demo Chatbot
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Create a pre-configured demo chatbot to test the widget system with realistic AI responses.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Demo Bot Features:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>✅ OpenAI GPT-4 powered intelligent responses</li>
            <li>✅ Professional tone with contextual understanding</li>
            <li>✅ Handles complex questions and conversations</li>
            <li>✅ Ready to embed on any website with CORS support</li>
            <li>✅ Real-time analytics and sentiment analysis</li>
          </ul>
        </div>

        <button
          onClick={createDemoChatbot}
          disabled={isCreating}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Demo Bot...
            </span>
          ) : (
            "Create Demo Chatbot"
          )}
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          This will create a fully functional chatbot that you can test immediately
        </p>
      </div>
    </div>
  );
} 