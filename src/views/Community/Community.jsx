import { useState } from 'react';
import './Community.css';

export default function Community() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Ayesha Khan',
      avatar: 'A',
      title: 'Top 5 tips for acing Organic Chemistry Reaction Mechanisms!',
      category: 'Exam Prep',
      upvotes: 24,
      comments: 6,
      time: '3 hours ago',
      content: 'Make sure to draw mechanism arrows carefully from the nucleophile electron pair to the electrophilic carbon...'
    },
    {
      id: 2,
      author: 'Muhammad Ali',
      avatar: 'M',
      title: 'Looking for a study group partner for Calculus III (Finals Prep)',
      category: 'Study Group',
      upvotes: 15,
      comments: 9,
      time: '5 hours ago',
      content: 'Hey everyone! Meeting on Zoom every evening at 8 PM for practice problem sessions. DM if interested!'
    }
  ]);

  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const handleUpvote = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    const newP = {
      id: Date.now(),
      author: 'You',
      avatar: 'Y',
      title: postTitle,
      category: 'Q&A',
      upvotes: 1,
      comments: 0,
      time: 'Just now',
      content: postContent
    };

    setPosts([newP, ...posts]);
    setPostTitle('');
    setPostContent('');
    setShowPostModal(false);
  };

  return (
    <div className="community-view animate-fade-in">
      <div className="community-header">
        <div>
          <h2>🌍 Peer Study Community</h2>
          <p>Share study notes, ask exam questions, and collaborate with student groups.</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={() => setShowPostModal(true)}>
          + Create Post
        </button>
      </div>

      <div className="posts-feed mt-4">
        {posts.map((post) => (
          <div key={post.id} className="glass-card post-card">
            <div className="post-header">
              <div className="post-author-info">
                <div className="author-avatar">{post.avatar}</div>
                <div>
                  <span className="author-name">{post.author}</span>
                  <span className="post-time">{post.time}</span>
                </div>
              </div>
              <span className="badge badge-cyan">{post.category}</span>
            </div>

            <h3 className="post-title mt-3">{post.title}</h3>
            <p className="post-body mt-2">{post.content}</p>

            <div className="post-footer mt-3">
              <button className="btn-upvote" onClick={() => handleUpvote(post.id)}>
                🔺 Upvote ({post.upvotes})
              </button>
              <span className="comments-count">💬 {post.comments} Comments</span>
            </div>
          </div>
        ))}
      </div>

      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Post to Community</h3>
            <form onSubmit={handleCreatePost} className="mt-3">
              <div className="form-group">
                <label>Post Title</label>
                <input
                  type="text"
                  placeholder="Ask a question or share study tips..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Details</label>
                <textarea
                  rows="4"
                  placeholder="Provide context or links..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              </div>

              <div className="modal-actions mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setShowPostModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
