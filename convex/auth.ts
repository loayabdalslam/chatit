import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: (params.name as string) || (params.email as string).split('@')[0],
        };
      },
    }),
    Anonymous,
  ],
});

// Handle referral processing after user signup
export const processSignupReferral = mutation({
  args: {
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    try {
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
    } catch (error) {
      console.error("Failed to process referral:", error);
      throw error;
    }
  },
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
