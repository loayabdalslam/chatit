import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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
