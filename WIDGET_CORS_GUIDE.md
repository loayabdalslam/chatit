# ChatIt.cloud Widget - CORS-Enabled Universal Embed

## 🌐 Overview

The ChatIt.cloud widget has been completely rewritten to support **full CORS functionality**, allowing it to be embedded on any website without domain restrictions. This new implementation provides a seamless chat experience with automatic fallback handling for network issues.

## 🚀 Quick Start

### Basic Implementation

```html
<div data-chatit-widget="k5750jnw9kbma8fncjj6ymy0697hbpvt"
     data-primary-color="#e74c3c"
     data-position="bottom-right">
</div>
<script src="https://chatit.cloud/widget.js"></script>
```

That's it! The widget will automatically initialize and be ready to use.

## ✨ Key Features

### CORS Support
- ✅ **Universal Embedding**: Works on any domain or website
- ✅ **No iframe Restrictions**: Direct DOM integration
- ✅ **Automatic Fallback**: Graceful degradation when API is unreachable
- ✅ **Secure Communication**: Proper CORS headers and security measures

### User Experience
- 📱 **Mobile Responsive**: Full-screen chat on mobile devices
- 💾 **Message Persistence**: Conversations saved locally
- 🎨 **Customizable Themes**: Light/dark mode support
- ⚡ **Fast Loading**: Optimized bundle size and performance

### Developer Features
- 🔄 **Dynamic Loading**: Supports widgets added after page load
- 📊 **Event Tracking**: Custom events for analytics integration
- 🛡️ **Security Focused**: XSS protection and input sanitization
- 🎯 **Auto-initialization**: Zero configuration needed

## 📋 Configuration Options

| Attribute | Description | Default | Example |
|-----------|-------------|---------|---------|
| `data-chatit-widget` | **Required** - Your chatbot ID | - | `k5750jnw9kbma8fncjj6ymy0697hbpvt` |
| `data-primary-color` | Widget theme color | `#e74c3c` | `#9b59b6` |
| `data-position` | Widget position | `bottom-right` | `bottom-left`, `top-right`, `top-left` |
| `data-animation` | Button animation | `bounce` | `pulse`, `shake`, `none` |
| `data-welcome-message` | Initial greeting | `Hi! How can I help...` | `Welcome to our store!` |
| `data-placeholder` | Input placeholder | `Type your message...` | `Ask us anything...` |
| `data-chatbot-name` | Display name in header | `Assistant` | `Store Assistant` |
| `data-show-branding` | Show "Powered by" footer | `true` | `false` |
| `data-theme` | Widget theme | `light` | `dark` |
| `data-border-radius` | Button border radius (px) | `50` | `12` |
| `data-api-url` | Custom API endpoint | `https://chatit.cloud` | `https://api.yoursite.com` |

## 🎨 Examples

### 1. Basic Widget
```html
<div data-chatit-widget="your-chatbot-id"></div>
<script src="https://chatit.cloud/widget.js"></script>
```

### 2. Custom Styling
```html
<div data-chatit-widget="your-chatbot-id"
     data-primary-color="#9b59b6"
     data-position="bottom-left"
     data-animation="pulse">
</div>
<script src="https://chatit.cloud/widget.js"></script>
```

### 3. Personalized Messages
```html
<div data-chatit-widget="your-chatbot-id"
     data-welcome-message="Welcome to our store!"
     data-placeholder="Ask us anything..."
     data-chatbot-name="Store Assistant">
</div>
<script src="https://chatit.cloud/widget.js"></script>
```

### 4. Enterprise Setup
```html
<div data-chatit-widget="your-chatbot-id"
     data-primary-color="#2c3e50"
     data-show-branding="false"
     data-api-url="https://api.yourcompany.com"
     data-theme="dark">
</div>
<script src="https://chatit.cloud/widget.js"></script>
```

## 📊 Analytics & Events

The widget dispatches custom events that you can listen to for analytics:

