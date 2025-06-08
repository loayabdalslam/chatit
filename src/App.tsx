import { useState, useEffect } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { ChatItLandingPage } from "./ChatItLandingPage";
import { Dashboard } from "./Dashboard";
import { ChatbotList } from "./ChatbotList";
import { ChatbotForm } from "./ChatbotForm";
import { ChatInterface } from "./ChatInterface";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { SubscriptionManager } from "./SubscriptionManager";
import { AdminDashboard } from "./AdminDashboard";
import { AdminSetup } from "./AdminSetup";
import { WidgetGenerator } from "./WidgetGenerator";
import { WidgetHandler } from "./components/WidgetHandler";
import { DetailedDashboard } from "./components/DetailedDashboard";
import { ReportGenerator } from "./components/ReportGenerator";
import { ConversationHistory } from "./components/ConversationHistory";
import { ReferralsDashboard } from "./components/ReferralsDashboard";
import { ContactUs } from "./components/ContactUs";
import { SuperAdmin } from "./components/SuperAdmin";
import { Sidebar } from "./components/Sidebar";
import { MessageLimitBanner } from "./components/MessageLimitBanner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { usePageTracking } from "./hooks/usePageTracking";
import { Id } from "../convex/_generated/dataModel";
import { Toaster } from "sonner";

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
  | "referrals"
  | "contact"
  | "super-admin";

// Check if we're in widget mode - handle both /widget/ID and just /ID patterns
const checkWidgetRoute = () => {
  const path = window.location.pathname;
  
  // Handle /widget/chatbotId pattern
  if (path.startsWith('/widget/')) {
    return {
      isWidget: true,
      chatbotId: path.split('/widget/')[1]
    };
  }
  
  // Handle direct chatbot ID pattern (like the URL you provided)
  const pathSegments = path.split('/').filter(Boolean);
  if (pathSegments.length === 1 && pathSegments[0].length > 10) {
    // Looks like a chatbot ID (long string)
    return {
      isWidget: true,
      chatbotId: pathSegments[0]
    };
  }
  
  return { isWidget: false, chatbotId: null };
};

