import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { SkeletonStat, SkeletonActionCard, SkeletonActivity } from '../../components/Skeleton/Skeleton';
import './Dashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

function fmtMin(min) {
  if (!min) return '0m';
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60 > 0 ? `${min % 60}m` : ''}`.trim();
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getCountdown(examDate) {
  const now = new Date();
  const exam = new Date(examDate);
  const diff = exam - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours, total: diff };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    focusStats: null,
    activePlans: 0,
    aiConversations: 0,
    flashcardSets: 0,
    recentSessions: [],
    recentConvos: [],
    nextExam: null,
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const headers = authHeaders();
      const [focusRes, plansRes, aiRes, fcRes, historyRes, examsRes] = await Promise.allSettled([
        axios.get(`${API}/api/focus/stats`,             { headers }),
        axios.get(`${API}/api/plans?limit=50`,           { headers }),
        axios.get(`${API}/api/ai/conversations?limit=5`, { headers }),
        axios.get(`${API}/api/flashcards`,               { headers }),
        axios.get(`${API}/api/focus/history?limit=3`,    { headers }),
        axios.get(`${API}/api/exams`,                    { headers }),
      ]);

      const focusStats      = focusRes.status      === 'fulfilled' ? focusRes.value.data        : null;
      const plansData       = plansRes.status      === 'fulfilled' ? plansRes.value.data        : null;
      const aiData          = aiRes.status         === 'fulfilled' ? aiRes.value.data           : null;
      const fcData          = fcRes.status         === 'fulfilled' ? fcRes.value.data           : null;
      const historyData     = historyRes.status    === 'fulfilled' ? historyRes.value.data      : null;
      const examsData       = examsRes.status      === 'fulfilled' ? examsRes.value.data        : null;

      const activePlans = plansData?.plans?.filter((p) => p.status === 'active').length ?? 0;

      // Find next upcoming exam
      let nextExam = null;
      if (examsData?.exams) {
        const upcoming = examsData.exams
          .filter((e) => new Date(e.examDate) > new Date())
          .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
        if (upcoming.length > 0) {
          nextExam = upcoming[0];
        }
      }

      setData({
        focusStats,
        activePlans,
        aiConversations: aiData?.total ?? 0,
        flashcardSets:   fcData?.sets?.length ?? 0,
        recentSessions:  historyData?.sessions ?? [],
        recentConvos:    aiData?.conversations ?? [],
        nextExam,
      });
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Build recent activity from sessions + convos merged
  const activity = [
    ...data.recentSessions.map((s) => ({
      type: 'focus',
      label: `Focus Session — ${s.subject}`,
      meta: `${s.durationMin} min`,
      time: s.completedAt,
      dot: 'green',
    })),
    ...data.recentConvos.map((c) => ({
      type: 'ai',
      label: `AI: ${c.topic}`,
      meta: 'AI Explainer',
      time: c.updatedAt,
      dot: 'purple',
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  // Exam countdown
  const countdown = data.nextExam ? getCountdown(data.nextExam.examDate) : null;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <h1>{greeting}, {firstName} 👋</h1>
        <p>Here's your study overview for this week.</p>
      </div>

      {/* Exam countdown banner */}
      {!loading && countdown && (
        <div className="dash-countdown-banner">
          <div className="dash-countdown-left">
            <span className="dash-countdown-emoji">📅</span>
            <div>
              <strong>{data.nextExam.title}</strong>
              <span className="dash-countdown-subject">
                {data.nextExam.subject?.name || ''}
              </span>
            </div>
          </div>
          <div className="dash-countdown-right">
            <div className="dash-countdown-block">
              <span className="dash-countdown-num">{countdown.days}</span>
              <span className="dash-countdown-label">din</span>
            </div>
            <div className="dash-countdown-block">
              <span className="dash-countdown-num">{countdown.hours}</span>
              <span className="dash-countdown-label">ghante</span>
            </div>
            <span className="dash-countdown-text">baache hain!</span>
          </div>
        </div>
      )}

      {/* Streak banner */}
      {data.focusStats?.streak > 0 && (
        <div className="dash-streak-banner">
          🔥 <strong>{data.focusStats.streak} din ki streak!</strong> — Aaj bhi padhna mat bhoolo
        </div>
      )}

      {/* Stat cards */}
      <div className="dashboard-stats">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <div className="card stat-card">
              <div className="stat-icon purple">📚</div>
              <div className="stat-info">
                <h3>{data.activePlans}</h3>
                <p>Active Plans</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon green">⏱️</div>
              <div className="stat-info">
                <h3>{fmtMin(data.focusStats?.weekMinutes)}</h3>
                <p>Focus Time (7 days)</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon amber">🧠</div>
              <div className="stat-info">
                <h3>{data.aiConversations}</h3>
                <p>Concepts Explored</p>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon blue">🃏</div>
              <div className="stat-info">
                <h3>{data.flashcardSets}</h3>
                <p>Flashcard Sets</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick actions */}
      {loading ? (
        <div className="dashboard-actions">
          <SkeletonActionCard />
          <SkeletonActionCard />
          <SkeletonActionCard />
          <SkeletonActionCard />
        </div>
      ) : (
        <div className="dashboard-actions">
          <Link to="/planner" className="card card-clickable action-card">
            <div className="action-left">
              <span className="action-emoji">📅</span>
              <span className="action-label">Study Planner</span>
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
          <Link to="/timer" className="card card-clickable action-card">
            <div className="action-left">
              <span className="action-emoji">⏱️</span>
              <span className="action-label">Start Focus Timer</span>
            </div>
            <span className="action-arrow">→</span>
          </Link>
          <Link to="/flashcards" className="card card-clickable action-card">
            <div className="action-left">
              <span className="action-emoji">🃏</span>
              <span className="action-label">Review Flashcards</span>
            </div>
            <span className="action-arrow">→</span>
          </Link>
        </div>
      )}

      {/* Recent activity */}
      <div className="dashboard-recent">
        <h2 className="section-title">Recent Activity</h2>
        {loading ? (
          <SkeletonActivity count={3} />
        ) : activity.length === 0 ? (
          <div className="dash-empty">
            <p>Koi activity nahi abhi — koi feature use karo!</p>
            <Link to="/ai-explainer" className="dash-empty-link">AI Explainer try karo →</Link>
          </div>
        ) : (
          <div className="recent-list">
            {activity.map((a, i) => (
              <div key={i} className="recent-item">
                <div className="recent-item-left">
                  <div className={`recent-dot ${a.dot}`} />
                  <div className="recent-text">
                    <strong>{a.label}</strong>
                    <span>{a.meta}</span>
                  </div>
                </div>
                <span className="recent-time">{timeAgo(a.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's focus */}
      {data.focusStats?.todayMinutes > 0 && (
        <div className="dash-today">
          <div className="dash-today-label">Aaj ka focus time</div>
          <div className="dash-today-bar-wrap">
            <div className="dash-today-bar">
              <div
                className="dash-today-fill"
                style={{ width: `${Math.min(100, (data.focusStats.todayMinutes / 120) * 100)}%` }}
              />
            </div>
            <span className="dash-today-num">{fmtMin(data.focusStats.todayMinutes)} / 2h goal</span>
          </div>
        </div>
      )}
    </div>
  );
}
