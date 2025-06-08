import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const SUPER_ADMIN_PASSWORD = "666x777";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Create super admin account
export const createSuperAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if super admin already exists
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "admin@chaticon.com"))
      .first();

    if (existingAdmin) {
      // Check if admin record exists
      const adminRecord = await ctx.db
        .query("admins")
        .withIndex("by_user", (q) => q.eq("userId", existingAdmin._id))
        .first();

      if (!adminRecord) {
        await ctx.db.insert("admins", {
          userId: existingAdmin._id,
          role: "super_admin",
          permissions: ["all"],
          createdAt: Date.now(),
          createdBy: existingAdmin._id,
        });
      }
      return existingAdmin._id;
    }

    // Create super admin user
    const adminUserId = await ctx.db.insert("users", {
      email: "admin@chaticon.com",
      name: "Super Admin",
      emailVerificationTime: Date.now(),
    });

    // Create admin record
    await ctx.db.insert("admins", {
      userId: adminUserId,
      role: "super_admin",
      permissions: ["all"],
      createdAt: Date.now(),
      createdBy: adminUserId,
    });

    return adminUserId;
  },
});

// Check if user is admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return !!admin;
  },
});

// Get admin info
export const getAdminInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) {
      return null;
    }

    const user = await ctx.db.get(userId);
    return {
      ...admin,
      user,
    };
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) {
      throw new Error("Access denied - admin only");
    }

    const users = await ctx.db.query("users").collect();
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const chatbots = await ctx.db
          .query("chatbots")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const subscription = await ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .first();

        return {
          ...user,
          chatbotCount: chatbots.length,
          subscription: subscription?.plan || "free",
        };
      })
    );

    return usersWithStats;
  },
});

// Get all chatbots (admin only)
export const getAllChatbots = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) {
      throw new Error("Access denied - admin only");
    }

    const chatbots = await ctx.db.query("chatbots").collect();
    const chatbotsWithStats = await Promise.all(
      chatbots.map(async (chatbot) => {
        const user = await ctx.db.get(chatbot.userId);
        const conversations = await ctx.db
          .query("conversations")
          .withIndex("by_chatbot", (q) => q.eq("chatbotId", chatbot._id))
          .collect();

        let totalMessages = 0;
        for (const conv of conversations) {
          const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
            .collect();
          totalMessages += messages.length;
        }

        return {
          ...chatbot,
          user: user?.name || "Unknown",
          userEmail: user?.email || "Unknown",
          conversationCount: conversations.length,
          messageCount: totalMessages,
        };
      })
    );

    return chatbotsWithStats;
  },
});

// Delete user (admin only)
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Must be logged in");
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .first();

    if (!admin || admin.role !== "super_admin") {
      throw new Error("Access denied - super admin only");
    }

    // Don't allow deleting self
    if (args.userId === currentUserId) {
      throw new Error("Cannot delete your own account");
    }

    // Delete user's chatbots and related data
    const chatbots = await ctx.db
      .query("chatbots")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const chatbot of chatbots) {
      // Delete conversations and messages
      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_chatbot", (q) => q.eq("chatbotId", chatbot._id))
        .collect();

      for (const conv of conversations) {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        for (const message of messages) {
          await ctx.db.delete(message._id);
        }
        await ctx.db.delete(conv._id);
      }

      // Delete sentiment analysis for each conversation
      for (const conv of conversations) {
        const sentimentAnalyses = await ctx.db
          .query("sentimentAnalysis")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        for (const sentiment of sentimentAnalyses) {
          await ctx.db.delete(sentiment._id);
        }
      }

      await ctx.db.delete(chatbot._id);
    }

    // Delete subscriptions
    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const subscription of subscriptions) {
      await ctx.db.delete(subscription._id);
    }

    // Delete admin record if exists
    const adminRecord = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (adminRecord) {
      await ctx.db.delete(adminRecord._id);
    }

    // Delete user
    await ctx.db.delete(args.userId);
  },
});

// Toggle chatbot active status (admin only)
export const toggleChatbotStatus = mutation({
  args: { 
    chatbotId: v.id("chatbots"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) {
      throw new Error("Access denied - admin only");
    }

    await ctx.db.patch(args.chatbotId, {
      isActive: args.isActive,
    });
  },
});

// Get platform stats (admin only)
export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) {
      throw new Error("Access denied - admin only");
    }

    const users = await ctx.db.query("users").collect();
    const chatbots = await ctx.db.query("chatbots").collect();
    const conversations = await ctx.db.query("conversations").collect();
    const messages = await ctx.db.query("messages").collect();

    const activeSubscriptions = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const revenue = activeSubscriptions.reduce((total, sub) => total + 0, 0); // Price calculation would be based on plan

    return {
      totalUsers: users.length,
      totalChatbots: chatbots.length,
      totalConversations: conversations.length,
      totalMessages: messages.length,
      monthlyRevenue: revenue / 100, // Convert from cents
      activeSubscriptions: activeSubscriptions.length,
    };
  },
});

// Super admin login
export const adminLogin = mutation({
  args: {
    password: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    sessionId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    if (args.password !== SUPER_ADMIN_PASSWORD) {
      return { success: false };
    }

    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = Date.now() + SESSION_DURATION;

    await ctx.db.insert("adminSessions", {
      sessionId,
      createdAt: Date.now(),
      expiresAt,
    });

    return {
      success: true,
      sessionId,
      expiresAt,
    };
  },
});

