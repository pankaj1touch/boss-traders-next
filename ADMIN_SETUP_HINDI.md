# एडमिन सिस्टम सेटअप गाइड (हिंदी)

## क्या बनाया गया है

आपके प्रोजेक्ट में अब एक पूर्ण **Admin Panel** सिस्टम है जहाँ एडमिन:

✅ **Courses को Manage कर सकते हैं**
  - नया Course बना सकते हैं
  - मौजूदा Course को Edit कर सकते हैं  
  - Course को Delete कर सकते हैं
  - सभी Courses की लिस्ट देख सकते हैं (Draft भी)

✅ **Ebooks को Manage कर सकते हैं**
  - नया Ebook बना सकते हैं
  - मौजूदा Ebook को Edit कर सकते हैं
  - Ebook को Delete कर सकते हैं
  - सभी Ebooks की लिस्ट देख सकते हैं (Draft भी)

✅ **Separate Management**
  - Courses और Ebooks अलग-अलग manage होते हैं
  - दोनों के लिए अलग pages हैं

## कैसे इस्तेमाल करें

### Step 1: Admin User बनाएं

Backend folder में जाएं और script चलाएं:

```bash
cd apps/backend
node src/scripts/createAdmin.js
```

**Default Admin Credentials:**
- Email: `admin@bosstraders.com`
- Password: `Admin@123`

**Custom Credentials के लिए:**
```bash
ADMIN_EMAIL=aapka@email.com ADMIN_NAME="Aapka Naam" ADMIN_PASSWORD="AapkaPassword" node src/scripts/createAdmin.js
```

### Step 2: Login करें

1. Website पर जाएं `/auth/login`
2. Admin email और password डालें
3. Login करने के बाद profile menu में "Admin Panel" दिखेगा

### Step 3: Admin Panel खोलें

**दो तरीके हैं:**
1. Profile menu (top right) → "Admin Panel" पर क्लिक करें
2. या सीधे `/admin` पर जाएं

## Admin Panel में क्या है

### Dashboard (`/admin`)
- Total courses और ebooks की संख्या
- Published items की गिनती
- Recent courses और ebooks की लिस्ट
- Quick navigation links

### Courses Management (`/admin/courses`)
- सभी courses की लिस्ट (Draft और Published दोनों)
- Search और Filter options
- **Create Course** button - नया course बनाने के लिए
- हर course के साथ **Edit** और **Delete** buttons
- Enrollment statistics

### Ebooks Management (`/admin/ebooks`)
- सभी ebooks की लिस्ट (Draft और Published दोनों)
- Search और Filter options
- **Create Ebook** button - नया ebook बनाने के लिए
- हर ebook के साथ **Edit** और **Delete** buttons
- Purchase statistics

## Course बनाते समय भरें

**Basic Information:**
- Title (required)
- Slug (auto-generate होता है)
- Category: programming, design, business, etc.
- Level: beginner, intermediate, advanced
- Description (required)

**Pricing:**
- Price (₹) - required
- Sale Price (₹) - optional

**Additional Details:**
- Language (default: English)
- Modality: live, recorded, hybrid
- Thumbnail URL
- Tags (comma-separated)
- Learning Outcomes (line by line)
- Prerequisites (line by line)
- Publish Status: draft, published, archived

## Ebook बनाते समय भरें

**Basic Information:**
- Title (required)
- Slug (auto-generate होता है)
- Author (required)
- Description (required)

**File Details:**
- File URL (required) - ebook file का link
- Format: PDF, EPUB, MOBI
- File Size (MB) - optional
- Pages - optional
- DRM Level: none, basic, advanced

**Pricing:**
- Price (₹) - required
- Sale Price (₹) - optional

**Additional Details:**
- Cover Image URL
- Category
- Tags (comma-separated)
- Publish Status: draft, published, archived

## Important Points

⚠️ **Security:**
- केवल Admin role वाले users ही admin panel access कर सकते हैं
- बिना admin role के users को automatically redirect कर दिया जाता है
- Delete करते समय confirmation popup आता है

⚠️ **Publish Status:**
- **Draft**: सिर्फ admin को दिखता है, users को नहीं
- **Published**: सभी को दिखता है
- **Archived**: archived हो गया, users को नहीं दिखता

## Files जो बनाए गए

### Backend Files:
```
apps/backend/src/
  controllers/
    courseController.js      (Updated - admin methods added)
    ebookController.js       (Updated - admin methods added)
  routes/
    courseRoutes.js          (Updated - admin routes added)
    ebookRoutes.js           (Updated - admin routes added)
  scripts/
    createAdmin.js           (New - admin user बनाने के लिए)
```

### Frontend Files:
```
apps/frontend/
  store/api/
    adminApi.ts              (New - admin API endpoints)
  app/admin/
    layout.tsx               (New - admin panel layout)
    page.tsx                 (New - admin dashboard)
    courses/
      page.tsx               (New - courses list)
      create/page.tsx        (New - create course)
      [id]/edit/page.tsx     (New - edit course)
    ebooks/
      page.tsx               (New - ebooks list)
      create/page.tsx        (New - create ebook)
      [id]/edit/page.tsx     (New - edit ebook)
  components/
    Navbar.tsx               (Updated - admin panel link added)
```

## Backend API Endpoints

### Courses:
- `GET /api/courses/admin/all` - सभी courses (Admin only)
- `GET /api/courses/admin/:id` - Course details (Admin only)
- `POST /api/courses` - नया course बनाएं (Admin/Instructor)
- `PATCH /api/courses/:id` - Course update करें (Admin/Instructor)
- `DELETE /api/courses/:id` - Course delete करें (Admin only)

### Ebooks:
- `GET /api/ebooks/admin/all` - सभी ebooks (Admin only)
- `GET /api/ebooks/admin/:id` - Ebook details (Admin only)
- `POST /api/ebooks` - नया ebook बनाएं (Admin only)
- `PATCH /api/ebooks/:id` - Ebook update करें (Admin only)
- `DELETE /api/ebooks/:id` - Ebook delete करें (Admin only)

## और Users को Admin बनाना

### Database में सीधे:
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $addToSet: { roles: "admin" } }
)
```

### Script से:
```bash
ADMIN_EMAIL=newadmin@email.com ADMIN_PASSWORD="password" node src/scripts/createAdmin.js
```

## Testing

1. **Admin user बनाएं** (ऊपर दिया गया script चलाएं)
2. **Frontend start करें**: `cd apps/frontend && npm run dev`
3. **Backend start करें**: `cd apps/backend && npm run dev`
4. **Login करें** admin credentials से
5. **Admin Panel खोलें** और test करें

## Troubleshooting

**Problem:** Admin Panel नहीं दिख रहा
- ✓ Check करें कि login है
- ✓ User के roles में 'admin' है या नहीं database में देखें
- ✓ Browser cache clear करें

**Problem:** API error आ रहा है
- ✓ Backend चल रहा है या नहीं check करें
- ✓ MongoDB connected है या नहीं
- ✓ JWT token valid है या नहीं

**Problem:** Changes save नहीं हो रहे
- ✓ Required fields भरे हैं या नहीं
- ✓ Browser console में errors देखें
- ✓ Network tab में API response check करें

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose  
- JWT Authentication
- Role-based Authorization

**Frontend:**
- Next.js 14 (App Router)
- React + TypeScript
- Redux Toolkit + RTK Query
- Tailwind CSS
- Modern UI with Dark Mode

---

**सभी features पूरी तरह ready हैं!** आप अभी admin panel को use करना शुरू कर सकते हैं। 🎉