// Check for special routes
const checkSpecialRoutes = (): Page => {
  const path = window.location.pathname;
  
  if (path === '/contact' || path === '/contact-us') {
    return 'contact';
  }
  
  if (path === '/admin' || path === '/super-admin') {
    return 'super-admin';
  }
  
  return 'landing';
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // Initialize page based on URL
    const specialRoute = checkSpecialRoutes();
    return specialRoute;
  });
  const [selectedChatbotId, setSelectedChatbotId] = useState<Id<"chatbots"> | null>(null);
  const [editingChatbotId, setEditingChatbotId] = useState<Id<"chatbots"> | null>(null);

  const user = useQuery(api.auth.loggedInUser);
  const adminInfo = useQuery(api.admin.getAdminInfo);
  const { signOut } = useAuthActions();

  const { isWidget, chatbotId: widgetChatbotId } = checkWidgetRoute();
  
  // Track page visits for analytics
  usePageTracking(currentPage);

  useEffect(() => {
    if (user && (currentPage === "auth" || currentPage === "landing")) {
      setCurrentPage("dashboard");
    }
  }, [user, currentPage]);

  const handleEditChatbot = (chatbotId: Id<"chatbots">) => {
    setEditingChatbotId(chatbotId);
    setCurrentPage("edit-chatbot");
  };

  const handleChatWithBot = (chatbotId: Id<"chatbots">) => {
    setSelectedChatbotId(chatbotId);
    setCurrentPage("chat");
  };

  const handleViewWidget = (chatbotId: Id<"chatbots">) => {
    setSelectedChatbotId(chatbotId);
    setCurrentPage("widget");
  };

  const handleViewDetails = (chatbotId: Id<"chatbots">) => {
    setSelectedChatbotId(chatbotId);
    setCurrentPage("detailed-dashboard");
  };

  const handleViewReports = (chatbotId?: Id<"chatbots">) => {
    setSelectedChatbotId(chatbotId || null);
    setCurrentPage("reports");
  };

  const handleViewConversations = (chatbotId?: Id<"chatbots">) => {
    setSelectedChatbotId(chatbotId || null);
    setCurrentPage("conversations");
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage("landing");
  };

  const renderContent = () => {
    switch (currentPage) {
      case "landing":
        return <ChatItLandingPage 
          onGetStarted={() => setCurrentPage("auth")}
          onSignUp={() => setCurrentPage("auth")}
        />;
      case "auth":
        return <SignInForm onSuccess={() => setCurrentPage("dashboard")} />;
      case "dashboard":
        return <Dashboard />;
      case "detailed-dashboard":
        return <DetailedDashboard chatbotId={selectedChatbotId || undefined} />;
      case "reports":
        return <ReportGenerator chatbotId={selectedChatbotId || undefined} />;
      case "conversations":
        return <ConversationHistory chatbotId={selectedChatbotId || undefined} />;
      case "chatbots":
        return (
          <ChatbotList
            onSelectChatbot={handleEditChatbot}
            onCreateChatbot={() => setCurrentPage("create-chatbot")}
            onEditChatbot={handleEditChatbot}
            onChatWithBot={handleChatWithBot}
            onViewWidget={handleViewWidget}
            onViewDetails={handleViewDetails}
          />
        );
      case "create-chatbot":
        return (
          <ChatbotForm
            onSuccess={() => setCurrentPage("chatbots")}
            onCancel={() => setCurrentPage("chatbots")}
          />
        );
      case "edit-chatbot":
        return editingChatbotId ? (
          <ChatbotForm
            chatbotId={editingChatbotId}
            onSuccess={() => setCurrentPage("chatbots")}
            onCancel={() => setCurrentPage("chatbots")}
          />
        ) : null;
      case "chat":
        return selectedChatbotId ? (
          <ChatInterface
            chatbotId={selectedChatbotId}
            onBack={() => setCurrentPage("chatbots")}
          />
        ) : null;
      case "widget":
        return selectedChatbotId ? (
          <WidgetGenerator 
            chatbotId={selectedChatbotId}
            onBack={() => setCurrentPage("chatbots")}
          />
        ) : null;
      case "analytics":
        return <AnalyticsDashboard chatbotId={selectedChatbotId} />;
      case "subscription":
        return <SubscriptionManager />;
      case "admin":
        return <AdminDashboard />;
      case "admin-setup":
        return <AdminSetup onComplete={() => setCurrentPage("admin")} />;
      case "referrals":
        return <ReferralsDashboard />;
      case "contact":
        return <ContactUs />;
      case "super-admin":
        return <SuperAdmin />;
      default:
        return <Dashboard />;
    }
  };

  // Render widget outside authentication wrapper
  if (isWidget && widgetChatbotId) {
    return <WidgetHandler chatbotId={widgetChatbotId} />;
  }

  // Render special pages outside authentication wrapper  
  if (currentPage === "contact") {
    return <ContactUs />;
  }
  
  if (currentPage === "super-admin") {
    return <SuperAdmin />;
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <Unauthenticated>
        {currentPage === "landing" ? (
          <ChatItLandingPage 
            onGetStarted={() => setCurrentPage("auth")}
            onSignUp={() => setCurrentPage("auth")}
          />
        ) : currentPage === "auth" ? (
          <SignInForm onSuccess={() => setCurrentPage("dashboard")} />
        ) : (
          <SignInForm onSuccess={() => setCurrentPage("dashboard")} />
        )}
      </Unauthenticated>
      
      <Authenticated>
        <div className="flex h-screen">
          <Sidebar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onViewConversations={handleViewConversations}
            onViewReports={handleViewReports}
            adminInfo={adminInfo}
            user={user}
            onSignOut={handleSignOut}
          />
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <MessageLimitBanner />
              {renderContent()}
            </div>
          </div>
        </div>
      </Authenticated>
      
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
