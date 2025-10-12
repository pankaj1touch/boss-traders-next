# 🎓 EdTech Platform - Complete Full-Stack Learning Management System

A production-ready EdTech web application built with Node.js + Express backend and Next.js + Tailwind CSS frontend. Features include live classes, recorded courses, eBook library, payment processing, and comprehensive user management.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Demo Credentials](#demo-credentials)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Deployment](#deployment)
- [Next Steps](#next-steps)

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens with rotation)
- **Validation**: Joi for request validation
- **Email**: EmailJS REST SDK for transactional emails
- **Security**: Helmet, CORS, rate-limiting, bcrypt
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Redux Toolkit + RTK Query
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

---

## ✨ Features

### Authentication & User Management
- ✅ User signup with email verification
- ✅ Login with JWT access & refresh tokens
- ✅ Token rotation for enhanced security
- ✅ Password reset via email
- ✅ Role-based access control (Student, Instructor, Admin)
- ✅ User profile management

### Course Management
- ✅ Browse and filter courses (category, level, modality, price, language)
- ✅ Course detail pages with curriculum (modules & lessons)
- ✅ Course enrollment system
- ✅ Multiple modalities: Live, Recorded, Hybrid
- ✅ Rating and feedback system with moderation
- ✅ Instructor profiles

### Live & Recorded Classes
- ✅ Live session scheduling with calendar view
- ✅ Join live sessions (placeholder links)
- ✅ Recording library for enrolled users
- ✅ Session status tracking (scheduled, live, completed)

### eBook Library
- ✅ Browse eBooks by category
- ✅ Secure download system (signed URLs)
- ✅ Multiple formats (PDF, EPUB, MOBI)
- ✅ Rating and reviews

### E-Commerce
- ✅ Shopping cart functionality
- ✅ Mock payment processing with webhooks placeholder
- ✅ Order history and invoice generation (PDF placeholder)
- ✅ Order confirmation emails via EmailJS

### Batch & Location Management
- ✅ Multiple teaching locations
- ✅ Batch planning with RRULE support for recurring schedules
- ✅ Schedule conflict detection
- ✅ Capacity management

### Notifications
- ✅ In-app notification center
- ✅ Email notifications (signup, reset, orders, announcements)
- ✅ Multiple channels: email, push (ready), in-app

### UI/UX
- ✅ Fully responsive mobile-first design
- ✅ Dark mode support
- ✅ Smooth Framer Motion animations
- ✅ Toast notifications
- ✅ Loading states and skeletons
- ✅ Accessible components (WCAG AA)

---

## 📁 Project Structure

```
edtech-platform/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/         # Database, logger, CORS configuration
│   │   │   ├── models/         # MongoDB models (User, Course, etc.)
│   │   │   ├── controllers/    # Route controllers
│   │   │   ├── routes/         # Express routes
│   │   │   ├── middleware/     # Auth, validation, error handling
│   │   │   ├── validators/     # Joi schemas
│   │   │   ├── utils/          # JWT, EmailJS, helpers
│   │   │   ├── scripts/        # Seed script
│   │   │   ├── app.js          # Express app setup
│   │   │   └── server.js       # Server entry point
│   │   └── package.json
│   │
│   └── frontend/
│       ├── app/                # Next.js App Router pages
│       │   ├── auth/           # Login, Signup pages
│       │   ├── courses/        # Courses list & detail
│       │   ├── live/           # Live sessions
│       │   ├── ebooks/         # eBook library
│       │   ├── cart/           # Shopping cart
│       │   ├── checkout/       # Checkout flow
│       │   ├── account/        # User dashboard
│       │   ├── layout.tsx      # Root layout
│       │   └── page.tsx        # Home page
│       ├── components/         # Reusable components
│       │   ├── ui/             # UI primitives
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   └── CourseCard.tsx
│       ├── store/              # Redux store
│       │   ├── api/            # RTK Query API endpoints
│       │   └── slices/         # Redux slices
│       ├── lib/                # Utilities
│       └── package.json
│
├── package.json                # Root package.json (workspace)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB Atlas** account (or local MongoDB)
- **EmailJS** account (optional for emails)

### Installation

1. **Clone the repository**
   ```bash
   cd boss-traders
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **Backend** (`apps/backend/.env`):
   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edtech?retryWrites=true&w=majority
   JWT_ACCESS_SECRET=your_very_strong_access_secret_change_this_in_production
   JWT_REFRESH_SECRET=your_very_strong_refresh_secret_change_this_in_production
   EMAILJS_SERVICE_ID=your_emailjs_service_id
   EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   CLIENT_URL=http://localhost:3000
   ```

   **Frontend** (`apps/frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_BASE=http://localhost:4000/api
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   ```

4. **Seed the database** (optional but recommended)
   ```bash
   cd apps/backend
   npm run seed
   ```

5. **Run the application**

   **Option 1: Run both apps concurrently (from root)**
   ```bash
   npm run dev:all
   ```

   **Option 2: Run separately**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend
   npm run dev

   # Terminal 2 - Frontend
   cd apps/frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api
   - Health Check: http://localhost:4000/health

---

## 🔐 Demo Credentials

After seeding the database, you can login with these accounts:

| Role       | Email                  | Password    |
|------------|------------------------|-------------|
| **Admin**  | admin@edtech.com       | password123 |
| Instructor | instructor@edtech.com  | password123 |
| Student    | student@edtech.com     | password123 |

> ⚠️ **Important**: Change these credentials in production!

---

## 📧 Environment Variables

### MongoDB Setup
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP (or use 0.0.0.0/0 for development)
4. Copy the connection string to `MONGODB_URI`

### EmailJS Setup (Optional)
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Copy Service ID, Template ID, and Public Key

> If EmailJS is not configured, emails will be logged but not sent.

---

## 📊 Database Seeding

The seed script creates:
- **3 Users**: Admin, Instructor, Student
- **5 Courses**: Web Dev, Data Science, UI/UX, Marketing, Business
- **3 Modules & 5 Lessons** for the first course
- **2 Locations**: Downtown Campus, Tech Hub
- **2 Batches**: Active course batches
- **3 Live Sessions**: Upcoming and scheduled
- **4 eBooks**: Programming, Design, Data Science books

Run seeding:
```bash
cd apps/backend
npm run seed
```

---

## 🌐 API Documentation

### Authentication Endpoints

```
POST   /api/auth/signup              # Register new user
POST   /api/auth/login               # Login
POST   /api/auth/refresh             # Refresh access token
POST   /api/auth/logout              # Logout
POST   /api/auth/verify-email        # Verify email
POST   /api/auth/forgot-password     # Request password reset
POST   /api/auth/reset-password      # Reset password
GET    /api/auth/me                  # Get current user
PATCH  /api/auth/me                  # Update profile
```

### Course Endpoints

```
GET    /api/courses                  # List courses (with filters)
GET    /api/courses/:slug            # Get course by slug
POST   /api/courses/:id/enroll       # Enroll in course (auth)
POST   /api/courses                  # Create course (instructor/admin)
PATCH  /api/courses/:id              # Update course (instructor/admin)
DELETE /api/courses/:id              # Delete course (admin)
```

### Live Session Endpoints

```
GET    /api/live                     # List live sessions
GET    /api/live/:id                 # Get session details
POST   /api/live/:id/join            # Join session (auth)
POST   /api/live                     # Create session (instructor/admin)
PATCH  /api/live/:id                 # Update session (instructor/admin)
DELETE /api/live/:id                 # Delete session (admin)
```

### Order Endpoints

```
POST   /api/orders                   # Create order (auth)
POST   /api/orders/payment           # Process payment (auth)
GET    /api/orders                   # Get user orders (auth)
GET    /api/orders/:id               # Get order by ID (auth)
```

### eBook Endpoints

```
GET    /api/ebooks                   # List ebooks
GET    /api/ebooks/:slug             # Get ebook by slug
GET    /api/ebooks/:id/download      # Download ebook (auth)
POST   /api/ebooks                   # Create ebook (admin)
PATCH  /api/ebooks/:id               # Update ebook (admin)
DELETE /api/ebooks/:id               # Delete ebook (admin)
```

### Additional Endpoints

- `/api/modules` - Course modules
- `/api/lessons` - Course lessons
- `/api/feedback` - Course feedback/reviews
- `/api/batches` - Batch management
- `/api/locations` - Location management
- `/api/notifications` - User notifications

---

## 🎨 Frontend Features

### Pages
- **Home** (`/`) - Hero, features, featured courses
- **Courses** (`/courses`) - Browse with filters
- **Course Detail** (`/courses/[slug]`) - Full course info, curriculum
- **Live Classes** (`/live`) - Upcoming sessions
- **eBooks** (`/ebooks`) - eBook library
- **Cart** (`/cart`) - Shopping cart
- **Checkout** (`/checkout/[orderId]`) - Payment flow
- **Account** (`/account`) - User dashboard
- **Orders** (`/account/orders`) - Order history
- **Auth** (`/auth/login`, `/auth/signup`) - Authentication

### Animations (Framer Motion)
- Page transitions with fade/slide
- Hero text and image reveals
- Course card hover effects
- Staggered list animations
- Button micro-interactions
- Toast notifications

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible mobile navigation
- Touch-friendly interactions

---

## 🚢 Deployment

### Backend Deployment (Recommended: Railway, Render, Heroku)

1. **Environment Variables**: Set all required env vars
2. **Database**: Use MongoDB Atlas (already cloud-based)
3. **Build**: No build step needed for Node.js
4. **Start**: `npm start` or `node src/server.js`

### Frontend Deployment (Recommended: Vercel, Netlify)

1. **Build**: `npm run build`
2. **Environment Variables**: Add `NEXT_PUBLIC_*` variables
3. **Deploy**: Follow platform-specific instructions

---

## 🔮 Next Steps

### Payment Integration
Currently using a mock payment system. To integrate real payments:

1. **Stripe**:
   ```bash
   npm install stripe @stripe/stripe-js
   ```
   - Add Stripe keys to env
   - Replace mock payment in `orderController.js`
   - Set up webhooks for payment confirmation

2. **Razorpay** (India):
   ```bash
   npm install razorpay
   ```
   - Similar integration process

### Email Service
Replace EmailJS with SMTP (Nodemailer):
```bash
npm install nodemailer
```

Update `apps/backend/src/utils/emailjs.js` to use Nodemailer.

### File Storage
For production file uploads (videos, ebooks):
- **AWS S3**: Use for scalable storage
- **Cloudinary**: For images and videos

### Advanced Features
- 🎥 Video streaming with HLS
- 💬 Real-time chat (Socket.io)
- 📱 Mobile apps (React Native)
- 🔔 Push notifications (Firebase)
- 📊 Analytics dashboard
- 🎯 Recommendations engine
- 🌍 Multi-language support

---

## 📝 Scripts

### Root Scripts
```bash
npm run dev:all          # Run both apps concurrently
npm run install:all      # Install all dependencies
npm run build:all        # Build both apps
```

### Backend Scripts
```bash
npm run dev              # Start development server
npm start                # Start production server
npm run seed             # Seed database with demo data
npm run lint             # Run ESLint
npm test                 # Run tests
```

### Frontend Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the API documentation
- Review the code comments

---

## ⭐ Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the flexible database
- Framer Motion for beautiful animations
- The entire open-source community

---

**Built with ❤️ using modern web technologies**

