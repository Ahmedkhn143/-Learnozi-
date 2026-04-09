import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/verify/${token}`);
      setStatus('success');
      setMessage(data.message);
      // Auto-login
      if (data.token && data.user) {
        login(data.token, data.user);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">L</Link>
        </div>

        {status === 'verifying' && (
          <>
            <div className="verify-spinner" />
            <h2>Verifying your email...</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Please wait a moment
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-icon success">✓</div>
            <h2>Email Verified! 🎉</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              {message}
            </p>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', fontSize: '0.875rem' }}>
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-icon error">✕</div>
            <h2>Verification Failed</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              {message}
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Go to Login
              </Link>
              <Link to="/signup" className="btn btn-secondary" style={{ width: '100%' }}>
                Sign Up Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
