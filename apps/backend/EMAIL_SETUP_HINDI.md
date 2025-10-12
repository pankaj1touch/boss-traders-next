# 📧 Email Setup Guide - Boss Traders

## समस्या (Problem)
Forgot password का email नहीं आ रहा है क्योंकि email configuration नहीं है।

## समाधान (Solution)

### स्टेप 1: Gmail App Password बनाएं

Gmail के साथ email भेजने के लिए आपको **App Password** चाहिए (regular password काम नहीं करेगा):

1. **2-Step Verification चालू करें**:
   - [Google Account Security](https://myaccount.google.com/security) पर जाएं
   - "2-Step Verification" ढूंढें और इसे enable करें

2. **App Password बनाएं**:
   - [App Passwords](https://myaccount.google.com/apppasswords) पर जाएं
   - या Google Account settings में "App Passwords" search करें
   - **Mail** को app के रूप में select करें
   - **Other (Custom name)** को device के रूप में select करें, "Boss Traders Backend" enter करें
   - **Generate** पर क्लिक करें
   - 16-character का password copy करें (format: `xxxx xxxx xxxx xxxx`)

### स्टेप 2: .env File बनाएं

`apps/backend` फोल्डर में `.env` नाम की file बनाएं और इसमें ये settings डालें:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/boss-traders

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production

# Email Configuration (ये सबसे ज़रूरी है forgot password के लिए)
SMTP_USER=apna-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# Client URL (Frontend URL)
CLIENT_URL=http://localhost:3000

# Server Configuration
PORT=4000
NODE_ENV=development
```

**बदलें (Replace)**:
- `apna-email@gmail.com` - अपना असली Gmail address
- `xxxx xxxx xxxx xxxx` - जो App Password आपने generate किया (spaces हटा सकते हैं)

### स्टेप 3: Email Test करें

Terminal में जाकर command चलाएं:

```bash
cd apps/backend
npm run test:email
```

ये test emails भेजेगा और check करेगा कि सब सही है या नहीं।

### स्टेप 4: Backend Server Restart करें

`.env` file update करने के बाद, backend server को restart करें:

```bash
npm run dev
```

## आसान तरीका (Easy Way)

Setup wizard चला सकते हैं जो automatically सब setup कर देगा:

```bash
cd apps/backend
npm run setup:email
```

ये wizard आपसे email और app password पूछेगा और automatically `.env` file बना देगा।

## Forgot Password Test करें

1. Browser में `http://localhost:3000/auth/forgot` खोलें
2. अपना email address डालें
3. अपने inbox को check करें - password reset email आना चाहिए
4. Email में दिए गए link पर click करके password reset करें

## Common Errors और Solutions

### ❌ Error: "Invalid login"
- **कारण**: Regular Gmail password use किया है
- **समाधान**: App Password use करें, regular password नहीं
- 2-Step Verification enable होना ज़रूरी है

### ❌ Error: "Email not configured"
- **कारण**: `.env` file में `SMTP_USER` और `SMTP_PASS` नहीं हैं
- **समाधान**: `.env` file बनाएं या update करें
- Backend server restart करें

### ❌ Email भेजा गया लेकिन inbox में नहीं आया
- Spam/Junk folder check करें
- Email address सही है या नहीं verify करें
- कुछ minutes wait करें

### 📱 Mobile से App Password कैसे बनाएं?

1. Google app खोलें → Account settings
2. Security → 2-Step Verification
3. App Passwords
4. Mail select करें → Generate

## Important Notes

- ❌ `.env` file को git में commit न करें (already .gitignore में है)
- ✅ App Password को safely store करें
- ✅ Production में strong JWT secrets use करें
- ✅ App Password को regularly change करते रहें

## Help Needed?

अगर अभी भी problem है तो:
1. `npm run test:email` चलाएं और error message देखें
2. Backend server के logs देखें
3. Console में detailed error messages आएंगे

---

**Quick Commands:**
```bash
# Setup wizard चलाएं
npm run setup:email

# Email test करें
npm run test:email

# Backend चालू करें
npm run dev

# Logs देखें
# Terminal में जहां backend चल रहा है वहां देखें
```


