import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Submit a contact form message
export const submitContactMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  returns: v.id("contactMessages"),
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("contactMessages", {
      name: args.name,
      email: args.email,
      subject: args.subject || "General Inquiry",
      message: args.message,
      status: "new",
      priority: "medium",
      createdAt: Date.now(),
    });

    // Track analytics
    await ctx.db.insert("analytics", {
      type: "contact_message_submitted",
      metadata: {
        email: args.email,
        subject: args.subject || "General Inquiry",
      },
      timestamp: Date.now(),
    });

    return messageId;
  },
});

// Track page visits for analytics
export const trackPageVisit = mutation({
  args: {
    page: v.string(),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await ctx.db.insert("pageVisits", {
      page: args.page,
      userAgent: args.userAgent,
      referrer: args.referrer,
      timestamp: Date.now(),
      userId: userId || undefined,
      sessionId: args.sessionId,
    });

    // Track analytics
    await ctx.db.insert("analytics", {
      type: "page_view",
      userId: userId || undefined,
      metadata: {
        page: args.page,
        referrer: args.referrer,
      },
      timestamp: Date.now(),
      value: 1,
    });

    return null;
  },
});

// Get contact form for public use
export const getContactInfo = query({
  args: {},
  returns: v.object({
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    return {
      email: "support@chatit.cloud",
      phone: "+1 (555) 123-4567",
      address: "123 Business St, Tech City, TC 12345",
    };
  },
}); 