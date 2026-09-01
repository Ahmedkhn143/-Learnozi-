import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Auth3DLayout from './Auth3DLayout';
import './Auth.css';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both Email Address and Password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setLoading(true);
    setTimeout(() => {
      demoLogin();
      setLoading(false);
      navigate('/dashboard');
    }, 300);
  };

  return (
    <Auth3DLayout>
      <div className="auth-3d-header">
        <h1 className="auth-3d-title">{t('auth.welcome_back')}</h1>
        <p className="auth-3d-subtitle">{t('auth.welcome_back_sub')}</p>
      </div>

      {error && (
        <div className="auth-3d-alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Demo Quick Access Box */}
      <div className="demo-3d-box">
        <div className="demo-3d-badge">
          <span>{t('auth.demo_badge')}</span>
        </div>
        <p>{t('auth.demo_sub')}</p>
        <button
          type="button"
          className="btn-3d btn-3d-demo"
          onClick={handleDemoAccess}
          disabled={loading}
        >
          {t('auth.demo_btn')}
        </button>
      </div>

      <form className="auth-3d-form" onSubmit={handleLogin} noValidate>
        {/* Email Address */}
        <div className="form-3d-group">
          <label className="form-3d-label">{t('auth.email')}</label>
          <div className="input-3d-wrapper">
            <span className="input-3d-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </span>
            <input
              type="email"
              className="input-3d-field"
              placeholder={t('auth.email_ph')}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-3d-group">
          <div className="label-3d-flex">
            <label className="form-3d-label">{t('auth.password')}</label>
            <Link to="/forgot-password" className="link-3d-forgot">{t('auth.forgot_password')}</Link>
          </div>
          <div className="input-3d-wrapper">
            <span className="input-3d-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-3d-field"
              placeholder={t('auth.password_ph')}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
            />
            <button
              type="button"
              className="input-3d-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide Password' : 'Show Password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Checkbox: Remember me */}
        <div className="checkbox-3d-wrapper">
          <label className="checkbox-3d-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox-3d-input"
            />
            <span className="checkbox-3d-custom"></span>
            <span className="checkbox-3d-text">{t('auth.remember_me')}</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-3d btn-3d-primary"
          disabled={loading}
        >
          {loading ? t('auth.authenticating') : t('auth.sign_in')}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-3d-divider">
        <span>{t('auth.or')}</span>
      </div>

      {/* Social OAuth Buttons */}
      <div className="social-3d-buttons">
        <button type="button" className="btn-3d btn-3d-social" onClick={handleDemoAccess}>
          <svg className="social-icon" width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{t('auth.continue_google')}</span>
        </button>

        <button type="button" className="btn-3d btn-3d-social" onClick={handleDemoAccess}>
          <svg className="social-icon" width="18" height="18" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          <span>{t('auth.continue_microsoft')}</span>
        </button>
      </div>

      {/* Footer link */}
      <div className="auth-3d-footer">
        <p>{t('auth.dont_have_account')} <Link to="/signup" className="link-3d-signup">{t('auth.sign_up_link')}</Link></p>
      </div>
    </Auth3DLayout>
  );
}
