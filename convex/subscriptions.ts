import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return subscription || { plan: "free", status: "active" };
  },
});

export const getPendingRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("upgradeRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const requestUpgrade = mutation({
  args: {
    plan: v.union(v.literal("pro"), v.literal("enterprise")),
    paymentScreenshotId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Check if there's already a pending request
    const existingRequest = await ctx.db
      .query("upgradeRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("You already have a pending upgrade request");
    }

    return await ctx.db.insert("upgradeRequests", {
      userId,
      requestedPlan: args.plan,
      currentPlan: "free",
      status: "pending",
      requestedAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUserLimits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const plan = subscription?.plan || "free";

    const limits = {
      free: {
        maxChatbots: 1,
        maxMessages: 100,
        hasAnalytics: false,
        hasAPI: false,
        hasBranding: true,
      },
      "class-c": {
        maxChatbots: 3,
        maxMessages: 2000,
        hasAnalytics: true,
        hasAPI: false,
        hasBranding: false,
      },
      "class-b": {
        maxChatbots: 10,
        maxMessages: 15000,
        hasAnalytics: true,
        hasAPI: true,
        hasBranding: false,
      },
      "class-a": {
        maxChatbots: -1, // unlimited
        maxMessages: 50000,
        hasAnalytics: true,
        hasAPI: true,
        hasBranding: false,
      },
    };

    return limits[plan as keyof typeof limits] || limits.free;
  },
});
