# Widget Setup and Testing Guide

## Overview

The chatbot widget system has been completely redesigned to work with dynamic routing and real chatbot responses. The widget now supports both authenticated and unauthenticated usage.

## Widget URL Structure

The widget supports multiple URL patterns:

1. **Direct Chatbot ID**: `https://your-domain.com/k5750jnw9kbma8fncjj6ymy0697hbpvt?parameters`
2. **Widget Route**: `https://your-domain.com/widget/k5750jnw9kbma8fncjj6ymy0697hbpvt?parameters`

## URL Parameters

The widget accepts the following customization parameters:

- `primaryColor` - Button and UI accent color (default: #2563eb)
- `position` - Widget position: bottom-right, bottom-left, top-right, top-left (default: bottom-right)
- `size` - Widget size: small, medium, large (default: medium)
- `welcomeMessage` - Initial greeting message (URL encoded)
- `placeholder` - Input field placeholder text (URL encoded)
- `showBranding` - Show "Powered by Chatit" (true/false, default: true)
- `borderRadius` - Button border radius in pixels (default: 12)
- `fontFamily` - Font family (default: system-ui)
- `animation` - Button animation: bounce, pulse, shake, none (default: bounce)
- `apiKey` - API key for authenticated requests (optional)

## Example Widget URLs

### Basic Widget
```
http://localhost:5173/k5750jnw9kbma8fncjj6ymy0697hbpvt
```

### Customized Widget
```
http://localhost:5173/k5750jnw9kbma8fncjj6ymy0697hbpvt?primaryColor=%23ff6b35&position=bottom-left&size=large&welcomeMessage=Hello%21%20How%20can%20I%20help%3F&placeholder=Ask%20me%20anything...&showBranding=false&borderRadius=20&animation=pulse
```

## Widget Features

### 1. Real-time Chat
- Connects to backend API for real chatbot responses
- Maintains conversation history per session
- Supports streaming responses (backend ready)

### 2. Customizable Appearance
- Configurable colors, position, size
- Multiple animation options
- Custom welcome messages and placeholders
- Optional branding

### 3. Cross-domain Support
- CORS enabled for all domains
- Can be embedded in any website
- PostMessage API for parent-child communication

### 4. Fallback Functionality
- Works without authentication
- Fallback responses when API is unavailable
- Graceful error handling

## Backend API Endpoints

### 1. Get Chatbot Info
```
GET /api/chatbot/:chatbotId
```
Returns chatbot configuration and widget settings.

### 2. Send Message
```
POST /api/chat
Content-Type: application/json

{
  "chatbotId": "string",
  "message": "string",
  "sessionId": "string"
}
```
Sends a message and returns AI response.

### 3. Widget Embed Code
```
GET /api/embed/:chatbotId
```
Returns JavaScript embed code for external websites.

## Testing the Widget

### 1. Start Development Servers
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npx convex dev
```

### 2. Test Direct Access
Open in browser:
```
http://localhost:5173/k5750jnw9kbma8fncjj6ymy0697hbpvt?primaryColor=%232563eb&position=bottom-right&size=medium&welcomeMessage=Hi%21+I%27m+your+assistant.+How+can+I+help+you+today%3F&placeholder=Type+your+message...&showBranding=true&borderRadius=12&fontFamily=system-ui&animation=bounce
```

### 3. Test in iframe
Create an HTML file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <h1>Test Page</h1>
    <p>The widget should appear in the bottom-right corner.</p>
    
    <iframe 
        src="http://localhost:5173/k5750jnw9kbma8fncjj6ymy0697hbpvt"
        style="position: fixed; bottom: 0; right: 0; width: 400px; height: 600px; border: none; z-index: 999999;"
        allow="microphone; camera">
    </iframe>
</body>
</html>
```

### 4. Test Widget Test Page
Visit:
```
http://localhost:5173/widget-test.html
```

## Troubleshooting

### Widget Not Loading
1. Check console for JavaScript errors
2. Verify Convex backend is running
3. Check network requests for API calls
4. Ensure chatbot ID exists in database

### API Errors
1. Check Convex dev server is running
2. Verify CORS headers are working
3. Check API endpoints return valid JSON
4. Test with valid chatbot ID

### Styling Issues
1. Check URL parameter encoding
2. Verify CSS values are valid
3. Test with default parameters first
4. Check for CSS conflicts in parent page

## Production Deployment

### 1. Environment Variables
```bash
# .env
CONVEX_URL=your-convex-url
NODE_ENV=production
```

### 2. Build and Deploy
```bash
npm run build
npx convex deploy
```

### 3. Widget Distribution
Share the widget URL with customization parameters:
```
https://your-domain.com/CHATBOT_ID?customization_parameters
```

## Security Considerations

1. **API Keys**: Optional for public widgets, required for private ones
2. **CORS**: Configured for all domains (adjust for production)
3. **Rate Limiting**: Implement on API endpoints for production
4. **Content Filtering**: Add message content validation
5. **Session Management**: Secure session handling for conversations

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API endpoints with curl/Postman
3. Test with minimal configuration first
4. Check Convex dashboard for backend errors 