import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AiExplainer.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUGGESTIONS = [
  'Explain photosynthesis',
  'What is Newton\'s 2nd Law?',
  'How does DNA replication work?',
  'Simplify integration by parts',
];

export default function AiExplainer() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [result, setResult] = useState(null);   // { explanation, example, summary }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef(null);

  // Auto-scroll to result when it appears
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [result]);

  const fetchExplanation = async (text) => {
    const query = (text || topic).trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        `${API_URL}/api/ai/explain`,
        { topic: query, level },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 30000,
        }
      );

      if (!data.explanation) {
        throw new Error('Received an empty response from AI');
      }

      setResult({
        explanation: data.explanation,
        example: data.example || '',
        summary: data.summary || '',
      });
    } catch (err) {
      if (err.response) {
        // Server responded with an error status
        const msg = err.response.data?.error || `Server error (${err.response.status})`;
        setError(msg);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (err.request) {
        setError('Cannot reach the server. Is the backend running?');
      } else {
        setError(err.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchExplanation();
  };

  const handleReset = () => {
    setTopic('');
    setResult(null);
    setError('');
  };

  return (
    <div className="ai-explainer">
      {/* Header */}
      <div className="ai-top">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>AI Concept Explainer</h1>
          <p>Ask anything — I'll explain it simply.</p>
        </div>
        <div className="ai-top-right">
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
            <button className="btn btn-secondary" onClick={handleReset}>
              New Topic
            </button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="ai-chat">
        {!result && !loading && !error ? (
          /* ── Empty state ── */
          <div className="ai-empty">
            <div className="ai-empty-icon">🧠</div>
            <h3>What would you like to learn?</h3>
            <p>Type a concept or question below to get started.</p>
            <div className="ai-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="ai-chip"
                  onClick={() => { setTopic(s); fetchExplanation(s); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ── Loading state ── */}
            {loading && (
              <div className="ai-loading">
                <div className="ai-spinner" />
                <p>Thinking…</p>
              </div>
            )}

            {/* ── Error state ── */}
            {error && (
              <div className="ai-error">
                <span className="ai-error-icon">⚠️</span>
                <p>{error}</p>
                <button className="btn btn-secondary" onClick={() => fetchExplanation()}>
                  Retry
                </button>
              </div>
            )}

            {/* ── Result cards ── */}
            {result && (
              <div className="ai-result" ref={resultRef}>
                <div className="ai-card ai-card-explanation">
                  <h3>📖 Explanation</h3>
                  <p>{result.explanation}</p>
                </div>

                {result.example && (
                  <div className="ai-card ai-card-example">
                    <h3>💡 Example</h3>
                    <p>{result.example}</p>
                  </div>
                )}

                {result.summary && (
                  <div className="ai-card ai-card-summary">
                    <h3>📝 Quick Summary</h3>
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
          placeholder="e.g. Explain photosynthesis in simple terms…"
          disabled={loading}
        />
        <button
          type="submit"
          className="ai-send-btn"
          disabled={!topic.trim() || loading}
        >
          {loading ? 'Sending…' : 'Send ↗'}
        </button>
      </form>
    </div>
  );
}
