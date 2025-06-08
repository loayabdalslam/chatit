# 🤖 Complete Chatbot System Guide

This guide shows you how to set up and use the complete ChatIt.cloud chatbot system with AI-powered widgets that can be embedded anywhere.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   Convex API    │    │  Widget System  │
│   (React App)   │───▶│   (Backend)     │◀───│  (Embeddable)   │
│                 │    │                 │    │                 │
│ • Create Bots   │    │ • AI Responses  │    │ • CORS Enabled  │
│ • Manage Data   │    │ • Conversations │    │ • Real-time     │
│ • Analytics     │    │ • Analytics     │    │ • Universal     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start (5 Minutes)

### 1. Start the Development Servers

```bash
# Terminal 1: Start the frontend
npm run dev

# Terminal 2: Start the backend
npx convex dev
```

### 2. Create Your First Chatbot

1. **Open Dashboard**: Go to `http://localhost:5173`
2. **Quick Demo Setup**: Click "Quick Demo Setup" for instant chatbot
3. **Copy Chatbot ID**: Save the generated ID (like `k5750jnw9kbma8fncjj6ymy0697hbpvt`)

### 3. Test the Widget

1. **Open Test Page**: Go to `http://localhost:5173/widget-complete-test.html`
2. **Paste ID**: Enter your chatbot ID in the input field
3. **Update Widget**: Click "Update Widget" button
4. **Test Chat**: Click the widget in bottom-right corner and send messages

## 📋 Detailed Setup Guide

### Backend Configuration

The system uses **Convex** as the backend with these key API endpoints:

#### Chat API (`/api/chat`)
```javascript
POST /api/chat
{
  "chatbotId": "your-chatbot-id",
  "message": "Hello!",
  "sessionId": "unique-session-id"
}

Response:
{
  "response": "Hello! How can I help you today?"
}
```

#### Chatbot Info API (`/api/chatbot/:id`)
```javascript
GET /api/chatbot/k5750jnw9kbma8fncjj6ymy0697hbpvt

Response:
{
  "id": "k5750jnw9kbma8fncjj6ymy0697hbpvt",
  "name": "Demo Support Bot",
  "description": "A helpful customer support chatbot",
  "widgetConfig": {
    "primaryColor": "#e74c3c",
    "welcomeMessage": "Hi! How can I help you?"
  }
}
```

### AI Response System

The chatbot uses a **rule-based AI system** in `convex/conversations.ts`:

```typescript
// Example AI responses
if (message.includes("hello")) {
  return `Hello! I'm ${chatbot.name}. How can I help you today?`;
}

if (message.includes("help")) {
  return "I'm here to help! You can ask me questions about our products and services.";
}

if (message.includes("price")) {
  return "For pricing information, please contact our sales team.";
}
```

**Key Features:**
- ✅ Context-aware responses
- ✅ Conversation history
- ✅ Sentiment analysis
- ✅ Session management
- ✅ Fallback responses

### Widget Integration

The widget system supports **universal embedding** with CORS:

#### Basic Embed Code
```html
<!-- Replace with your actual chatbot ID -->
<div data-chatit-widget="k5750jnw9kbma8fncjj6ymy0697hbpvt"
     data-primary-color="#e74c3c" 
     data-position="bottom-right">
</div>
<script src="widget.js"></script>
```

#### Full Configuration Options
```html
<div data-chatit-widget="your-chatbot-id"
     data-primary-color="#e74c3c"
     data-position="bottom-right"
     data-theme="light"
     data-welcome-message="Hi! How can I help you?"
     data-placeholder="Type your message..."
     data-show-branding="true"
     data-border-radius="12"
     data-font-family="system-ui"
     data-animation="bounce"
     data-size="medium">
