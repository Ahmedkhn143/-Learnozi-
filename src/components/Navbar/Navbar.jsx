import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const close = () => setMenuOpen(false);

  const links = [
    { to: '/dashboard',    label: t('nav.dashboard'), end: true },
    { 
      to: '/academics',    
      label: '🎓 Academics',
      hide: user?.academicProfile?.educationLevel !== 'University'
    },
    { to: '/planner',      label: t('nav.planner') },
    { to: '/ai-explainer', label: t('nav.ai_explainer') },
    { to: '/document-chat',label: '📄 Doc Chat' },
    { to: '/flashcards',   label: `🃏 ${t('nav.flashcards')}` },
    { to: '/community',    label: '🌍 Community' },
    { to: '/notes',        label: '📝 Notes' },
  ].filter(l => !l.hide);

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
        <button 
          className="btn btn-ghost" 
          onClick={toggleLanguage} 
          style={{ marginRight: '8px', padding: '0.4rem 0.6rem', fontWeight: 'bold' }}>
          {language === 'en' ? 'UR' : 'EN'}
        </button>
        {user ? (
          <>
            <Link to="/profile" className="navbar-user" style={{ textDecoration: 'none', color: 'inherit' }}>👤 {user.name}</Link>
            <button className="btn btn-ghost" onClick={handleLogout}>{t('nav.logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">{t('nav.login')}</Link>
            <Link to="/signup" className="btn btn-primary">{t('nav.signup')}</Link>
          </>
        )}
      </div>

      <button 
        className={`navbar-hamburger ${menuOpen ? 'is-active' : ''}`} 
        onClick={() => setMenuOpen((o) => !o)} 
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      {menuOpen && (
        <div className="navbar-mobile-drawer">
          {user && (
            <Link to="/profile" className="navbar-mobile-user" onClick={close}>
              <span className="user-icon">👤</span>
              <span className="user-name">{user.name}</span>
            </Link>
          )}
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={close}>{l.label}</NavLink>
          ))}
          <div className="navbar-mobile-divider" />
          <button className="btn btn-ghost" onClick={toggleLanguage} style={{ width: '100%', justifyContent: 'flex-start', fontWeight: 'bold' }}>
            🌐 Language: {language === 'en' ? 'English (EN)' : 'Urdu (UR)'}
          </button>
          {user ? (
            <button className="btn btn-ghost danger-text" onClick={() => { handleLogout(); close(); }} style={{ width: '100%', justifyContent: 'flex-start' }}>
              🚪 {t('nav.logout')}
            </button>
          ) : (
            <div className="mobile-auth-btns">
              <Link to="/login" className="btn btn-ghost" onClick={close}>{t('nav.login')}</Link>
              <Link to="/signup" className="btn btn-primary" onClick={close}>{t('nav.signup')}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
