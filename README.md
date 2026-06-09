# MCQ Learning Platform

A comprehensive Multiple Choice Question (MCQ) learning platform built with Next.js, React, TypeScript, MongoDB, and Tailwind CSS. The platform allows admins to create courses and questions, while users can take tests and track their progress.

## 🎯 Features

### User Features
- **Authentication**: Secure login and registration system
- **Dashboard**: View test results, scores, and statistics
- **Courses**: Browse and access available courses
- **Tests**: Take multiple-choice question tests
- **Results**: View detailed test results and performance metrics
- **Dark Mode**: Full dark mode support for comfortable viewing
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop devices

### Admin Features
- **Course Management**: Create, edit, and delete courses
- **Question Management**: Add questions with multiple choice options
- **Question Sets**: Organize questions into sets (Set-1, Set-2, etc.)
- **Home Page Editor**: Customize home page content and images
- **Role-Based Access**: Admin-only pages and features

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Navigate to project directory**
   ```bash
   cd aimcq
   ```

2. **Install dependencies** (already done)
   ```bash
   npm install
   ```

3. **Create `.env.local` file**
   ```
   MONGODB_URI=mongodb://localhost:27017/aimcq
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open browser**: `http://localhost:3000`

## 📁 Project Structure

- `src/app/api/` - API routes (auth, courses, questions, tests, home)
- `src/app/admin/` - Admin dashboard and management pages
- `src/app/` - User pages (home, login, register, dashboard, course, test)
- `src/components/` - Reusable components (Navbar, ThemeProvider, AuthProvider)
- `src/models/` - MongoDB Mongoose models
- `src/lib/` - MongoDB connection utility
- `src/middleware/` - Authentication middleware
- `src/utils/` - JWT utilities

## 🔐 Creating Admin Account

1. Register at `/register`
2. Open MongoDB and find your user document
3. Change `role` field from `"user"` to `"admin"`
4. Now you can access `/admin` dashboard

## 🎨 Key Features

### Dark Mode
- Toggle in navbar
- Auto-detects system preference
- Persists in localStorage
- Fully implemented throughout app

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Works on all devices

### Notifications
- Toast notifications with react-hot-toast
- Success, error, warning types
- Auto-dismiss functionality

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints
- Role-based access control

## 📝 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET/POST /api/courses` - Course CRUD
- `GET/POST /api/questions` - Question CRUD
- `GET/POST /api/question-sets` - Question set CRUD
- `GET/POST /api/test-results` - Test submission and results
- `GET/PUT /api/home` - Home page content

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, PostCSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs
- **UI**: react-hot-toast, react-icons

## 📱 Pages Overview

| Route | Purpose |
|-------|---------|
| `/` | Home with courses list |
| `/login` | User login |
| `/register` | User registration |
| `/dashboard` | User dashboard with stats |
| `/course/[id]` | Course details and question sets |
| `/test/[id]` | Quiz interface |
| `/admin` | Admin dashboard |
| `/admin/courses` | Manage courses |
| `/admin/home-editor` | Edit home page |

## 🚀 Building for Production

```bash
npm run build
npm start
```

## 💡 Code Highlights

✅ Comprehensive inline comments explaining all code  
✅ Full TypeScript implementation  
✅ Error handling and validation  
✅ Responsive design for all devices  
✅ Dark mode support throughout  
✅ Secure authentication system  
✅ Role-based access control  
✅ Real-time notifications  
✅ RESTful API architecture  
✅ MongoDB with proper data relationships  

---

**Built with ❤️ using Next.js 16 and MongoDB**


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
