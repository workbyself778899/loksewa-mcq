# MCQ Platform - Quick Setup Guide

## 🎯 What Has Been Built

A complete MCQ (Multiple Choice Question) learning platform with:

### ✅ Features Implemented
- **User Authentication**: Login & Registration with JWT tokens
- **Home Page**: Beautiful hero section with course listings
- **User Dashboard**: Stats, test results, and available courses
- **Course Management**: Browse courses and access question sets
- **Quiz Interface**: Interactive MCQ testing with timer and answer tracking
- **Admin Dashboard**: Complete admin panel for managing content
- **Course Management**: Add, edit, delete courses (Admin only)
- **Home Page Editor**: Customize home page content (Admin only)
- **Dark Mode**: Full dark/light theme support throughout
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Toast Notifications**: Real-time user feedback
- **Well-Commented Code**: Every function and complex logic explained

---

## 🚀 Quick Start

### Step 1: Install MongoDB
**Option A - Local MongoDB:**
- Download from https://www.mongodb.com/try/download/community
- Install and run MongoDB

**Option B - MongoDB Atlas (Cloud):**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account and cluster
- Get connection string

### Step 2: Create Environment File
Create `.env.local` in project root:
```
MONGODB_URI=mongodb://localhost:27017/aimcq
JWT_SECRET=your-super-secret-key-change-this-in-production
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aimcq
JWT_SECRET=your-super-secret-key-change-this-in-production
```

### Step 3: Run Development Server
```bash
npm run dev
```

Open `http://localhost:3000`

---

## 👥 User Roles

### Regular User
- Register account
- View courses
- Take tests
- See results and scores
- Track progress

### Admin User
1. Register account
2. Open MongoDB
3. Find your user document
4. Change `role` field from `"user"` to `"admin"`
5. Reload page and access `/admin`

---

## 📱 Main Pages

### Public Pages (No Login Required)
- **Home** (`/`) - Browse courses
- **Login** (`/login`) - Sign in
- **Register** (`/register`) - Create account

### User Pages (Login Required)
- **Dashboard** (`/dashboard`) - View stats and results
- **Course** (`/course/:id`) - View question sets
- **Test** (`/test/:id`) - Take MCQ test

### Admin Pages (Admin Only)
- **Admin Dashboard** (`/admin`) - Admin hub
- **Manage Courses** (`/admin/courses`) - CRUD courses
- **Home Editor** (`/admin/home-editor`) - Edit home page

---

## 🎮 How to Use

### As a User
1. Register at `/register`
2. Browse courses on home page
3. Click on a course to see question sets
4. Click "Start Test" button
5. Select answer for each question
6. Submit when all answered
7. View results and score

### As an Admin
1. Register and make yourself admin (see above)
2. Go to `/admin`
3. **Create Courses**:
   - Click "Manage Courses"
   - Click "Add Course"
   - Fill in name, description, image URL
   - Save

4. **Add Question Sets** (from course page):
   - Go to course in `/admin/courses`
   - Click the edit/plus icon
   - Create question sets

5. **Add Questions**:
   - Edit questions through the admin interface
   - Questions have 4 options
   - Mark correct answer (0-3)

6. **Edit Home Page**:
   - Go to `/admin/home-editor`
   - Update title, description, content
   - Save changes

---

## 🎨 Customization

### Change Colors
Edit Tailwind classes in components:
- Replace `blue-500` with different color
- Use `purple-500`, `green-500`, `red-500`, etc.

### Change Logo/Brand Name
Edit in `src/components/Navbar.tsx`:
- Search for "MCQ Platform"
- Change to your brand name

### Change Database
Update `MONGODB_URI` in `.env.local`

---

## 🔒 Security Tips

### Before Production
1. **Change JWT_SECRET** to a random strong string
2. **Use MongoDB Atlas** instead of local
3. **Enable HTTPS** on your domain
4. **Set strong passwords** for admin accounts
5. **Remove demo data** before launch
6. **Update dependencies**: `npm audit fix`

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### MongoDB Connection Error
1. Check MongoDB is running
2. Verify MONGODB_URI in `.env.local`
3. For Atlas, whitelist your IP

### Can't Login After Registration
1. Clear browser cache
2. Check MongoDB has user data
3. Verify JWT_SECRET matches

### Dark Mode Not Working
1. Refresh page
2. Check localStorage
3. Clear browser cache

---

## 📊 Database Structure

```
Users
  ├── email (unique)
  ├── password (hashed)
  ├── fullName
  ├── role (user/admin)
  └── createdAt

Courses
  ├── name
  ├── description
  ├── image (URL)
  └── createdBy (User ID)

QuestionSets
  ├── course (Course ID)
  ├── name (Set-1, Set-2, etc.)
  └── createdBy (User ID)

Questions
  ├── questionSet (QuestionSet ID)
  ├── questionText
  ├── options (array of 4)
  ├── correctAnswer (0-3 index)
  └── createdBy (User ID)

TestResults
  ├── user (User ID)
  ├── questionSet (QuestionSet ID)
  ├── answers (array of indices)
  ├── score
  ├── percentage
  └── timeSpent (seconds)

HomePage
  ├── title
  ├── description
  ├── heroImage (URL)
  └── content
```

---

## 📚 Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Notifications**: react-hot-toast
- **Icons**: react-icons

---

## 🎓 Code Learning

The code is **heavily commented** for learning:

1. **API Routes** - `/src/app/api/` - See how API endpoints work
2. **Models** - `/src/models/` - MongoDB schema examples
3. **Components** - `/src/components/` - React component patterns
4. **Pages** - `/src/app/` - Full page implementations

Each file has:
- Function descriptions
- Parameter explanations  
- Comments on complex logic
- Usage examples

---

## 🚀 Next Steps

1. **Test Everything**:
   - Register and login
   - Create courses
   - Add questions
   - Take a test

2. **Customize**:
   - Change colors
   - Update home page content
   - Add more courses

3. **Deploy**:
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, or any Node.js host
   - Set environment variables on hosting platform

---

## 💡 Features to Add Later

- Email notifications
- Leaderboard
- Analytics dashboard
- Export test results as PDF
- Batch import questions via CSV
- Video tutorials in courses
- Detailed question explanations
- Performance analytics
- Time-based difficulty levels

---

## 📞 Need Help?

1. Check the comprehensive README.md
2. Look at code comments in files
3. Review API structure in `/src/app/api/`
4. Check MongoDB documentation
5. Review Next.js documentation

---

## ✨ You're Ready!

Your MCQ platform is fully functional. Now:
1. Set up MongoDB
2. Create `.env.local`
3. Run `npm run dev`
4. Register and start testing!

**Happy Learning! 📚✨**

---

**Built with ❤️ using Next.js 16 and MongoDB**
