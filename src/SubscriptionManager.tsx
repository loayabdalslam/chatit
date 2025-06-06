import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SubscriptionModal } from "./components/SubscriptionModal";

export function SubscriptionManager() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  
  const subscription = useQuery(api.subscriptions.getCurrentSubscription);
  const pendingRequests = useQuery(api.subscriptions.getPendingRequests);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0 EGP",
      period: "forever",
      features: [
        "1 chatbot",
        "100 AI messages/month",
        "Basic analytics",
        "Community support",
        "Chatit branding required"
      ],
      current: subscription?.plan === "free",
      popular: false
    },
    {
      id: "class-c",
      name: "Basic",
      price: "1000 EGP",
      period: "per month",
      features: [
        "Up to 3 chatbots",
        "2,000 AI message credits/month",
        "Advanced analytics",
        "Email support",
        "No branding required",
        "Priority support"
      ],
      current: subscription?.plan === "class-c",
      popular: true
    },
    {
      id: "class-b",
      name: "Professional",
      price: "5000 EGP",
      period: "per month",
      features: [
        "Up to 10 chatbots",
        "15,000 AI message credits/month",
        "Full analytics suite",
        "Priority support",
        "White-label solution",
        "API access"
      ],
      current: subscription?.plan === "class-b",
      popular: false
    },
    {
      id: "class-a",
      name: "Enterprise",
      price: "20000 EGP",
      period: "per month",
      features: [
        "Unlimited chatbots",
        "50,000 AI message credits/month",
        "Enterprise analytics",
        "24/7 phone support",
        "Custom integrations",
        "Dedicated account manager"
      ],
      current: subscription?.plan === "class-a",
      popular: false
    }
  ];

  const handleUpgrade = (planId: string) => {
    if (planId === "free") return;
    setSelectedPlan(planId);
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Scale your chatbot operations with our flexible pricing plans
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Current Subscription</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800">
                <span className="font-medium">Plan:</span> {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1).replace('-', ' ')}
              </p>
              <p className="text-blue-800">
                <span className="font-medium">Status:</span> {subscription.status}
              </p>
              {'currentPeriodEnd' in subscription && subscription.currentPeriodEnd && (
                <p className="text-blue-800">
                  <span className="font-medium">Next billing:</span> {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Pending Upgrade Requests</h3>
          <div className="space-y-2">
            {pendingRequests.map((request: any) => (
              <div key={request._id} className="flex items-center justify-between">
                <span className="text-yellow-800">
                  Upgrade to {request.plan.charAt(0).toUpperCase() + request.plan.slice(1).replace('-', ' ')}
                </span>
                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">
                  Under Review
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            We'll review your request within 24 hours and send you an email confirmation.
          </p>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-sm border-2 p-6 ${
              plan.current
                ? "border-blue-500 ring-2 ring-blue-200"
                : plan.popular
                ? "border-blue-300"
                : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            {plan.current && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">{plan.price}</div>
              <div className="text-sm text-gray-600">{plan.period}</div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.current || plan.id === "free"}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                plan.current
                  ? "bg-green-100 text-green-800 cursor-default"
                  : plan.id === "free"
                  ? "bg-gray-100 text-gray-500 cursor-default"
                  : plan.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {plan.current ? "Current Plan" : plan.id === "free" ? "Free Forever" : "Upgrade"}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-green-900 mb-4">Payment Information</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-green-900 mb-1">InstaPay Payment</h4>
            <p className="text-sm text-green-800">
              Send payment to InstaPay number: <span className="font-bold">01211268396</span>
            </p>
            <p className="text-sm text-green-700 mt-2">
              After payment, upload your payment screenshot and we'll verify it within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">How does billing work?</h4>
            <p className="text-sm text-gray-600">
              All plans are billed monthly. You can upgrade or downgrade at any time, and changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-600">
              We currently accept InstaPay payments to number 01211268396. Upload your payment screenshot and we'll verify it within 24 hours.
            </p>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}
