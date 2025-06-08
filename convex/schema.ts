import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Extend authTables with referralCode
const extendedAuthTables = {
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    referralCode: v.optional(v.string()),
  })
    .index("by_referral_code", ["referralCode"]),
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
    subscriptionId: v.optional(v.id("subscriptions")), // Optional until subscription is created
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_referred_user", ["referredUserId"]),

  commissions: defineTable({
    referralId: v.id("referrals"),
    referrerId: v.id("users"),
    referredUserId: v.id("users"),
    amount: v.number(),
    subscriptionAmount: v.number(),
    createdAt: v.number(),
  }).index("by_referral", ["referralId"])
    .index("by_referrer", ["referrerId"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.string(), // "new", "read", "replied", "closed"
    priority: v.optional(v.string()), // "low", "medium", "high", "urgent"
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
    respondedBy: v.optional(v.id("users")),
    response: v.optional(v.string()),
  }).index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  pageVisits: defineTable({
    page: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    referrer: v.optional(v.string()),
    timestamp: v.number(),
    userId: v.optional(v.id("users")),
    sessionId: v.optional(v.string()),
  }).index("by_page", ["page"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"]),

  analytics: defineTable({
    type: v.string(), // "user_signup", "subscription_created", "message_sent", "page_view", etc.
    userId: v.optional(v.id("users")),
    metadata: v.optional(v.any()), // Additional data specific to the event
    timestamp: v.number(),
    value: v.optional(v.number()), // Numeric value for aggregations
  }).index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"]),

  adminSessions: defineTable({
    sessionId: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_session_id", ["sessionId"])
    .index("by_expires_at", ["expiresAt"]),

  paymentProofs: defineTable({
    userId: v.id("users"),
    plan: v.string(), // "standard", "premium", "enterprise"
    amount: v.number(),
    currency: v.string(),
    paymentMethod: v.string(), // "bank_transfer", "mobile_money", "crypto", "other"
    proofImageId: v.optional(v.id("_storage")), // Screenshot of payment
    transactionId: v.optional(v.string()),
    paymentDate: v.optional(v.number()),
    status: v.string(), // "pending", "verified", "rejected"
    notes: v.optional(v.string()), // User notes about payment
    adminNotes: v.optional(v.string()), // Admin notes for verification
    submittedAt: v.number(),
    verifiedAt: v.optional(v.number()),
    verifiedBy: v.optional(v.id("users")),
    rejectedAt: v.optional(v.number()),
    rejectedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_submitted_at", ["submittedAt"]),
};

export default defineSchema({
  ...extendedAuthTables,
  ...applicationTables,
});
