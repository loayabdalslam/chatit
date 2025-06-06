# Chatbot Widget API Integration Guide

## 🚀 Overview

This guide covers the new API endpoints and embedding capabilities for the chatbot widget system. The widget now dynamically fetches chatbot configuration and supports easy integration with any website or system.

## 🔧 API Endpoints

### 1. Get Chatbot Configuration
**Endpoint:** `GET /api/chatbot/{chatbotId}`

Retrieves chatbot information and widget configuration.

**Response:**
```json
{
  "id": "chatbot_id",
  "name": "My Assistant",
  "description": "Helpful AI assistant",
  "widgetConfig": {
    "primaryColor": "#2563eb",
    "position": "bottom-right",
    "size": "medium",
    "welcomeMessage": "Hi! I'm My Assistant. How can I help you today?",
    "placeholder": "Type your message...",
    "showBranding": true,
    "borderRadius": 12,
    "fontFamily": "system-ui",
    "animation": "bounce",
    "theme": "light"
  }
}
```

### 2. Send Chat Message
**Endpoint:** `POST /api/chat`

Sends a message and receives a response from the chatbot.

**Request Body:**
```json
{
  "chatbotId": "your_chatbot_id",
  "message": "Hello, how are you?",
  "sessionId": "unique_session_id"
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing great, thank you for asking. How can I help you today?"
}
```

### 3. Get Embed Code
**Endpoint:** `GET /api/embed/{chatbotId}`

Returns ready-to-use HTML embed code for the chatbot widget.

**Response:** HTML script tag with all necessary configuration.

## 🎨 Widget Integration

### Basic Integration

The simplest way to add the chatbot widget to any website:

```html
<script 
  src="https://your-domain.com/widget.js"
  data-chatbot-id="your_chatbot_id"
  data-api-url="https://your-domain.com">
</script>
```

### Advanced Configuration

For custom styling and behavior:

```html
<script 
  src="https://your-domain.com/widget.js"
  data-chatbot-id="your_chatbot_id"
  data-api-url="https://your-domain.com"
  data-theme="dark"
  data-primary-color="#667eea"
  data-position="bottom-left"
  data-size="large"
  data-welcome-message="Custom welcome message"
  data-placeholder="Ask me anything..."
  data-show-branding="false"
  data-border-radius="8"
  data-font-family="Inter"
  data-animation="pulse">
</script>
```

### Widget Configuration Options

| Attribute | Default | Options | Description |
|-----------|---------|---------|-------------|
| `data-chatbot-id` | - | string | **Required.** Your chatbot ID |
| `data-api-url` | current origin | URL | API base URL |
| `data-theme` | `light` | `light`, `dark` | Widget color theme |
| `data-primary-color` | `#2563eb` | hex color | Main accent color |
| `data-position` | `bottom-right` | `bottom-right`, `bottom-left`, `top-right`, `top-left` | Widget position |
| `data-size` | `medium` | `small`, `medium`, `large` | Widget size |
| `data-welcome-message` | Auto-generated | string | Initial bot message |
| `data-placeholder` | `Type your message...` | string | Input placeholder text |
| `data-show-branding` | `true` | `true`, `false` | Show "Powered by" text |
| `data-border-radius` | `12` | number | Corner roundness in pixels |
| `data-font-family` | `system-ui` | string | Font family name |
| `data-animation` | `bounce` | `bounce`, `pulse`, `none` | Button animation |

## 💡 Dynamic Configuration

The widget automatically fetches chatbot configuration from the server, including:

- **Chatbot name** - Used as widget title
- **Welcome message** - Customized greeting
- **Widget styling** - Colors, theme, positioning
- **Behavior settings** - Animations, branding

This means you can update the chatbot configuration in your admin panel, and all embedded widgets will automatically use the new settings without code changes.

## 🔐 CORS Configuration

The API includes proper CORS headers to allow embedding on any domain:

```javascript
// Automatic CORS headers
"Access-Control-Allow-Origin": "*"
"Access-Control-Allow-Methods": "POST, OPTIONS, GET, PUT, DELETE"
"Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key"
```

## 🛠 Error Handling

The widget includes comprehensive error handling:

- **Network errors** - Shows connection error message
- **Invalid chatbot ID** - Graceful fallback to default config
- **API errors** - Displays appropriate error messages
- **Missing configuration** - Uses sensible defaults

## 📱 Responsive Design

The widget is fully responsive and works on:

- **Desktop computers** - Full-featured chat interface
- **Tablets** - Optimized touch interactions
- **Mobile phones** - Responsive layout and sizing
- **All screen sizes** - Adaptive positioning and scaling

## 🚀 Integration Examples

### WordPress
```php
// Add to your theme's functions.php or use a plugin
function add_chatbot_widget() {
    echo '<script src="https://your-domain.com/widget.js" data-chatbot-id="your_id" data-api-url="https://your-domain.com"></script>';
}
add_action('wp_footer', 'add_chatbot_widget');
```

### React
```jsx
import { useEffect } from 'react';

function ChatbotWidget({ chatbotId }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.setAttribute('data-chatbot-id', chatbotId);
    script.setAttribute('data-api-url', 'https://your-domain.com');
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, [chatbotId]);

  return null;
}
```

### Vue.js
```vue
<template>
  <div id="app">
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  mounted() {
    this.loadChatbot();
  },
  methods: {
    loadChatbot() {
      const script = document.createElement('script');
      script.src = 'https://your-domain.com/widget.js';
      script.setAttribute('data-chatbot-id', 'your_chatbot_id');
      script.setAttribute('data-api-url', 'https://your-domain.com');
      document.head.appendChild(script);
    }
  }
}
</script>
```

### Shopify
```liquid
<!-- Add to your theme's layout/theme.liquid before </body> -->
<script 
  src="https://your-domain.com/widget.js"
  data-chatbot-id="your_chatbot_id"
  data-api-url="https://your-domain.com"
  data-primary-color="{{ settings.accent_color }}"
  data-theme="light">
</script>
```

## 🎯 Best Practices

1. **Performance** - The widget loads asynchronously and won't block page rendering
2. **SEO-friendly** - No impact on search engine optimization
3. **Accessibility** - Includes proper ARIA labels and keyboard navigation
4. **Privacy** - Session data is stored locally, respects user privacy
5. **Customization** - Inherits your site's design system when configured properly

## 🐛 Troubleshooting

### Common Issues

**Widget not appearing:**
- Check that the chatbot ID is correct
- Verify the API URL is accessible
- Check browser console for errors

**CORS errors:**
- Ensure you're using the latest version of the widget
- Check that your API domain is correctly configured

**Styling conflicts:**
- Use specific CSS selectors to override widget styles
- Check for conflicting z-index values

**Connection issues:**
- Verify your chatbot is active in the admin panel
- Check network connectivity
- Ensure the API endpoints are responding correctly

## 📞 Support

For technical support or questions about the widget integration:

1. Check the browser console for error messages
2. Verify all configuration attributes are correct
3. Test with a simple HTML page first
4. Contact support with specific error details and reproduction steps 