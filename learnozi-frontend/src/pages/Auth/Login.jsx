import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim())           e.email    = 'Email daalna zaroori hai';
    else if (!validateEmail(email)) e.email = 'Email sahi format mein nahi hai';
    if (!password)               e.password = 'Password daalna zaroori hai';
    else if (password.length < 6) e.password = 'Password kam az kam 6 characters ka hona chahiye';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setNeedsVerification(false);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.needsVerification) {
        setNeedsVerification(true);
      }
      setServerError(errData?.error || 'Login nahi hua. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`, { email });
      setServerError('');
      setNeedsVerification(false);
      alert('Verification email bhej diya! Apna inbox check karo.');
    } catch {
      // silently fail
    }
  };

  const field = (name) => ({
    onChange: () => errors[name] && setErrors((e) => ({ ...e, [name]: '' })),
  });

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">L</Link>
          <h2>Wapas aao!</h2>
          <p>Apne Learnozi account mein sign in karo</p>
        </div>

        {serverError && <div className="auth-error">{serverError}</div>}
        {needsVerification && (
          <button className="btn btn-ghost" style={{ width: '100%', marginBottom: '0.75rem' }} onClick={handleResend}>
            Resend verification email
          </button>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); field('email').onChange(); }}
              placeholder="you@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); field('password').onChange(); }}
              placeholder="••••••••"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password">Password bhool gaye?</Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sign in ho raha hai…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Account nahi hai? <Link to="/signup">Sign up karo</Link>
        </div>
      </div>
    </div>
  );
}

