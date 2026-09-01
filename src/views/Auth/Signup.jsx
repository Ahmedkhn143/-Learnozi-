import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login('demo-mock-jwt-token-12345', {
        id: 'new_user_999',
        name: name,
        email: email,
        isOnboarded: true,
        academicProfile: { educationLevel: 'University' }
      });
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="auth-page-container">
      <div className="glow-ambient" style={{ top: '20%', right: '30%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />

      <div className="glass-card auth-card animate-fade-in">
        <div className="auth-header text-center">
          <Link to="/" className="auth-logo-brand">
            <span className="brand-icon">L</span>
          </Link>
          <h2>Create Account ✨</h2>
          <p>Join Learnozi to start studying smarter with AI</p>
        </div>

        {error && <div className="auth-alert-error">{error}</div>}

        <form className="auth-form mt-3" onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
              />
            </div>
          </div>

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
            <label>Password</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
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
            {password && (
              <div className="password-strength-bar mt-1">
                <div
                  className="strength-fill"
                  style={{
                    width: password.length >= 8 ? '100%' : password.length >= 6 ? '60%' : '30%',
                    background: password.length >= 8 ? '#10b981' : password.length >= 6 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg mt-3" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Get Started Free'}
          </button>
        </form>

        <div className="auth-footer text-center mt-4">
          <p>Already have an account? <Link to="/login" className="signup-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
