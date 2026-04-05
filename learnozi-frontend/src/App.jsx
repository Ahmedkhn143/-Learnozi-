import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import StudyPlanner from './pages/StudyPlanner/StudyPlanner';
import AiExplainer from './pages/AiExplainer/AiExplainer';
import Flashcards from './pages/Flashcards/Flashcards';
import Pomodoro from './pages/Pomodoro/Pomodoro';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

export default function App() {
  return (
    <Routes>
      {/* Landing page — guests only */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

      {/* Auth pages — guests only */}
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected pages — logged in users */}
      <Route element={<Layout />}>
        <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/planner"      element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
        <Route path="/ai-explainer" element={<ProtectedRoute><AiExplainer /></ProtectedRoute>} />
        <Route path="/flashcards"   element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
        <Route path="/timer"        element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
