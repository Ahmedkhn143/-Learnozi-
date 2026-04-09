import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './DocumentChat.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function DocumentChat() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAnswering]);

  const fetchDocuments = async () => {
    try {
      const { data } = await axios.get(`${API}/api/documents`, { headers: authHeaders() });
      setDocuments(data.documents);
      if (data.documents.length > 0 && !activeDoc) {
        selectDocument(data.documents[0]);
      }
    } catch (err) {
      error('Failed to load documents');
    }
  };

  const selectDocument = (doc) => {
    setActiveDoc(doc);
    setChatHistory([
      { role: 'ai', content: `Hi! I have analyzed "${doc.title}". Ask me anything about this document.` }
    ]);
  };

  const handleDelete = async (e, docId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await axios.delete(`${API}/api/documents/${docId}`, { headers: authHeaders() });
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      if (activeDoc && activeDoc._id === docId) {
        setActiveDoc(null);
        setChatHistory([]);
      }
      success('Document deleted');
    } catch (err) {
      error('Failed to delete document');
    }
  };

  /* ── Drag & Drop Handlers ── */
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      return error('Only PDF files are supported.');
    }
    if (file.size > 15 * 1024 * 1024) {
      return error('File exceeds 15MB limit.');
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', file.name.replace('.pdf', ''));

    setIsUploading(true);
    info('Analyzing PDF... This might take a moment.');
    
    try {
      const { data } = await axios.post(`${API}/api/documents/upload`, formData, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      success('Document analyzed successfully!');
      setDocuments([data.document, ...documents]);
      selectDocument(data.document);
    } catch (err) {
      error(err.response?.data?.error || 'Failed to analyze PDF. Is it image-based?');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ── Chat Handlers ── */
  const handleAsk = async (e) => {
    e.preventDefault();
    const txt = question.trim();
    if (!txt || !activeDoc || isAnswering) return;

    setQuestion('');
    const newMsg = { role: 'user', content: txt };
    // Maintain max 10 message history for context limits
    const currentHistory = [...chatHistory, newMsg].slice(-10);
    setChatHistory(currentHistory);
    setIsAnswering(true);

    try {
      const { data } = await axios.post(
        `${API}/api/documents/${activeDoc._id}/chat`,
        { 
          question: txt,
          // Only send actual past history excluding the very first greeting
          history: currentHistory.slice(1, -1).map(m => ({ role: m.role, content: m.content }))
        },
        { headers: authHeaders() }
      );
      setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev, 
        { role: 'ai', content: '🔴 ' + (err.response?.data?.error || 'Failed to get answer. Try again.') }
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="doc-chat-page">
      <div className="page-header">
        <h1>AI PDF Analyzer 📄</h1>
        <p>Chat with your lecture slides and past papers. 100% accurate, no hallucinations.</p>
      </div>

      <div className="doc-chat-layout">
        {/* Left Sidebar: Sidebar & Upload */}
        <div className="doc-sidebar card">
          <div 
            className={`doc-upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden-file-input" 
              ref={fileInputRef} 
              onChange={onFileSelect}
            />
            {isUploading ? (
              <div className="upload-spinner" />
            ) : (
              <span className="upload-icon">📤</span>
            )}
            <p>{isUploading ? 'Analyzing Document...' : 'Drag & Drop PDF or Click to Upload'}</p>
            <span className="upload-hint">Max 15MB</span>
          </div>

          <div className="doc-list">
            <h3>Your Documents</h3>
            {documents.length === 0 ? (
              <div className="doc-empty">No documents yet. Upload one!</div>
            ) : (
              documents.map((doc) => (
                <div 
                  key={doc._id} 
                  className={`doc-item ${activeDoc?._id === doc._id ? 'active' : ''}`}
                  onClick={() => selectDocument(doc)}
                >
                  <div className="doc-item-title">📄 {doc.title}</div>
                  <button 
                    className="doc-item-del" 
                    onClick={(e) => handleDelete(e, doc._id)}
                    title="Delete document"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Section: Chat Area */}
        <div className="doc-chat-area card">
          {!activeDoc ? (
            <div className="doc-chat-placeholder">
              <span className="placeholder-emoji">👈</span>
              <h2>Select or Upload a PDF</h2>
              <p>Upload a document to start a hallucination-free AI chat.</p>
            </div>
          ) : (
            <>
              <div className="doc-chat-header">
                <strong>Chatting with:</strong> {activeDoc.title}
                <span className="doc-badge">Locked Context ✔️</span>
              </div>

              <div className="doc-messages">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`msg-wrapper ${msg.role}`}>
                    {msg.role === 'ai' && <div className="msg-avatar ai">🤖</div>}
                    <div className={`msg-bubble ${msg.role}`}>
                      {msg.content}
                    </div>
                    {msg.role === 'user' && <div className="msg-avatar user">👤</div>}
                  </div>
                ))}
                {isAnswering && (
                  <div className="msg-wrapper ai">
                    <div className="msg-avatar ai">🤖</div>
                    <div className="msg-bubble ai typing">
                      <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form className="doc-input-box" onSubmit={handleAsk}>
                <input
                  type="text"
                  placeholder={`Ask a question about "${activeDoc.title}"...`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isAnswering}
                />
                <button type="submit" className="btn btn-primary" disabled={!question.trim() || isAnswering}>
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
