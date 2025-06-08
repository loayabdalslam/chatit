import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to generate unique referral code
const generateUniqueCode = async (ctx: any) => {
  let code = "";
  let attempts = 0;
  
  do {
    code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const existing = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q: any) => q.eq("referralCode", code))
      .first();
    
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    throw new Error("Could not generate unique referral code");
  }

  return code;
};

// Generate a unique referral code for a user (simplified version)
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

    // Generate a unique code
    const code = await generateUniqueCode(ctx);

    // Update user with referral code
    await ctx.db.patch(userId, { referralCode: code });
    
    return code;
  },
});

// Backfill referral codes for existing users
export const backfillReferralCodes = mutation({
  args: {},
  returns: v.object({
    processed: v.number(),
    updated: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all users without referral codes
    const usersWithoutCodes = await ctx.db
      .query("users")
      .filter((q: any) => 
        q.or(
          q.eq(q.field("referralCode"), undefined),
          q.eq(q.field("referralCode"), null)
        )
      )
      .collect();

    let updated = 0;
    
    for (const user of usersWithoutCodes) {
      try {
        const code = await generateUniqueCode(ctx);
        await ctx.db.patch(user._id, { referralCode: code });
        updated++;
        console.log(`Generated referral code ${code} for existing user ${user._id}`);
      } catch (error) {
        console.error(`Failed to generate code for user ${user._id}:`, error);
      }
    }

    return {
      processed: usersWithoutCodes.length,
      updated,
    };
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
      console.error("❌ Referral processing failed: User not authenticated");
      throw new Error("Not authenticated");
    }

    console.log("🔄 Processing referral for user:", userId, "with code:", args.referralCode);

    // Get current user info for debugging
    const currentUser = await ctx.db.get(userId);
    console.log("👤 Current user email:", currentUser?.email);

    // Find the referrer by referral code
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q: any) => q.eq("referralCode", args.referralCode))
      .first();

    console.log("🔍 Found referrer:", referrer ? `${referrer._id} (${referrer.email})` : "❌ Not found");

    if (!referrer) {
      console.error("❌ Invalid referral code:", args.referralCode);
      throw new Error("Invalid referral code");
    }

    // Check if user is trying to refer themselves
    if (referrer._id === userId) {
      console.error("❌ User trying to refer themselves");
      throw new Error("Cannot use your own referral code");
    }

    // Check if this user was already referred
    const existingReferral = await ctx.db
      .query("referrals")
      .withIndex("by_referred_user", (q: any) => q.eq("referredUserId", userId))
      .first();

    console.log("🔍 Existing referral check:", existingReferral ? "❌ Already referred" : "✅ Can be referred");

    if (existingReferral) {
      console.error("❌ User already referred by:", existingReferral.referrerId);
      throw new Error("User has already been referred");
    }

    // Create referral record (without subscription ID initially)
    const referralId = await ctx.db.insert("referrals", {
      referrerId: referrer._id,
      referredUserId: userId,
      status: "pending",
      commission: 0, // Will be updated when subscription is created
      createdAt: Date.now(),
    });

    console.log("✅ Successfully created referral record:", referralId);
    console.log("📊 Referral details:", {
      referrer: referrer.email,
      referred: currentUser?.email,
      code: args.referralCode,
      status: "pending"
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
    // Show all referrals, including pending ones (users who just signed up)
    const activeReferrals = referrals.filter(r => 
      r.status === "pending" || r.status === "active" || r.status === "completed"
    ).length;
    
    // Calculate monthly earnings (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyEarnings = referrals
      .filter(r => r.paidAt && r.paidAt > thirtyDaysAgo)
      .reduce((sum, r) => sum + r.commission, 0);

    return {
      referralCode: user?.referralCode,
      totalReferrals: referrals.length, // This shows ALL referrals
      activeReferrals, // This now includes pending referrals (newly registered users)
      totalEarnings,
      monthlyEarnings,
      referrals: referralDetails, // This shows ALL referrals with their details
    };
  },
});

// Calculate and award referral commission
export const awardReferralCommission = mutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.id("subscriptions"),
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

    // Update referral record with subscription and commission details
    await ctx.db.patch(referral._id, {
      status: "completed",
      commission: commission,
      subscriptionId: args.subscriptionId,
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

// Get all referrals in the system (for debugging)
export const getAllReferrals = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("referrals"),
    referrerId: v.id("users"),
    referredUserId: v.id("users"),
    status: v.string(),
    commission: v.number(),
    createdAt: v.number(),
    referrerEmail: v.optional(v.string()),
    referredUserEmail: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    const referrals = await ctx.db.query("referrals").collect();
    
    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const referrer = await ctx.db.get(referral.referrerId);
        const referredUser = await ctx.db.get(referral.referredUserId);
        
        return {
          _id: referral._id,
          referrerId: referral.referrerId,
          referredUserId: referral.referredUserId,
          status: referral.status,
          commission: referral.commission,
          createdAt: referral.createdAt,
          referrerEmail: referrer?.email,
          referredUserEmail: referredUser?.email,
        };
      })
    );
    
    return enrichedReferrals;
  },
});

// Test function to verify referral system works
export const testReferralFlow = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    referralCode: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  }),
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return {
          success: false,
          message: "Not authenticated",
        };
      }

      // Get current user
      const user = await ctx.db.get(userId);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Generate referral code if doesn't exist
      let referralCode = user.referralCode;
      if (!referralCode) {
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
          return {
            success: false,
            message: "Could not generate unique referral code",
          };
        }

        // Update user with referral code
        await ctx.db.patch(userId, { referralCode: code });
        referralCode = code;
      }

      return {
        success: true,
        message: `Referral code generated successfully: ${referralCode}`,
        referralCode,
        userId,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  },
});

 