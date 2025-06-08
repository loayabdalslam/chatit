"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  
  const processSignupReferral = useMutation(api.referrals.processReferral);

  // Extract referral code from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && refCode.trim()) {
      setReferralCode(refCode.trim().toUpperCase());
      // Switch to sign up mode if a referral code is present
      setFlow("signUp");
      // Show a message to let user know referral code was detected
      toast.info(`Referral code "${refCode.toUpperCase()}" detected! Create your account to complete the referral.`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          setSubmitting(true);
    
    try {
          const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      if (!email || !password) {
        toast.error("Please fill in all fields");
        setSubmitting(false);
        return;
      }
      
          formData.set("flow", flow);
      
      const result = await signIn("password", formData);
      
      if (result) {
        // Success message first
        toast.success(flow === "signIn" ? "Welcome back!" : "Account created successfully!");
        
        // If signup with referral code, process the referral after a short delay
        if (flow === "signUp" && referralCode.trim()) {
          // Process referral after user is fully authenticated
          setTimeout(async () => {
            try {
              console.log("Processing referral with code:", referralCode.trim());
              await processSignupReferral({ referralCode: referralCode.trim() });
              toast.success("Referral processed! Your referrer will earn commissions from your subscriptions.");
            } catch (referralError: any) {
              console.error("Referral processing error:", referralError);
              if (referralError.message?.includes("Invalid referral code")) {
                toast.error("Invalid referral code detected.");
              } else if (referralError.message?.includes("already been referred")) {
                toast.warning("You've already been referred by someone else.");
            } else {
                toast.warning("Note: There was an issue processing your referral code.");
              }
            }
          }, 1000); // 1 second delay to ensure authentication is complete
        }
        
        // Clear URL parameters after successful signup
        if (flow === "signUp" && referralCode.trim()) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let toastTitle = "";
      
      if (error.message?.includes("Invalid password") || error.message?.includes("Invalid login")) {
        toastTitle = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("User not found")) {
        toastTitle = "Account not found. Did you mean to sign up?";
      } else if (error.message?.includes("User already exists")) {
        toastTitle = "Account already exists. Did you mean to sign in?";
      } else {
        toastTitle = flow === "signIn" 
          ? "Could not sign in. Please check your credentials."
          : "Could not create account. Please try again.";
      }
      
            toast.error(toastTitle);
            setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-black">
            <span className="text-white text-xl font-bold">C</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {flow === "signIn" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-2 text-gray-600">
            {flow === "signIn" 
              ? "Sign in to your ChatIt account" 
              : referralCode 
                ? "Complete your referral signup to ChatIt" 
                : "Join thousands of businesses using ChatIt"
            }
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
        <input
                id="email"
                name="email"
          type="email"
                autoComplete="email"
          required
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
        <input
                id="password"
                name="password"
          type="password"
                autoComplete={flow === "signIn" ? "current-password" : "new-password"}
          required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Enter your password"
              />
              {flow === "signUp" && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
            
            {flow === "signUp" && (
              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code <span className="text-gray-500">(Optional)</span>
                  {referralCode && <span className="text-green-600 ml-2">✓ Code detected from link</span>}
                </label>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                  placeholder="Enter referral code"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Have a referral code? Your referrer will earn 20% commission from your subscriptions!
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {flow === "signIn" ? "Signing in..." : "Creating account..."}
                </div>
              ) : (
                flow === "signIn" ? "Sign in" : "Create account"
              )}
        </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
                className="text-sm font-medium text-black hover:underline"
                onClick={() => {
                  setFlow(flow === "signIn" ? "signUp" : "signIn");
                  // Don't clear referral code when switching flows
                }}
          >
                {flow === "signIn" ? "Sign up here" : "Sign in instead"}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void signIn("anonymous")}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
              Try without account
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
