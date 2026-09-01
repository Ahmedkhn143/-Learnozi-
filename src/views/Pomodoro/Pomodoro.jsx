import { useState, useEffect } from 'react';
import './Pomodoro.css';

export default function Pomodoro() {
  const [mode, setMode] = useState('pomodoro'); // pomodoro (25m), shortBreak (5m), longFocus (50m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundscape, setSoundscape] = useState('rain');
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(3);

  const modeConfig = {
    pomodoro: { label: 'Pomodoro (25m)', duration: 25 * 60 },
    shortBreak: { label: 'Short Break (5m)', duration: 5 * 60 },
    longFocus: { label: 'Deep Focus (50m)', duration: 50 * 60 }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setCompletedSessions((prev) => prev + 1);
      alert('🎉 Focus Session Completed! Take a well-deserved break.');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(modeConfig[newMode].duration);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeConfig[mode].duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSecs = modeConfig[mode].duration;
  const progressPercent = ((totalSecs - timeLeft) / totalSecs) * 100;
  const strokeDashoffset = 565 - (565 * progressPercent) / 100;

  return (
    <div className="pomodoro-view animate-fade-in">
      <div className="pomodoro-header text-center">
        <h2>⏱️ Ambient Focus Room</h2>
        <p>Eliminate distractions, lock in deep study sessions, and track focus time.</p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="timer-mode-tabs mt-3">
        <button className={`mode-tab-btn ${mode === 'pomodoro' ? 'active' : ''}`} onClick={() => changeMode('pomodoro')}>
          🧠 25m Focus
        </button>
        <button className={`mode-tab-btn ${mode === 'shortBreak' ? 'active' : ''}`} onClick={() => changeMode('shortBreak')}>
          ☕ 5m Break
        </button>
        <button className={`mode-tab-btn ${mode === 'longFocus' ? 'active' : ''}`} onClick={() => changeMode('longFocus')}>
          🚀 50m Deep Work
        </button>
      </div>

      {/* Circular Timer Ring */}
      <div className="timer-workspace mt-4">
        <div className="svg-timer-wrap">
          <svg className="timer-svg" width="220" height="220" viewBox="0 0 200 200">
            <circle className="timer-bg-circle" cx="100" cy="100" r="90" />
            <circle
              className="timer-progress-circle"
              cx="100"
              cy="100"
              r="90"
              style={{ strokeDasharray: 565, strokeDashoffset }}
            />
          </svg>

          <div className="timer-display-content">
            <span className="time-digits">{formatTime(timeLeft)}</span>
            <span className="mode-status-text">{isActive ? '⚡ IN FOCUS' : 'PAUSED'}</span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="timer-controls mt-4">
          <button className={`btn btn-lg ${isActive ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleTimer}>
            {isActive ? '⏸️ Pause' : '▶️ Start Session'}
          </button>
          <button className="btn btn-secondary btn-lg" onClick={resetTimer}>
            🔄 Reset
          </button>
        </div>

        {/* Ambient Soundscapes Bar */}
        <div className="glass-card soundscape-panel mt-4">
          <div className="soundscape-header">
            <span>🎧 Ambient Soundscape: <strong>{soundscape.toUpperCase()}</strong></span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSoundPlaying(!soundPlaying)}>
              {soundPlaying ? '🔊 Playing' : '🔇 Muted'}
            </button>
          </div>
          <div className="soundscape-options mt-2">
            <button className={`sound-btn ${soundscape === 'rain' ? 'active' : ''}`} onClick={() => setSoundscape('rain')}>
              🌧️ Gentle Rain
            </button>
            <button className={`sound-btn ${soundscape === 'lofi' ? 'active' : ''}`} onClick={() => setSoundscape('lofi')}>
              🎧 Lo-Fi Beats
            </button>
            <button className={`sound-btn ${soundscape === 'forest' ? 'active' : ''}`} onClick={() => setSoundscape('forest')}>
              🌲 Pine Forest
            </button>
            <button className={`sound-btn ${soundscape === 'cafe' ? 'active' : ''}`} onClick={() => setSoundscape('cafe')}>
              ☕ Cafe Atmosphere
            </button>
          </div>
        </div>

        {/* Completed Sessions Stats */}
        <div className="completed-sessions-badge mt-3">
          <span>🎉 {completedSessions} Focus Sessions Completed Today ({(completedSessions * 25) / 60} hours logged)</span>
        </div>
      </div>
    </div>
  );
}
