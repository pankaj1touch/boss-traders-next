# Role-Based Routing Guide

## Overview

The application now has **complete role-based routing** where users are automatically redirected to their appropriate dashboards based on their role:

- **Admin Role** → `/admin` (Admin Panel)
- **Student Role** → `/student` (Student Portal)

## 🎯 How It Works

### 1. Login Redirect
When users login, they are automatically redirected based on their role:

```typescript
// In apps/frontend/app/auth/login/page.tsx
const userRoles = result.user?.roles || [];
if (userRoles.includes('admin')) {
  router.push('/admin');        // Admin → Admin Panel
} else if (userRoles.includes('student')) {
  router.push('/student');      // Student → Student Portal
} else {
  router.push('/');             // Others → Home
}
```

### 2. Route Protection

Both admin and student areas are protected:

**Admin Protection:**
- Only users with 'admin' role can access `/admin`
- Others are redirected to home page

**Student Protection:**
- Only users with 'student' role can access `/student`
- Admins are redirected to admin panel
- Non-authenticated users redirected to login

### 3. Navigation Menu

The navbar shows role-specific links:
- **Students**: See "Student Portal" link
- **Admins**: See "Admin Panel" link
- If a user has both roles, only "Admin Panel" shows (admin takes priority)

## 📁 Application Structure

### Admin Area (`/admin`)
```
/admin                          # Admin Dashboard
  /courses                      # Course Management
    /create                     # Create Course
    /[id]/edit                  # Edit Course
  /ebooks                       # Ebook Management
    /create                     # Create Ebook
    /[id]/edit                  # Edit Ebook
```

**Admin Features:**
- ✅ View all courses and ebooks (including drafts)
- ✅ Create new courses and ebooks
- ✅ Edit existing content
- ✅ Delete content
- ✅ View statistics (enrollments, purchases)

### Student Area (`/student`)
```
/student                        # Student Dashboard
  /my-courses                   # Enrolled Courses
  /my-ebooks                    # Purchased Ebooks
  /live-sessions                # Live Classes
  /orders                       # Order History
```

**Student Features:**
- ✅ View enrolled courses
- ✅ Access purchased ebooks
- ✅ Join live sessions
- ✅ View order history
- ✅ Track learning progress

## 🚀 Setup & Testing

### 1. Create Admin User
```bash
cd apps/backend
node src/scripts/createAdmin.js
```

Default admin credentials:
- Email: `admin@bosstraders.com`
- Password: `Admin@123`

### 2. Create Student User
Students are automatically created when they signup. Every new user gets 'student' role by default.

**To signup as student:**
1. Go to `/auth/signup`
2. Fill in details
3. After login, you'll be redirected to `/student`

### 3. Test Role-Based Routing

**Test Admin:**
1. Login with admin credentials
2. Should redirect to `/admin`
3. See admin dashboard with course/ebook management

**Test Student:**
1. Signup/Login with regular account
2. Should redirect to `/student`
3. See student dashboard with enrolled courses

**Test Mixed Role:**
1. If user has both admin and student roles
2. Will redirect to `/admin` (admin priority)
3. Can still access public routes like `/courses`

## 🔐 Role Assignment

### Check User Roles

**Via MongoDB:**
```javascript
db.users.findOne({ email: "user@example.com" }, { roles: 1 })
```

### Add Admin Role to Existing User

**Via MongoDB:**
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $addToSet: { roles: "admin" } }
)
```

**Via Script:**
```bash
cd apps/backend
ADMIN_EMAIL=user@example.com node src/scripts/createAdmin.js
```

### Remove Admin Role

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $pull: { roles: "admin" } }
)
```

## 🎨 UI Components

### Admin Sidebar
- Dashboard overview
- Course management
- Ebook management
- User info with back to site button

### Student Sidebar
- Personal dashboard
- My courses
- My ebooks
- Live sessions
- Orders
- User profile

## 📊 Access Matrix

| Route | Public | Student | Admin |
|-------|--------|---------|-------|
| `/` | ✅ | ✅ | ✅ |
| `/courses` | ✅ | ✅ | ✅ |
| `/ebooks` | ✅ | ✅ | ✅ |
| `/student` | ❌ | ✅ | ❌ (redirects to /admin) |
| `/student/*` | ❌ | ✅ | ❌ |
| `/admin` | ❌ | ❌ | ✅ |
| `/admin/*` | ❌ | ❌ | ✅ |
| `/auth/login` | ✅ | ✅* | ✅* |
| `/auth/signup` | ✅ | ✅* | ✅* |

*Logged-in users are redirected to their dashboard

## 🛠️ Customization

### Change Login Redirect Logic

Edit `apps/frontend/app/auth/login/page.tsx`:

```typescript
// Add custom redirect logic
if (userRoles.includes('instructor')) {
  router.push('/instructor');
} else if (userRoles.includes('admin')) {
  router.push('/admin');
} else {
  router.push('/student');
}
```

### Add New Role

1. **Update User Model** (backend):
```javascript
// apps/backend/src/models/User.js
roles: {
  type: [String],
  enum: ['student', 'instructor', 'admin', 'moderator'], // Add new role
  default: ['student'],
}
```

2. **Create Layout** (frontend):
```typescript
// apps/frontend/app/[role]/layout.tsx
// Similar to admin or student layout
```

3. **Update Login Redirect**:
```typescript
// Add condition in login page
else if (userRoles.includes('moderator')) {
  router.push('/moderator');
}
```

## 🐛 Troubleshooting

### Problem: Redirected to wrong area
**Solution:** Check user roles in database
```javascript
db.users.findOne({ email: "your@email.com" }, { roles: 1 })
```

### Problem: Cannot access student portal
**Solution:** Ensure 'student' role exists in roles array
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $addToSet: { roles: "student" } }
)
```

### Problem: Admin sees student portal link
**Solution:** This shouldn't happen. Check navbar logic - admin should only see admin panel.

### Problem: Infinite redirect loop
**Solution:** 
1. Clear browser cache and cookies
2. Logout and login again
3. Check if user has at least one role

## 📝 Code Examples

### Check Current User Role in Component
```typescript
import { useAppSelector } from '@/store/hooks';

function MyComponent() {
  const { user } = useAppSelector((state) => state.auth);
  
  const isAdmin = user?.roles?.includes('admin');
  const isStudent = user?.roles?.includes('student');
  
  return (
    <div>
      {isAdmin && <AdminContent />}
      {isStudent && <StudentContent />}
    </div>
  );
}
```

### Programmatic Navigation Based on Role
```typescript
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

function NavigateButton() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  
  const goToDashboard = () => {
    if (user?.roles?.includes('admin')) {
      router.push('/admin');
    } else if (user?.roles?.includes('student')) {
      router.push('/student');
    } else {
      router.push('/');
    }
  };
  
  return <button onClick={goToDashboard}>Go to Dashboard</button>;
}
```

## 🎓 Best Practices

1. **Always check authentication first**, then roles
2. **Use middleware/guards** for route protection
3. **Redirect to appropriate area** after login
4. **Show role-specific UI** in shared components
5. **Log role changes** for security audit
6. **Test all role combinations** thoroughly

## 📚 Related Documentation

- [Admin System Guide](./ADMIN_SYSTEM_GUIDE.md)
- [Admin Setup (Hindi)](./ADMIN_SETUP_HINDI.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

---

**All role-based routing is fully functional and ready to use!** 🎉











