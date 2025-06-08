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

    // Check if user already has a referral code
    const user = await ctx.db.get(userId);
    if (user?.referralCode) {
      return user.referralCode;
    }

    // Generate a unique 8-character code
    let code = "";
    let attempts = 0;
    do {
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", code))
        .first();
      
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new Error("Could not generate unique referral code");
    }

    // Update user with referral code
    await ctx.db.patch(userId, { referralCode: code });
    
    return code;
  },
});

// Process a referral when someone signs up with a referral code
export const processReferral = mutation({
  args: {
    referralCode: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Find the referrer by referral code
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode))
      .first();

    if (!referrer) {
      throw new Error("Invalid referral code");
    }

    // Check if user is trying to refer themselves
    if (referrer._id === userId) {
      throw new Error("Cannot use your own referral code");
    }

    // Check if this user was already referred
    const existingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_referred_user", (q) => q.eq("referredUserId", userId))
      .first();

    if (existingReferral) {
      throw new Error("User has already been referred");
    }

    // Create referral record
    await ctx.db.insert("referrals", {
      referrerId: referrer._id,
      referredUserId: userId,
      status: "pending",
      commission: 0, // Will be updated when subscription is created
      subscriptionId: "" as any, // Will be updated when subscription is created
      createdAt: Date.now(),
    });

    return null;
  },
});

// Get referral statistics for the current user
export const getReferralStats = query({
  args: {},
  returns: v.object({
    referralCode: v.optional(v.string()),
    totalReferrals: v.number(),
    activeReferrals: v.number(),
    totalEarnings: v.number(),
    monthlyEarnings: v.number(),
    referrals: v.array(v.object({
      _id: v.id("referrals"),
      referredUserId: v.id("users"),
      referredUserEmail: v.optional(v.string()),
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
    
    // Get all referrals made by this user
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", userId))
      .collect();

    // Get referred user details
    const referralDetails = await Promise.all(
      referrals.map(async (referral) => {
        const referredUser = await ctx.db.get(referral.referredUserId);
        return {
          _id: referral._id,
          referredUserId: referral.referredUserId,
          referredUserEmail: referredUser?.email,
          status: referral.status,
          commission: referral.commission,
          createdAt: referral.createdAt,
          paidAt: referral.paidAt,
        };
      })
    );

    // Calculate statistics
    const totalEarnings = referrals.reduce((sum, r) => sum + r.commission, 0);
    const activeReferrals = referrals.filter(r => r.status === "active" || r.status === "completed").length;
    
    // Calculate monthly earnings (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyEarnings = referrals
      .filter(r => r.paidAt && r.paidAt > thirtyDaysAgo)
      .reduce((sum, r) => sum + r.commission, 0);

    return {
      referralCode: user?.referralCode,
      totalReferrals: referrals.length,
      activeReferrals,
      totalEarnings,
      monthlyEarnings,
      referrals: referralDetails,
    };
  },
});

// Calculate and award referral commission
export const awardReferralCommission = mutation({
  args: {
    userId: v.id("users"),
    subscriptionAmount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find if this user was referred
    const referral = await ctx.db
      .query("referrals")
      .withIndex("by_referred_user", (q) => q.eq("referredUserId", args.userId))
      .first();

    if (!referral) {
      return null; // No referral, nothing to do
    }

    // Calculate commission (20% of subscription amount)
    const commissionRate = 0.2; // 20%
    const commission = args.subscriptionAmount * commissionRate;

    // Update referral record
    await ctx.db.patch(referral._id, {
      status: "completed",
      commission: commission,
      paidAt: Date.now(),
    });

    // Create commission record for tracking
    await ctx.db.insert("commissions", {
      referralId: referral._id,
      referrerId: referral.referrerId,
      referredUserId: args.userId,
      amount: commission,
      subscriptionAmount: args.subscriptionAmount,
      createdAt: Date.now(),
    });

    return null;
  },
});

// Get all users who were referred by a specific code (for admin/tracking)
export const getReferralsByCode = query({
  args: {
    referralCode: v.string(),
  },
  returns: v.array(v.object({
    userId: v.id("users"),
    email: v.optional(v.string()),
    signupDate: v.number(),
    status: v.string(),
  })),
  handler: async (ctx, args) => {
    // Find the referrer
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode))
      .first();

    if (!referrer) {
      return [];
    }

    // Get all referrals
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", referrer._id))
      .collect();

    // Get user details
    const results = await Promise.all(
      referrals.map(async (referral) => {
        const user = await ctx.db.get(referral.referredUserId);
        return {
          userId: referral.referredUserId,
          email: user?.email,
          signupDate: referral.createdAt,
          status: referral.status,
        };
      })
    );

    return results;
  },
});

// Validate referral code
export const validateReferralCode = query({
  args: {
    code: v.string(),
  },
  returns: v.object({
    valid: v.boolean(),
    referrerName: v.optional(v.string()),
    referrerEmail: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.code))
      .first();

    if (!referrer) {
      return { valid: false };
    }

    return {
      valid: true,
      referrerName: referrer.name,
      referrerEmail: referrer.email,
    };
  },
}); 