import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Auth.css';

export default function Auth3DLayout({ children }) {
  const { language, toggleLanguage, t } = useLanguage();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth subtle 3D tilt tracking
    setRotate({
      x: (-y / rect.height) * 8,
      y: (x / rect.width) * 8
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="auth-3d-page">
      {/* Soft Ambient Pastel Background Orbs */}
      <div className="clay-ambient orb-1" />
      <div className="clay-ambient orb-2" />
      <div className="clay-ambient orb-3" />

      {/* Main 3D Container Card */}
      <div 
        className="auth-3d-card-wrapper animate-fade-in"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: rotate.x === 0 && rotate.y === 0 ? 'transform 0.5s ease-out' : 'none'
        }}
      >
        {/* Language Switcher Pill Floating Button */}
        <button 
          type="button" 
          className="auth-lang-switcher-btn"
          onClick={toggleLanguage}
          title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
        >
          <span className="lang-flag">{language === 'en' ? '🇵🇰' : '🇬🇧'}</span>
          <span className="lang-text">{language === 'en' ? 'اردو' : 'EN'}</span>
        </button>

        {/* LEFT PANEL: 3D Visual & Branding */}
        <div className="auth-3d-left-panel">
          {/* Brand Header */}
          <div className="auth-3d-brand">
            <Link to="/" className="brand-badge-3d" title="Learnozi Home">
              <span className="brand-letter-icon">L</span>
            </Link>
            <span className="brand-name-3d">Learnozi</span>
          </div>

          {/* Heading */}
          <div className="auth-3d-welcome-text">
            <h2>{t('auth.welcome_title')}</h2>
            <p>{t('auth.welcome_sub')}</p>
          </div>

          {/* 3D Illustration Canvas & Floating Badges */}
          <div className="auth-3d-scene-container">
            {/* Main Generated 3D Art Asset */}
            <img 
              src="/auth-3d-avatar.jpg" 
              alt="3D AI Study Workspace Station" 
              className="auth-3d-character-img"
            />

            {/* Floating 3D Micro Widgets */}
            <div className="floating-3d-badge badge-sticky-note">
              <div className="badge-icon">📌</div>
              <div className="badge-text">
                <strong>{t('auth.study_smart')}</strong>
                <span>{t('auth.ai_powered')}</span>
              </div>
            </div>

            <div className="floating-3d-badge badge-heart">
              <span>{t('auth.focused')}</span>
            </div>

            <div className="floating-3d-badge badge-sparkle">
              <span>✨</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form Card */}
        <div className="auth-3d-right-panel">
          <div className="auth-3d-form-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
