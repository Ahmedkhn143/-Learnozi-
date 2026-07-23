import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-header">
            <Link to="/" className="auth-logo">L</Link>
          </div>
          <div className="verify-icon success">✉</div>
          <h2>Check Your Email</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Agar is email ka account hai, toh tumhe password reset link mil jayega.
            Apna inbox check karo.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">L</Link>
          <h2>Forgot Password?</h2>
          <p>Apna email daalo, hum tumhe reset link bhejenge</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          Yaad aa gaya? <Link to="/login">Login karo</Link>
        </div>
      </div>
    </div>
  );
}
