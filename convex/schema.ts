import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Extend authTables with referralCode
const extendedAuthTables = {
  ...authTables,
  users: defineTable({
    ...authTables.users.validator._def,
    referralCode: v.optional(v.string()),
  })
    .index("by_referral_code", ["referralCode"])
    .searchIndex("search_users", {
      searchField: "email",
    }),
};

const applicationTables = {
  chatbots: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    instructions: v.optional(v.string()),
    userId: v.id("users"),
    isActive: v.boolean(),
    widgetConfig: v.optional(v.object({
      primaryColor: v.string(),
      position: v.string(),
      size: v.string(),
      welcomeMessage: v.string(),
      placeholder: v.string(),
      showBranding: v.boolean(),
      borderRadius: v.number(),
      fontFamily: v.string(),
      animation: v.string(),
      theme: v.string(),
    })),
    widgetSettings: v.optional(v.object({
      primaryColor: v.string(),
      position: v.string(),
      welcomeMessage: v.string(),
      placeholder: v.string(),
    })),
  }).index("by_user", ["userId"]),

  conversations: defineTable({
    chatbotId: v.id("chatbots"),
    userId: v.id("users"),
    title: v.string(),
    status: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    source: v.optional(v.string()),
  })
    .index("by_chatbot", ["chatbotId"])
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    content: v.string(),
    role: v.string(),
    timestamp: v.number(),
    sentiment: v.optional(v.string()),
  }).index("by_conversation", ["conversationId"]),

  documents: defineTable({
    chatbotId: v.id("chatbots"),
    userId: v.id("users"),
    name: v.string(),
    content: v.string(),
    type: v.string(),
    size: v.optional(v.number()),
    uploadedAt: v.optional(v.number()),
    fileId: v.optional(v.id("_storage")),
    storageId: v.optional(v.id("_storage")),
    status: v.optional(v.string()),
  }).index("by_chatbot", ["chatbotId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    messageLimit: v.number(),
    messagesUsed: v.number(),
    referredBy: v.optional(v.id("users")),
  }).index("by_user", ["userId"])
    .index("by_referred_by", ["referredBy"]),

  reports: defineTable({
    userId: v.id("users"),
    chatbotId: v.optional(v.id("chatbots")),
    title: v.optional(v.string()),
    type: v.string(),
    data: v.any(),
    generatedAt: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_chatbot", ["chatbotId"]),

  adminSettings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  }).index("by_key", ["key"]),

  admins: defineTable({
    userId: v.id("users"),
    role: v.string(),
    permissions: v.array(v.string()),
    createdAt: v.number(),
    createdBy: v.id("users"),
  }).index("by_user", ["userId"]),

  upgradeRequests: defineTable({
    userId: v.id("users"),
    requestedPlan: v.string(),
    currentPlan: v.string(),
    status: v.string(),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
    processedBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  sentimentAnalysis: defineTable({
    conversationId: v.id("conversations"),
    messageId: v.optional(v.id("messages")),
    messageContent: v.optional(v.string()),
    sentiment: v.string(),
    score: v.number(),
    analyzedAt: v.optional(v.number()),
    timestamp: v.optional(v.number()),
    confidence: v.optional(v.number()),
  }).index("by_conversation", ["conversationId"]),

  referrals: defineTable({
    referrerId: v.id("users"),
    referredUserId: v.id("users"),
    status: v.string(), // "pending", "completed", "paid"
    commission: v.number(), // 20% of subscription price
    subscriptionId: v.id("subscriptions"),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_referred_user", ["referredUserId"])
    .index("by_subscription", ["subscriptionId"]),
};

export default defineSchema({
  ...extendedAuthTables,
  ...applicationTables,
});
