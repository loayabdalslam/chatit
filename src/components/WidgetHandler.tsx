import { useEffect, useState } from "react";
import { WidgetPage } from "./WidgetPage";
import { Id } from "../../convex/_generated/dataModel";

interface WidgetHandlerProps {
  chatbotId: string;
}

export function WidgetHandler({ chatbotId }: WidgetHandlerProps) {
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
    if (chatbotId) {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Decode URL parameters that may be encoded
      const decodeParam = (param: string | null) => {
        if (!param) return null;
        try {
          return decodeURIComponent(param);
        } catch {
          return param;
        }
      };

      setWidgetConfig({
        chatbotId: chatbotId as Id<"chatbots">,
        primaryColor: decodeParam(urlParams.get('primaryColor')) || '#2563eb',
        position: urlParams.get('position') || 'bottom-right',
        size: urlParams.get('size') || 'medium',
        welcomeMessage: decodeParam(urlParams.get('welcomeMessage')) || 'Hi! How can I help you today?',
        placeholder: decodeParam(urlParams.get('placeholder')) || 'Type your message...',
        showBranding: urlParams.get('showBranding') !== 'false',
        borderRadius: parseInt(urlParams.get('borderRadius') || '12'),
        fontFamily: urlParams.get('fontFamily') || 'system-ui',
        animation: urlParams.get('animation') || 'bounce',
        apiKey: urlParams.get('apiKey') || ''
      });
    }
  }, [chatbotId]);

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