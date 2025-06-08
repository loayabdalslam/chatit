import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Submit payment proof
export const submitPaymentProof = mutation({
  args: {
    plan: v.string(),
    amount: v.number(),
    currency: v.string(),
    paymentMethod: v.string(),
    proofImageId: v.optional(v.id("_storage")),
    transactionId: v.optional(v.string()),
    paymentDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Check if user already has a pending payment proof
    const existingPending = await ctx.db
      .query("paymentProofs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingPending) {
      throw new Error("You already have a pending payment verification. Please wait for admin approval.");
    }

    const paymentProofId = await ctx.db.insert("paymentProofs", {
      userId,
      plan: args.plan,
      amount: args.amount,
      currency: args.currency,
      paymentMethod: args.paymentMethod,
      proofImageId: args.proofImageId,
      transactionId: args.transactionId,
      paymentDate: args.paymentDate,
      status: "pending",
      notes: args.notes,
      submittedAt: Date.now(),
    });

    // Log analytics
    await ctx.db.insert("analytics", {
      type: "payment_proof_submitted",
      userId,
      metadata: {
        plan: args.plan,
        amount: args.amount,
        paymentMethod: args.paymentMethod,
      },
      timestamp: Date.now(),
      value: args.amount,
    });

    return paymentProofId;
  },
});

// Get user's payment proofs
export const getUserPaymentProofs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    return await ctx.db
      .query("paymentProofs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get all payment proofs for admin
export const getAllPaymentProofs = query({
  args: {
    status: v.optional(v.string()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Check if user is admin (you can add admin verification here)
    // For now, this is accessible to all authenticated users

    let proofs;
    
    if (args.status) {
      // TypeScript narrowing: args.status is definitely string here
      const status: string = args.status;
      proofs = await ctx.db
        .query("paymentProofs")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    } else {
      proofs = await ctx.db
        .query("paymentProofs")
        .order("desc")
        .collect();
    }

    // Get user details for each proof
    const proofsWithUsers = await Promise.all(
      proofs.map(async (proof) => {
        const user = await ctx.db.get(proof.userId);
        return {
          ...proof,
          userEmail: user?.email || "Unknown",
          userName: user?.name || "Unknown",
        };
      })
    );

    return proofsWithUsers;
  },
});

// Verify payment proof (admin only)
export const verifyPaymentProof = mutation({
  args: {
    paymentProofId: v.id("paymentProofs"),
    adminNotes: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Admin must be authenticated");
    }

    const paymentProof = await ctx.db.get(args.paymentProofId);
    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    if (paymentProof.status !== "pending") {
      throw new Error("Payment proof is not pending verification");
    }

    // Update payment proof status
    await ctx.db.patch(args.paymentProofId, {
      status: "verified",
      verifiedAt: Date.now(),
      verifiedBy: adminUserId,
      adminNotes: args.adminNotes,
    });

    // Create or update user subscription
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", paymentProof.userId))
      .first();

    const planLimits = {
      standard: { messageLimit: 10000, duration: 30 * 24 * 60 * 60 * 1000 }, // 30 days
      premium: { messageLimit: 50000, duration: 30 * 24 * 60 * 60 * 1000 }, // 30 days
      enterprise: { messageLimit: 200000, duration: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    };

    const planConfig = planLimits[paymentProof.plan as keyof typeof planLimits];

    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, {
        plan: paymentProof.plan,
        status: "active",
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + planConfig.duration,
        messageLimit: planConfig.messageLimit,
        messagesUsed: 0,
      });
    } else {
      // Create new subscription
      await ctx.db.insert("subscriptions", {
        userId: paymentProof.userId,
        plan: paymentProof.plan,
        status: "active",
        currentPeriodStart: Date.now(),
        currentPeriodEnd: Date.now() + planConfig.duration,
        messageLimit: planConfig.messageLimit,
        messagesUsed: 0,
      });
    }

    // Log analytics
    await ctx.db.insert("analytics", {
      type: "subscription_activated",
      userId: paymentProof.userId,
      metadata: {
        plan: paymentProof.plan,
        amount: paymentProof.amount,
        verifiedBy: adminUserId,
      },
      timestamp: Date.now(),
      value: paymentProof.amount,
    });

    return { success: true };
  },
});

// Reject payment proof (admin only)
export const rejectPaymentProof = mutation({
  args: {
    paymentProofId: v.id("paymentProofs"),
    rejectionReason: v.string(),
    adminNotes: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Admin must be authenticated");
    }

    const paymentProof = await ctx.db.get(args.paymentProofId);
    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    if (paymentProof.status !== "pending") {
      throw new Error("Payment proof is not pending verification");
    }

    await ctx.db.patch(args.paymentProofId, {
      status: "rejected",
      rejectedAt: Date.now(),
      rejectedBy: adminUserId,
      rejectionReason: args.rejectionReason,
      adminNotes: args.adminNotes,
    });

    // Log analytics
    await ctx.db.insert("analytics", {
      type: "payment_proof_rejected",
      userId: paymentProof.userId,
      metadata: {
        plan: paymentProof.plan,
        amount: paymentProof.amount,
        rejectionReason: args.rejectionReason,
        rejectedBy: adminUserId,
      },
      timestamp: Date.now(),
      value: paymentProof.amount,
    });

    return { success: true };
  },
});

// Get payment statistics
export const getPaymentStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    pending: v.number(),
    verified: v.number(),
    rejected: v.number(),
    totalRevenue: v.number(),
    monthlyRevenue: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const allProofs = await ctx.db.query("paymentProofs").collect();

    const stats = {
      total: allProofs.length,
      pending: allProofs.filter(p => p.status === "pending").length,
      verified: allProofs.filter(p => p.status === "verified").length,
      rejected: allProofs.filter(p => p.status === "rejected").length,
      totalRevenue: allProofs.filter(p => p.status === "verified").reduce((sum, p) => sum + p.amount, 0),
      monthlyRevenue: allProofs
        .filter(p => p.status === "verified" && p.verifiedAt && p.verifiedAt > Date.now() - 30 * 24 * 60 * 60 * 1000)
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return stats;
  },
});

// Get proof image URL
export const getProofImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
}); 