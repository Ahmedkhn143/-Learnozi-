import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: '', percent: '0%', color: 'transparent' };
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: 'Strong Password 💪', percent: '100%', color: '#10b981' };
    }
    if (password.length >= 6) {
      return { label: 'Good Password 👍', percent: '65%', color: '#f59e0b' };
    }
    return { label: 'Weak (Min 6 chars)', percent: '30%', color: '#ef4444' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page-container">
      {/* Background Ambient Glows */}
      <div className="glow-ambient glow-cyan" style={{ top: '15%', right: '25%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)' }} />
      <div className="glow-ambient glow-purple" style={{ bottom: '15%', left: '25%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

      <div className="glass-card auth-card animate-fade-in">
        <div className="auth-header text-center">
          <Link to="/" className="auth-logo-brand" title="Go to Home">
            <span className="brand-icon">L</span>
          </Link>
          <h2>Create Free Account ✨</h2>
          <p>Join Learnozi to start studying 10x faster with AI</p>
        </div>

        {error && (
          <div className="auth-alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form className="auth-form mt-3" onSubmit={handleSignup} noValidate>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="e.g. Ayesha Khan"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                required
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
                required
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

            {password && (
              <div className="password-strength-wrapper mt-2">
                <div className="strength-bar-bg">
                  <div className="strength-bar-fill" style={{ width: strength.percent, background: strength.color }} />
                </div>
                <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg mt-3"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Get Started Free →'}
          </button>
        </form>

        <div className="auth-footer text-center mt-4">
          <p>Already have an account? <Link to="/login" className="signup-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
