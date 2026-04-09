import { useState } from 'react';
import axios from 'axios';
import './Notes.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function Notes() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    setError('');
    setResult(null);

    if (text.trim().length < 50) {
      setError('Text kam az kam 50 characters ka hona chahiye');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API}/api/ai/summarize`,
        { text: text.trim(), language },
        { headers: authHeaders() }
      );
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Summarize nahi ho saka. Dobara try karo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const lines = [
      '📝 Summary:',
      result.oneLineSummary,
      '',
      '📌 Key Points:',
      ...result.bullets.map((b, i) => `${i + 1}. ${b}`),
      '',
      '🔑 Key Terms:',
      ...result.keyTerms.map((k) => `• ${k.term}: ${k.definition}`),
    ].join('\n');
    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="notes-page">
      <div className="page-header">
        <h1>Notes Summarizer 📝</h1>
        <p>Lamba chapter text paste karo — AI summary de dega</p>
      </div>

      <div className="notes-input-section card">
        <div className="notes-toolbar">
          <div className="notes-char-count">
            {text.length} characters
            {text.length < 50 && text.length > 0 && (
              <span className="notes-min-hint"> (min 50 needed)</span>
            )}
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="notes-lang-select"
          >
            <option value="english">English</option>
            <option value="urdu">Urdu</option>
          </select>
        </div>

        <textarea
          className="notes-textarea"
          placeholder="Apne chapter ka text yahan paste karo... (kam az kam 50 characters)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
        />

        {error && <div className="notes-error">{error}</div>}

        <button
          className="btn btn-primary notes-btn"
          onClick={handleSummarize}
          disabled={loading || text.trim().length < 50}
        >
          {loading ? (
            <>
              <span className="notes-spinner" />
              Summarizing...
            </>
          ) : (
            '✨ Summarize Now'
          )}
        </button>
      </div>

      {result && (
        <div className="notes-result card">
          <div className="notes-result-header">
            <h2>Summary</h2>
            <button className="btn btn-ghost" onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy All'}
            </button>
          </div>

          {result.oneLineSummary && (
            <div className="notes-one-liner">
              <strong>💡 TL;DR:</strong> {result.oneLineSummary}
            </div>
          )}

          <div className="notes-bullets">
            <h3>📌 Key Points</h3>
            <ul>
              {result.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          {result.keyTerms.length > 0 && (
            <div className="notes-terms">
              <h3>🔑 Key Terms</h3>
              <div className="notes-terms-grid">
                {result.keyTerms.map((k, i) => (
                  <div key={i} className="notes-term-item">
                    <strong>{k.term}</strong>
                    <span>{k.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
