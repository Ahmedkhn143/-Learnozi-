import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <h1>Welcome back, Student 👋</h1>
        <p>Here's your study overview for this week.</p>
      </div>

      {/* Stat cards */}
      <div className="dashboard-stats">
        <div className="card stat-card">
          <div className="stat-icon purple">📚</div>
          <div className="stat-info">
            <h3>3</h3>
            <p>Active Plans</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon green">⏱️</div>
          <div className="stat-info">
            <h3>12h 30m</h3>
            <p>Focus Time (7 days)</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon amber">🧠</div>
          <div className="stat-info">
            <h3>24</h3>
            <p>Concepts Explored</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="dashboard-actions">
        <Link to="/planner" className="card card-clickable action-card">
          <div className="action-left">
            <span className="action-emoji">📅</span>
            <span className="action-label">New Study Plan</span>
          </div>
          <span className="action-arrow">→</span>
        </Link>

        <Link to="/ai-explainer" className="card card-clickable action-card">
          <div className="action-left">
            <span className="action-emoji">🤖</span>
            <span className="action-label">Ask AI Tutor</span>
          </div>
          <span className="action-arrow">→</span>
        </Link>

        <Link to="/planner" className="card card-clickable action-card">
          <div className="action-left">
            <span className="action-emoji">🎯</span>
            <span className="action-label">Start Focus Session</span>
          </div>
          <span className="action-arrow">→</span>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="dashboard-recent">
        <h2 className="section-title">Recent Activity</h2>
        <div className="recent-list">
          <div className="recent-item">
            <div className="recent-item-left">
              <div className="recent-dot green" />
              <div className="recent-text">
                <strong>Completed: Photosynthesis Chapter</strong>
                <span>Biology • Study Plan</span>
              </div>
            </div>
            <span className="recent-time">2h ago</span>
          </div>

          <div className="recent-item">
            <div className="recent-item-left">
              <div className="recent-dot purple" />
              <div className="recent-text">
                <strong>AI Explanation: Newton's 3rd Law</strong>
                <span>Physics • AI Explainer</span>
              </div>
            </div>
            <span className="recent-time">5h ago</span>
          </div>

          <div className="recent-item">
            <div className="recent-item-left">
              <div className="recent-dot amber" />
              <div className="recent-text">
                <strong>Focus Session: 45 min</strong>
                <span>Mathematics • Focus Timer</span>
              </div>
            </div>
            <span className="recent-time">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
