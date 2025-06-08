import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import { toast } from "sonner";

export function SuperAdmin() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if we have a valid session
  const isValidSession = useQuery(
    api.admin.verifyAdminSession, 
    sessionId ? { sessionId } : "skip"
  );

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem("adminSession");
    const storedExpires = localStorage.getItem("adminSessionExpires");
    
    if (storedSession && storedExpires) {
      const expiresAt = parseInt(storedExpires);
      if (Date.now() < expiresAt) {
        setSessionId(storedSession);
      } else {
        // Session expired, clean up
        localStorage.removeItem("adminSession");
        localStorage.removeItem("adminSessionExpires");
      }
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // If we have a session but it's invalid, clean up
    if (sessionId && isValidSession === false) {
      localStorage.removeItem("adminSession");
      localStorage.removeItem("adminSessionExpires");
      setSessionId(null);
      toast.error("Session expired. Please login again.");
    }
  }, [sessionId, isValidSession]);

  const handleLogin = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  const handleLogout = () => {
    setSessionId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a valid session, show the dashboard
  if (sessionId && isValidSession === true) {
    return <AdminDashboard sessionId={sessionId} onLogout={handleLogout} />;
  }

  // Otherwise show the login form
  return <AdminLogin onLogin={handleLogin} />;
} 