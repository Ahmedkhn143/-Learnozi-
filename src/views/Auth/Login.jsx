import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    // Standard mock login or backend login attempt
    setTimeout(() => {
      login('demo-mock-jwt-token-12345', {
        id: 'user_123',
        name: email.split('@')[0] || 'Student',
        email: email,
        isOnboarded: true,
        academicProfile: { educationLevel: 'University' }
      });
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    login('demo-mock-jwt-token-12345', {
      id: 'demo_user_123',
      name: 'Demo Student',
      email: 'demo@learnozi.com',
      isOnboarded: true,
      academicProfile: { educationLevel: 'University', university: 'NUST' }
    });
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 300);
  };

  return (
    <div className="auth-page-container">
      <div className="glow-ambient" style={{ top: '20%', left: '30%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

      <div className="glass-card auth-card animate-fade-in">
        <div className="auth-header text-center">
          <Link to="/" className="auth-logo-brand">
            <span className="brand-icon">L</span>
          </Link>
          <h2>Welcome Back 👋</h2>
          <p>Sign in to your Learnozi AI workspace</p>
        </div>

        {/* Demo Quick Login Highlight Box */}
        <div className="demo-login-box">
          <div className="demo-box-header">
            <span>⚡ Instant Demo Access</span>
          </div>
          <p>Want to explore without creating an account?</p>
          <button type="button" className="btn btn-accent btn-sm" onClick={handleDemoLogin} style={{ width: '100%', marginTop: '0.5rem' }}>
            🚀 One-Click Demo Login
          </button>
        </div>

        <div className="auth-divider">
          <span>OR SIGN IN WITH EMAIL</span>
        </div>

        {error && <div className="auth-alert-error">{error}</div>}

        <form className="auth-form mt-3" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
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
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg mt-2" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer text-center mt-4">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}
