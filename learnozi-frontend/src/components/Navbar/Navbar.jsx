import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const close = () => setMenuOpen(false);

  const links = [
    { to: '/dashboard',    label: 'Dashboard', end: true },
    { to: '/planner',      label: 'Planner' },
    { to: '/ai-explainer', label: 'AI Explainer' },
    { to: '/flashcards',   label: '🃏 Flashcards' },
    { to: '/timer',        label: '⏱️ Timer' },
  ];

  return (
    <header className="navbar">
      <Link to="/dashboard" className="navbar-logo" onClick={close}>
        <span className="navbar-logo-icon">L</span>
        <span className="navbar-logo-text">Learnozi</span>
      </Link>

      <nav className="navbar-nav-wrap">
        <ul className="navbar-nav">
          {links.map((l) => (
            <li key={l.to}><NavLink to={l.to} end={l.end}>{l.label}</NavLink></li>
          ))}
        </ul>
      </nav>

      <div className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-user">👤 {user.name}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>

      <button className="navbar-hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>

      {menuOpen && (
        <div className="navbar-mobile-drawer">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={close}>{l.label}</NavLink>
          ))}
          <div className="navbar-mobile-divider" />
          {user ? (
            <button className="btn btn-ghost" onClick={() => { handleLogout(); close(); }}>Log Out</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={close}>Log In</Link>
              <Link to="/signup" className="btn btn-primary" onClick={close}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