```javascript
// Widget ready
window.addEventListener('chatit-widget-ready', (e) => {
    console.log('Widget ready:', e.detail.chatbotId);
    // Track widget initialization
});

// Widget opened/closed
window.addEventListener('chatit-widget-opened', (e) => {
    // Track widget opens
    gtag('event', 'widget_opened', {
        chatbot_id: e.detail.chatbotId
    });
});

window.addEventListener('chatit-widget-closed', (e) => {
    // Track widget closes
    gtag('event', 'widget_closed', {
        chatbot_id: e.detail.chatbotId
    });
});

// Messages sent
window.addEventListener('chatit-widget-message', (e) => {
    console.log('Message sent:', e.detail.message);
    console.log('Response received:', e.detail.response);
    
    // Track conversations
    gtag('event', 'widget_message', {
        chatbot_id: e.detail.chatbotId,
        message_length: e.detail.message.length
    });
});
```

## 🔧 Advanced Usage

### Manual Widget Creation

```javascript
// Create widget programmatically
const widget = new ChatItWidget({
    chatbotId: 'your-chatbot-id',
    primaryColor: '#e74c3c',
    position: 'bottom-right',
    welcomeMessage: 'Hello! How can I help you?'
});

// Control widget
widget.open();
widget.close();
widget.toggle();

// Destroy widget
widget.destroy();
```

### Multiple Widgets

```html
<!-- Support widget -->
<div data-chatit-widget="support-bot-id"
     data-primary-color="#2ecc71"
     data-position="bottom-right"
     data-chatbot-name="Support">
</div>

<!-- Sales widget -->
<div data-chatit-widget="sales-bot-id"
     data-primary-color="#3498db"
     data-position="bottom-left"
     data-chatbot-name="Sales">
</div>

<script src="https://chatit.cloud/widget.js"></script>
```

## 🛡️ Security Features

- **XSS Protection**: All user inputs are sanitized
- **CORS Compliant**: Proper cross-origin request handling
- **No Cookies**: Session data stored locally only
- **Content Security Policy**: Compatible with strict CSP headers
- **Input Validation**: Server-side and client-side validation

## 📱 Mobile Optimization

- **Responsive Design**: Adapts to all screen sizes
- **Touch Friendly**: Optimized for mobile interactions
- **Full-Screen Mode**: Chat window takes full screen on mobile
- **Keyboard Support**: Proper mobile keyboard handling

## 🔄 Fallback Handling

When the API is unreachable, the widget provides:

- **Smart Fallback Responses**: Context-aware default messages
- **Offline Indicators**: Clear visual feedback
- **Message Queuing**: Stores messages for when connection resumes
- **Graceful Degradation**: Widget remains functional

## 🌐 Deployment

### Development
```bash
npm run dev
# Widget available at: http://localhost:5173/widget.js
```

### Production
```bash
npm run build
# Deploy dist/ folder to your CDN
# Widget available at: https://yourcdn.com/widget.js
```

### CORS Headers
Ensure your server includes these headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
```

## 🧪 Testing

Test the widget implementation:

1. Open `/public/cors-test.html` in your browser
2. Check browser console for event logs
3. Test widget functionality across different domains
4. Verify fallback behavior when API is offline

## 🔗 Migration from v1

### Old Implementation (iframe-based)
```html
<iframe src="https://chatit.cloud/widget/chatbot-id" 
        width="70" height="70"></iframe>
```

### New Implementation (CORS-enabled)
```html
<div data-chatit-widget="chatbot-id"></div>
<script src="https://chatit.cloud/widget.js"></script>
```

### Benefits of Migration
- ✅ Better performance (no iframe overhead)
- ✅ More customization options
- ✅ Better mobile experience
- ✅ Improved accessibility
- ✅ Enhanced analytics capabilities

## 📞 Support

For technical support or questions about the CORS-enabled widget:

- 📧 Email: support@chatit.cloud
- 📚 Documentation: https://docs.chatit.cloud
- 🐛 Issues: Create an issue in the repository

## 📄 License

This widget implementation is part of the ChatIt.cloud platform and is subject to the terms of service. 