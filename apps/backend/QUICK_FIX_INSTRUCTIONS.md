# 🚀 QUICK FIX: Forgot Password Email Issue

## Problem / समस्या
Forgot password का email नहीं आ रहा है।

## Root Cause
`.env` file missing है जिसमें email (SMTP) configuration होना चाहिए।

---

## ✅ SOLUTION - Do These 3 Steps

### Method 1: Automatic Setup (Recommended / आसान तरीका)

Open terminal और ये commands चलाएं:

```bash
cd apps/backend
npm run setup:email
```

Wizard चलेगा और पूछेगा:
1. Gmail address
2. Gmail App Password

बस enter कर दें और automatically setup हो जाएगा।

### Method 2: Manual Setup

#### Step 1: Create Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not enabled)
3. Search for "App Passwords"
4. Select Mail → Generate
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### Step 2: Create `.env` file

`apps/backend` folder में `.env` file बनाएं:

```bash
cd apps/backend
copy env.example .env
```

Or manually create and add:

```env
MONGODB_URI=mongodb://localhost:27017/boss-traders
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
CLIENT_URL=http://localhost:3000
PORT=4000
NODE_ENV=development
```

**Replace:**
- `your-email@gmail.com` → Your Gmail
- `your-app-password-here` → The 16-char password from step 1

#### Step 3: Test Email

```bash
npm run test:email
```

You should see: ✅ All emails sent successfully

#### Step 4: Restart Backend

```bash
npm run dev
```

---

## 🧪 Test the Fix

1. Open browser: `http://localhost:3000/auth/forgot`
2. Enter your email
3. Click "Send Reset Link"
4. Check your inbox - you should receive password reset email within 1-2 minutes
5. Check spam folder if not in inbox

---

## ❌ Troubleshooting

### Still not working?

Run test command and share the error:
```bash
cd apps/backend
npm run test:email
```

### Common Errors:

**"Invalid login"**
- ❌ Using regular Gmail password
- ✅ Use App Password (16 characters)
- Need 2-Step Verification enabled

**"Email not configured"**
- ❌ `.env` file missing or wrong location
- ✅ File should be at `apps/backend/.env`
- ✅ Restart backend after creating .env

**"ECONNREFUSED"**
- ❌ No internet connection
- ✅ Check internet and try again

---

## 📁 Files Changed/Created

1. ✅ `apps/backend/EMAIL_SETUP_GUIDE.md` - Detailed English guide
2. ✅ `apps/backend/EMAIL_SETUP_HINDI.md` - Hindi-English guide
3. ✅ `apps/backend/setup-email.js` - Interactive setup wizard
4. ✅ `apps/backend/src/utils/emailjs.js` - Better error messages
5. ⚠️ `apps/backend/.env` - **You need to create this**

---

## 🎯 Quick Commands Reference

```bash
# Navigate to backend
cd apps/backend

# Setup wizard (recommended)
npm run setup:email

# Test email
npm run test:email

# Start backend
npm run dev

# Check logs
# Look at terminal where backend is running
```

---

## 📞 Need Help?

1. Hindi guide: `EMAIL_SETUP_HINDI.md`
2. Detailed guide: `EMAIL_SETUP_GUIDE.md`
3. Run: `npm run test:email` and check error messages

---

**IMPORTANT:** 
- ❌ Never commit `.env` to git
- ✅ Keep App Password secret
- ✅ Use different passwords for production


