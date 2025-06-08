# Instruction-Based AI System Guide

## Overview

The enhanced `ai.ts` file provides a comprehensive, instruction-based AI message system using Convex patterns. This system eliminates static responses and generates dynamic, contextual responses based on chatbot instructions and conversation context.

## Key Features

### 🎯 **Dynamic Response Generation**
- All responses are generated based on chatbot instructions
- No more static, hardcoded responses
- Context-aware conversation flow analysis
- Adaptive response styles based on conversation stage

### 🔄 **Backward Compatibility**
- Maintains existing widget integration points
- `generateResponseSync` and `generateResponse` still work
- Seamless migration from old system

### 🚀 **Advanced Features**
- Real-time instruction analysis
- Conversation flow optimization
- Batch message processing
- Streaming response support
- Instruction validation and testing

### 📄 **Document Storage Integration**
- **File-based AI responses** using Convex storage patterns
- **PDF, DOCX, TXT support** with content extraction
- **Document search and retrieval** for contextual responses
- **Batch document processing** for efficient file handling
- **Real-time document context** in AI conversations

## Core Functions

### Main AI Functions

#### `generateDynamicResponse`
```typescript
// Primary AI response generator
const response = await ctx.runAction(internal.ai.generateDynamicResponse, {
  conversationId: "conversation_id",
  userMessage: "How can I help you?",
  chatbotId: "chatbot_id",
  useRealAI: true, // Optional, defaults to true
});
```

#### `generateDocumentBasedResponse` ⭐ **NEW**
```typescript
// Enhanced AI response with document context
const response = await ctx.runAction(internal.ai.generateDocumentBasedResponse, {
  conversationId: "conversation_id",
  userMessage: "What does the user manual say about setup?",
  chatbotId: "chatbot_id",
  useDocumentContext: true, // Include document context
  maxDocumentsToInclude: 10, // Limit documents for performance
});
```

### Document Management Functions

#### `loadChatbotDocuments`
```typescript
// Load all documents for a chatbot with metadata
const documents = await ctx.runQuery(internal.ai.loadChatbotDocuments, {
  chatbotId: "chatbot_id",
  includeContent: true, // Include extracted text content
  maxDocuments: 50, // Limit for performance
});

// Returns:
// {
//   documents: [...],     // Document details with content
//   totalDocuments: 25,   // Total count
//   totalSize: 1048576,   // Total size in bytes
// }
```

#### `searchChatbotDocuments`
```typescript
// Search documents for relevant content
const results = await ctx.runQuery(internal.ai.searchChatbotDocuments, {
  chatbotId: "chatbot_id",
  query: "user authentication setup",
  maxResults: 5,
});

// Returns relevant documents with snippets:
// [
//   {
//     documentId: "doc_id",
//     name: "User Manual.pdf",
//     relevantContent: "Authentication setup requires...",
//     score: 0.85,
//     type: "pdf"
//   }
// ]
```

#### `processStoredFile`
```typescript
// Extract content from uploaded files
const result = await ctx.runAction(internal.ai.processStoredFile, {
  documentId: "document_id",
  forceReprocess: false, // Skip if already processed
});

// Returns:
// {
//   success: true,
//   content: "Extracted text content...",
//   wordCount: 1250,
//   error: null
// }
```

#### `processChatbotDocuments`
```typescript
// Batch process all documents for a chatbot
const result = await ctx.runAction(internal.ai.processChatbotDocuments, {
  chatbotId: "chatbot_id",
  forceReprocess: false,
});

// Returns processing summary:
// {
//   processed: 15,
//   errors: 1,
//   skipped: 8,
//   totalSize: 2097152
// }
```

### Context and Analysis

#### `loadConversationContext`
```typescript
// Load comprehensive conversation context
const context = await ctx.runQuery(internal.ai.loadConversationContext, {
  conversationId: "conversation_id",
  chatbotId: "chatbot_id",
});

// Returns:
// {
//   messages: [...],          // Conversation history
//   chatbot: {...},          // Bot configuration
//   conversationMeta: {...}  // Metadata
// }
```

#### `processInstructionBasedResponse`
```typescript
// Core intelligence engine
const response = await ctx.runQuery(internal.ai.processInstructionBasedResponse, {
  userMessage: "User's question",
  chatbotInstructions: "Be helpful and professional...",
  chatbotName: "Assistant",
  chatbotDescription: "AI Assistant",
  conversationHistory: [...],
  useAdvancedProcessing: true,
});
```

#### `processDocumentAwareResponse` ⭐ **NEW**
```typescript
// Enhanced response processing with document context
const response = await ctx.runQuery(internal.ai.processDocumentAwareResponse, {
  userMessage: "How do I configure the API?",
  chatbotInstructions: "Be technical and precise...",
  chatbotName: "TechBot",
  chatbotDescription: "Technical support assistant",
  conversationHistory: [...],
  documentContext: [...], // Available documents
  useAdvancedProcessing: true,
});
```

## File Storage Best Practices

### Following Convex Guidelines
The implementation follows Convex file storage best practices:

