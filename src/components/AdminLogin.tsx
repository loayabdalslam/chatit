import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AdminLoginProps {
  onLogin: (sessionId: string) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const adminLogin = useMutation(api.admin.adminLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error("Please enter the admin password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await adminLogin({ password });
      
      if (result.success && result.sessionId) {
        toast.success("Welcome, Super Admin!");
        onLogin(result.sessionId);
        
        // Store session in localStorage
        localStorage.setItem("adminSession", result.sessionId);
        if (result.expiresAt) {
          localStorage.setItem("adminSessionExpires", result.expiresAt.toString());
        }
      } else {
        toast.error("Invalid password. Access denied.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-600">
            <span className="text-white text-2xl font-bold">🛡️</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Super Admin Access
          </h2>
          <p className="mt-2 text-gray-600">
            Enter the super admin password to access the dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              placeholder="Enter super admin password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Authenticating...
              </div>
            ) : (
              "Access Admin Dashboard"
            )}
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              This is a restricted area. Unauthorized access is prohibited.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 