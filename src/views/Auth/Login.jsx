import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="auth-page-container">
      {/* Background Ambient Glows */}
      <div className="glow-ambient glow-purple" style={{ top: '15%', left: '25%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
      <div className="glow-ambient glow-cyan" style={{ bottom: '15%', right: '25%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />

      <div className="glass-card auth-card animate-fade-in">
        <div className="auth-header text-center">
          <Link to="/" className="auth-logo-brand" title="Go to Home">
            <span className="brand-icon">L</span>
          </Link>
          <h2>Welcome Back 👋</h2>
          <p>Sign in to your Learnozi AI study workspace</p>
        </div>

        {/* Demo One-Click Access Box */}
        <div className="demo-login-box">
          <div className="demo-box-header">
            <span>⚡ INSTANT DEMO ACCESS</span>
          </div>
          <p>Explore all features without typing credentials!</p>
          <button
            type="button"
            className="btn btn-accent btn-sm mt-2"
            onClick={handleDemoAccess}
            style={{ width: '100%' }}
            disabled={loading}
          >
            🚀 One-Click Demo Login
          </button>
        </div>

        <div className="auth-divider">
          <span>OR LOGIN WITH YOUR EMAIL</span>
        </div>

        {error && (
          <div className="auth-alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form className="auth-form mt-3" onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-flex">
              <label>Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <div className="input-icon-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg mt-3"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Account →'}
          </button>
        </form>

        <div className="auth-footer text-center mt-4">
          <p>Don't have an account yet? <Link to="/signup" className="signup-link">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}
