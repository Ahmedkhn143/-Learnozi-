import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AiExplainer.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUGGESTIONS_EN = [
  'Explain photosynthesis',
  "What is Newton's 2nd Law?",
  'How does DNA replication work?',
  'Simplify integration by parts',
];
const SUGGESTIONS_UR = [
  'فوٹوسنتھیسس کیا ہے؟',
  'نیوٹن کا دوسرا قانون بتاو',
  'DNA replication Urdu mein samjhao',
  'Osmosis kya hota hai?',
];

export default function AiExplainer() {
  const [topic, setTopic]       = useState('');
  const [level, setLevel]       = useState('intermediate');
  const [language, setLanguage] = useState('english');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const resultRef = useRef(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [result]);

  const fetchExplanation = async (text) => {
    const query = (text || topic).trim();
    if (!query) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/api/ai/explain`,
        { topic: query, level, language },
        { headers: token ? { Authorization: `Bearer ${token}` } : {}, timeout: 30000 }
      );
      if (!data.explanation) throw new Error('Empty response from AI');
      setResult({ explanation: data.explanation, example: data.example || '', summary: data.summary || '' });
    } catch (err) {
      if (err.response)          setError(err.response.data?.error || `Server error (${err.response.status})`);
      else if (err.code === 'ECONNABORTED') setError('Request timed out. Please try again.');
      else if (err.request)      setError('Cannot reach the server. Is the backend running?');
      else                       setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); fetchExplanation(); };
  const handleReset  = () => { setTopic(''); setResult(null); setError(''); };

  const suggestions = language === 'urdu' ? SUGGESTIONS_UR : SUGGESTIONS_EN;
  const isUrdu = language === 'urdu';

  return (
    <div className="ai-explainer">
      {/* Header */}
      <div className="ai-top">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>AI Concept Explainer</h1>
          <p>{isUrdu ? 'Koi bhi topic likho — Urdu mein samjhaunga' : 'Ask anything — explained simply.'}</p>
        </div>
        <div className="ai-top-right">

          {/* Language Toggle */}
          <div className="ai-lang-toggle">
            <button
              className={`ai-lang-btn${!isUrdu ? ' active' : ''}`}
              onClick={() => setLanguage('english')}
            >
              EN
            </button>
            <button
              className={`ai-lang-btn${isUrdu ? ' active' : ''}`}
              onClick={() => setLanguage('urdu')}
            >
              اردو
            </button>
          </div>

          <select
            className="ai-level-select"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {result && (
            <button className="btn btn-secondary" onClick={handleReset}>New Topic</button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="ai-chat">
        {!result && !loading && !error ? (
          <div className="ai-empty">
            <div className="ai-empty-icon">🧠</div>
            <h3>{isUrdu ? 'Kya seekhna chahte ho?' : 'What would you like to learn?'}</h3>
            <p>{isUrdu ? 'Neeche topic likho — AI Urdu mein samjhayega' : 'Type a concept or question below.'}</p>
            <div className="ai-suggestions">
              {suggestions.map((s) => (
                <button
                  key={s} className="ai-chip"
                  onClick={() => { setTopic(s); fetchExplanation(s); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="ai-loading">
                <div className="ai-spinner" />
                <p>{isUrdu ? 'AI soch raha hai…' : 'Thinking…'}</p>
              </div>
            )}
            {error && (
              <div className="ai-error">
                <span className="ai-error-icon">⚠️</span>
                <p>{error}</p>
                <button className="btn btn-secondary" onClick={() => fetchExplanation()}>Retry</button>
              </div>
            )}
            {result && (
              <div className="ai-result" ref={resultRef}>
                <div className="ai-card ai-card-explanation">
                  <h3>📖 {isUrdu ? 'Wazahat' : 'Explanation'}</h3>
                  <p>{result.explanation}</p>
                </div>
                {result.example && (
                  <div className="ai-card ai-card-example">
                    <h3>💡 {isUrdu ? 'Misaal' : 'Example'}</h3>
                    <p>{result.example}</p>
                  </div>
                )}
                {result.summary && (
                  <div className="ai-card ai-card-summary">
                    <h3>📝 {isUrdu ? 'Khulasa' : 'Quick Summary'}</h3>
                    <p>{result.summary}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Input bar */}
      <form className="ai-input-bar" onSubmit={handleSubmit}>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={isUrdu ? 'Topic likho — e.g. Photosynthesis Urdu mein…' : 'e.g. Explain photosynthesis in simple terms…'}
          disabled={loading}
          dir={isUrdu ? 'auto' : 'ltr'}
        />
        <button type="submit" className="ai-send-btn" disabled={!topic.trim() || loading}>
          {loading ? 'Sending…' : 'Send ↗'}
        </button>
      </form>
    </div>
  );
}