1. **Storage Metadata Access**:
   ```typescript
   // ✅ Correct: Use ctx.db.system.get() for file metadata
   const metadata = await ctx.db.system.get(storageId);
   
   // ❌ Deprecated: Don't use ctx.storage.getMetadata()
   ```

2. **File URL Generation**:
   ```typescript
   // ✅ Correct: Get signed URLs
   const fileUrl = await ctx.storage.getUrl(storageId);
   if (!fileUrl) {
     // Handle file not found
   }
   ```

3. **Blob Handling**:
   ```typescript
   // Files are stored as Blob objects
   // Convert to/from Blob when processing
   ```

### Document Schema Integration
Your documents table structure is fully supported:

```typescript
// convex/schema.ts
documents: defineTable({
  chatbotId: v.id("chatbots"),      // ✅ Chatbot association
  userId: v.id("users"),            // ✅ User ownership
  name: v.string(),                 // ✅ File name
  content: v.string(),              // ✅ Extracted text content
  type: v.string(),                 // ✅ File type (pdf, txt, docx)
  size: v.optional(v.number()),     // ✅ File size
  uploadedAt: v.optional(v.number()), // ✅ Upload timestamp
  fileId: v.optional(v.id("_storage")), // ✅ Storage reference
  storageId: v.optional(v.id("_storage")), // ✅ Alternative storage ref
  status: v.optional(v.string()),   // ✅ Processing status
}).index("by_chatbot", ["chatbotId"]), // ✅ Efficient queries
```

## Enhanced Features

### Document-Aware Responses
The AI system now intelligently uses document content to provide accurate, contextual responses:

```typescript
// Example: User asks about API configuration
// System searches through:
// - API_Documentation.pdf
// - Setup_Guide.docx  
// - Configuration_Examples.txt
//
// Response includes relevant excerpts and accurate information
```

### Smart Document Search
```typescript
const results = await ctx.runQuery(internal.ai.searchChatbotDocuments, {
  chatbotId: "chatbot_id",
  query: "payment integration webhook",
  maxResults: 3,
});

// Returns documents ranked by relevance with extracted snippets
```

### Streaming Responses
```typescript
const result = await ctx.runAction(internal.ai.generateStreamingResponse, {
  conversationId: "conversation_id",
  userMessage: "User message",
  chatbotId: "chatbot_id",
});

// Returns response + metadata:
// {
//   response: "AI response",
//   metadata: {
//     processingTime: 150,
//     confidenceScore: 0.85,
//     instructionMatch: "high"
//   }
// }
```

### Batch Processing
```typescript
const results = await ctx.runAction(internal.ai.processBatchMessages, {
  requests: [
    { conversationId: "conv1", userMessage: "Hello", chatbotId: "bot1" },
    { conversationId: "conv2", userMessage: "Help", chatbotId: "bot2" },
  ]
});
```

### Instruction Validation
```typescript
const validation = await ctx.runQuery(internal.ai.validateInstructions, {
  instructions: "Be helpful, friendly, and provide detailed technical support...",
  testMessages: ["How do I setup?", "What's the price?", "I need help"],
});

// Returns:
// {
//   isValid: true,
//   score: 0.8,
//   suggestions: [...],
//   testResults: [...]
// }
```

## How Document Processing Works

### 1. **File Upload & Storage**
- Files uploaded via Convex storage system
- Stored with metadata in `_storage` table
- Document records created with references

### 2. **Content Extraction**
- `processStoredFile` extracts text from files
- Supports PDF, DOCX, TXT, and other formats
- Content stored in document `content` field

### 3. **Document Indexing**
- Documents processed and marked as "processed"
- Content searchable for AI responses
- Metadata tracked for optimization

### 4. **AI Integration**
- AI queries search relevant documents
- Context includes document excerpts
- Responses cite source documents

### 5. **Real-time Updates**
- New documents automatically available
- Content updates trigger reprocessing
- AI responses stay current

## Implementation Examples

### Basic Document-Based Chatbot
```typescript
// 1. Process all documents for a chatbot
await ctx.runAction(internal.ai.processChatbotDocuments, {
  chatbotId: "my_chatbot_id",
});

// 2. Generate document-aware responses
const response = await ctx.runAction(internal.ai.generateDocumentBasedResponse, {
  conversationId: "conversation_id",
  userMessage: "How do I integrate payments?",
  chatbotId: "my_chatbot_id",
  useDocumentContext: true,
});

// Response will include relevant information from uploaded documents
```

### Advanced Document Search
```typescript
// Search for specific information
const searchResults = await ctx.runQuery(internal.ai.searchChatbotDocuments, {
  chatbotId: "support_bot",
  query: "troubleshooting login issues",
  maxResults: 5,
});

// Use search results in custom response logic
for (const result of searchResults) {
  console.log(`Found in ${result.name}: ${result.relevantContent}`);
}
```

### File Processing Pipeline
```typescript
// 1. Upload file to Convex storage
const storageId = await ctx.storage.store(file);

// 2. Create document record
const documentId = await ctx.db.insert("documents", {
  chatbotId: "bot_id",
  userId: "user_id", 
  name: "API_Guide.pdf",
  type: "pdf",
  storageId: storageId,
  status: "pending",
});

// 3. Process file content
const result = await ctx.runAction(internal.ai.processStoredFile, {
  documentId: documentId,
});

// 4. Content now available for AI responses
```

