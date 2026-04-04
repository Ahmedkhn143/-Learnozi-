import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-icon">L</span>
        <span className="navbar-logo-text">Learnozi</span>
      </Link>

      {/* Navigation links */}
      <nav>
        <ul className="navbar-nav">
          <li>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/planner">Study Planner</NavLink>
          </li>
          <li>
            <NavLink to="/ai-explainer">AI Explainer</NavLink>
          </li>
        </ul>
      </nav>

      {/* Auth actions */}
      <div className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-user">{user.name}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              Log In
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
