import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Demo Student');
  const [email, setEmail] = useState(user?.email || 'student@learnozi.app');
  const [educationLevel, setEducationLevel] = useState('University');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="profile-view animate-fade-in">
      <div className="profile-header">
        <div>
          <h2>👤 Account Settings & Profile</h2>
          <p>Manage your account preferences, academic goals, and notification settings.</p>
        </div>
      </div>

      <div className="grid-3 mt-4">
        {/* User Card */}
        <div className="glass-card user-summary-card">
          <div className="user-avatar-large">
            {name ? name[0].toUpperCase() : 'U'}
          </div>
          <h3 className="mt-3">{name}</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>{email}</p>
          <span className="badge badge-primary mt-2">Learnozi PRO Student</span>

          <div className="user-quick-stats mt-4">
            <div className="stat-box">
              <span className="num">14.5</span>
              <span className="lbl">Focus Hrs</span>
            </div>
            <div className="stat-box">
              <span className="num">42</span>
              <span className="lbl">Flashcards</span>
            </div>
            <div className="stat-box">
              <span className="num">6</span>
              <span className="lbl">Streak</span>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="glass-card profile-form-panel" style={{ gridColumn: 'span 2' }}>
          <h3>Edit Profile Information</h3>
          {savedMsg && <div className="badge badge-success mb-3">✓ Profile settings saved successfully!</div>}

          <form onSubmit={handleSave} className="mt-3">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Education Level</label>
              <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
                <option value="High School">High School</option>
                <option value="University">University Major</option>
                <option value="Post-Graduate">Post-Graduate / Masters</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
