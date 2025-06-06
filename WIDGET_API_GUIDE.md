# ChatBase Widget Integration Guide

## Overview

The ChatBase Widget uses an **iframe-based architecture** that completely eliminates CORS issues by hosting the widget page on the same domain as your API. This approach is more secure, reliable, and works from any website or local file.

## How It Works

1. **Widget Page**: A dedicated HTML page (`widget.html`) contains the full chat interface
2. **Iframe Embedding**: The widget is embedded using iframes that load the widget page
3. **Same-Origin Requests**: All API calls happen from within the iframe (same domain), avoiding CORS
4. **Configuration**: Widget settings are passed via URL parameters

## Integration Methods

### Method 1: JavaScript Embed (Recommended)

Load the embed script and create widgets programmatically:

```html
<script src="https://fast-bulldog-662.convex.app/embed.js"></script>
<script>
    ChatBaseWidget.embed({
        chatbotId: 'your-chatbot-id',
        position: 'bottom-right', // or 'bottom-left', 'inline'
        width: '400px',
        height: '600px'
    });
</script>
```

### Method 2: Inline Container Embedding

Embed the widget in a specific container:

```html
<script src="https://fast-bulldog-662.convex.app/embed.js"></script>
<div id="my-chatbot"></div>
<script>
    ChatBaseWidget.embed({
        chatbotId: 'your-chatbot-id',
        containerId: 'my-chatbot',
        width: '400px',
        height: '600px',
        position: 'inline'
    });
</script>
```

### Method 3: Auto-embed with Data Attributes

The simplest method - just add data attributes:

```html
<script src="https://fast-bulldog-662.convex.app/embed.js"></script>
<div data-chatbase-widget 
     data-chatbot-id="your-chatbot-id"
     data-position="inline"
     data-width="400px" 
     data-height="600px">
</div>
```

### Method 4: Direct iframe (No JavaScript)

For the most basic integration:

```html
<iframe 
    src="https://fast-bulldog-662.convex.app/widget.html?chatbotId=your-chatbot-id"
    width="400" 
    height="600"
    style="border: none; border-radius: 12px;">
</iframe>
```

## Configuration Options

### JavaScript Embed Options

```javascript
ChatBaseWidget.embed({
    chatbotId: 'your-chatbot-id',    // Required: Your chatbot ID
    containerId: 'container-id',      // For inline widgets
    width: '400px',                   // Widget width
    height: '600px',                  // Widget height
    position: 'bottom-right',         // 'bottom-right', 'bottom-left', 'inline'
    theme: 'light'                    // Theme (future use)
});
```

### Data Attributes

- `data-chatbase-widget`: Enables auto-embedding
- `data-chatbot-id`: Your chatbot ID
- `data-position`: Widget position ('inline' for containers)
- `data-width`: Widget width
- `data-height`: Widget height

### URL Parameters (for direct iframe)

- `chatbotId`: Your chatbot ID
- `theme`: Theme preference (future use)

## Widget Positions

### Floating Widgets

- **bottom-right**: Floating button in bottom-right corner
- **bottom-left**: Floating button in bottom-left corner

### Inline Widgets

- **inline**: Embedded directly in a page container

## API Endpoints

The widget automatically uses these endpoints:

- `GET /api/chatbot/{chatbotId}` - Fetch chatbot configuration
- `POST /api/chat` - Send messages and receive responses

## Advanced Usage

### Multiple Widgets

You can embed multiple widgets with different chatbot IDs:

```javascript
// Support chatbot
ChatBaseWidget.embed({
    chatbotId: 'support-bot',
    containerId: 'support-widget',
    position: 'inline'
});

// Sales chatbot
ChatBaseWidget.embed({
    chatbotId: 'sales-bot',
    position: 'bottom-right'
});
```

### Dynamic Widget Creation

```javascript
function showChatbot(chatbotId) {
    ChatBaseWidget.embed({
        chatbotId: chatbotId,
        position: 'bottom-right',
        width: '400px',
        height: '600px'
    });
}
```

### Widget Removal

For floating widgets, you can remove them programmatically:

```javascript
// Remove floating widgets
const floatingButtons = document.querySelectorAll('[style*="position: fixed"]');
const floatingContainers = document.querySelectorAll('[style*="z-index: 9998"]');

floatingButtons.forEach(btn => {
    if (btn.innerHTML === '💬') btn.remove();
});
floatingContainers.forEach(container => container.remove());
```

## Styling and Customization

### Widget Appearance

The widget appearance is controlled by the `widget.html` page and can be customized by:

1. Modifying the CSS in `widget.html`
2. Passing theme parameters via URL
3. Using CSS custom properties (future enhancement)

### Responsive Design

The widget is fully responsive and adapts to different screen sizes:

- Mobile: Optimized for touch interactions
- Desktop: Hover effects and keyboard shortcuts
- Tablet: Balanced experience

## Security Features

### Iframe Sandbox

The widget iframe uses security attributes:

```html
allow="microphone; camera"
sandbox="allow-scripts allow-same-origin allow-forms"
```

### CORS-Free Architecture

- No cross-origin requests from embedded scripts
- All API communication happens server-side within the iframe
- Secure by design

## Error Handling

The widget includes comprehensive error handling:

- Network failures
- Invalid chatbot IDs
- API errors
- Configuration issues

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Testing

Use the test page at `https://fast-bulldog-662.convex.app/test-embed.html` to:

- Test different integration methods
- Verify chatbot configurations
- Debug embedding issues
- Preview widget appearance

## Migration from Old Widget

If migrating from the old script-based widget:

### Old Method (CORS Issues)
```html
<script src="/widget.js" data-chatbot-id="..."></script>
```

### New Method (CORS-Free)
```html
<script src="https://fast-bulldog-662.convex.app/embed.js"></script>
<script>
    ChatBaseWidget.embed({
        chatbotId: 'your-chatbot-id',
        position: 'bottom-right'
    });
</script>
```

## Troubleshooting

### Common Issues

1. **Widget not appearing**: Check that the script loads successfully
2. **Chat not working**: Verify chatbot ID is correct
3. **Styling issues**: Check container CSS for conflicts
4. **Mobile problems**: Ensure viewport meta tag is set

### Debug Mode

Add `?debug=true` to the widget URL for additional logging:

```html
<iframe src="https://fast-bulldog-662.convex.app/widget.html?chatbotId=test&debug=true">
```

## Performance

### Loading Speed

- Lazy iframe loading
- Minimal JavaScript footprint
- Cached resources
- Optimized API calls

### Resource Usage

- ~50KB total download size
- Minimal memory footprint
- Efficient DOM updates
- Smart caching

## Support

For technical support or questions:

1. Check the test page for working examples
2. Verify API endpoints are accessible
3. Test with different chatbot IDs
4. Review browser console for errors

---

**Note**: This iframe-based architecture is the recommended approach for all new integrations as it provides better security, reliability, and compatibility compared to the previous script injection method. 