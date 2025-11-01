# Role-Based Routing Guide (हिंदी)

## Overview

अब आपके application में **पूरी तरह से role-based routing** है जहाँ users automatically अपने role के हिसाब से redirect हो जाते हैं:

- **Admin Role** → `/admin` (Admin Panel)
- **Student Role** → `/student` (Student Portal)

## 🎯 कैसे काम करता है

### 1. Login के बाद Redirect

जब user login करता है, तो उनके role के हिसाब से automatically redirect होता है:

```
Admin user login करे → /admin पर जाएगा
Student user login करे → /student पर जाएगा
```

**Example:**
- आप admin account से login करें → सीधे Admin Panel खुलेगा
- आप student account से login करें → सीधे Student Portal खुलेगा

### 2. Route Protection (सुरक्षा)

दोनों areas protected हैं:

**Admin Area:**
- केवल admin role वाले users ही `/admin` access कर सकते हैं
- बाकी users को home page पर redirect कर दिया जाता है

**Student Area:**
- केवल student role वाले users ही `/student` access कर सकते हैं
- Admin users को admin panel पर redirect कर दिया जाता है
- बिना login के users को login page पर भेज दिया जाता है

### 3. Navigation Menu

Navbar में role के हिसाब से links दिखते हैं:
- **Students को**: "Student Portal" link दिखेगा
- **Admins को**: "Admin Panel" link दिखेगा
- अगर user दोनों roles हैं तो केवल "Admin Panel" दिखेगा (admin priority है)

## 📁 Application Structure

### Admin Area (`/admin`)
```
/admin                          # Admin Dashboard
  /courses                      # Course Management
    /create                     # नया Course बनाएं
    /[id]/edit                  # Course Edit करें
  /ebooks                       # Ebook Management
    /create                     # नया Ebook बनाएं
    /[id]/edit                  # Ebook Edit करें
```

**Admin क्या कर सकते हैं:**
- ✅ सभी courses और ebooks देख सकते हैं (drafts भी)
- ✅ नए courses और ebooks बना सकते हैं
- ✅ मौजूदा content edit कर सकते हैं
- ✅ Content delete कर सकते हैं
- ✅ Statistics देख सकते हैं (enrollments, purchases)

### Student Area (`/student`)
```
/student                        # Student Dashboard
  /my-courses                   # Enrolled Courses
  /my-ebooks                    # Purchased Ebooks
  /live-sessions                # Live Classes
  /orders                       # Order History
```

**Student क्या कर सकते हैं:**
- ✅ Enrolled courses देख सकते हैं
- ✅ Purchased ebooks access कर सकते हैं
- ✅ Live sessions join कर सकते हैं
- ✅ Order history देख सकते हैं
- ✅ Learning progress track कर सकते हैं

## 🚀 Setup & Testing

### 1. Admin User बनाएं

```bash
cd apps/backend
node src/scripts/createAdmin.js
```

**Default admin credentials:**
- Email: `admin@bosstraders.com`
- Password: `Admin@123`

### 2. Student User बनाएं

Student automatically बनते हैं जब वो signup करते हैं। हर नए user को 'student' role मिलता है।

**Student बनने के लिए:**
1. `/auth/signup` पर जाएं
2. Details भरें
3. Login के बाद `/student` पर redirect होंगे

### 3. Test करें

**Admin Test:**
1. Admin credentials से login करें
2. `/admin` पर redirect होना चाहिए
3. Admin dashboard दिखेगा

**Student Test:**
1. Regular account से signup/login करें
2. `/student` पर redirect होना चाहिए
3. Student dashboard दिखेगा

## 🔐 Role Assignment

### User के Roles Check करें

**MongoDB में:**
```javascript
db.users.findOne({ email: "user@example.com" }, { roles: 1 })
```

### Existing User को Admin बनाएं

**MongoDB Query:**
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $addToSet: { roles: "admin" } }
)
```

**Script से:**
```bash
cd apps/backend
ADMIN_EMAIL=user@example.com node src/scripts/createAdmin.js
```

### Admin Role Remove करें

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $pull: { roles: "admin" } }
)
```

## 📊 Access Table

| Route | Public | Student | Admin |
|-------|--------|---------|-------|
| `/` (Home) | ✅ | ✅ | ✅ |
| `/courses` | ✅ | ✅ | ✅ |
| `/ebooks` | ✅ | ✅ | ✅ |
| `/student` | ❌ | ✅ | ❌ |
| `/student/*` | ❌ | ✅ | ❌ |
| `/admin` | ❌ | ❌ | ✅ |
| `/admin/*` | ❌ | ❌ | ✅ |
| `/auth/login` | ✅ | ✅* | ✅* |

*Logged-in users अपने dashboard पर redirect होते हैं

