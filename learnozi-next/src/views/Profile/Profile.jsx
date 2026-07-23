import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [studyHours, setStudyHours] = useState(4);
  const [subjects, setSubjects] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/api/auth/me`, { headers: authHeaders() });
      const u = data.user;
      setName(u.name || '');
      setEmail(u.email || '');
      setStudyHours(u.preferences?.studyHoursPerDay || 4);
      setSubjects(u.preferences?.subjects?.join(', ') || '');
    } catch {
      setMessage({ type: 'error', text: 'Profile load nahi ho saka' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const body = {
        name: name.trim(),
        preferences: {
          studyHoursPerDay: parseInt(studyHours) || 4,
          subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
        },
      };

      if (newPassword) {
        body.oldPassword = oldPassword;
        body.newPassword = newPassword;
      }

      const { data } = await axios.put(`${API}/api/auth/profile`, body, { headers: authHeaders() });

      // Update auth context
      const token = localStorage.getItem('token');
      if (token && data.user) {
        login(token, data.user);
      }

      setMessage({ type: 'success', text: 'Profile update ho gaya! ✓' });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Update nahi hua, dobara try karo' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="page-header">
          <h1>Profile</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Apne account ki details aur preferences manage karo</p>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="card profile-section">
          <h3 className="section-heading">👤 Personal Info</h3>
          <div className="profile-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tera naam"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="input-disabled"
              />
              <span className="field-hint">Email change nahi ho sakta</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card profile-section">
          <h3 className="section-heading">🔒 Change Password</h3>
          <p className="section-hint">Chorna hai toh khali chhor do — password nahi badlega</p>
          <div className="profile-grid">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kam az kam 6 characters"
              />
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="card profile-section">
          <h3 className="section-heading">📚 Study Preferences</h3>
          <div className="profile-grid">
            <div className="form-group">
              <label>Daily Study Hours Goal</label>
              <input
                type="number"
                min="1"
                max="16"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
              />
              <span className="field-hint">{studyHours} ghante roz ka target</span>
            </div>
            <div className="form-group">
              <label>Preferred Subjects</label>
              <input
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="Physics, Chemistry, Biology"
              />
              <span className="field-hint">Comma se alag karo</span>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary profile-save" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
