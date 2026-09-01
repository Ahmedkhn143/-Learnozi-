import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navItems = [
    {
      to: '/dashboard',
      label: t('nav.dashboard') || 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
      ),
      end: true
    },
    {
      to: '/academics',
      label: 'Academics',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    },
    {
      to: '/planner',
      label: t('nav.planner') || 'Study Planner',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      to: '/ai-explainer',
      label: t('nav.ai_explainer') || 'AI Explainer',
      badge: 'AI',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      )
    },
    {
      to: '/document-chat',
      label: 'Doc Chat',
      badge: 'PRO',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    {
      to: '/flashcards',
      label: t('nav.flashcards') || 'Flashcards',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="15" height="14" rx="2" />
          <path d="M6 2h13a2 2 0 0 1 2 2v13" />
        </svg>
      )
    },
    {
      to: '/timer',
      label: 'Focus Timer',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2" />
          <path d="M5 3L2 6" />
          <path d="M22 6l-3-3" />
        </svg>
      )
    },
    {
      to: '/notes',
      label: 'Notes',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )
    },
    {
      to: '/community',
      label: 'Community',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Sidebar Navigation for Desktop */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand">
            <div className="brand-icon-wrap">
              <span className="brand-icon">L</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">Learnozi</span>
              <span className="brand-tag">PRO AI</span>
            </div>
          </Link>
        </div>

        <div className="sidebar-menu-wrapper">
          <div className="menu-group-label">WORKSPACE</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <span className="link-icon">{item.icon}</span>
                <span className="link-label">{item.label}</span>
                {item.badge && <span className="link-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="menu-group-label" style={{ marginTop: '1.5rem' }}>ACCOUNT</div>
          <nav className="sidebar-nav">
            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <span className="link-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="link-label">Profile & Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* User Card at bottom of Sidebar */}
        <div className="sidebar-user-footer">
          {user ? (
            <div className="user-profile-badge">
              <div className="user-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
              <div className="user-info">
                <span className="user-name">{user.name || 'Learner'}</span>
                <span className="user-email">{user.email || 'student@learnozi.app'}</span>
              </div>
              <button className="btn-logout-icon" onClick={handleLogout} title="Logout">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="guest-auth-actions">
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Login</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Top Utility Header */}
      <header className="app-topbar">
        <div className="topbar-left">
          <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          
          <div className="topbar-search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search topics, flashcards, AI notes... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="topbar-right">
          <button className="topbar-chip-btn" onClick={toggleLanguage}>
            <span className="chip-flag">🌐</span>
            <span>{language === 'en' ? 'ENGLISH (EN)' : 'URDU (UR)'}</span>
          </button>

          <Link to="/ai-explainer" className="btn btn-accent btn-sm">
            <span>✨ Ask AI Assistant</span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMobile}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="brand-name">Learnozi</span>
              <button className="close-btn" onClick={closeMobile}>✕</button>
            </div>
            <nav className="mobile-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="mobile-link"
                  onClick={closeMobile}
                >
                  <span className="link-icon">{item.icon}</span>
                  <span className="link-label">{item.label}</span>
                </NavLink>
              ))}
              <NavLink to="/profile" className="mobile-link" onClick={closeMobile}>
                <span className="link-icon">👤</span>
                <span className="link-label">Profile & Settings</span>
              </NavLink>
            </nav>
            <div className="drawer-footer">
              <button className="btn btn-danger btn-sm" onClick={() => { handleLogout(); closeMobile(); }} style={{ width: '100%' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
