import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Check if super admin exists
export const checkSuperAdminExists = query({
  args: {},
  handler: async (ctx) => {
    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "admin@chaticon.com"))
      .first();

    if (!existingAdmin) {
      return { exists: false };
    }

    const adminRecord = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", existingAdmin._id))
      .first();

    return { 
      exists: true, 
      hasAdminRecord: !!adminRecord,
      userId: existingAdmin._id 
    };
  },
});

// Create admin record for current user if they are the admin email
export const promoteToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.email !== "admin@chaticon.com") {
      throw new Error("Only admin@chaticon.com can be promoted to admin");
    }

    // Check if admin record already exists
    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingAdmin) {
      return { success: true, message: "You are already an admin" };
    }

    // Create admin record
    await ctx.db.insert("admins", {
      userId: userId,
      role: "super_admin",
      permissions: ["all"],
      createdAt: Date.now(),
      createdBy: userId,
    });

    return { success: true, message: "Successfully promoted to admin" };
  },
});
