import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export function ReferralDebugger() {
  const [testCode, setTestCode] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  
  const testData = useQuery(api.referrals.testReferralSystem);
  const generateCode = useMutation(api.referrals.generateReferralCode);
  const referralStats = useQuery(api.referrals.getReferralStats);
  
  const handleGenerateCode = async () => {
    try {
      const code = await generateCode();
      setTestResult({ type: "success", message: `Generated code: ${code}` });
    } catch (error: any) {
      setTestResult({ type: "error", message: error.message });
    }
  };
  
  const handleValidateCode = async () => {
    if (!testCode.trim()) return;
    try {
      // Since validateReferralCode is a query, we can't call it directly as a mutation
      // We'll just show the test code for now and let the user test it manually
      setTestResult({ 
        type: "info", 
        message: `Test code: ${testCode}. Try using this code during signup to test the referral system.` 
      });
    } catch (error: any) {
      setTestResult({ type: "error", message: error.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Referral System Debugger</h1>
      
      {/* Generate Code Section */}
      <div className="bg-white p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">Generate Referral Code</h2>
        <button
          onClick={handleGenerateCode}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate My Referral Code
        </button>
      </div>
      
      {/* Validate Code Section */}
      <div className="bg-white p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">Validate Referral Code</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            className="px-3 py-2 border rounded flex-1"
          />
          <button
            onClick={handleValidateCode}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Validate
          </button>
        </div>
      </div>
      
      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded ${
          testResult.type === "success" ? "bg-green-100 text-green-800" :
          testResult.type === "error" ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {testResult.message}
        </div>
      )}
      
      {/* Current User's Referral Stats */}
      <div className="bg-white p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">My Referral Stats</h2>
        {referralStats ? (
          <div className="space-y-2">
            <p><strong>Referral Code:</strong> {referralStats.referralCode || "Not generated yet"}</p>
            <p><strong>Total Referrals:</strong> {referralStats.totalReferrals}</p>
            <p><strong>Active Referrals:</strong> {referralStats.activeReferrals}</p>
            <p><strong>Total Earnings:</strong> ${referralStats.totalEarnings}</p>
            <p><strong>Monthly Earnings:</strong> ${referralStats.monthlyEarnings}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      
      {/* System Debug Data */}
      <div className="bg-white p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">System Debug Data</h2>
        {testData ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">All Users ({testData.allUsers.length})</h3>
              <div className="text-sm max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                {testData.allUsers.map((user) => (
                  <div key={user._id} className="border-b py-1">
                    <div><strong>ID:</strong> {user._id}</div>
                    <div><strong>Name:</strong> {user.name || "N/A"}</div>
                    <div><strong>Email:</strong> {user.email || "N/A"}</div>
                    <div><strong>Referral Code:</strong> {user.referralCode || "None"}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium">All Referrals ({testData.allReferrals.length})</h3>
              <div className="text-sm max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                {testData.allReferrals.length > 0 ? testData.allReferrals.map((referral) => (
                  <div key={referral._id} className="border-b py-1">
                    <div><strong>Referrer:</strong> {referral.referrerId}</div>
                    <div><strong>Referred:</strong> {referral.referredUserId}</div>
                    <div><strong>Status:</strong> {referral.status}</div>
                    <div><strong>Commission:</strong> ${referral.commission}</div>
                    <div><strong>Created:</strong> {new Date(referral.createdAt).toLocaleString()}</div>
                  </div>
                )) : (
                  <p>No referrals yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>Loading debug data...</p>
        )}
      </div>
      
      {/* Test URLs */}
      <div className="bg-white p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">Test Referral URLs</h2>
        {referralStats?.referralCode && (
          <div className="space-y-2">
            <div>
              <strong>Referral URL:</strong>
              <input
                type="text"
                value={`${window.location.origin}?ref=${referralStats.referralCode}`}
                readOnly
                className="w-full mt-1 px-3 py-1 border rounded bg-gray-50"
              />
            </div>
            <div>
              <strong>Test Link:</strong>
              <a
                href={`${window.location.origin}?ref=${referralStats.referralCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline ml-2"
              >
                Test Referral Link
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 