import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface WidgetGeneratorProps {
  chatbotId: Id<"chatbots">;
  onBack?: () => void;
}

interface WidgetConfig {
  primaryColor: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size: "small" | "medium" | "large";
  welcomeMessage: string;
  placeholder: string;
  showBranding: boolean;
  borderRadius: number;
  fontFamily: string;
  animation: "none" | "bounce" | "pulse" | "shake";
}

type TabType = "customize" | "preview" | "test" | "code";

// Reusable chat icon component to avoid duplication
const ChatIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3 16.31L2 22L7.69 21C8.99 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="currentColor" opacity="0.9"/>
    <circle cx="8" cy="12" r="1.5" fill="white"/>
    <circle cx="12" cy="12" r="1.5" fill="white"/>
    <circle cx="16" cy="12" r="1.5" fill="white"/>
  </svg>
);

export function WidgetGenerator({ chatbotId, onBack }: WidgetGeneratorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("customize");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [config, setConfig] = useState<WidgetConfig>({
    primaryColor: "#2563eb",
    position: "bottom-right",
    size: "medium",
    welcomeMessage: "Hi! How can I help you today?",
    placeholder: "Type your message...",
    showBranding: true,
    borderRadius: 12,
    fontFamily: "system-ui",
    animation: "bounce"
  });

  const [testMessages, setTestMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);
  const [testInput, setTestInput] = useState("");
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testConversationId, setTestConversationId] = useState<Id<"conversations"> | null>(null);

  const chatbot = useQuery(api.chatbots.get, { id: chatbotId });
  const saveWidgetConfig = useMutation(api.widgets.saveConfig);
  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.conversations.sendMessage);
  const conversationMessages = useQuery(
    api.conversations.getMessages,
    testConversationId ? { conversationId: testConversationId } : "skip"
  );

  useEffect(() => {
    if (chatbot?.widgetConfig) {
      if (chatbot.widgetConfig) {
        const widgetConfig = chatbot.widgetConfig;
        setConfig(prev => ({ 
          ...prev, 
          ...widgetConfig,
          position: (widgetConfig.position as "bottom-right" | "bottom-left" | "top-right" | "top-left") || prev.position,
          size: (widgetConfig.size as "small" | "medium" | "large") || prev.size,
          animation: (widgetConfig.animation as "none" | "bounce" | "pulse" | "shake") || prev.animation
        }));
      }
    }
    if (chatbot?.name) {
      setConfig(prev => ({
        ...prev,
        welcomeMessage: `Hi! I'm ${chatbot.name}. How can I help you today?`
      }));
    }
  }, [chatbot]);

  // Update test messages when conversation messages change
  useEffect(() => {
    if (conversationMessages) {
      const formattedMessages = conversationMessages.map(msg => ({
        id: msg._id,
        text: msg.content,
        isUser: msg.role === "user"
      }));
      setTestMessages(formattedMessages);
      setIsTestLoading(false);
    }
  }, [conversationMessages]);

  const handleConfigChange = (key: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async () => {
    try {
      await saveWidgetConfig({ 
        chatbotId, 
        config: {
          ...config,
          theme: "light" as const
        }
      });
      toast.success("Widget configuration saved!");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  const initializeTestChat = async () => {
    try {
      const conversationId = await createConversation({
        chatbotId,
        title: "Widget Test Chat"
      });
      setTestConversationId(conversationId);
    } catch (error) {
      toast.error("Failed to initialize test chat");
    }
  };

  const handleTestMessage = async () => {
    if (!testInput.trim()) return;

    // Initialize conversation if not exists
    if (!testConversationId) {
      await initializeTestChat();
      return;
    }

    setIsTestLoading(true);
    
    try {
      await sendMessage({
        conversationId: testConversationId,
        content: testInput
      });
      setTestInput("");
    } catch (error) {
      toast.error("Failed to send message");
      setIsTestLoading(false);
    }
  };





  const generateWidgetCode = () => {
    const baseUrl = window.location.origin;
    
    // Generate clean data attributes for configuration (only include non-default values)
    const dataAttributes = [
      `data-chatit-widget="${chatbotId}"`,
      config.primaryColor !== "#2563eb" ? `data-primary-color="${config.primaryColor}"` : "",
      config.position !== "bottom-right" ? `data-position="${config.position}"` : "",
      config.size !== "medium" ? `data-size="${config.size}"` : "",
      config.welcomeMessage !== "Hi! How can I help you today?" ? `data-welcome-message="${config.welcomeMessage}"` : "",
      config.placeholder !== "Type your message..." ? `data-placeholder="${config.placeholder}"` : "",
      !config.showBranding ? `data-show-branding="false"` : "",
      config.borderRadius !== 12 ? `data-border-radius="${config.borderRadius}"` : "",
      config.fontFamily !== "system-ui" ? `data-font-family="${config.fontFamily}"` : "",
      config.animation !== "bounce" ? `data-animation="${config.animation}"` : ""
    ].filter(attr => attr).join('\n     ');

    return `<div ${dataAttributes}>
</div>
<script src="${baseUrl}/widget.js"></script>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard!");
  };

  if (!chatbot) {
    return <div>Loading...</div>;
  }

  const tabs = [
    { id: "customize", label: " Customize", icon: "🎨" },
    { id: "preview", label: "Preview", icon: "👁️" },
    { id: "test", label: "Test Chat", icon: "🧪" },
    { id: "code", label: "Get Widget", icon: "📦" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Widget Generator</h2>
          <p className="text-gray-600">Customize and embed your chatbot widget</p>
          <p className="text-sm text-gray-500 mt-1">Chatbot: {chatbot.name}</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            ← Back to Chatbots
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Tabs and Content */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Customize Tab */}
            {activeTab === "customize" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Customization</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => handleConfigChange("primaryColor", e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={(e) => handleConfigChange("primaryColor", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <select
                        value={config.position}
                        onChange={(e) => handleConfigChange("position", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                      <select
                        value={config.size}
                        onChange={(e) => handleConfigChange("size", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Animation</label>
                      <select
                        value={config.animation}
                        onChange={(e) => handleConfigChange("animation", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">None</option>
                        <option value="bounce">Bounce</option>
                        <option value="pulse">Pulse</option>
                        <option value="shake">Shake</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={config.borderRadius}
                        onChange={(e) => handleConfigChange("borderRadius", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{config.borderRadius}px</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                      <select
                        value={config.fontFamily}
                        onChange={(e) => handleConfigChange("fontFamily", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="system-ui">System UI</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                    <input
                      type="text"
                      value={config.welcomeMessage}
                      onChange={(e) => handleConfigChange("welcomeMessage", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Input Placeholder</label>
                    <input
                      type="text"
                      value={config.placeholder}
                      onChange={(e) => handleConfigChange("placeholder", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showBranding"
                      checked={config.showBranding}
                      onChange={(e) => handleConfigChange("showBranding", e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="showBranding" className="text-sm font-medium text-gray-700">
                      Show "Powered by chatit.cloud" branding
                    </label>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === "preview" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
                
                <div className="bg-gray-100 p-6 rounded-lg min-h-96 relative">
                  <p className="text-gray-600 mb-4">This is how your widget will appear on your website:</p>
                  
                  {/* Mock website background */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-h-80 relative">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Your Website</h4>
                    <p className="text-gray-600 mb-4">Widget preview with real-time updates</p>
                    <div className="space-y-2 text-gray-500">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>

                    {/* Widget Preview */}
                    <div
                      className={`absolute ${
                        config.position.includes('bottom') ? 'bottom-4' : 'top-4'
                      } ${
                        config.position.includes('right') ? 'right-4' : 'left-4'
                      } z-50`}
                      style={{ fontFamily: config.fontFamily }}
                    >
                      {/* Chat Button */}
                      <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`${
                          config.size === 'small' ? 'w-12 h-12 text-lg' :
                          config.size === 'large' ? 'w-16 h-16 text-2xl' :
                          'w-14 h-14 text-xl'
                        } rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
                          config.animation === 'bounce' ? 'animate-bounce' :
                          config.animation === 'pulse' ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: config.primaryColor,
                          borderRadius: `${config.borderRadius}px`,
                          animation: config.animation === 'shake' ? 'shake 0.5s ease-in-out infinite alternate' : undefined
                        }}
                      >
                        <ChatIcon size={24} />
                      </button>

                      {/* Chat Window */}
                      {isChatOpen && (
                        <div
                          className={`absolute ${
                            config.position.includes('bottom') ? 'bottom-16' : 'top-16'
                          } ${
                            config.position.includes('right') ? 'right-0' : 'left-0'
                          } w-80 h-96 shadow-xl flex flex-col overflow-hidden bg-white`}
                          style={{ borderRadius: `${config.borderRadius}px` }}
                        >
                          {/* Header */}
                          <div
                            className="p-4 text-white font-semibold flex justify-between items-center"
                            style={{ backgroundColor: config.primaryColor }}
                          >
                            <span>{config.welcomeMessage}</span>
                            <button
                              onClick={() => setIsChatOpen(false)}
                              className="text-white hover:text-gray-200"
                            >
                              ×
                            </button>
                          </div>

                          {/* Messages */}
                          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                            <div className="text-left mb-3">
                              <div className="inline-block p-2 rounded-lg max-w-xs bg-gray-200 text-gray-800">
                                {config.welcomeMessage}
                              </div>
                            </div>
                          </div>

                          {/* Input */}
                          <div className="p-4 border-t border-gray-200 bg-white">
                            <input
                              type="text"
                              placeholder={config.placeholder}
                              className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {config.showBranding && (
                            <div className="px-4 py-2 text-xs text-center text-gray-500">
                              Powered by <a href="https://chatit.cloud" target="_blank" className="text-blue-600 hover:underline">chatit.cloud</a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Chat Tab */}
            {activeTab === "test" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Test Your Chatbot</h3>
                  <div className="flex gap-2">
                    {!testConversationId && (
                      <button
                        onClick={initializeTestChat}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Start Test Chat
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setTestMessages([]);
                        setTestConversationId(null);
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Clear Chat
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg h-96 flex flex-col">
                  {/* Chat Header */}
                  <div
                    className="p-4 text-white font-semibold"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {config.welcomeMessage}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {testMessages.length === 0 && !testConversationId && (
                      <div className="text-center text-gray-500 mt-8">
                        Click "Start Test Chat" to begin testing your chatbot
                      </div>
                    )}
                    
                    {testMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 ${message.isUser ? 'text-right' : 'text-left'}`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg max-w-xs ${
                            message.isUser
                              ? 'text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                          style={message.isUser ? { backgroundColor: config.primaryColor } : {}}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                    
                    {isTestLoading && (
                      <div className="text-left mb-3">
                        <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                        placeholder={config.placeholder}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isTestLoading || !testConversationId}
                      />
                      <button
                        onClick={handleTestMessage}
                        disabled={!testInput.trim() || isTestLoading || !testConversationId}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === "code" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Widget Embed Code</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-gray-800">Copy and paste this code into your website</h4>
                    <button
                      onClick={() => copyToClipboard(generateWidgetCode())}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Copy Code
                    </button>
                  </div>
                  
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-64">
                    <pre className="text-xs">
                      <code>{generateWidgetCode()}</code>
                    </pre>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">🎯 Clean Widget Integration Features</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                      <li>Simple data-attribute configuration</li>
                      <li>Clean HTML with no complex scripts or API keys</li>
                      <li>Universal compatibility - works on any website</li>
                      <li>Automatic configuration detection from data attributes</li>
                      <li>CORS-free integration using your domain</li>
                      <li>Lightweight and fast loading</li>
                      <li>No iframe complexity or messaging</li>
                      <li>Responsive design optimized for all devices</li>
                      <li>Secure OpenAI integration on the backend</li>
                      <li>Professional appearance with smooth animations</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">📋 Installation Instructions</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                    <li>Copy the clean widget embed code above</li>
                    <li>Paste it into your website's HTML, preferably before the closing &lt;/body&gt; tag</li>
                    <li>The widget will automatically initialize and appear on your website</li>
                    <li>All configuration is handled through data attributes - no complex setup required</li>
                    <li>Test the widget to ensure it's working correctly</li>
                  </ol>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">🔒 Security & Integration</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                    <li>Secure backend integration with OpenAI GPT-4</li>
                    <li>No API keys or sensitive data exposed to frontend</li>
                    <li>CORS-enabled for universal website embedding</li>
                    <li>Data attributes provide clean configuration</li>
                    <li>Session-based conversation tracking</li>
                    <li>Intelligent fallback responses when needed</li>
                    <li>Real-time sentiment analysis and analytics</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Live Preview (Always Visible) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Real-time Preview</h3>
          
          <div className="bg-gray-100 p-4 rounded-lg min-h-80 relative">
            <p className="text-sm text-gray-600 mb-4">Live preview updates as you change settings</p>
            
            {/* Mock website background */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 min-h-64 relative">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Your Website</h4>
              <div className="space-y-2 text-gray-500">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>

              {/* Widget Preview */}
              <div
                className={`absolute ${
                  config.position.includes('bottom') ? 'bottom-2' : 'top-2'
                } ${
                  config.position.includes('right') ? 'right-2' : 'left-2'
                } z-50`}
                style={{ fontFamily: config.fontFamily }}
              >
                {/* Chat Button */}
                <button
                  className={`${
                    config.size === 'small' ? 'w-8 h-8 text-sm' :
                    config.size === 'large' ? 'w-12 h-12 text-lg' :
                    'w-10 h-10 text-base'
                  } rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
                    config.animation === 'bounce' ? 'animate-bounce' :
                    config.animation === 'pulse' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: config.primaryColor,
                    borderRadius: `${config.borderRadius}px`,
                    animation: config.animation === 'shake' ? 'shake 0.5s ease-in-out infinite alternate' : undefined
                  }}
                >
                  <ChatIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Settings</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Position: <span className="font-medium">{config.position}</span></div>
              <div>Size: <span className="font-medium">{config.size}</span></div>
              <div>Animation: <span className="font-medium">{config.animation}</span></div>
              <div>Border Radius: <span className="font-medium">{config.borderRadius}px</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          100% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
