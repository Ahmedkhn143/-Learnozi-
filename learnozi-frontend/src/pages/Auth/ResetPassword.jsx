import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!password) e.password = 'Password daalna zaroori hai';
    else if (password.length < 6) e.password = 'Password kam az kam 6 characters ka hona chahiye';
    if (!confirm) e.confirm = 'Confirm password daalna zaroori hai';
    else if (password !== confirm) e.confirm = 'Passwords match nahi ho rahe';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
      setSuccess(true);
      // Auto-login
      if (data.token && data.user) {
        login(data.token, data.user);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setServerError(err.response?.data?.error || 'Reset failed. Link expired ho sakta hai.');
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
          <div className="verify-icon success">✓</div>
          <h2>Password Reset! 🎉</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            Tumhara password change ho gaya. Dashboard pe redirect ho rahe ho...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">L</Link>
          <h2>New Password Set Karo</h2>
          <p>Apna naya password choose karo</p>
        </div>

        {serverError && <div className="auth-error">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })); }}
              placeholder="••••••••"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((prev) => ({ ...prev, confirm: '' })); }}
              placeholder="••••••••"
              className={errors.confirm ? 'input-error' : ''}
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
