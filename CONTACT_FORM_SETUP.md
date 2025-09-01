# Contact Form Setup Guide - EmailJS Integration

This contact form uses **EmailJS** to send emails directly from the frontend without requiring a backend server. EmailJS provides a free tier with 200 requests per day, making it perfect for small to medium-sized websites.

## 🚨 IMPORTANT: Current Status

The contact form is currently configured with **placeholder values** and will not work until you complete the setup below. You must replace the placeholder IDs with your actual EmailJS credentials.

## 📋 Quick Setup Checklist

- [ ] Create EmailJS account
- [ ] Connect email service (Gmail, Outlook, etc.)
- [ ] Create email template
- [ ] Get Service ID, Template ID, and Public Key
- [ ] Update DetailsSection.tsx with your credentials
- [ ] Test the form

## 🔧 Step-by-Step Setup

### Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Create Free Account"
3. Sign up with your email and verify your account
4. Log in to your EmailJS dashboard

### Step 2: Connect Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook** (recommended for business)
   - **Yahoo**, **AOL**, or other supported providers
4. Follow the authentication process for your chosen provider
5. **Important**: Note down your **Service ID** (you'll need this later)

### Step 3: Create Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template structure:

```
Subject: New Contact Form Submission from {{from_name}}

Content:
You have received a new message from your website contact form.

Name: {{from_name}}
Email: {{from_email}}
Company: {{company}}

Message:
{{message}}

---
This email was sent from your ChatIt website contact form.
```

4. **Important**: Note down your **Template ID**
5. Make sure the template uses these exact variable names:
   - `{{from_name}}` - Sender's name
   - `{{from_email}}` - Sender's email
   - `{{company}}` - Sender's company
   - `{{message}}` - The message content

### Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (also called User ID)
3. **Important**: Note down your **Public Key**

### Step 5: Update Your Code

1. Open `src/components/DetailsSection.tsx`
2. Find these lines around line 35:

```typescript
const serviceId = "service_za049ca"; // Replace with your EmailJS service ID
const templateId = "YOUR_TEMPLATE_ID"; // Replace with your EmailJS template ID
const publicKey = "YOUR_PUBLIC_KEY"; // Replace with your EmailJS public key
```

3. Replace the placeholder values with your actual credentials:

```typescript
      const serviceId = "service_za049ca"; // Replace with your EmailJS service ID
      const templateId = "template_oqqb0nz"; // Replace with your EmailJS template ID
      const publicKey = "65bDI5QDBko5OJmeB"; // Replace with your EmailJS public key
      
```

### Step 6: Test Your Form

1. Save your changes
2. Start your development server: `npm run dev`
3. Navigate to the contact form
4. Fill out and submit a test message
5. Check your email inbox for the message

## 🔍 Troubleshooting

### Form Shows "Failed to send message" Error

**Cause**: Usually incorrect EmailJS configuration

**Solutions**:
1. **Check your credentials**: Verify Service ID, Template ID, and Public Key are correct
2. **Check template variables**: Ensure your template uses the exact variable names listed above
3. **Check email service**: Make sure your email service is properly connected and active
4. **Check browser console**: Look for specific error messages in the developer tools

### Email Not Received

**Cause**: Email delivery or template issues

**Solutions**:
1. **Check spam folder**: EmailJS emails might be filtered as spam initially
2. **Verify email service**: Ensure your connected email service is working
3. **Test template**: Use EmailJS dashboard's "Test" feature to verify your template
4. **Check rate limits**: Free tier has 200 emails/day limit

### "Service ID not found" Error

**Cause**: Incorrect or inactive Service ID

**Solutions**:
1. **Double-check Service ID**: Copy it exactly from your EmailJS dashboard
2. **Verify service status**: Ensure your email service is active and properly configured
3. **Re-authenticate**: Try disconnecting and reconnecting your email service

### CORS or Network Errors

**Cause**: Domain restrictions or network issues

**Solutions**:
1. **Check domain whitelist**: In EmailJS settings, ensure your domain is allowed
2. **Use HTTPS**: EmailJS works better with HTTPS in production
3. **Check firewall**: Ensure EmailJS domains aren't blocked

## 📊 EmailJS Free Tier Limits

- **200 emails per month** (free tier)
- **Rate limiting**: Prevents spam and abuse
- **Template-based**: All emails use predefined templates
- **No backend required**: Works entirely from frontend

## 🔒 Security Features

- **No exposed credentials**: Your email password stays secure
- **Template-based sending**: Prevents arbitrary email content
- **Rate limiting**: Built-in spam protection
- **Domain restrictions**: Can limit to specific domains

## 🚀 Production Deployment

1. **Domain whitelist**: Add your production domain to EmailJS settings
2. **Environment variables**: Consider using environment variables for credentials
3. **Error handling**: The form includes comprehensive error handling
4. **User feedback**: Success/error messages keep users informed

## 💡 Tips for Success

1. **Test thoroughly**: Always test with real email addresses
2. **Monitor usage**: Keep track of your monthly email quota
3. **Backup plan**: Consider upgrading to paid plan for higher limits
4. **User experience**: The form provides clear feedback to users

## 🆘 Need Help?

- **EmailJS Documentation**: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **EmailJS Support**: Available through their dashboard
- **Community**: Stack Overflow has many EmailJS examples

---

**Remember**: Replace all placeholder values with your actual EmailJS credentials for the contact form to work properly!