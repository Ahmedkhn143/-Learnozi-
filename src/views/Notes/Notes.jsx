import { useState } from 'react';
import './Notes.css';

export default function Notes() {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Organic Chemistry Reaction Mechanisms', tag: 'Chemistry', date: 'Sep 1', content: 'SN1 vs SN2 substitution summary, electrophiles, and nucleophiles...' },
    { id: 2, title: 'Calculus Integration Shortcuts', tag: 'Math', date: 'Aug 28', content: 'Integration by parts formula: ∫u dv = uv - ∫v du...' },
    { id: 3, title: 'Data Structures Graph Algorithms', tag: 'Computer Science', date: 'Aug 25', content: 'Dijkstra shortest path algorithm, BFS vs DFS comparison...' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState(notes[0]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newN = {
      id: Date.now(),
      title: newTitle,
      tag: 'General',
      date: 'Today',
      content: newContent || 'No content added yet...'
    };

    setNotes([newN, ...notes]);
    setActiveNote(newN);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="notes-view animate-fade-in">
      <div className="notes-header">
        <div>
          <h2>📝 AI Smart Study Notes</h2>
          <p>Create, organize, and auto-summarize your lecture notes.</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={() => setShowAddModal(true)}>
          + Create Note
        </button>
      </div>

      <div className="grid-3 mt-4">
        {/* Notes List Sidebar */}
        <div className="glass-card notes-sidebar-panel">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          <div className="notes-list">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`glass-card note-list-item ${activeNote.id === note.id ? 'active' : ''}`}
                onClick={() => setActiveNote(note)}
              >
                <span className="badge badge-primary mb-1">{note.tag}</span>
                <h4 className="note-item-title">{note.title}</h4>
                <span className="note-date">{note.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note Reader / Editor Workspace */}
        <div className="glass-card note-editor-panel" style={{ gridColumn: 'span 2' }}>
          {activeNote ? (
            <div>
              <div className="editor-header">
                <div>
                  <span className="badge badge-cyan">{activeNote.tag}</span>
                  <h3 className="mt-2">{activeNote.title}</h3>
                  <span className="note-date">Last edited: {activeNote.date}</span>
                </div>
                <div className="editor-actions">
                  <button className="btn btn-accent btn-sm">✨ AI Summarize</button>
                </div>
              </div>

              <div className="editor-content mt-4">
                <p>{activeNote.content}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted mt-4">Select or create a note to view details.</div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Study Note</h3>
            <form onSubmit={handleCreateNote} className="mt-3">
              <div className="form-group">
                <label>Note Title</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry Reactions"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Note Content</label>
                <textarea
                  rows="5"
                  placeholder="Write your note markdown or text here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div className="modal-actions mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
