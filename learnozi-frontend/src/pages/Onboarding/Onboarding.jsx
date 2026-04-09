import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Onboarding.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Onboarding() {
  const { user, login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    educationLevel: '',
    fieldOfStudy: '',
    currentYear: '',
    institution: ''
  });

  // If already onboarded, don't show this
  if (user?.isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  const levels = [
    { id: 'Matric', label: 'Matric (9th/10th)', icon: '🏫' },
    { id: 'Intermediate', label: 'College (11th/12th)', icon: '🏢' },
    { id: 'University', label: 'University (Degree)', icon: '🎓' },
    { id: 'TestPrep', label: 'Test Preparation (Nat/GAT)', icon: '📝' }
  ];

  const fieldOptions = {
    Matric: ['Science', 'Computer Science', 'Arts'],
    Intermediate: ['Pre-Medical', 'Pre-Engineering', 'ICS (Computer Science)', 'I.Com', 'F.A'],
    University: ['Computer Science (BSCS)', 'Software Engineering (BSSE)', 'Artificial Intelligence', 'Information Technology', 'MBBS / Medical', 'Business (BBA)', 'Arts / Humanities', 'Other Engineering'],
    TestPrep: ['MDCAT (Medical)', 'ECAT (Engineering)', 'NTS NAT', 'GAT', 'LAT', 'CSS']
  };

  const yearOptions = {
    Matric: ['9th Class', '10th Class'],
    Intermediate: ['1st Year (11th)', '2nd Year (12th)'],
    University: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8', 'Final Year (Medicine)'],
    TestPrep: ['Fresh Candidate', 'Repeater']
  };

  const handleSelectLevel = (level) => {
    setFormData({ ...formData, educationLevel: level, fieldOfStudy: '', currentYear: '' });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_URL}/api/auth/onboarding`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local user state
      login(token, data.user);
      success('Welcome to Learnozi! Aapki profile tayyar hai.');
      navigate('/dashboard');
    } catch (err) {
      error(err.response?.data?.error || 'Kuch masla hua. Dobara try karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container card">
        <div className="onboarding-header">
          <h1>Welcome to Learnozi! 🇵🇰</h1>
          <p>Hamari help karein taa'ke hum aapki study ko behtar bana sakein.</p>
          
          <div className="onboarding-progress">
            <div className={`progress-dot ${step >= 1 ? 'active' : ''}`} />
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`} />
            <div className={`progress-dot ${step >= 2 ? 'active' : ''}`} />
            <div className={`progress-line ${step >= 3 ? 'active' : ''}`} />
            <div className={`progress-dot ${step >= 3 ? 'active' : ''}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="onboarding-step step-1 animate-fade-in">
            <h2>Aap kya parh rahe hain?</h2>
            <div className="level-grid">
              {levels.map((level) => (
                <button 
                  key={level.id} 
                  className="level-card" 
                  onClick={() => handleSelectLevel(level.id)}
                >
                  <span className="level-icon">{level.icon}</span>
                  <span className="level-label">{level.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step step-2 animate-fade-in">
            <button className="back-btn" onClick={() => setStep(1)}>← Peechay</button>
            <h2>Baqi details batayein</h2>
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <div className="form-group">
                <label>Field of Study / Group</label>
                <select 
                  required 
                  value={formData.fieldOfStudy} 
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                >
                  <option value="">Chunyein...</option>
                  {fieldOptions[formData.educationLevel].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Current Year / Semester</label>
                <select 
                  required 
                  value={formData.currentYear} 
                  onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                >
                  <option value="">Chunyein...</option>
                  {yearOptions[formData.educationLevel].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block">Next →</button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step step-3 animate-fade-in">
            <button className="back-btn" onClick={() => setStep(2)}>← Peechay</button>
            <h2>Aakhri step!</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Institution Name (Optional)</label>
                <input 
                  type="text" 
                  placeholder="E.g. Punjab College, NUST, etc."
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>

              <div className="onboarding-summary">
                <p><strong>Education:</strong> {formData.educationLevel}</p>
                <p><strong>Field:</strong> {formData.fieldOfStudy}</p>
                <p><strong>Year:</strong> {formData.currentYear}</p>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Tyari ho rahi hai...' : 'Let\'s Start Studying! 🚀'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
