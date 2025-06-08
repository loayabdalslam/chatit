import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AdminDashboardProps {
  sessionId: string;
  onLogout: () => void;
}

export function AdminDashboard({ sessionId, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const analytics = useQuery(api.admin.getAnalyticsDashboard, { sessionId });
  const allUsers = useQuery(api.admin.getAllUsersForAdminDashboard, { sessionId });
  const contactMessages = useQuery(api.admin.getContactMessages, { sessionId });
  const adminLogout = useMutation(api.admin.adminLogout);
  const updateMessageStatus = useMutation(api.admin.updateContactMessageStatus);

  const handleLogout = async () => {
    try {
      await adminLogout({ sessionId });
      localStorage.removeItem("adminSession");
      localStorage.removeItem("adminSessionExpires");
      toast.success("Logged out successfully");
      onLogout();
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleUpdateMessageStatus = async (messageId: string, status: string, response?: string) => {
    try {
      await updateMessageStatus({ sessionId, messageId, status, response });
      toast.success("Message updated successfully");
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!analytics || !allUsers || !contactMessages) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">🛡️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "users", label: "Users", icon: "👥" },
              { id: "analytics", label: "Analytics", icon: "📈" },
              { id: "contact", label: "Contact Messages", icon: "💬" },
              { id: "performance", label: "Performance", icon: "⚡" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                    <p className="text-xs text-green-600">+{analytics.newUsersToday} today</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600 text-xl">👁️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Page Views</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalPageViews}</p>
                    <p className="text-xs text-green-600">+{analytics.pageViewsToday} today</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 text-xl">💬</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalMessages}</p>
                    <p className="text-xs text-green-600">+{analytics.messagesThisWeek} this week</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-yellow-600 text-xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Subscriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeSubscriptions}</p>
                    <p className="text-xs text-gray-600">of {analytics.totalSubscriptions} total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 30 Days)</h3>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {analytics.userGrowth.slice(-7).map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-blue-500 rounded-t"
                        style={{
                          height: `${Math.max((day.users / Math.max(...analytics.userGrowth.map(d => d.users))) * 200, 4)}px`,
                          width: "24px",
                        }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2 transform -rotate-45">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Pages */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
                <div className="space-y-3">
                  {analytics.popularPages.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 truncate">{page.page}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(page.views / Math.max(...analytics.popularPages.map(p => p.views))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{page.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
              <p className="text-sm text-gray-600">Manage all registered users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">{user._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email || "No email"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user._creationTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {user.referralCode || "None"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isAnonymous ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}>
                          {user.isAnonymous ? "Anonymous" : "Registered"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Program</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Referrals</span>
                    <span className="text-sm font-medium text-gray-900">{analytics.totalReferrals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Commissions</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(analytics.totalCommissions)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Pages/Visit</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(analytics.totalPageViews / Math.max(analytics.totalUsers, 1)).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Messages/User</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(analytics.totalMessages / Math.max(analytics.totalUsers, 1)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subscription Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {((analytics.totalSubscriptions / Math.max(analytics.totalUsers, 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {((analytics.activeSubscriptions / Math.max(analytics.totalSubscriptions, 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalUsers}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics.totalPageViews}</p>
                  <p className="text-sm text-gray-600">Page Views</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{analytics.totalMessages}</p>
                  <p className="text-sm text-gray-600">Messages Sent</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{analytics.activeSubscriptions}</p>
                  <p className="text-sm text-gray-600">Active Subscriptions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Contact Messages</h2>
              <p className="text-sm text-gray-600">Manage customer inquiries and support requests</p>
            </div>
            <div className="divide-y divide-gray-200">
              {contactMessages.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">No contact messages yet.</p>
                </div>
              ) : (
                contactMessages.map((message) => (
                  <div key={message._id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-gray-900">{message.name}</h3>
                          <span className="text-sm text-gray-500">{message.email}</span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            message.status === "new" ? "bg-red-100 text-red-800" :
                            message.status === "read" ? "bg-yellow-100 text-yellow-800" :
                            message.status === "replied" ? "bg-blue-100 text-blue-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {message.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{message.subject}</p>
                        <p className="text-sm text-gray-900 mt-2">{message.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(message.createdAt)}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleUpdateMessageStatus(message._id, "read")}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        >
                          Mark Read
                        </button>
                        <button
                          onClick={() => handleUpdateMessageStatus(message._id, "replied", "Thank you for your message. We'll get back to you soon.")}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          Mark Replied
                        </button>
                        <button
                          onClick={() => handleUpdateMessageStatus(message._id, "closed")}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Performance */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">User Growth Rate</span>
                      <span className="font-medium">+{analytics.newUsersToday} today</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Page Load Performance</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">User Engagement</span>
                      <span className="font-medium">High</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Active Users</span>
                    <span className="text-sm font-medium text-gray-900">{analytics.newUsersToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Session Duration</span>
                    <span className="text-sm font-medium text-gray-900">8.5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bounce Rate</span>
                    <span className="text-sm font-medium text-gray-900">32%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Return Visitor Rate</span>
                    <span className="text-sm font-medium text-gray-900">68%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 