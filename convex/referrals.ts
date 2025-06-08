import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate a unique referral code for a user
export const generateReferralCode = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Generate a unique 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Check if code already exists
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("referralCode"), code))
      .first();
    
    if (existing) {
      // Recursively try again if code exists
      return await generateReferralCode(ctx, {});
    }

    // Update user with referral code
    await ctx.db.patch(userId, { referralCode: code });
    
    return code;
  },
});

// Get referral stats for current user
export const getReferralStats = query({
  args: {},
  returns: v.object({
    totalReferrals: v.number(),
    totalEarnings: v.number(),
    pendingEarnings: v.number(),
    referralCode: v.optional(v.string()),
    referrals: v.array(v.object({
      _id: v.id("referrals"),
      referredUserEmail: v.string(),
      status: v.string(),
      commission: v.number(),
      createdAt: v.number(),
      paidAt: v.optional(v.number()),
    })),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get all referrals made by this user
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", userId))
      .collect();

    const referralDetails = await Promise.all(
      referrals.map(async (referral) => {
        const referredUser = await ctx.db.get(referral.referredUserId);
        return {
          _id: referral._id,
          referredUserEmail: referredUser?.email || "Unknown",
          status: referral.status,
          commission: referral.commission,
          createdAt: referral.createdAt,
          paidAt: referral.paidAt,
        };
      })
    );

    const totalEarnings = referrals
      .filter(r => r.status === "paid")
      .reduce((sum, r) => sum + r.commission, 0);

    const pendingEarnings = referrals
      .filter(r => r.status === "completed")
      .reduce((sum, r) => sum + r.commission, 0);

    return {
      totalReferrals: referrals.length,
      totalEarnings,
      pendingEarnings,
      referralCode: user.referralCode,
      referrals: referralDetails,
    };
  },
});

// Process a referral when a user signs up with a referral code
export const processReferral = mutation({
  args: {
    referralCode: v.string(),
    newUserId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find the referrer by referral code
    const referrer = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("referralCode"), args.referralCode))
      .first();

    if (!referrer) {
      // Invalid referral code, but don't throw error
      return null;
    }

    // Check if this user already has a referral record
    const existingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_referred_user", (q) => q.eq("referredUserId", args.newUserId))
      .first();

    if (existingReferral) {
      // Already referred, don't create duplicate
      return null;
    }

    // For now, just mark the referral as pending
    // Commission will be calculated when user subscribes
    await ctx.db.insert("referrals", {
      referrerId: referrer._id,
      referredUserId: args.newUserId,
      status: "pending",
      commission: 0, // Will be updated when subscription is created
      subscriptionId: "" as any, // Will be updated when subscription is created
      createdAt: Date.now(),
    });

    return null;
  },
});

// Calculate and process commission when a subscription is created
export const processSubscriptionCommission = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    userId: v.id("users"),
    plan: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find pending referral for this user
    const pendingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_referred_user", (q) => q.eq("referredUserId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (!pendingReferral) {
      return null;
    }

    // Calculate 20% commission based on plan
    const planPrices = {
      "class-c": 29, // $29/month
      "class-b": 99, // $99/month
      "class-a": 299, // $299/month
    };

    const planPrice = planPrices[args.plan as keyof typeof planPrices] || 0;
    const commission = planPrice * 0.2; // 20% commission

    if (commission > 0) {
      // Update the referral with subscription details and commission
      await ctx.db.patch(pendingReferral._id, {
        status: "completed",
        commission,
        subscriptionId: args.subscriptionId,
      });
    }

    return null;
  },
}); 