import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Signup() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!name.trim())            e.name     = 'Naam daalna zaroori hai';
    else if (name.trim().length < 2) e.name = 'Naam kam az kam 2 characters ka hona chahiye';
    if (!email.trim())           e.email    = 'Email daalna zaroori hai';
    else if (!validateEmail(email)) e.email = 'Email sahi format mein nahi hai';
    if (!password)               e.password = 'Password daalna zaroori hai';
    else if (password.length < 6) e.password = 'Password kam az kam 6 characters ka hona chahiye';
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
      const { data } = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Signup nahi hua. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (field) => errors[field] && setErrors((e) => ({ ...e, [field]: '' }));

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">L</Link>
          <h2>Account banao</h2>
          <p>AI ke saath smarter study shuru karo</p>
        </div>

        {serverError && <div className="auth-error">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Poora Naam</label>
            <input
              type="text" value={name}
              onChange={(e) => { setName(e.target.value); clearErr('name'); }}
              placeholder="Tera naam"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email" value={email}
              onChange={(e) => { setEmail(e.target.value); clearErr('email'); }}
              placeholder="you@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password" value={password}
              onChange={(e) => { setPassword(e.target.value); clearErr('password'); }}
              placeholder="Kam az kam 6 characters"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
            {password && password.length >= 6 && (
              <span className="field-success">✓ Password theek hai</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Account ban raha hai…' : 'Account Banao — Free'}
          </button>
        </form>

        <div className="auth-footer">
          Pehle se account hai? <Link to="/login">Sign in karo</Link>
        </div>
      </div>
    </div>
  );
}
