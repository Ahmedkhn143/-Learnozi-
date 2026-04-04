import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import StudyPlanner from './pages/StudyPlanner/StudyPlanner';
import AiExplainer from './pages/AiExplainer/AiExplainer';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

export default function App() {
  return (
    <Routes>
      {/* Protected pages with Navbar layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
        <Route path="/ai-explainer" element={<ProtectedRoute><AiExplainer /></ProtectedRoute>} />
      </Route>

      {/* Auth pages (no navbar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
