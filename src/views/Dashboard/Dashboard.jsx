import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.name || 'Learner';

  const [stats, setStats] = useState({
    focusHours: 14.5,
    streakDays: 6,
    flashcardsMastered: 42,
    totalFlashcards: 50,
    upcomingExamsCount: 2
  });

  const subjects = [
    { name: 'Organic Chemistry', progress: 78, color: '#6366f1', totalHours: 18 },
    { name: 'Quantum Mechanics', progress: 60, color: '#06b6d4', totalHours: 12 },
    { name: 'Calculus III', progress: 85, color: '#10b981', totalHours: 24 },
    { name: 'Data Structures', progress: 45, color: '#f59e0b', totalHours: 8 }
  ];

  const upcomingExams = [
    { title: 'Organic Chemistry Midterm', date: '2026-09-05', daysLeft: 4, urgency: 'high', subject: 'Chemistry' },
    { title: 'Calculus III Final', date: '2026-09-12', daysLeft: 11, urgency: 'medium', subject: 'Math' }
  ];

  const recentActivity = [
    { title: 'AI Chat: Explained Bayes Theorem', time: '2 hours ago', icon: '✨' },
    { title: 'Completed 25m Focus Session', time: '4 hours ago', icon: '⏱️' },
    { title: 'Reviewed 15 Organic Chemistry Flashcards', time: 'Yesterday', icon: '🃏' }
  ];

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="glass-card welcome-banner">
        <div className="welcome-content">
          <div className="welcome-badge">
            <span>🔥 {stats.streakDays} DAY FOCUS STREAK</span>
          </div>
          <h1>Welcome back, <span className="gradient-text">{userName}</span> 👋</h1>
          <p>You are on track to hit your study goals this week. Keep the momentum going!</p>

          <div className="welcome-actions mt-3">
            <Link to="/ai-explainer" className="btn btn-primary btn-sm">
              <span>✨ Ask AI Assistant</span>
            </Link>
            <Link to="/timer" className="btn btn-secondary btn-sm">
              <span>⏱️ Start Focus Room</span>
            </Link>
            <Link to="/planner" className="btn btn-ghost btn-sm">
              <span>📅 View Planner</span>
            </Link>
          </div>
        </div>

        <div className="welcome-quote-card glass-card">
          <span className="quote-icon">💡</span>
          <p className="quote-text">"Success isn't always about greatness. It's about consistency. Consistent hard work leads to success."</p>
          <span className="quote-author">— Daily AI Motivation</span>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid-4 mt-4">
        <div className="glass-card glass-card-hover stat-widget">
          <div className="stat-header">
            <span className="stat-title">Focus Time</span>
            <div className="stat-icon-wrap primary">⏱️</div>
          </div>
          <div className="stat-value">{stats.focusHours} hrs</div>
          <div className="stat-footer">
            <span className="stat-trend positive">↑ +2.5 hrs</span> vs last week
          </div>
        </div>

        <div className="glass-card glass-card-hover stat-widget">
          <div className="stat-header">
            <span className="stat-title">Study Streak</span>
            <div className="stat-icon-wrap amber">🔥</div>
          </div>
          <div className="stat-value">{stats.streakDays} Days</div>
          <div className="stat-footer">
            <span className="stat-trend positive">Best record: 12 days</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover stat-widget">
          <div className="stat-header">
            <span className="stat-title">Flashcards Mastered</span>
            <div className="stat-icon-wrap cyan">🃏</div>
          </div>
          <div className="stat-value">{stats.flashcardsMastered} / {stats.totalFlashcards}</div>
          <div className="stat-footer">
            <div className="mini-progress-bg">
              <div className="mini-progress-fill" style={{ width: `${(stats.flashcardsMastered / stats.totalFlashcards) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="glass-card glass-card-hover stat-widget">
          <div className="stat-header">
            <span className="stat-title">Upcoming Exams</span>
            <div className="stat-icon-wrap rose">🎓</div>
          </div>
          <div className="stat-value">{stats.upcomingExamsCount} Tests</div>
          <div className="stat-footer">
            <span className="stat-trend urgent">Next in 4 Days</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Subject Progress & Exams */}
      <div className="grid-2 mt-4">
        {/* Subject Completion Progress */}
        <div className="glass-card dashboard-card">
          <div className="card-header-flex">
            <h3>🎓 Subject Mastery</h3>
            <Link to="/academics" className="view-all-link">Manage →</Link>
          </div>

          <div className="subject-list mt-3">
            {subjects.map((sub, idx) => (
              <div key={idx} className="subject-item">
                <div className="subject-info-row">
                  <span className="subject-name">{sub.name}</span>
                  <span className="subject-percentage">{sub.progress}%</span>
                </div>
                <div className="subject-bar-bg">
                  <div
                    className="subject-bar-fill"
                    style={{ width: `${sub.progress}%`, background: sub.color }}
                  />
                </div>
                <div className="subject-meta mt-1">
                  <span>{sub.totalHours} Focus Hours Logged</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams Timeline */}
        <div className="glass-card dashboard-card">
          <div className="card-header-flex">
            <h3>📅 Upcoming Exams & Deadlines</h3>
            <Link to="/planner" className="view-all-link">Planner →</Link>
          </div>

          <div className="exam-list mt-3">
            {upcomingExams.map((exam, idx) => (
              <div key={idx} className="exam-card-item">
                <div className="exam-left">
                  <div className={`exam-countdown-badge ${exam.urgency}`}>
                    <span className="days-num">{exam.daysLeft}</span>
                    <span className="days-text">Days</span>
                  </div>
                  <div>
                    <h4 className="exam-title">{exam.title}</h4>
                    <span className="exam-date">Date: {exam.date} • {exam.subject}</span>
                  </div>
                </div>
                <Link to="/planner" className="btn btn-secondary btn-sm">Prep Plan</Link>
              </div>
            ))}

            <div className="add-exam-prompt mt-3">
              <Link to="/planner" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                + Add New Exam Date
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Quick Flashcards Review & Recent AI Activity */}
      <div className="grid-2 mt-4">
        <div className="glass-card dashboard-card">
          <div className="card-header-flex">
            <h3>🃏 Quick Flashcard Review</h3>
            <Link to="/flashcards" className="view-all-link">All Decks →</Link>
          </div>

          <div className="quick-flashcard-box mt-3 text-center">
            <span className="badge badge-cyan mb-2">Organic Chemistry Deck</span>
            <h4>Q: What is an electrophile in organic reactions?</h4>
            <p className="text-muted mt-1" style={{ fontSize: '0.88rem' }}>Click below to test your recall!</p>
            <div className="mt-3">
              <Link to="/flashcards" className="btn btn-primary btn-sm">
                🔄 Flip Card & Review
              </Link>
            </div>
          </div>
        </div>

        <div className="glass-card dashboard-card">
          <div className="card-header-flex">
            <h3>📜 Recent Activity</h3>
          </div>

          <div className="activity-list mt-3">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="activity-item">
                <span className="activity-icon">{act.icon}</span>
                <div className="activity-details">
                  <span className="activity-title">{act.title}</span>
                  <span className="activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