</div>
<script src="widget.js"></script>
```

## 🛠️ Creating Custom Chatbots

### 1. Manual Creation

1. **Go to Chatbots Page**: Click "Chatbots" in dashboard sidebar
2. **Create New**: Click "Create Custom Chatbot"
3. **Fill Details**:
   - **Name**: Your chatbot's display name
   - **Description**: Brief description of its purpose
   - **Instructions**: Detailed AI behavior instructions
4. **Training Data**: Add FAQs, product info, policies
5. **Documents**: Upload PDFs/DOCX files (optional)

### 2. Demo Creation (Recommended)

The **Quick Demo Setup** creates a pre-configured chatbot with:

```typescript
name: "Demo Support Bot"
instructions: `
You are a friendly customer support assistant. Your role is to:
1. Greet users warmly and professionally
2. Answer questions about products and services
3. Help with common issues like account setup, billing, troubleshooting
4. Provide clear, helpful responses
5. Direct users to human support when needed

Key information:
- Business hours: Monday-Friday 9AM-6PM EST
- 24/7 live chat support available
- 30-day money-back guarantee
- Technical support: support@example.com
`
```

### 3. AI Response Customization

Edit `convex/conversations.ts` to customize AI responses:

```typescript
// Add your custom response logic
if (message.includes("your-product")) {
  return "Our product is amazing! Here's what it can do...";
}

if (message.includes("pricing")) {
  return "We offer three plans: Basic ($9/mo), Pro ($29/mo), Enterprise ($99/mo)";
}
```

## 🧪 Testing & Debugging

### Test Pages Available

1. **Complete System Test**: `/widget-complete-test.html`
   - Full integration testing
   - Step-by-step guidance
   - Real chatbot ID testing

2. **AI Connection Test**: `/test-ai-connection.html`
   - Backend connectivity
   - API endpoint testing
   - Widget functionality

3. **CORS Test**: `/cors-test.html`
   - Cross-origin testing
   - External domain simulation

### Testing Checklist

- [ ] **Backend Running**: `npx convex dev` shows no errors
- [ ] **Frontend Running**: `npm run dev` accessible at localhost:5173
- [ ] **Chatbot Created**: Real chatbot ID from dashboard
- [ ] **API Responses**: Test endpoints return valid JSON
- [ ] **Widget Loading**: Script loads without console errors
- [ ] **Chat Working**: Messages get AI responses
- [ ] **CORS Enabled**: Widget works on external domains

### Common Issues & Solutions

**Issue**: Widget shows "Failed to send message"
```bash
# Solution: Check if backend is running
npx convex dev

# Check browser console for CORS errors
# Make sure chatbot ID is valid
```

**Issue**: "Chatbot not found" error
```bash
# Solution: Create a chatbot first
# Copy the exact ID from dashboard
# Check API endpoint: /api/chatbot/YOUR_ID
```

**Issue**: AI gives generic responses
```bash
# Solution: Customize AI logic in convex/conversations.ts
# Add specific response patterns
# Include training data in chatbot setup
```

## 🌐 Production Deployment

### 1. Deploy Backend (Convex)
```bash
npx convex deploy
```

### 2. Deploy Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### 3. Update Widget URLs
```html
<!-- Change script source to production URL -->
<script src="https://yourdomain.com/widget.js"></script>
```

### 4. Configure CORS
Make sure your production domain allows CORS in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    cors: {
      origin: ['https://yourdomain.com', '*'],
      credentials: true
    }
  }
});
```

## 📊 Analytics & Monitoring

The dashboard provides:

- **Conversation Analytics**: Total chats, messages, response times
- **Sentiment Analysis**: Positive/negative/neutral message tracking  
- **Performance Metrics**: Average response times, satisfaction rates
- **Usage Patterns**: Peak hours, popular topics
- **Widget Analytics**: Embedding domains, click-through rates

## 🔗 API Reference

### Core Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/chat` | POST | Send chat message | No |
| `/api/chatbot/:id` | GET | Get chatbot info | No |
| `/api/embed/:id` | GET | Get embed code | No |

### Widget Events

```javascript
// Listen for widget events
window.addEventListener('chatit-widget-ready', (e) => {
  console.log('Widget ready:', e.detail.chatbotId);
});

window.addEventListener('chatit-widget-message', (e) => {
  console.log('Message sent:', e.detail.message);
  console.log('AI response:', e.detail.response);
});
```

## 🎯 Next Steps

1. **Create Your Chatbot**: Use Quick Demo Setup for instant results
2. **Test Integration**: Use the provided test pages
3. **Customize Responses**: Edit AI logic for your use case
4. **Deploy to Production**: Follow deployment guide
5. **Monitor Performance**: Use dashboard analytics

## 📞 Support

- **Documentation**: This guide covers everything you need
- **Test Pages**: Use built-in testing tools first
- **Console Logs**: Check browser dev tools for errors
- **API Testing**: Use browser network tab to debug requests

---

**🎉 Congratulations!** You now have a complete AI chatbot system that can be embedded anywhere with full CORS support and real-time responses! 