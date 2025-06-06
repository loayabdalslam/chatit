import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onSwitchToSignup?: () => void;
  onSuccess?: () => void;
}

export function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const formDataObj = new FormData();
      formDataObj.set("email", formData.email);
      formDataObj.set("password", formData.password);
      formDataObj.set("flow", "signIn");

      await signIn("password", formDataObj);
      toast.success("Welcome back! Successfully signed in.");
      onSuccess?.();
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Failed to sign in. Please try again.";
      
      if (error.message?.includes("Invalid password")) {
        errorMessage = "Invalid password. Please check your password and try again.";
      } else if (error.message?.includes("User not found")) {
        errorMessage = "No account found with this email. Please sign up first.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-600">Sign in to continue to your dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`auth-input-field pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter your email"
              disabled={submitting}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`auth-input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter your password"
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="auth-button"
        >
          {submitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center my-6">
          <hr className="flex-1 border-gray-200" />
          <span className="mx-4 text-sm text-gray-500">or</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* Anonymous Sign In */}
        <button
          type="button"
          onClick={() => {
            setSubmitting(true);
            signIn("anonymous")
              .then(() => {
                toast.success("Signed in anonymously");
                onSuccess?.();
              })
              .catch((error) => {
                console.error("Anonymous sign in error:", error);
                toast.error("Failed to sign in anonymously");
              })
              .finally(() => setSubmitting(false));
          }}
          disabled={submitting}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Continue as Guest
        </button>

        {/* Switch to Signup */}
        {onSwitchToSignup && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
} 