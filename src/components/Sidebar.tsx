import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type Page = 
  | "landing"
  | "auth"
  | "dashboard" 
  | "chatbots" 
  | "create-chatbot" 
  | "edit-chatbot" 
  | "chat" 
  | "analytics" 
  | "subscription" 
  | "admin" 
  | "admin-setup"
  | "widget"
  | "detailed-dashboard"
  | "reports"
  | "conversations"
  | "referrals";

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onViewConversations: (chatbotId?: Id<"chatbots">) => void;
  onViewReports: (chatbotId?: Id<"chatbots">) => void;
  adminInfo: any;
  user: any;
  onSignOut: () => void;
}

export function Sidebar({ 
  currentPage, 
  onPageChange, 
  onViewConversations, 
  onViewReports, 
  adminInfo, 
  user, 
  onSignOut 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const chatbots = useQuery(api.chatbots.list) || [];

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "chatbots", label: "Chatbots", icon: "🤖" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "referrals", label: "Referrals", icon: "🎁" },
    { id: "subscription", label: "Subscription", icon: "💳" },
  ];

  const quickActions = [
    { 
      label: "All Conversations", 
      icon: "💬", 
      onClick: () => onViewConversations() 
    },
    { 
      label: "All Reports", 
      icon: "📋", 
      onClick: () => onViewReports() 
    },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-blue-600">Chatit</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <span className="text-lg mr-3">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Chatbots */}
        {!isCollapsed && chatbots.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recent Chatbots
            </h3>
            <div className="space-y-2">
              {chatbots.slice(0, 3).map((chatbot) => (
                <button
                  key={chatbot._id}
                  onClick={() => onViewConversations(chatbot._id)}
                  className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <span className="text-lg mr-3">🤖</span>
                  <span className="truncate">{chatbot.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {adminInfo && !isCollapsed && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Admin
            </h3>
            <button
              onClick={() => onPageChange("admin")}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === "admin"
                  ? "bg-red-100 text-red-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-lg mr-3">⚙️</span>
              <span>Admin Panel</span>
            </button>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Sign out"
            >
              <span className="text-gray-400">🚪</span>
            </button>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={onSignOut}
            className="w-full p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <span className="text-gray-400">🚪</span>
          </button>
        )}
      </div>
    </div>
  );
}
