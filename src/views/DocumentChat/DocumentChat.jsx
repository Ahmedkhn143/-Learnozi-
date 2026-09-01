import { useState } from 'react';
import './DocumentChat.css';

export default function DocumentChat() {
  const [activeDoc, setActiveDoc] = useState({
    name: 'Organic_Chemistry_Ch4_Slides.pdf',
    pages: 45,
    size: '4.2 MB'
  });

  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: 'PDF Document loaded! Ask me anything about Organic_Chemistry_Ch4_Slides.pdf or request a summary.', citations: 'Page 1 - 45' }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskDoc = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setChatHistory((prev) => [...prev, userMsg]);
    const userQ = query;
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      const aiMsg = {
        sender: 'ai',
        text: `According to ${activeDoc.name}, "${userQ}" is explained as a nucleophilic addition reaction where the electron pair attacks the carbonyl carbon atom.`,
        citations: 'Referenced from Slide 18 & Slide 24'
      };
      setChatHistory((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="document-chat-view animate-fade-in">
      <div className="doc-header">
        <div>
          <h2>📄 Document & PDF AI Chat</h2>
          <p>Upload lecture slides, research PDFs, or notes and chat directly with your files.</p>
        </div>
      </div>

      <div className="grid-2 mt-4">
        {/* Document Uploader & Info Panel */}
        <div className="glass-card doc-sidebar-panel">
          <h3>📂 Uploaded Documents</h3>
          
          <div className="dropzone-box mt-3 text-center">
            <span className="upload-icon">📥</span>
            <h4>Drag & Drop PDF Slides Here</h4>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>Supports PDF, DOCX, TXT (Max 50MB)</p>
            <button className="btn btn-secondary btn-sm mt-2">Browse Files</button>
          </div>

          <div className="doc-list-box mt-4">
            <span className="list-title">ACTIVE DOCUMENT</span>
            <div className="glass-card doc-item-card active-doc">
              <span className="doc-icon">📄</span>
              <div className="doc-info">
                <span className="doc-name">{activeDoc.name}</span>
                <span className="doc-meta">{activeDoc.pages} Pages • {activeDoc.size}</span>
              </div>
              <span className="badge badge-success">Parsed</span>
            </div>
          </div>
        </div>

        {/* Document Chat Workspace */}
        <div className="glass-card doc-chat-panel">
          <div className="doc-chat-header">
            <span>💬 Chat with <strong>{activeDoc.name}</strong></span>
          </div>

          <div className="doc-chat-body">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`doc-bubble-wrap ${msg.sender}`}>
                <div className="bubble-text">{msg.text}</div>
                {msg.citations && <span className="citation-badge">📌 {msg.citations}</span>}
              </div>
            ))}
            {loading && <div className="doc-bubble-wrap ai"><div className="bubble-text">Searching document slides... 🔍</div></div>}
          </div>

          <form className="doc-input-bar mt-3" onSubmit={handleAskDoc}>
            <input
              type="text"
              placeholder="Ask a question about this document..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-accent" disabled={loading || !query.trim()}>
              Ask PDF 📄
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
