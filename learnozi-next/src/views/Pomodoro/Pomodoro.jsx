import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './Pomodoro.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const MODES = {
  focus:      { label: 'Focus',       minutes: 25, color: '#4f46e5' },
  shortBreak: { label: 'Short Break', minutes: 5,  color: '#22c55e' },
  longBreak:  { label: 'Long Break',  minutes: 15, color: '#8b5cf6' },
};

const CIRCUMFERENCE = 2 * Math.PI * 108; // radius = 108

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Pomodoro() {
  const [mode, setMode]           = useState('focus');
  const [running, setRunning]     = useState(false);
  const [seconds, setSeconds]     = useState(MODES.focus.minutes * 60);
  const [subject, setSubject]     = useState('General');
  const [sessions, setSessions]   = useState(0); // pomodoros done this sitting
  const [stats, setStats]         = useState(null);
  const [history, setHistory]     = useState([]);
  const [toast, setToast]         = useState('');
  const intervalRef = useRef(null);
  const totalRef    = useRef(MODES.focus.minutes * 60);

  // Load stats + history on mount
  useEffect(() => {
    loadStats();
    loadHistory();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await axios.get(`${API}/api/focus/stats`, { headers: authHeaders() });
      setStats(data);
    } catch { /* silent */ }
  };

  const loadHistory = async () => {
    try {
      const { data } = await axios.get(`${API}/api/focus/history?limit=5`, { headers: authHeaders() });
      setHistory(data.sessions || []);
    } catch { /* silent */ }
  };

  // Change mode
  const switchMode = (m) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setMode(m);
    const secs = MODES[m].minutes * 60;
    setSeconds(secs);
    totalRef.current = secs;
  };

  // Tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const handleComplete = useCallback(async () => {
    // Sound — beep via AudioContext
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; gain.gain.value = 0.3;
      osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.stop(ctx.currentTime + 0.8);
    } catch { /* no audio */ }

    if (mode === 'focus') {
      const dur = MODES.focus.minutes;
      setSessions((s) => s + 1);
      showToast('🎉 Focus session complete! Time for a break.');
      // Save to DB
      try {
        await axios.post(
          `${API}/api/focus`,
          { subject, durationMin: dur, completed: true },
          { headers: authHeaders() }
        );
        loadStats();
        loadHistory();
      } catch { /* silent */ }
    } else {
      showToast('⏰ Break over! Ready to focus?');
    }
  }, [mode, subject]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const secs = MODES[mode].minutes * 60;
    setSeconds(secs);
    totalRef.current = secs;
  };

  // SVG progress
  const progress  = seconds / totalRef.current;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const color = MODES[mode].color;

  // Format stats
  const fmtMin = (min) => {
    if (!min) return '0m';
    if (min < 60) return `${min}m`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  return (
    <div className="pomodoro">
      {/* Header */}
      <div className="pomo-header">
        <h1>⏱️ Focus Timer</h1>
        <p>Pomodoro technique — 25 min focus, 5 min break</p>
      </div>

      {/* Streak */}
      {stats?.streak > 0 && (
        <div className="pomo-streak">
          🔥 {stats.streak} din ki streak — keep it up!
        </div>
      )}

      {/* Mode tabs */}
      <div className="pomo-modes">
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            className={`pomo-mode-btn${mode === key ? ' active' : ''}`}
            onClick={() => switchMode(key)}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Circle timer */}
      <div className="pomo-circle-wrap">
        <div className="pomo-circle">
          <svg className="pomo-svg" width="240" height="240" viewBox="0 0 240 240">
            <circle className="pomo-track" cx="120" cy="120" r="108" />
            <circle
              className="pomo-fill"
              cx="120" cy="120" r="108"
              stroke={color}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="pomo-time-text">
            <div className="pomo-time">{formatTime(seconds)}</div>
            <div className="pomo-mode-label">{MODES[mode].label}</div>
            {mode === 'focus' && (
              <div className="pomo-session-count">Session #{sessions + 1}</div>
            )}
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="pomo-subject-row">
        <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={running}>
          {['General','Physics','Chemistry','Biology','Mathematics','English','Urdu',
            'Pakistan Studies','Islamiat','Computer Science'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="pomo-controls">
        <button
          className={`pomo-btn-main ${running ? 'pause' : 'start'}`}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? '⏸ Pause' : seconds === totalRef.current ? '▶ Start' : '▶ Resume'}
        </button>
        <button className="pomo-btn-reset" onClick={handleReset} title="Reset">↺</button>
      </div>

      {/* Stats */}
      <div className="pomo-stats">
        <div className="pomo-stat">
          <div className="pomo-stat-num">{fmtMin(stats?.todayMinutes)}</div>
          <div className="pomo-stat-label">Aaj ka focus</div>
        </div>
        <div className="pomo-stat">
          <div className="pomo-stat-num">{fmtMin(stats?.weekMinutes)}</div>
          <div className="pomo-stat-label">Is hafte</div>
        </div>
        <div className="pomo-stat">
          <div className="pomo-stat-num">{stats?.totalSessions ?? 0}</div>
          <div className="pomo-stat-label">Total sessions</div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <>
          <div className="pomo-history-title">Recent Sessions</div>
          <div className="pomo-history-list">
            {history.map((h) => (
              <div key={h._id} className="pomo-history-item">
                <div>
                  <div className="pomo-history-subject">{h.subject}</div>
                  <div className="pomo-history-meta">
                    {new Date(h.completedAt).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                <span className="pomo-history-duration">{h.durationMin} min</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <div className="pomo-toast">{toast}</div>}
    </div>
  );
}
