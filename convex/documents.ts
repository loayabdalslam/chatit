import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to upload documents");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveDocument = mutation({
  args: {
    chatbotId: v.id("chatbots"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Verify chatbot ownership
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      throw new Error("Chatbot not found or access denied");
    }

    return await ctx.db.insert("documents", {
      chatbotId: args.chatbotId,
      userId: userId,
      name: args.fileName || "Uploaded Document",
      content: "",
      type: "text",
      size: 0,
      uploadedAt: Date.now(),
      fileId: args.storageId,
    });
  },
});

export const getDocuments = query({
  args: { chatbotId: v.id("chatbots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify chatbot ownership
    const chatbot = await ctx.db.get(args.chatbotId);
    if (!chatbot || chatbot.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_chatbot", (q) => q.eq("chatbotId", args.chatbotId))
      .order("desc")
      .collect();
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== userId) {
      throw new Error("Document not found or access denied");
    }

    // Delete from storage
    if (document.fileId) {
      try {
        await ctx.storage.delete(document.fileId);
      } catch (error) {
        console.error("Failed to delete storage file:", error);
      }
    }
    
    // Delete from database
    await ctx.db.delete(args.documentId);
  },
});

export const processDocument = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // This would integrate with a document processing service
    // For now, we'll simulate processing and update status
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update document status to completed
    await ctx.runMutation(internal.documents.updateDocumentStatus, {
      documentId: args.documentId,
      status: "completed",
      extractedText: "Sample extracted text from document...",
    });
  },
});

export const updateDocumentStatus = internalMutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
    extractedText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {

      content: args.extractedText || "",
    });
  },
});
