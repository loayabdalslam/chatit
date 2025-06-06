import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Check, X } from "lucide-react";

interface SignupFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export function SignupForm({ onSwitchToLogin, onSuccess }: SignupFormProps) {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRequirements = [
    { test: (pwd: string) => pwd.length >= 8, label: "At least 8 characters" },
    { test: (pwd: string) => /[A-Z]/.test(pwd), label: "One uppercase letter" },
    { test: (pwd: string) => /[a-z]/.test(pwd), label: "One lowercase letter" },
    { test: (pwd: string) => /\d/.test(pwd), label: "One number" },
    { test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), label: "One special character" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const failedRequirements = passwordRequirements.filter(req => !req.test(formData.password));
      if (failedRequirements.length > 0) {
        newErrors.password = "Password doesn't meet all requirements";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      formDataObj.set("name", formData.name.trim());
      formDataObj.set("flow", "signUp");

      await signIn("password", formDataObj);
      toast.success("Account created successfully! Welcome to Chatit.");
      onSuccess?.();
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.message?.includes("already exists") || error.message?.includes("already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error.message?.includes("invalid email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message?.includes("weak password")) {
        errorMessage = "Password is too weak. Please choose a stronger password.";
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

  const getPasswordStrength = (password: string) => {
    const passedRequirements = passwordRequirements.filter(req => req.test(password)).length;
    if (passedRequirements === 0) return { strength: 0, label: "" };
    if (passedRequirements <= 2) return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (passedRequirements <= 3) return { strength: 2, label: "Fair", color: "bg-yellow-500" };
    if (passedRequirements <= 4) return { strength: 3, label: "Good", color: "bg-blue-500" };
    return { strength: 4, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
        <p className="text-gray-600">Join Chatit and start building amazing chatbots</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`auth-input-field pl-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter your full name"
              disabled={submitting}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

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
              placeholder="Create a secure password"
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password strength:</span>
                <span className={`text-xs font-medium ${
                  passwordStrength.strength === 4 ? 'text-green-600' :
                  passwordStrength.strength === 3 ? 'text-blue-600' :
                  passwordStrength.strength === 2 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center text-xs">
                  {req.test(formData.password) ? (
                    <Check className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <X className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={req.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className={`auth-input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Confirm your password"
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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
              Creating account...
            </div>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Terms and Privacy */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Switch to Login */}
        {onSwitchToLogin && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
} 