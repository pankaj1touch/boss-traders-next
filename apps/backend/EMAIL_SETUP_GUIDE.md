# 📧 Email Setup Guide for Boss Traders

## Problem
The forgot password email is not being sent because the email configuration is missing.

## Solution

### Step 1: Create Gmail App Password

Since regular Gmail passwords don't work with nodemailer, you need to create an **App Password**:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Find "2-Step Verification" and enable it

2. **Create App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Or search for "App Passwords" in Google Account settings
   - Select **Mail** as the app
   - Select **Other (Custom name)** as the device, enter "Boss Traders Backend"
   - Click **Generate**
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Configure Environment Variables

Create a `.env` file in the `apps/backend` directory with these settings:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/boss-traders

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production

# Email Configuration (CRITICAL FOR PASSWORD RESET)
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# Client URL (Frontend URL)
CLIENT_URL=http://localhost:3000

# Server Configuration
PORT=4000
NODE_ENV=development
```

**Replace**:
- `your-email@gmail.com` with your actual Gmail address
- `xxxx xxxx xxxx xxxx` with the App Password you generated (you can remove spaces)

### Step 3: Test Email Configuration

Run the email test script:

```bash
cd apps/backend
npm run test:email
```

This will send test emails to verify your configuration is working.

### Step 4: Restart Backend Server

After updating `.env`, restart your backend server:

```bash
npm run dev
```

## Alternative: Using Other Email Services

If you don't want to use Gmail, you can configure other SMTP services:

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your_password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### Custom SMTP
For custom SMTP, you'll need to update `apps/backend/src/utils/emailjs.js` to use `host`, `port`, and `secure` options instead of `service: 'gmail'`.

## Troubleshooting

### Error: "Invalid login"
- Make sure you're using an **App Password**, not your regular Gmail password
- Double-check that 2-Step Verification is enabled

### Error: "SMTP not configured"
- Check that `SMTP_USER` and `SMTP_PASS` are set in `.env`
- Restart the backend server after updating `.env`

### Email sends but doesn't arrive
- Check your spam/junk folder
- Verify the email address is correct
- Gmail may block emails if sending too many too quickly

### "Less secure app access"
- Gmail deprecated this - you MUST use App Passwords now
- Enable 2-Step Verification first

## Testing Forgot Password Flow

1. Go to `http://localhost:3000/auth/forgot`
2. Enter your email address
3. Check your inbox for the password reset email
4. Click the link to reset your password

## Current Implementation Details

- **Email Service**: Nodemailer with Gmail SMTP
- **Port**: 587 (TLS)
- **Sender**: Boss Traders (from configured email)
- **Reset Link Expiry**: 1 hour
- **Email Templates**: HTML + Plain text fallback

## Security Notes

- Never commit `.env` file to git (it's already in `.gitignore`)
- Use strong, unique JWT secrets in production
- Rotate App Passwords periodically
- Consider using dedicated email services (SendGrid, AWS SES) for production


