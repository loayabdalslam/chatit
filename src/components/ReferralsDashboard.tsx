import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function ReferralsDashboard() {
  const referralStats = useQuery(api.referrals.getReferralStats);
  const allReferrals = useQuery(api.referrals.getAllReferrals);
  const generateReferralCode = useMutation(api.referrals.generateReferralCode);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleGenerateCode = async () => {
    if (referralStats?.referralCode) return;
    
    setIsGenerating(true);
    try {
      const code = await generateReferralCode();
      toast.success(`Referral code generated: ${code}`);
    } catch (error) {
      toast.error("Failed to generate referral code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!referralStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}?ref=${referralStats.referralCode}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-black mb-2">Affiliate Program</h1>
        <p className="text-gray-600">
          Earn 20% commission for every user you refer who subscribes to a paid plan.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-3xl font-bold text-black">{referralStats.totalReferrals}</p>
            </div>
            <div className="text-black text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Referrals</p>
              <p className="text-3xl font-bold text-black">{referralStats.activeReferrals}</p>
            </div>
            <div className="text-black text-2xl">✅</div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Includes registered users (pending) and paid subscribers
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold text-black">{formatCurrency(referralStats.totalEarnings)}</p>
            </div>
            <div className="text-black text-2xl">💰</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-black">{formatCurrency(referralStats.monthlyEarnings)}</p>
            </div>
            <div className="text-black text-2xl">📈</div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-black mb-4">Your Affiliate Code</h3>
        
        {referralStats.referralCode ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
                <div className="flex">
                  <input
                    type="text"
                    value={referralStats.referralCode}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md bg-gray-50 text-gray-900"
                  />
                  <button
                    onClick={() => copyToClipboard(referralStats.referralCode!, "Referral code")}
                    className="px-4 py-3 bg-black text-white rounded-r-md hover:bg-gray-800 transition-colors"
                  >
                    {copiedCode ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral URL</label>
                <div className="flex">
                  <input
                    type="text"
                    value={referralUrl}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md bg-gray-50 text-gray-900 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(referralUrl, "Referral URL")}
                    className="px-4 py-3 bg-black text-white rounded-r-md hover:bg-gray-800 transition-colors"
                  >
                    {copiedCode ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">How to share your referral:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Share your referral code or URL with friends and colleagues</li>
                <li>• When they sign up and subscribe to a paid plan, you earn 20% commission</li>
                <li>• Commissions are paid monthly to your account</li>
                <li>• Track your referrals and earnings in real-time below</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🎯</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Generate Your Affiliate Code</h4>
            <p className="text-gray-600 mb-4">
              Create your unique referral code to start earning 20% commission on referrals.
            </p>
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </div>
              ) : (
                "Generate Affiliate Code"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Referrals List */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-black">Your Referrals</h3>
          <div className="text-sm text-gray-600">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mr-2">
              Registered
            </span>
            Users appear here immediately when they sign up
          </div>
        </div>
        
        {referralStats.referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Join Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Commission</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {referralStats.referrals.map((referral) => (
                  <tr key={referral._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {referral.referredUserEmail || "Anonymous User"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          ID: {referral.referredUserId.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(referral.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        referral.status === 'completed' || referral.status === 'paid'
                          ? 'bg-black text-white' 
                          : referral.status === 'pending'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.status === 'pending' ? 'Registered' : 
                         referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                      {referral.status === 'pending' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Will earn commission when they subscribe
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {referral.commission > 0 ? formatCurrency(referral.commission) : (
                        <span className="text-gray-500">
                          {referral.status === 'pending' ? 'Pending subscription' : '$0.00'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {referral.paidAt ? formatDate(referral.paidAt) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Referrals Yet</h4>
            <p className="text-gray-600 mb-4">
              Share your referral code to start earning commissions when people sign up!
            </p>
            {referralStats.referralCode && (
              <button
                onClick={() => copyToClipboard(referralUrl, "Referral URL")}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Copy Referral URL
              </button>
            )}
          </div>
        )}
      </div>

      {/* Commission Structure */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-black mb-4">Commission Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-black mb-2">20%</div>
            <div className="text-sm text-gray-600">Commission Rate</div>
            <div className="text-xs text-gray-500 mt-1">On all paid subscriptions</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-black mb-2">Monthly</div>
            <div className="text-sm text-gray-600">Payment Schedule</div>
            <div className="text-xs text-gray-500 mt-1">Payments on the 1st of each month</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-black mb-2">Lifetime</div>
            <div className="text-sm text-gray-600">Commission Duration</div>
            <div className="text-xs text-gray-500 mt-1">Earn as long as they subscribe</div>
          </div>
        </div>
      </div>

      {/* Debug Section - All Referrals in System */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-black mb-4">System Debug - All Referrals</h3>
        <p className="text-sm text-gray-600 mb-4">
          This shows all referrals in the system to help debug the referral connection.
        </p>
        
        {allReferrals && allReferrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium text-gray-900">Referrer</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900">Referred User</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900">Status</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900">Commission</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {allReferrals.map((referral) => (
                  <tr key={referral._id} className="border-b border-gray-100">
                    <td className="py-2 px-2">
                      <div className="text-xs">
                        <div className="font-medium">{referral.referrerEmail || "Unknown"}</div>
                        <div className="text-gray-500">ID: {referral.referrerId.slice(-8)}</div>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="text-xs">
                        <div className="font-medium">{referral.referredUserEmail || "Unknown"}</div>
                        <div className="text-gray-500">ID: {referral.referredUserId.slice(-8)}</div>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'completed' || referral.status === 'paid'
                          ? 'bg-black text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-xs font-medium">
                      {formatCurrency(referral.commission)}
                    </td>
                    <td className="py-2 px-2 text-xs">
                      {formatDate(referral.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-2xl mb-2">🔍</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Referrals Found</h4>
            <p className="text-gray-600">
              No referrals have been processed yet. Try using a referral code during signup to test the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 