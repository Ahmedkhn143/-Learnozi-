import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Community.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function Community() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  
  const [publicSets, setPublicSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');

  useEffect(() => {
    fetchLibrary();
  }, [search, universityFilter]);

  const fetchLibrary = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (universityFilter) params.append('university', universityFilter);

      const { data } = await axios.get(`${API}/api/flashcards/public/library?${params.toString()}`, { headers: authHeaders() });
      setPublicSets(data.sets);
    } catch (err) {
      error('Failed to fetch community library');
    } finally {
      setLoading(false);
    }
  };

  const cloneSet = async (id, title) => {
    try {
      info(`Cloning "${title}" to your account...`);
      await axios.post(`${API}/api/flashcards/${id}/clone`, {}, { headers: authHeaders() });
      success(`Successfully cloned! You can find it in your Flashcards space.`);
    } catch (err) {
      error(err.response?.data?.error || 'Failed to clone set');
    }
  };

  return (
    <div className="community-page">
      <div className="community-hero card">
        <h1>Community Library 🌍</h1>
        <p>Find, clone, and share flashcards with university students across Pakistan.</p>
        
        <div className="community-filters">
          <input 
            type="text" 
            placeholder="Search topics (e.g. Newton's laws)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <input 
            type="text" 
            placeholder="Filter by University (e.g. NUST, FAST)..." 
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
            className="uni-input"
          />
        </div>
      </div>

      <div className="library-grid">
        {loading ? (
          <div className="text-center p-xl">Loading library...</div>
        ) : publicSets.length === 0 ? (
          <div className="empty-state card">
            <h2>No public sets found.</h2>
            <p>Be the first to share a set in this category!</p>
          </div>
        ) : (
          publicSets.map(set => (
            <div key={set._id} className="library-card card">
              <div className="lib-card-header">
                <h3>{set.title}</h3>
                {set.isAIGenerated && <span className="ai-badge">🤖 AI Generated</span>}
              </div>
              <div className="lib-card-meta">
                <span>📚 {set.subject}</span>
                <span>🃏 {set.cards.length} cards</span>
              </div>
              <div className="lib-card-author">
                <span className="author-name">👤 {set.user?.name || 'Anonymous Learner'}</span>
                {set.university && <span className="uni-badge">🏫 {set.university}</span>}
              </div>
              <button 
                className="btn btn-primary clone-btn" 
                onClick={() => cloneSet(set._id, set.title)}
                disabled={set.user?._id === user._id}
              >
                {set.user?._id === user._id ? 'Your Set' : '📥 Clone to My Account'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
