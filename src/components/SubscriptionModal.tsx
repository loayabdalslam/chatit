import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
}

export function SubscriptionModal({ isOpen, onClose, selectedPlan }: SubscriptionModalProps) {
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const requestUpgrade = useMutation(api.subscriptions.requestUpgrade);
  const generateUploadUrl = useMutation(api.subscriptions.generateUploadUrl);

  if (!isOpen) return null;

  const planNames: Record<string, string> = {
    "class-c": "Basic",
    "class-b": "Professional", 
    "class-a": "Enterprise"
  };

  const planPrices: Record<string, string> = {
    "class-c": "1000 EGP",
    "class-b": "5000 EGP",
    "class-a": "20000 EGP"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentScreenshot) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload payment screenshot
      const uploadUrl = await generateUploadUrl();
      
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": paymentScreenshot.type },
        body: paymentScreenshot,
      });

      if (!result.ok) {
        throw new Error("Failed to upload screenshot");
      }

      const { storageId } = await result.json();

      // Submit upgrade request
      await requestUpgrade({
        plan: selectedPlan as "pro" | "enterprise",
        paymentScreenshotId: storageId,
      });

      toast.success("Upgrade request submitted! We'll review it within 24 hours.");
      onClose();
      setPaymentScreenshot(null);
    } catch (error) {
      console.error("Upgrade request error:", error);
      toast.error("Failed to submit upgrade request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Upgrade to {planNames[selectedPlan]}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Send {planPrices[selectedPlan]} to InstaPay: <strong>01211268396</strong></li>
              <li>Take a screenshot of the successful payment</li>
              <li>Upload the screenshot below</li>
              <li>Submit your upgrade request</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {paymentScreenshot && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {paymentScreenshot.name}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !paymentScreenshot}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
