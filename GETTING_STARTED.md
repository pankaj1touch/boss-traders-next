# 🚀 Getting Started - Quick Guide

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed
- [ ] MongoDB Atlas account created (or local MongoDB)
- [ ] npm or yarn installed
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup (5 minutes)

### 1️⃣ Install Dependencies

```bash
# From project root
npm install

# Install backend dependencies
cd apps/backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2️⃣ Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get connection string (Connect → Drivers → Copy connection string)
6. Replace `<password>` with your database user password

### 3️⃣ Configure Environment Variables

**Backend** - Create `apps/backend/.env`:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edtech?retryWrites=true&w=majority
JWT_ACCESS_SECRET=super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-production
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
CLIENT_URL=http://localhost:3000
```

> 📧 EmailJS is optional. Leave those fields empty for now - emails will be logged but not sent.

**Frontend** - Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
```

### 4️⃣ Seed Database with Demo Data

```bash
cd apps/backend
npm run seed
```

This creates:
- ✅ 3 demo users (admin, instructor, student)
- ✅ 5 courses with content
- ✅ 2 locations with batches
- ✅ 3 live sessions
- ✅ 4 ebooks

### 5️⃣ Start the Application

**Option A: Run both apps together (recommended)**
```bash
# From project root
npm run dev:all
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend  
cd apps/frontend
npm run dev
```

### 6️⃣ Access the Application

- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:4000/api
- ❤️ Health Check: http://localhost:4000/health

---

## 🔐 Demo Login Credentials

| Role       | Email                  | Password    |
|------------|------------------------|-------------|
| Admin      | admin@edtech.com       | password123 |
| Instructor | instructor@edtech.com  | password123 |
| Student    | student@edtech.com     | password123 |

---

## 🧪 Test the Application

1. **Browse Courses**
   - Go to http://localhost:3000/courses
   - Apply filters and search

2. **Login**
   - Go to http://localhost:3000/auth/login
   - Use demo credentials above

3. **Enroll in a Course**
   - Click on any course
   - Click "Add to Cart" → "Cart" → "Checkout"
   - Complete mock payment

4. **View Live Sessions**
   - Go to http://localhost:3000/live
   - See upcoming sessions

5. **Browse eBooks**
   - Go to http://localhost:3000/ebooks
   - Add to cart and purchase

---

## 📱 Features to Explore

### Student Features
- Browse and search courses
- Enroll in courses
- Access live sessions
- Purchase ebooks
- View order history
- Manage profile

### Instructor Features
- Create and manage courses
- Schedule live sessions
- View student enrollments

### Admin Features
- Manage all courses
- Manage users
- Moderate feedback
- Manage locations and batches
- Send announcements

---

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Verify your connection string is correct
- Check that you've whitelisted your IP
- Ensure password doesn't contain special characters (or encode them)

### Port Already in Use
```bash
# Kill process on port 4000 (backend)
npx kill-port 4000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Module Not Found Errors
```bash
# Reinstall dependencies
cd apps/backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### TypeScript Errors in Frontend
```bash
cd apps/frontend
npm run build
```

---

## 📚 Next Steps

1. **Explore the Code**
   - Backend: `apps/backend/src/`
   - Frontend: `apps/frontend/app/`

2. **Read Documentation**
   - Main README: Full documentation
   - Backend README: API details
   - Frontend README: Component structure

3. **Customize**
   - Update colors in `tailwind.config.ts`
   - Add your logo and branding
   - Modify course categories

4. **Deploy**
   - Backend → Railway, Render, or Heroku
   - Frontend → Vercel or Netlify

---

## 💡 Pro Tips

- Use the seeded data to explore all features
- Check the browser console for any errors
- Backend logs are visible in the terminal
- Redux DevTools Extension is helpful for frontend debugging
- All pages are mobile responsive - test on different screen sizes

---

## 🆘 Need Help?

1. Check the main README.md for detailed documentation
2. Review the code comments
3. Check backend logs for API errors
4. Use browser DevTools for frontend issues

---

**Happy coding! 🎉**

