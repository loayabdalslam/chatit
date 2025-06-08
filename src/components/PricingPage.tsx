import React, { useState } from 'react';
import { PaymentSubmission } from './PaymentSubmission';

export function PricingPage() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const plans = [
    {
      id: 'standard',
      name: 'Standard',
      price: 20,
      features: [
        '10,000 messages per month',
        '5 chatbots',
        'Basic analytics',
        'Email support',
        'Widget customization',
        'API access'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 50,
      features: [
        '50,000 messages per month',
        '20 chatbots',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Advanced integrations',
        'Team collaboration',
        'Custom domains'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 250,
      features: [
        '200,000 messages per month',
        'Unlimited chatbots',
        'Enterprise analytics',
        '24/7 phone support',
        'White-label solution',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'On-premise deployment'
      ],
      popular: false
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
  };

  if (showPaymentForm) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-black">Submit Payment Proof</h1>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Plans
            </button>
          </div>
          <p className="text-gray-600">
            You selected the <strong className="capitalize">{selectedPlan}</strong> plan. 
            Please submit your payment proof below.
          </p>
        </div>
        <PaymentSubmission onSubmitted={() => setShowPaymentForm(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the perfect plan for your business needs. All plans include our core features 
          with different usage limits and support levels.
        </p>
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Payment Instructions</h2>
        <div className="text-blue-800 space-y-2">
          <p>1. Choose your preferred plan below</p>
          <p>2. Make payment using any of these methods:</p>
          <ul className="ml-6 space-y-1">
            <li>• Bank Transfer</li>
            <li>• Mobile Money (MTN, Vodafone, AirtelTigo)</li>
            <li>• Cryptocurrency (Bitcoin, Ethereum)</li>
            <li>• Other payment methods</li>
          </ul>
          <p>3. Take a screenshot of your payment confirmation</p>
          <p>4. Submit the payment proof using our form</p>
          <p>5. We'll verify and activate your subscription within 24 hours</p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
              plan.popular 
                ? 'border-black transform scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-black">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                  plan.popular
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-300'
                }`}
              >
                Select {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Accepted Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">🏦</div>
            <h3 className="font-medium text-gray-900">Bank Transfer</h3>
            <p className="text-sm text-gray-600">Direct bank transfers</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-medium text-gray-900">Mobile Money</h3>
            <p className="text-sm text-gray-600">MTN, Vodafone, AirtelTigo</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">₿</div>
            <h3 className="font-medium text-gray-900">Cryptocurrency</h3>
            <p className="text-sm text-gray-600">Bitcoin, Ethereum, etc.</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">💳</div>
            <h3 className="font-medium text-gray-900">Other Methods</h3>
            <p className="text-sm text-gray-600">Contact us for alternatives</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">How long does verification take?</h3>
            <p className="text-gray-600">We typically verify payments within 24 hours during business days.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">What if my payment is rejected?</h3>
            <p className="text-gray-600">We'll provide a clear reason for rejection and you can resubmit with the correct information.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
            <p className="text-gray-600">Yes, you can change your plan at any time. Contact support for assistance.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600">We offer a 30-day money-back guarantee for all new subscriptions.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 