## Migration Guide

### From Basic AI to Document-Enhanced AI

**Before:**
```typescript
// Basic instruction-based response
const response = await ctx.runAction(internal.ai.generateDynamicResponse, {
  conversationId: args.conversationId,
  userMessage: args.userMessage,
  chatbotId: args.chatbotId,
});
```

**After:**
```typescript
// Document-enhanced response
const response = await ctx.runAction(internal.ai.generateDocumentBasedResponse, {
  conversationId: args.conversationId,
  userMessage: args.userMessage,
  chatbotId: args.chatbotId,
  useDocumentContext: true, // Enable document integration
});
```

### Widget Integration
The system maintains backward compatibility:

```typescript
// This still works exactly as before
const response = await ctx.runAction(internal.ai.generateResponseSync, {
  conversationId: "conv_id",
  userMessage: "Hello",
  chatbotId: "bot_id",
});

// But now includes document context automatically if available
```

## Best Practices

### 1. **Document Management**
```typescript
// Good: Process documents after upload
await ctx.runAction(internal.ai.processChatbotDocuments, {
  chatbotId: "bot_id",
});

// Good: Regular reprocessing for updates
await ctx.runAction(internal.ai.processChatbotDocuments, {
  chatbotId: "bot_id",
  forceReprocess: true, // Reprocess all documents
});
```

### 2. **Performance Optimization**
```typescript
// Good: Limit document context for performance
const response = await ctx.runAction(internal.ai.generateDocumentBasedResponse, {
  conversationId: "conv_id",
  userMessage: "question",
  chatbotId: "bot_id",
  maxDocumentsToInclude: 5, // Limit for faster responses
});

// Good: Search before full processing
const relevantDocs = await ctx.runQuery(internal.ai.searchChatbotDocuments, {
  chatbotId: "bot_id",
  query: userMessage,
  maxResults: 3,
});
```

### 3. **Error Handling**
```typescript
try {
  const response = await ctx.runAction(internal.ai.generateDocumentBasedResponse, {
    // ... args
  });
  return response;
} catch (error) {
  // Fallback to regular instruction-based response
  return await ctx.runAction(internal.ai.generateDynamicResponse, {
    // ... fallback args
  });
}
```

### 4. **File Type Support**
Currently supported file types:
- **PDF**: `.pdf` files with text extraction
- **Text**: `.txt` files with direct content reading
- **Word**: `.docx` files with content extraction
- **Extensible**: Framework ready for additional formats

### 5. **Storage Best Practices**
- Use `storageId` field for new implementations
- Maintain `fileId` for backward compatibility
- Process files asynchronously after upload
- Monitor storage usage and file sizes

## Monitoring and Analytics

### Document Processing Status
```typescript
// Check document processing status
const documents = await ctx.runQuery(internal.ai.loadChatbotDocuments, {
  chatbotId: "bot_id",
  includeContent: false, // Just metadata for status check
});

documents.documents.forEach(doc => {
  console.log(`${doc.name}: ${doc.status}`); // processed, pending, error
});
```

### Conversation Analytics with Document Context
```typescript
// Enhanced analytics including document usage
const analysis = await ctx.runQuery(internal.ai.analyzeConversationFlowDetailed, {
  conversationId: "conversation_id",
  analysisDepth: "comprehensive",
});

// Includes document relevance and usage patterns
```

### Performance Monitoring
```typescript
// Monitor processing performance
const processingResult = await ctx.runAction(internal.ai.processChatbotDocuments, {
  chatbotId: "bot_id",
});

console.log(`Processed: ${processingResult.processed}`);
console.log(`Errors: ${processingResult.errors}`);
console.log(`Total size: ${processingResult.totalSize} bytes`);
```

## Advanced Usage

### Custom Document Processing
For specific document types or custom extraction logic:

```typescript
// Extend the extractFileContent function for custom processing
// Add support for additional file formats
// Integrate with external content extraction services
```

### Vector Search Integration
For production deployments, consider integrating vector search:

```typescript
// Replace keyword search with vector similarity
// Use embeddings for semantic document search
// Implement RAG (Retrieval-Augmented Generation) patterns
```

### Real-time Document Updates
```typescript
// Monitor document changes and trigger reprocessing
// Implement webhook handlers for external document updates
// Cache frequently accessed document content
```

## Conclusion

This document-enhanced instruction-based AI system provides:

- **Complete Document Integration**: PDF, DOCX, TXT support with Convex storage
- **Intelligent Context**: Documents automatically inform AI responses
- **Scalable Processing**: Batch operations and efficient storage patterns
- **Backward Compatibility**: Existing code continues to work seamlessly
- **Performance Optimized**: Smart caching and content limiting
- **Production Ready**: Follows Convex best practices throughout

The system eliminates static responses entirely while adding powerful document-based knowledge capabilities, ensuring every interaction is dynamic, contextual, and informed by your chatbot's specific instructions and available documentation. 