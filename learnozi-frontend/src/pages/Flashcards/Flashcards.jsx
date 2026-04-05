import { useState, useEffect } from 'react';
import axios from 'axios';
import './Flashcards.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Flip Card Component ──────────────────────────────────
function FlipCard({ card, flipped, onFlip }) {
  return (
    <div className="fc-card-scene" onClick={onFlip}>
      <div className={`fc-card${flipped ? ' flipped' : ''}`}>
        <div className="fc-card-face fc-card-front">
          <div className="fc-card-label">Question</div>
          <div className="fc-card-text">{card.question}</div>
          <div className="fc-flip-hint">Click to reveal answer</div>
        </div>
        <div className="fc-card-face fc-card-back">
          <div className="fc-card-label">Answer</div>
          <div className="fc-card-text">{card.answer}</div>
        </div>
      </div>
    </div>
  );
}

// ── Review Mode ──────────────────────────────────────────
function ReviewMode({ set, onBack, onUpdateCard }) {
  const [index, setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats]   = useState({ known: 0, learning: 0 });
  const [done, setDone]     = useState(false);

  const cards = set.cards;
  const current = cards[index];
  const progress = Math.round((index / cards.length) * 100);

  const handleAnswer = async (status) => {
    await onUpdateCard(set._id, current._id, status);
    if (status === 'known') setStats((s) => ({ ...s, known: s.known + 1 }));
    else setStats((s) => ({ ...s, learning: s.learning + 1 }));

    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setFlipped(false);
      setTimeout(() => setIndex((i) => i + 1), 100);
    }
  };

  if (done) {
    return (
      <div className="fc-review">
        <div className="fc-done">
          <div className="fc-done-icon">🎉</div>
          <h2>Session Complete!</h2>
          <p>Tune aaj {cards.length} flashcards review ki.</p>
          <div className="fc-done-stats">
            <div className="fc-done-stat">
              <div className="fc-done-stat-num" style={{ color: '#16a34a' }}>{stats.known}</div>
              <div className="fc-done-stat-label">Yaad tha</div>
            </div>
            <div className="fc-done-stat">
              <div className="fc-done-stat-num" style={{ color: '#dc2626' }}>{stats.learning}</div>
              <div className="fc-done-stat-label">Practice chahiye</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={onBack}>Back to Sets</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fc-review">
      <div className="fc-review-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <h2>{set.title}</h2>
        <span className="fc-review-progress">{index + 1} / {cards.length}</span>
      </div>

      <div className="fc-review-bar">
        <div className="fc-review-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <FlipCard card={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      {flipped && (
        <div className="fc-review-actions">
          <button className="btn-forgot" onClick={() => handleAnswer('learning')}>
            ✗ Nahi yaad tha
          </button>
          <button className="btn-knew" onClick={() => handleAnswer('known')}>
            ✓ Yaad tha!
          </button>
        </div>
      )}

      {!flipped && (
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Card click karo answer dekhne ke liye
        </p>
      )}
    </div>
  );
}

