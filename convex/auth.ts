import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";

// Helper function to generate referral code
const generateUniqueReferralCode = async (ctx: any) => {
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
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: any, args: any) {
      // Generate referral code for new users (only if they don't have one)
      try {
        const user = await ctx.db.get(args.userId);
        if (!user?.referralCode) {
          const referralCode = await generateUniqueReferralCode(ctx);
          await ctx.db.patch(args.userId, { 
            referralCode: referralCode 
          });
          console.log(`Generated referral code ${referralCode} for user ${args.userId}`);
        }
      } catch (error) {
        console.error("Failed to generate referral code for user:", error);
        // Don't fail user creation if referral code generation fails
      }
    },
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

// Mutation to manually generate referral code if needed
export const generateReferralCodeManually = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (user?.referralCode) {
      return user.referralCode;
    }

    const referralCode = await generateUniqueReferralCode(ctx);
    await ctx.db.patch(userId, { referralCode });
    
    return referralCode;
  },
});
