import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface AdminSetupProps {
  onComplete: () => void;
}

export function AdminSetup({ onComplete }: AdminSetupProps) {
  const [isPromoting, setIsPromoting] = useState(false);
  const adminStatus = useQuery(api.adminInit.checkSuperAdminExists);
  const promoteToAdmin = useMutation(api.adminInit.promoteToAdmin);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const handlePromoteToAdmin = async () => {
    setIsPromoting(true);
    try {
      const result = await promoteToAdmin({});
      toast.success(result.message);
    } catch (error) {
      toast.error("Failed to promote to admin: " + (error as Error).message);
    } finally {
      setIsPromoting(false);
    }
  };

  // Don't show if admin already exists and has admin record
  if (adminStatus?.exists && adminStatus?.hasAdminRecord) {
    return null;
  }

  // Show promotion button if user is logged in as admin email but doesn't have admin record
  if (loggedInUser?.email === "admin@chaticon.com" && adminStatus?.exists && !adminStatus?.hasAdminRecord) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Promotion</h3>
        <p className="text-gray-600 mb-4">
          You are logged in as the admin email. Click below to activate admin privileges.
        </p>
        <button
          onClick={handlePromoteToAdmin}
          disabled={isPromoting}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPromoting ? "Activating..." : "Activate Admin Privileges"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Setup</h3>
      <p className="text-gray-600 mb-4">
        To set up the admin account, please sign up with the following credentials:
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-900 mb-2">Admin Credentials:</h4>
        <p className="text-sm text-blue-800">
          <strong>Email:</strong> admin@chaticon.com<br />
          <strong>Password:</strong> admin@01123842360@
        </p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Instructions:</strong>
          <br />1. Click "Sign up instead" above
          <br />2. Use the admin credentials to create the account
          <br />3. After signing up, you'll be able to activate admin privileges
        </p>
      </div>
    </div>
  );
}