// ── Main Flashcards Page ─────────────────────────────────
export default function Flashcards() {
  const [sets, setSets]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]         = useState('');
  const [reviewSet, setReviewSet] = useState(null);

  // Generate form state
  const [topic, setTopic]       = useState('');
  const [subject, setSubject]   = useState('General');
  const [count, setCount]       = useState(10);
  const [language, setLanguage] = useState('english');

  // Load sets
  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/flashcards`, { headers: authHeaders() });
      setSets(data.sets || []);
    } catch {
      setError('Sets load nahi ho sake. Server chal raha hai?');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${API}/api/flashcards/generate`,
        { topic: topic.trim(), subject, count, language },
        { headers: authHeaders() }
      );
      setSets((prev) => [
        {
          id: data.set._id,
          title: data.set.title,
          subject: data.set.subject,
          cardCount: data.set.cards.length,
          progress: 0,
          isAIGenerated: true,
        },
        ...prev,
      ]);
      setTopic('');
    } catch (err) {
      setError(err.response?.data?.error || 'Flashcards generate nahi ho sake. Dobara try karo.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Yeh flashcard set delete karna chahte ho?')) return;
    try {
      await axios.delete(`${API}/api/flashcards/${id}`, { headers: authHeaders() });
      setSets((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError('Delete nahi ho saka.');
    }
  };

  const handleStartReview = async (setId) => {
    try {
      const { data } = await axios.get(`${API}/api/flashcards/${setId}`, { headers: authHeaders() });
      setReviewSet(data.set);
    } catch {
      setError('Set load nahi hua.');
    }
  };

  const handleUpdateCard = async (setId, cardId, status) => {
    try {
      await axios.patch(
        `${API}/api/flashcards/${setId}/cards/${cardId}`,
        { status },
        { headers: authHeaders() }
      );
    } catch {
      // silent fail — review continue karta hai
    }
  };

  const handleBackFromReview = () => {
    setReviewSet(null);
    loadSets(); // progress refresh
  };

  // Review mode
  if (reviewSet) {
    return (
      <ReviewMode
        set={reviewSet}
        onBack={handleBackFromReview}
        onUpdateCard={handleUpdateCard}
      />
    );
  }

  return (
    <div className="flashcards">
      {/* Header */}
      <div className="fc-top">
        <div>
          <h1>🃏 Flashcards</h1>
          <p>Topic likho — AI automatically flashcards bana dega</p>
        </div>
      </div>

      {/* Error */}
      {error && <div className="fc-error">{error}</div>}

      {/* Generate Box */}
      <div className="fc-generate-box">
        <h2>✨ AI se Flashcards Banao</h2>
        <form onSubmit={handleGenerate}>
          <div className="fc-gen-row">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic likho — e.g. Newton's Laws of Motion"
              disabled={generating}
              required
            />
            <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={generating}>
              <option>General</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>Mathematics</option>
              <option>English</option>
              <option>Urdu</option>
              <option>Pakistan Studies</option>
              <option>Islamiat</option>
              <option>Computer Science</option>
            </select>
          </div>
          <div className="fc-gen-options">
            <select value={count} onChange={(e) => setCount(e.target.value)} disabled={generating}>
              <option value={5}>5 cards</option>
              <option value={10}>10 cards</option>
              <option value={15}>15 cards</option>
              <option value={20}>20 cards</option>
            </select>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={generating}>
              <option value="english">English</option>
              <option value="urdu">Urdu</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={generating || !topic.trim()}>
              {generating ? 'Generating...' : '✨ Generate'}
            </button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {generating && (
        <div className="fc-loading">
          <div className="spinner" />
          <p>AI flashcards bana raha hai — thoda wait karo...</p>
        </div>
      )}

      {/* Sets */}
      <div className="fc-sets-title">Teri Flashcard Sets ({sets.length})</div>

      {loading ? (
        <div className="fc-loading"><div className="spinner" /></div>
      ) : sets.length === 0 ? (
        <div className="fc-empty">
          <div className="fc-empty-icon">🃏</div>
          <h3>Abhi koi flashcard set nahi hai</h3>
          <p>Upar topic likho — AI automatically set bana dega</p>
        </div>
      ) : (
        <div className="fc-sets-grid">
          {sets.map((s) => (
            <div key={s.id} className="fc-set-card" onClick={() => handleStartReview(s.id)}>
              <button className="fc-set-delete" onClick={(e) => handleDelete(e, s.id)} title="Delete">✕</button>
              <div className="fc-set-card-top">
                <div className="fc-set-card-title">{s.title}</div>
                <span className="fc-set-card-subject">{s.subject}</span>
              </div>
              <div className="fc-set-card-meta">{s.cardCount} cards</div>
              {s.isAIGenerated && <div className="fc-ai-badge">✨ AI Generated</div>}
              <div className="fc-set-progress">
                <div className="fc-progress-bar">
                  <div className="fc-progress-fill" style={{ width: `${s.progress || 0}%` }} />
                </div>
                <div className="fc-progress-label">{s.progress || 0}% complete</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
