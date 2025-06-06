import { useEffect, useState } from "react";
import { WidgetPage } from "./WidgetPage";
import { Id } from "../../convex/_generated/dataModel";

export function WidgetHandler() {
  const [widgetConfig, setWidgetConfig] = useState<{
    chatbotId: Id<"chatbots"> | null;
    primaryColor: string;
    position: string;
    size: string;
    welcomeMessage: string;
    placeholder: string;
    showBranding: boolean;
    borderRadius: number;
    fontFamily: string;
    animation: string;
    apiKey: string;
  } | null>(null);

  useEffect(() => {
    // Check if we're in widget mode
    const pathParts = window.location.pathname.split('/');
    const isWidgetRoute = pathParts[1] === 'widget' && pathParts[2];
    
    if (isWidgetRoute) {
      const chatbotId = pathParts[2] as Id<"chatbots">;
      const urlParams = new URLSearchParams(window.location.search);
      
      setWidgetConfig({
        chatbotId,
        primaryColor: urlParams.get('primaryColor') || '#2563eb',
        position: urlParams.get('position') || 'bottom-right',
        size: urlParams.get('size') || 'medium',
        welcomeMessage: urlParams.get('welcomeMessage') || 'Hi! How can I help you today?',
        placeholder: urlParams.get('placeholder') || 'Type your message...',
        showBranding: urlParams.get('showBranding') !== 'false',
        borderRadius: parseInt(urlParams.get('borderRadius') || '12'),
        fontFamily: urlParams.get('fontFamily') || 'system-ui',
        animation: urlParams.get('animation') || 'bounce',
        apiKey: urlParams.get('apiKey') || ''
      });
    }
  }, []);

  if (!widgetConfig) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading widget...</p>
        </div>
      </div>
    );
  }

  return (
    <WidgetPage
      chatbotId={widgetConfig.chatbotId!}
      primaryColor={widgetConfig.primaryColor}
      position={widgetConfig.position}
      size={widgetConfig.size}
      welcomeMessage={widgetConfig.welcomeMessage}
      placeholder={widgetConfig.placeholder}
      showBranding={widgetConfig.showBranding}
      borderRadius={widgetConfig.borderRadius}
      fontFamily={widgetConfig.fontFamily}
      animation={widgetConfig.animation}
      apiKey={widgetConfig.apiKey}
    />
  );
} 