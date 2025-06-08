import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface PaymentSubmissionProps {
  onSubmitted?: () => void;
}

export function PaymentSubmission({ onSubmitted }: PaymentSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    plan: '',
    amount: '',
    currency: 'USD',
    paymentMethod: '',
    transactionId: '',
    paymentDate: '',
    notes: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  const submitPaymentProof = useMutation(api.payments.submitPaymentProof);
  const userPaymentProofs = useQuery(api.payments.getUserPaymentProofs);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const plans = [
    { id: 'standard', name: 'Standard Plan', price: 29 },
    { id: 'premium', name: 'Premium Plan', price: 79 },
    { id: 'enterprise', name: 'Enterprise Plan', price: 199 },
  ];

  const paymentMethods = [
    { id: 'bank_transfer', name: 'Bank Transfer' },
    { id: 'mobile_money', name: 'Mobile Money' },
    { id: 'crypto', name: 'Cryptocurrency' },
    { id: 'other', name: 'Other' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plan || !formData.amount || !formData.paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!proofFile) {
      toast.error('Please upload payment proof screenshot');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload proof image
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': proofFile.type },
        body: proofFile,
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload proof image');
      }

      const { storageId } = await uploadResult.json();

      // Submit payment proof
      await submitPaymentProof({
        plan: formData.plan,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        proofImageId: storageId,
        transactionId: formData.transactionId || undefined,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate).getTime() : undefined,
        notes: formData.notes || undefined,
      });

      toast.success('Payment proof submitted successfully! We will review it within 24 hours.');
      
      // Reset form
      setFormData({
        plan: '',
        amount: '',
        currency: 'USD',
        paymentMethod: '',
        transactionId: '',
        paymentDate: '',
        notes: '',
      });
      setProofFile(null);

      if (onSubmitted) onSubmitted();
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user has pending payment
  const hasPendingPayment = userPaymentProofs?.some(proof => proof.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-black mb-2">Submit Payment Proof</h1>
        <p className="text-gray-600">
          Upload your payment screenshot to verify your subscription and activate your plan.
        </p>
      </div>

      {/* Payment Submission Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Payment Details</h2>
        
        {hasPendingPayment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-yellow-600 text-lg mr-3">⏳</div>
              <div>
                <h3 className="font-medium text-yellow-800">Pending Verification</h3>
                <p className="text-sm text-yellow-700">
                  You have a payment pending verification. Please wait for admin approval before submitting another payment.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Selection */}
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                Plan *
              </label>
              <select
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={handleInputChange}
                required
                disabled={hasPendingPayment}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select a plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price}/month
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  disabled={hasPendingPayment}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                disabled={hasPendingPayment}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction ID */}
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                disabled={hasPendingPayment}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter transaction ID (optional)"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="datetime-local"
                id="paymentDate"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleInputChange}
                disabled={hasPendingPayment}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                disabled={hasPendingPayment}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="NGN">NGN</option>
                <option value="GHS">GHS</option>
                <option value="KES">KES</option>
              </select>
            </div>
          </div>

          {/* Payment Proof Image */}
          <div>
            <label htmlFor="proofImage" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Proof Screenshot *
            </label>
            <input
              type="file"
              id="proofImage"
              accept="image/*"
              onChange={handleFileChange}
              required
              disabled={hasPendingPayment}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a clear screenshot of your payment confirmation. Max file size: 5MB.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              disabled={hasPendingPayment}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Any additional information about your payment..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || hasPendingPayment}
            className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Payment Proof'
            )}
          </button>
        </form>
      </div>

      {/* Payment History */}
      {userPaymentProofs && userPaymentProofs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Payment History</h2>
          <div className="space-y-4">
            {userPaymentProofs.map((proof) => (
              <div key={proof._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 capitalize">{proof.plan} Plan</span>
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}>
                      {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(proof.submittedAt)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Amount: ${proof.amount} {proof.currency}</p>
                  <p>Payment Method: {proof.paymentMethod.replace('_', ' ')}</p>
                  {proof.transactionId && <p>Transaction ID: {proof.transactionId}</p>}
                  {proof.status === 'rejected' && proof.rejectionReason && (
                    <p className="text-red-600 mt-2">Rejection Reason: {proof.rejectionReason}</p>
                  )}
                  {proof.adminNotes && (
                    <p className="text-blue-600 mt-2">Admin Notes: {proof.adminNotes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 