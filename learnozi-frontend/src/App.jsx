import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import StudyPlanner from './pages/StudyPlanner/StudyPlanner';
import AiExplainer from './pages/AiExplainer/AiExplainer';
import Flashcards from './pages/Flashcards/Flashcards';
import Pomodoro from './pages/Pomodoro/Pomodoro';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Profile from './pages/Profile/Profile';
import Notes from './pages/Notes/Notes';
import DocumentChat from './pages/DocumentChat/DocumentChat';
import Academics from './pages/Academics/Academics';
import Community from './pages/Community/Community';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Landing page — guests only */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

        {/* Auth pages — guests only */}
        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Auth — public (no auth required) */}
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected pages — logged in users */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/academics" element={<ProtectedRoute><ErrorBoundary><Academics /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/planner"   element={<ProtectedRoute><ErrorBoundary><StudyPlanner /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/ai-explainer" element={<ProtectedRoute><ErrorBoundary><AiExplainer /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/document-chat" element={<ProtectedRoute><ErrorBoundary><DocumentChat /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><ErrorBoundary><Flashcards /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/community"  element={<ProtectedRoute><ErrorBoundary><Community /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/timer"     element={<ProtectedRoute><ErrorBoundary><Pomodoro /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ErrorBoundary><Profile /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/notes"     element={<ProtectedRoute><ErrorBoundary><Notes /></ErrorBoundary></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
