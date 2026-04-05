# 🎓 Learnozi - Complete Project Overview

Learnozi is a comprehensive, full-stack educational and productivity web application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Its primary goal is to help students and learners organize their study materials, prep for exams, track focus sessions, and understand complex topics using AI.

---

## 🏛️ Architecture & Tech Stack

### Frontend (`learnozi-frontend`)
- **Framework & Tooling**: React.js (v18) initialized via Vite for lightning-fast module replacement and builds.
- **Routing**: `react-router-dom` for handling guest (Landing, Login, Signup) and protected routes (Dashboard, Flashcards, etc.).
- **HTTP Client**: `axios` for making API requests to the Node.js backend.
- **Styling**: Vanilla CSS for modular component-level formatting.

### Backend (`learnozi-backend`)
- **Server**: Node.js running Express.js (v5.x).
- **Database**: MongoDB with Mongoose for Object Data Modeling (ODM).
- **Authentication**: JWT (JSON Web Tokens) combined with `bcryptjs` for secure password hashing.
- **Security & Middleware**: `helmet` for HTTP header security, `express-rate-limit` for DDoS protection, `cors` for cross-origin requests, and custom global error handling.

---

## ✨ Core Features & Modules

### 1. User Authentication & Authorization
- **Implementation**: Login and Signup routes with JWT generation.
- **Frontend**: Provides public routes for guests and protected routes for authenticated users.

### 2. Dashboard
- **Implementation**: The central hub that summarizes the user's progress. It queries upcoming exams, recent focus sessions, and overall study time to give the user a birds-eye view of their academic standing.

### 3. Study Planner & Subjects/Exams
- **Subjects**: Users can manage subjects they are currently learning.
- **Exams**: Tracks upcoming exams and pairs them with specific subjects.
- **Plans & Schedules**: Intelligent allocation of study hours across different subjects tailored to exam dates.

### 4. Flashcards System 
- **Implementation**: A newly added feature allowing learners to create custom flashcards (Question & Answer format) linked to subjects. 
- **Usage**: Great for active recall and spaced repetition before taking exams.

### 5. Pomodoro / Focus Timer
- **Implementation**: Features a dedicated timer (Pomodoro technique) on the frontend.
- **Backend Tracking**: Completing a focus session saves the `durationMin` and `subject` in the database under `FocusSession.js`. This allows users to track exactly how much time they've dedicated to a specific subject.

### 6. AI Explainer
- **Implementation**: An integrated AI assistant tab. If a student is stuck on a difficult concept, they can ask the AI explainer for a breakdown, simplifying complex educational material into digestible points.

---

## 📂 Directory Structure Highlights

```text
Learnozi/
├── learnozi-frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, Layout, ProtectedRoutes)
│   │   ├── pages/           # Page views:
│   │   │   ├── AiExplainer/ # AI chat/explanation view
│   │   │   ├── Auth/        # Login and Signup
│   │   │   ├── Dashboard/   # Main user dashboard
│   │   │   ├── Flashcards/  # Flashcard management view
│   │   │   ├── Landing/     # Home page for unauthenticated users
│   │   │   ├── Pomodoro/    # Focus timer view
│   │   │   └── StudyPlanner/# Timetable and exam scheduling
│   │   ├── App.jsx          # Route declarations
│   │   └── main.jsx         # React application entry point
│   └── package.json
│
├── learnozi-backend/
│   ├── config/              # Database connection and environment variables
│   ├── controllers/         # Business logic for all modules 
│   │   └── (ai, auth, exam, flashcard, focus, plan, schedule, subject)
│   ├── middleware/          # Security and auth verification middlewares
│   ├── models/              # Mongoose database schemas
│   │   ├── Flashcard.js     
│   │   ├── FocusSession.js  
│   │   ├── User.js          
│   │   └── ...
│   ├── routes/              # Express API endpoint declarations
│   ├── server.js            # Express application entry point
│   └── package.json
└── README.md                # Project startup instructions
```

---

## 🚀 How Data Flows (Example: Starting a Focus Session)
1. **Frontend**: The user opens the Pomodoro tab, selects a Subject, sets the timer (e.g., 25 mins), and hits Start.
2. **Timer Finishes**: React triggers an Axios POST request to `/api/focus/log` (or similar) with the session details.
3. **Backend Middleware**: The Express router intercepts the request and verifies the user's JWT token.
4. **Controller**: `focusController.js` creates a new Mongoose document using the `FocusSession` model, linking it to the user's `ObjectId`.
5. **Database**: MongoDB saves the focus session.
6. **Response**: Express sends a 201 Success status back to the chosen client, and the Frontend updates the user's stats on the Dashboard!
