# Admin System Guide

## Overview

This project now includes a complete admin panel system that allows administrators to manage courses and ebooks. The admin system includes:

- **Role-based access control** - Only users with admin role can access the admin panel
- **Course Management** - Create, read, update, and delete courses
- **Ebook Management** - Create, read, update, and delete ebooks
- **Separate Management** - Courses and ebooks are managed independently
- **Dashboard** - Overview of all courses and ebooks with statistics

## Features

### Backend Features

1. **Admin Role Support**
   - User model includes admin role in roles array
   - Middleware for authenticating and authorizing admin users
   - Protected routes that only admins can access

2. **Course Management API**
   - `GET /api/courses/admin/all` - Get all courses (including drafts)
   - `GET /api/courses/admin/:id` - Get course details with stats
   - `POST /api/courses` - Create new course
   - `PATCH /api/courses/:id` - Update course
   - `DELETE /api/courses/:id` - Delete course

3. **Ebook Management API**
   - `GET /api/ebooks/admin/all` - Get all ebooks (including drafts)
   - `GET /api/ebooks/admin/:id` - Get ebook details with stats
   - `POST /api/ebooks` - Create new ebook
   - `PATCH /api/ebooks/:id` - Update ebook
   - `DELETE /api/ebooks/:id` - Delete ebook

### Frontend Features

1. **Admin Panel Layout**
   - Sidebar navigation
   - Protected routes (auto-redirects non-admins)
   - Beautiful, modern UI with dark mode support

2. **Dashboard** (`/admin`)
   - Statistics cards showing total courses, ebooks, and published items
   - Recent courses and ebooks lists
   - Quick navigation to management pages

3. **Course Management** (`/admin/courses`)
   - List all courses with search and filters
   - Create new courses
   - Edit existing courses
   - Delete courses with confirmation
   - View enrollment statistics

4. **Ebook Management** (`/admin/ebooks`)
   - List all ebooks with search and filters
   - Create new ebooks
   - Edit existing ebooks
   - Delete ebooks with confirmation
   - View purchase statistics

## Getting Started

### 1. Create an Admin User

Run the admin creation script:

```bash
cd apps/backend
node src/scripts/createAdmin.js
```

Or set custom admin credentials using environment variables:

```bash
ADMIN_EMAIL=your@email.com ADMIN_NAME="Your Name" ADMIN_PASSWORD="YourPassword" node src/scripts/createAdmin.js
```

Default credentials (if no env vars set):
- Email: `admin@bosstraders.com`
- Password: `Admin@123`

### 2. Login as Admin

1. Go to `/auth/login`
2. Enter admin credentials
3. After login, you'll see "Admin Panel" in the user menu

### 3. Access Admin Panel

Click on your profile menu (top right) → "Admin Panel" or directly visit `/admin`

## Admin Panel Structure

```
/admin                          # Dashboard
  /courses                      # Course list
    /create                     # Create new course
    /[id]/edit                  # Edit course
  /ebooks                       # Ebook list
    /create                     # Create new ebook
    /[id]/edit                  # Edit ebook
```

## API Endpoints

### Course Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/courses` | Get published courses | Public |
| GET | `/api/courses/admin/all` | Get all courses | Admin |
| GET | `/api/courses/admin/:id` | Get course details | Admin |
| POST | `/api/courses` | Create course | Admin/Instructor |
| PATCH | `/api/courses/:id` | Update course | Admin/Instructor |
| DELETE | `/api/courses/:id` | Delete course | Admin |

### Ebook Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ebooks` | Get published ebooks | Public |
| GET | `/api/ebooks/admin/all` | Get all ebooks | Admin |
| GET | `/api/ebooks/admin/:id` | Get ebook details | Admin |
| POST | `/api/ebooks` | Create ebook | Admin |
| PATCH | `/api/ebooks/:id` | Update ebook | Admin |
| DELETE | `/api/ebooks/:id` | Delete ebook | Admin |

## Course Fields

When creating or editing a course, you can set:

- **Basic Info**: title, slug, category, level, description
- **Pricing**: price, sale price
- **Details**: language, modality (live/recorded/hybrid), tags
- **Content**: learning outcomes, prerequisites
- **Media**: thumbnail URL
- **Status**: draft, published, archived

## Ebook Fields

When creating or editing an ebook, you can set:

- **Basic Info**: title, slug, author, description
- **File Details**: file URL, format (PDF/EPUB/MOBI), file size, pages
- **Security**: DRM level (none/basic/advanced)
- **Pricing**: price, sale price
- **Media**: cover image URL
- **Categorization**: category, tags
- **Status**: draft, published, archived

## Security

- All admin routes require authentication
- Admin middleware checks for admin role
- Frontend routes auto-redirect non-admin users
- Delete operations require confirmation

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Role-based authorization

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Redux Toolkit + RTK Query
- Tailwind CSS
- Lucide React icons

## Adding More Admin Users

To give admin access to an existing user:

1. **Via Database**: Update the user document and add 'admin' to roles array
2. **Via Script**: Modify and run the createAdmin.js script
3. **Via Code**: Create an admin management page (future enhancement)

Example MongoDB query:
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $addToSet: { roles: "admin" } }
)
```

## Troubleshooting

### Cannot access admin panel
- Ensure you're logged in
- Check that your user has 'admin' in roles array
- Clear browser cache and try again

### API returns 403 Forbidden
- Verify JWT token is valid
- Check that user roles include 'admin'
- Ensure authorization header is set correctly

### Changes not reflecting
- Check Redux cache - try refreshing the page
- Verify API endpoint is being called
- Check browser console for errors

## Future Enhancements

Potential features to add:
- [ ] Admin user management (add/remove admin roles)
- [ ] Bulk operations (delete multiple courses/ebooks)
- [ ] Analytics dashboard with charts
- [ ] Content scheduling (publish at specific time)
- [ ] Media upload directly from admin panel
- [ ] Course preview in admin panel
- [ ] Email notifications for new content
- [ ] Audit logs for admin actions

## Support

For issues or questions, please check:
1. This documentation
2. API documentation in code comments
3. React component PropTypes/TypeScript interfaces

---

**Note**: Always test admin features in a development environment before deploying to production.













