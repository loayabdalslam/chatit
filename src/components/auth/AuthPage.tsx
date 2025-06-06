import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

interface AuthPageProps {
  onSuccess?: () => void;
  onBackToHome?: () => void;
  initialMode?: "login" | "signup";
}

export function AuthPage({ onSuccess, onBackToHome, initialMode = "login" }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">(initialMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-600">Chatit</h1>
          </div>
        </div>

        {/* Back to Home Link */}
        {onBackToHome && (
          <div className="text-center mb-6">
            <button
              onClick={onBackToHome}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium hover:underline"
            >
              ← Back to homepage
            </button>
          </div>
        )}
      </div>

      {/* Auth Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200">
          {/* Mode Tabs */}
          <div className="flex mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                authMode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                authMode === "signup"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Forms */}
          <div className="transition-all duration-300 ease-in-out">
            {authMode === "login" ? (
              <LoginForm
                onSwitchToSignup={() => setAuthMode("signup")}
                onSuccess={onSuccess}
              />
            ) : (
              <SignupForm
                onSwitchToLogin={() => setAuthMode("login")}
                onSuccess={onSuccess}
              />
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Secure authentication powered by{" "}
            <span className="font-medium text-blue-600">Convex Auth</span>
          </p>
        </div>
      </div>
    </div>
  );
} 