## 🎨 UI Features

### Admin Sidebar में:
- Dashboard overview
- Course management link
- Ebook management link
- User profile
- Back to site button

### Student Sidebar में:
- Personal dashboard
- My courses
- My ebooks
- Live sessions
- Orders
- User profile

## 🔄 Login Flow

```
User Login करता है
    ↓
System role check करता है
    ↓
┌─────────────┬─────────────┐
│             │             │
Admin role?   Student role?  कोई role नहीं?
│             │             │
↓             ↓             ↓
/admin        /student      / (home)
```

## 🛠️ Common Tasks

### 1. किसी Student को Admin बनाना

**Step 1:** Email note करें
**Step 2:** MongoDB में या script चलाएं:

```bash
cd apps/backend
ADMIN_EMAIL=student@email.com node src/scripts/createAdmin.js
```

**Step 3:** User को logout और login करने बोलें

### 2. Admin को वापस Student बनाना

```javascript
// MongoDB में
db.users.updateOne(
  { email: "admin@email.com" },
  { $pull: { roles: "admin" } }
)
```

### 3. User के सभी Roles देखना

```javascript
// MongoDB में
db.users.findOne(
  { email: "user@email.com" },
  { name: 1, email: 1, roles: 1 }
)
```

## 🐛 Problems & Solutions

### Problem 1: Login के बाद गलत page पर जा रहा है
**Solution:** Database में role check करें:
```javascript
db.users.findOne({ email: "your@email.com" }, { roles: 1 })
```

### Problem 2: Student portal access नहीं हो रहा
**Solution:** 'student' role add करें:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $addToSet: { roles: "student" } }
)
```

### Problem 3: Admin panel नहीं दिख रहा
**Solution:** 
1. Admin role है या नहीं check करें
2. Browser cache clear करें
3. Logout करके फिर login करें

### Problem 4: Infinite redirect हो रहा है
**Solution:**
1. Browser cookies clear करें
2. User में कम से कम एक role होना चाहिए
3. Database में verify करें

## 📝 Testing Checklist

Login करने के बाद check करें:

**Admin User के लिए:**
- [ ] `/admin` पर redirect हुआ?
- [ ] Admin dashboard दिख रहा है?
- [ ] Courses manage कर सकते हैं?
- [ ] Ebooks manage कर सकते हैं?
- [ ] Navbar में "Admin Panel" link है?

**Student User के लिए:**
- [ ] `/student` पर redirect हुआ?
- [ ] Student dashboard दिख रहा है?
- [ ] My Courses page खुल रहा है?
- [ ] My Ebooks page खुल रहा है?
- [ ] Navbar में "Student Portal" link है?

## 💡 Tips

1. **हमेशा testing environment में test करें** production में push करने से पहले
2. **Admin credentials को safe रखें** और किसी के साथ share न करें
3. **Regular backups लें** database का
4. **Role changes का log रखें** security के लिए
5. **Users को proper training दें** नए features के बारे में

## 🎓 Important Notes

⚠️ **Security:**
- Admin role बहुत powerful है
- केवल trusted users को admin बनाएं
- Admin access regularly audit करें

⚠️ **Data:**
- Role changes immediate effect रखते हैं
- User को logout/login करना पड़ सकता है
- Database में directly changes करने से पहले backup लें

⚠️ **Testing:**
- दोनों roles को अलग-अलग test करें
- Mixed roles (admin + student) भी test करें
- Mobile और desktop दोनों पर test करें

## 📚 Related Files

### Backend Files:
- `apps/backend/src/models/User.js` - User model with roles
- `apps/backend/src/middleware/auth.js` - Authentication & authorization
- `apps/backend/src/scripts/createAdmin.js` - Admin creation script

### Frontend Files:
- `apps/frontend/app/admin/*` - Admin panel pages
- `apps/frontend/app/student/*` - Student portal pages
- `apps/frontend/app/auth/login/page.tsx` - Login with redirect logic
- `apps/frontend/components/Navbar.tsx` - Navigation with role-based links

## 🎉 Summary

अब आपके पास:
- ✅ पूरी तरह से अलग Admin और Student areas हैं
- ✅ Login के बाद automatic role-based redirect
- ✅ Protected routes with proper authorization
- ✅ Role-specific navigation menus
- ✅ Beautiful, modern UI for both areas

**सब कुछ ready है! आप अभी use कर सकते हैं।** 🚀

---

ज्यादा जानकारी के लिए देखें:
- [Role-Based Routing Guide (English)](./ROLE_BASED_ROUTING_GUIDE.md)
- [Admin Setup Guide (Hindi)](./ADMIN_SETUP_HINDI.md)
- [Admin System Guide](./ADMIN_SYSTEM_GUIDE.md)










