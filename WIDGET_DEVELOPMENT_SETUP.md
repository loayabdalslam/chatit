# ChatIt Widget - Development Setup Guide

## 🚨 **Fixed Issues**
- ✅ **JavaScript Error**: Fixed missing `AbortController` declaration
- ✅ **CORS Configuration**: Updated Convex HTTP routes with proper CORS headers
- ✅ **Error Handling**: Enhanced error detection and messaging

## 🔧 **Setup Instructions**

### 1. **Deploy Updated Convex Backend**

First, deploy the updated CORS configuration:

```bash
# Deploy the updated HTTP routes with CORS support
npx convex deploy
```

### 2. **Serve Widget Files Properly**

The CORS errors occur because you're opening HTML files directly (`file://`). You need to serve them through a web server:

#### **Option A: Simple HTTP Server (Recommended)**
```bash
# Navigate to your project directory
cd /path/to/your/project

# Using Python (if installed)
python -m http.server 8000

# OR using Node.js http-server
npx http-server -p 8000 -c-1

# OR using PHP (if installed)
php -S localhost:8000
```

Then access: `http://localhost:8000/test-convex-widget.html`

#### **Option B: VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click on `test-convex-widget.html` 
3. Select "Open with Live Server"

#### **Option C: Vite Dev Server**
```bash
# If you have Vite configured
npm run dev:frontend
```

### 3. **Update Widget Configuration**

Update your test HTML file to use the correct Convex URL:

```html
<!-- In your test HTML file -->
<div 
  data-chatit-widget="k57bvehffr3nnvfpy2cvz5d36s7hetxd"
  data-convex-url="https://reminiscent-wildebeest-246.convex.site"
  data-primary-color="#3b82f6"
  data-position="bottom-right">
</div>
```

### 4. **Verify Backend Endpoints**

Test your Convex endpoints directly:

```bash
# Test health endpoint
curl -X GET "https://reminiscent-wildebeest-246.convex.site/api/health" \
  -H "Content-Type: application/json"

# Test chatbot info endpoint  
curl -X GET "https://reminiscent-wildebeest-246.convex.site/api/chatbot/k57bvehffr3nnvfpy2cvz5d36s7hetxd" \
  -H "Content-Type: application/json"

# Test chat endpoint
curl -X POST "https://reminiscent-wildebeest-246.convex.site/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"chatbotId":"k57bvehffr3nnvfpy2cvz5d36s7hetxd","message":"Hello","sessionId":"test"}'
```

## 📋 **Complete Development Workflow**

### 1. **Start Development Servers**

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start your frontend dev server  
npm run dev:frontend

# Terminal 3: Start simple HTTP server for widget testing
npx http-server public -p 8001 -c-1
```

### 2. **Test Widget Integration**

1. **Create Test Page**: `test-widget-integration.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChatIt Widget Test</title>
</head>
<body>
    <h1>Testing ChatIt Widget</h1>
    
    <!-- Widget Integration -->
    <div 
      data-chatit-widget="k57bvehffr3nnvfpy2cvz5d36s7hetxd"
      data-convex-url="http://localhost:3000"
      data-primary-color="#3b82f6"
      data-position="bottom-right"
      data-welcome-message="Hello! I'm your AI assistant. How can I help?"
      data-show-branding="true">
    </div>
    
    <!-- Load Widget Script -->
    <script src="http://localhost:8001/widget.js"></script>
    
    <script>
      // Optional: Listen for widget events
      window.addEventListener('chatit-widget-ready', (event) => {
        console.log('Widget ready for chatbot:', event.detail.chatbotId);
      });
      
      window.addEventListener('chatit-message-sent', (event) => {
        console.log('Message sent:', event.detail);
      });
    </script>
</body>
</html>
```

2. **Access Test Page**: `http://localhost:8000/test-widget-integration.html`

### 3. **Debug Connection Issues**

If you still see CORS errors:

1. **Check Convex Deployment Status**:
   ```bash
   npx convex logs --tail
   ```

2. **Verify HTTP Routes**:
   ```bash
   # List all deployed functions
   npx convex dashboard
   ```

3. **Test Direct API Calls**:
   ```javascript
   // In browser console
   fetch('https://reminiscent-wildebeest-246.convex.site/api/health')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error);
   ```

## 🔍 **Troubleshooting Common Issues**

### **Issue**: "Origin 'null' blocked by CORS"
**Solution**: Don't open HTML files directly. Use a web server.

### **Issue**: "Failed to fetch" 
**Solution**: 
1. Check internet connection
2. Verify Convex deployment URL
3. Ensure Convex backend is running

### **Issue**: "controller is not defined"
**Solution**: ✅ Fixed in latest widget.js

### **Issue**: "Chatbot not found"
**Solution**: 
1. Verify chatbot ID exists in database
2. Check if chatbot is active/published
3. Use correct Convex deployment URL

## 🌐 **Production Deployment**

### 1. **Update Production Widget URL**
```javascript
// In widget.js - update getConvexUrl function
const getConvexUrl = () => {
  return 'https://reminiscent-wildebeest-246.convex.site';
};
```

### 2. **Host Widget File**
Upload `widget.js` to your CDN or hosting service:
```html
<script src="https://cdn.chatit.cloud/widget.js"></script>
```

### 3. **Embed in Customer Sites**
```html
<div data-chatit-widget="YOUR_CHATBOT_ID"></div>
<script src="https://cdn.chatit.cloud/widget.js"></script>
```

## ✅ **Verification Checklist**

- [ ] Convex backend deployed with CORS-enabled HTTP routes
- [ ] Widget served through HTTP server (not file://)
- [ ] Correct chatbot ID in data attribute
- [ ] Valid Convex deployment URL
- [ ] Network connectivity to Convex backend
- [ ] Browser console shows no JavaScript errors

## 📞 **Need Help?**

If issues persist:
1. Check browser console for specific error messages
2. Verify network tab shows successful API calls
3. Test with a simple chatbot ID first
4. Ensure Convex functions are properly deployed 