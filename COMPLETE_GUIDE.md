# MCQ Platform - Complete Setup & Usage Guide

Welcome! Your MCQ Platform is now fully built with all features. Follow this guide to get started.

## ✅ What's Been Completed

### Features Built
- ✅ **User Authentication** - Register, Login with JWT
- ✅ **User Dashboard** - View scores, test results, courses
- ✅ **Courses Management** - Browse and take courses
- ✅ **Question Sets** - Organize questions by sets
- ✅ **MCQ Tests** - Interactive quiz with timer
- ✅ **Admin Panel** - Full content management
- ✅ **Admin Courses** - Create, edit, delete courses
- ✅ **Admin Question Sets** - Manage question sets
- ✅ **Admin Questions** - Add MCQ questions with options
- ✅ **Dark Mode** - Full theme support
- ✅ **Responsive Design** - Mobile, tablet, desktop
- ✅ **Toast Notifications** - Real-time feedback

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Development Server
```bash
npm run dev
```
Open http://localhost:3000

### Step 2: Seed Sample Data
Go to http://localhost:3000/setup and click **"Seed Database"**
This will create 6 sample courses for testing.

### Step 3: Create Your Account
- Click **"Get Started"** or go to `/register`
- Create an account with any email and password
- You'll be logged in automatically

### Step 4: Make Yourself an Admin
1. Open MongoDB (local or Atlas)
2. Go to `aimcq` database → `users` collection
3. Find your user document
4. Change the `role` field from `"user"` to `"admin"`
5. Refresh the page

### Step 5: Access Admin Panel
- Go to http://localhost:3000/admin
- You now have full control!

## 📱 Main Pages Overview

### Public Pages (No Login)
- **Home** (`/`) - Browse available courses
- **Login** (`/login`) - Sign in to your account
- **Register** (`/register`) - Create new account
- **Setup** (`/setup`) - Initial setup guide

### User Pages (Login Required)
- **Dashboard** (`/dashboard`) - Your stats and test results
- **Course** (`/course/:id`) - View question sets in a course
- **Test** (`/test/:id`) - Take MCQ test for a question set

### Admin Pages (Admin Only)
- **Admin Dashboard** (`/admin`) - Main admin hub
- **Manage Courses** (`/admin/courses`) - CRUD courses
- **Question Sets** (`/admin/question-sets`) - CRUD question sets
- **Manage Questions** (`/admin/questions`) - CRUD MCQ questions
- **Home Editor** (`/admin/home-editor`) - Edit home page content

## 📚 How to Use (Step by Step)

### As a User
1. Register/Login at `/register`
2. You'll land on your **Dashboard**
3. Go back to **Home** to see courses
4. Click a course card to view its **Question Sets**
5. Click "Start Test" on any question set
6. Answer the MCQ questions
7. View your score and performance

### As an Admin
1. Navigate to `/admin` to see the admin dashboard
2. **Add Courses**: Click "Manage Courses" → Add Course with name, description, and image URL
3. **Create Question Sets**: Click "Question Sets" → Select course → Add question set name
4. **Add Questions**: Click "Manage Questions" → Select question set → Add MCQ with 4 options

#### Example Image URLs for Courses
```
Computer Operator: https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop
English: https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=500&h=300&fit=crop
Math: https://images.unsplash.com/photo-1509228627152-72ae9e29f773?w=500&h=300&fit=crop
General Knowledge: https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&h=300&fit=crop
Reasoning: https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop
Science: https://images.unsplash.com/photo-1530693737987-381d20c9be65?w=500&h=300&fit=crop
```

## 🗄️ Database Structure

### Collections
- **users** - Registered users with roles (user/admin)
- **courses** - All courses
- **questionsets** - Question sets grouped by course
- **questions** - Individual MCQ questions
- **testresults** - User test scores and results
- **homepages** - Home page customization content

## 🎨 Design Features

- **Modern UI** - Beautiful gradient backgrounds and smooth animations
- **Dark Mode** - Full dark theme support with localStorage persistence
- **Responsive** - Works perfectly on phone, tablet, and desktop
- **Smooth Animations** - Hover effects, transitions, and loading states
- **Professional Cards** - Course cards with images and descriptions
- **Toast Notifications** - Real-time user feedback

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication tokens (7-day expiry)
- ✅ Role-based access control (user/admin)
- ✅ Protected API endpoints
- ✅ Input validation on all forms
- ✅ Environment variables for secrets

## ⚙️ Environment Variables

Your `.env.local` file has:
```
MONGODB_URI=mongodb://localhost:27017/aimcq
JWT_SECRET=mycode100
```

For production, change:
- `MONGODB_URI` to MongoDB Atlas URI
- `JWT_SECRET` to a strong random key

## 📞 Common Issues & Solutions

### Issue: "No courses available yet"
**Solution**: Go to `/setup` and click "Seed Database"

### Issue: Not seeing admin panel
**Solution**: Change your role to "admin" in MongoDB (see Step 4 above)

### Issue: Getting 404 errors
**Solution**: Make sure MongoDB is running and connection string is correct

### Issue: Can't log in
**Solution**: Clear cookies and cache, then try again

## 🚀 Production Deployment

To deploy:
1. Set `MONGODB_URI` to MongoDB Atlas connection string
2. Set `JWT_SECRET` to a strong random key
3. Set environment variables on your hosting platform
4. Run `npm run build` then `npm start`

## 📖 API Endpoints

All endpoints are RESTful:

```
POST   /api/auth/register       - Register user
POST   /api/auth/login          - Login user
GET    /api/courses             - Get all courses
POST   /api/courses             - Create course (Admin)
GET    /api/question-sets       - Get question sets
POST   /api/question-sets       - Create question set (Admin)
GET    /api/questions           - Get questions
POST   /api/questions           - Create question (Admin)
POST   /api/test-results        - Submit test
GET    /api/home                - Get home page content
POST   /api/home                - Update home page (Admin)
POST   /api/seed                - Seed sample data
```

## 🎯 Next Steps

1. ✅ Seed the database with sample courses
2. ✅ Create your account
3. ✅ Make yourself an admin
4. ✅ Test taking a quiz
5. ✅ Create your own courses and questions
6. ✅ Deploy to production

## 💡 Tips

- Use the `/setup` page for easy database seeding
- Try the dark mode toggle in the navbar
- Admin panel is very user-friendly - just follow the forms
- You can edit/delete any course, question set, or question
- All data is persisted in MongoDB

## 🎉 That's It!

Your MCQ Platform is now ready to use. Start by visiting:
- **Home Page**: http://localhost:3000
- **Setup Guide**: http://localhost:3000/setup
- **Register**: http://localhost:3000/register

Enjoy! 🚀