// Verify admin session
export const verifyAdminSession = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_session_id", (q: any) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return false;
    }

    return true;
  },
});

// Get all users for admin dashboard
export const getAllUsersForAdminDashboard = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.array(v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    referralCode: v.optional(v.string()),
    lastActive: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    // Check session validity
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_session_id", (q: any) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid admin session");
    }

    const users = await ctx.db.query("users").collect();
    
    return users.map(user => ({
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      email: user.email,
      isAnonymous: user.isAnonymous,
      referralCode: user.referralCode,
      lastActive: user._creationTime, // Placeholder - could track real last activity
    }));
  },
});

// Get analytics dashboard data
export const getAnalyticsDashboard = query({
  args: {
    sessionId: v.string(),
    days: v.optional(v.number()),
  },
  returns: v.object({
    totalUsers: v.number(),
    newUsersToday: v.number(),
    totalPageViews: v.number(),
    pageViewsToday: v.number(),
    totalMessages: v.number(),
    messagesThisWeek: v.number(),
    totalSubscriptions: v.number(),
    activeSubscriptions: v.number(),
    totalReferrals: v.number(),
    totalCommissions: v.number(),
    popularPages: v.array(v.object({
      page: v.string(),
      views: v.number(),
    })),
    userGrowth: v.array(v.object({
      date: v.string(),
      users: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    // Check session validity
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_session_id", (q: any) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid admin session");
    }

    const days = args.days || 30;
    const timeRange = Date.now() - (days * 24 * 60 * 60 * 1000);
    const today = new Date().setHours(0, 0, 0, 0);
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const allUsers = await ctx.db.query("users").collect();
    const allPageViews = await ctx.db.query("pageVisits").collect();
    const allMessages = await ctx.db.query("messages").collect();
    const allSubscriptions = await ctx.db.query("subscriptions").collect();
    const allReferrals = await ctx.db.query("referrals").collect();
    const allCommissions = await ctx.db.query("commissions").collect();

    // Calculate metrics
    const totalUsers = allUsers.length;
    const newUsersToday = allUsers.filter(u => u._creationTime >= today).length;
    const totalPageViews = allPageViews.length;
    const pageViewsToday = allPageViews.filter(pv => pv.timestamp >= today).length;
    const totalMessages = allMessages.length;
    const messagesThisWeek = allMessages.filter(m => m.timestamp >= weekAgo).length;
    const totalSubscriptions = allSubscriptions.length;
    const activeSubscriptions = allSubscriptions.filter(s => s.status === "active").length;
    const totalReferrals = allReferrals.length;
    const totalCommissions = allCommissions.reduce((sum, c) => sum + c.amount, 0);

    // Popular pages
    const pageViewCounts: Record<string, number> = {};
    allPageViews.forEach(pv => {
      pageViewCounts[pv.page] = (pageViewCounts[pv.page] || 0) + 1;
    });
    const popularPages = Object.entries(pageViewCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // User growth over last 30 days
    const userGrowth = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date).setHours(0, 0, 0, 0);
      const dayEnd = new Date(date).setHours(23, 59, 59, 999);
      
      const usersOnDay = allUsers.filter(u => 
        u._creationTime >= dayStart && u._creationTime <= dayEnd
      ).length;
      
      userGrowth.push({
        date: date.toISOString().split('T')[0],
        users: usersOnDay,
      });
    }

    return {
      totalUsers,
      newUsersToday,
      totalPageViews,
      pageViewsToday,
      totalMessages,
      messagesThisWeek,
      totalSubscriptions,
      activeSubscriptions,
      totalReferrals,
      totalCommissions,
      popularPages,
      userGrowth,
    };
  },
});

// Get contact messages
export const getContactMessages = query({
  args: {
    sessionId: v.string(),
    status: v.optional(v.string()),
  },
  returns: v.array(v.object({
    _id: v.id("contactMessages"),
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.string(),
    priority: v.optional(v.string()),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
    response: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    // Check session validity
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_session_id", (q: any) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid admin session");
    }

    let messages;
    
    if (args.status) {
      messages = await ctx.db
        .query("contactMessages")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .order("desc")
        .collect();
    } else {
      messages = await ctx.db
        .query("contactMessages")
        .order("desc")
        .collect();
    }
    
    return messages.map(msg => ({
      _id: msg._id,
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      status: msg.status,
      priority: msg.priority,
      createdAt: msg.createdAt,
      respondedAt: msg.respondedAt,
      response: msg.response,
    }));
  },
});

// Update contact message status
export const updateContactMessageStatus = mutation({
  args: {
    sessionId: v.string(),
    messageId: v.id("contactMessages"),
    status: v.string(),
    response: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check session validity
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_session_id", (q: any) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid admin session");
    }

    const updateData: any = {
      status: args.status,
    };

    if (args.response) {
      updateData.response = args.response;
      updateData.respondedAt = Date.now();
    }

    await ctx.db.patch(args.messageId, updateData);
    return null;
  },
});

// Admin logout
export const adminLogout = mutation({
  args: {
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_session_id", (q: any) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return null;
  },
});
