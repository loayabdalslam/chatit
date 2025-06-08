# ChatIt Widget - Direct Convex Integration Guide

## Overview

This guide covers the complete implementation of ChatIt Widget with **direct Convex integration**. The widget connects directly to your Convex backend for **real AI responses only** - no fallback or fake responses.

## Key Features

- ✅ **Direct Convex Backend Integration**
- ✅ **Real AI Responses Only** (no fallbacks)
- ✅ **Automatic Environment Detection** (localhost vs production)
- ✅ **Origin Issue Resolution** with proper CORS
- ✅ **Connection Health Monitoring**
- ✅ **Smart Retry Mechanism** with visual feedback
- ✅ **Enhanced Error Handling**

## Architecture

```
Widget -> Convex HTTP Endpoints -> AI Actions -> Real Responses
```

### No API Layer Required
The widget connects directly to your Convex HTTP endpoints, eliminating the need for a separate API layer.

## Installation & Setup

### 1. Environment Auto-Detection

The widget automatically detects your environment:

```javascript
// Development (localhost) -> http://localhost:3000
// Production -> https://chatit.cloud
// Custom -> data-convex-url attribute
```

### 2. Basic Implementation

```html
<!-- Auto-detects environment -->
<div data-chatit-widget 
     data-chatit-primarycolor="#3b82f6"
     data-chatit-title="AI Assistant"
     data-chatit-chatbotid="default">
</div>
<script src="widget.js"></script>
```

### 3. Custom Configuration

```html
<!-- With custom Convex URL -->
<div data-chatit-widget 
     data-chatit-primarycolor="#10b981"
     data-chatit-title="Custom Bot"
     data-chatit-theme="dark"
     data-chatit-chatbotid="custom"
     data-convex-url="https://your-deployment.convex.cloud">
</div>
```

## Configuration Options

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-chatit-primarycolor` | Widget primary color | `#3b82f6` |
| `data-chatit-title` | Widget header title | `Chat Support` |
| `data-chatit-theme` | Widget theme (`light`/`dark`) | `light` |
| `data-chatit-chatbotid` | Chatbot identifier | `default` |
| `data-chatit-borderradius` | Border radius in pixels | `8` |
| `data-convex-url` | Custom Convex URL | Auto-detected |

## Convex Backend Requirements

### Required HTTP Endpoints

Your Convex backend must expose these HTTP endpoints:

#### 1. Health Check
```
GET/HEAD /api/health
```

#### 2. Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "message": "User message",
  "chatbotId": "chatbot-id", 
  "sessionId": "session-id"
}

Response:
{
  "message": "AI response"
}
```

#### 3. Chatbot Config (Optional)
```
POST /api/chatbot
Content-Type: application/json

{
  "chatbotId": "chatbot-id"
}

Response:
{
  "name": "Chatbot Name",
  "config": { ... }
}
```

### CORS Configuration

Ensure your Convex backend has proper CORS headers:

```javascript
// In your Convex http.ts
export default httpRouter
  .route({
    path: "/api/chat",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      // Add CORS headers
      const response = await handleChatMessage(ctx, request);
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
      return response;
    }),
  });
```

## Widget API

### Direct Widget Creation

```javascript
const widget = new ChatItWidget(element, {
  title: 'AI Assistant',
  primaryColor: '#3b82f6',
  chatbotId: 'your-chatbot-id',
  theme: 'light'
});
```

### Widget Methods

```javascript
// Open widget
widget.ui.open();

// Close widget
widget.ui.close();

// Send message programmatically
widget.sendMessage('Hello AI');

// Test connection
await widget.api.testConnection();
```

## Error Handling

The widget provides comprehensive error handling:

### Connection Errors
- Automatic connection health monitoring
- Visual connection status indicators
- Retry mechanisms with exponential backoff

### User Feedback
- Real-time error messages
- Connection status updates
- Loading indicators during requests

### Example Error Flow
```
1. Connection Lost -> Show "Connection lost" status
2. Auto-retry (3 attempts) -> Show "Retrying..." status  
3. Success -> Hide status / Failure -> Show error message
```

## Testing

### Test File
Use `test-convex-widget.html` for comprehensive testing:

- Connection health checks
- CORS configuration validation
- API endpoint testing
- Widget interaction tests
- Error simulation

### Manual Testing
```bash
# Development
npm run dev:frontend  # Start Vite dev server
npm run dev:backend   # Start Convex dev server
# Open test-convex-widget.html via localhost

# Production
# Deploy and test with production URLs
```

## Environment Detection

### Development (localhost)
```
Detected: localhost/127.0.0.1
Convex URL: http://localhost:3000
CORS: Relaxed for development
```

### Production
```
Detected: Any other domain
Convex URL: https://chatit.cloud
CORS: Strict production settings
```

### Custom Override
```html
<div data-chatit-widget data-convex-url="https://custom.convex.cloud">
```

## Real-Time Features

### Connection Monitoring
- Health checks every 30 seconds
- Visual status indicators
- Automatic reconnection

### Message Flow
```
User Input -> Widget -> Convex HTTP -> AI Action -> Real Response -> Widget UI
```

### Retry Logic
- 3 automatic retry attempts
- Exponential backoff delays
- User-visible retry status

## Security

### CORS
- Proper origin validation
- Environment-specific CORS policies
- Preflight request handling

### Data Validation
- Input sanitization
- Response validation
- Error message sanitization

## Deployment

### Development Setup
1. Start Convex dev server: `npm run dev:backend`
2. Start frontend dev server: `npm run dev:frontend`
3. Widget auto-detects localhost environment

### Production Deployment
1. Deploy Convex backend
2. Update production URL in widget
3. Configure production CORS policies
4. Deploy widget files

## Troubleshooting

### Common Issues

#### Connection Failed
```
Check: Convex server running?
Check: CORS headers configured?
Check: Firewall/network blocking?
```

#### No AI Responses
```
Check: Convex functions deployed?
Check: AI actions working?
Check: Request payload format?
```

#### CORS Errors
```
Check: Access-Control-Allow-Origin header
Check: Preflight OPTIONS handling
Check: Custom headers allowed
```

### Debug Mode

Enable debug logging:
```javascript
CONFIG.debug = true; // In widget.js
```

### Logs to Check
- Browser developer console
- Network tab for HTTP requests
- Convex dashboard logs
- Widget test suite logs

## Migration from Fallback Version

If migrating from a version with fallback responses:

1. **Remove fallback logic** - No longer needed
2. **Update error handling** - Focus on real connection issues
3. **Test thoroughly** - Ensure AI responses work
4. **Update expectations** - Users see real errors, not fake responses

## Performance

### Optimizations
- Connection pooling for requests
- Request timeout handling (30s)
- Automatic retry with exponential backoff
- Local storage for message history

### Monitoring
- Connection health checks
- Response time tracking
- Error rate monitoring
- User interaction analytics

## Support

For issues or questions:
1. Check browser console for errors
2. Use test-convex-widget.html for diagnostics
3. Verify Convex backend is responding
4. Test CORS configuration

---

**Note**: This implementation provides a **real AI chatbot experience** with direct Convex integration. No fake responses or fallbacks are used - all responses come from your actual AI backend. 