import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const [activeTab, setActiveTab] = useState('explainer');

  const featureTabs = [
    {
      id: 'explainer',
      label: '✨ AI Explainer Studio',
      title: 'Simplify Complex Topics Instantly',
      desc: 'Stuck on tough Quantum Mechanics, Organic Chemistry, or Calculus? Ask our AI Explainer in plain language to break down concepts into 5-year-old summaries or university-level deep dives.',
      badge: 'Interactive AI Chat',
      previewCode: `> USER: Explain Bayes' Theorem with a real-life example
> AI EXPLAINER: Imagine you are testing for a rare medical condition...
P(A|B) = [P(B|A) * P(A)] / P(B)
Key takeaway: Always update your belief when new evidence comes in!`
    },
    {
      id: 'flashcards',
      label: '🃏 Smart 3D Flashcards',
      title: 'Active Recall & Spaced Repetition',
      desc: 'Generate interactive 3D flashcards automatically from your course syllabus or notes. Rate your confidence level to optimize memory retention before exam day.',
      badge: '3D Flip Engine',
      previewCode: `Q: What is the main function of Mitochondria?
[ Click Card to Flip 🔄 ]
A: Mitochondria generate most of the chemical energy (ATP) needed to power the cell's biochemical reactions!`
    },
    {
      id: 'planner',
      label: '📅 AI Study Planner',
      title: 'Automated Exam Countdown & Schedules',
      desc: 'Input your upcoming exam dates and target grades. Learnozi calculates optimal daily study hours and distributes subject tasks across your calendar automatically.',
      badge: 'Smart Timetable',
      previewCode: `Upcoming Exam: Organic Chemistry (In 4 Days)
Daily Target: 2.5 Hours Focus
Status: [====================>] 85% Prepared`
    },
    {
      id: 'focus',
      label: '⏱️ Ambient Focus Room',
      title: 'Pomodoro Timer with Lo-Fi & Rain Soundscapes',
      desc: 'Eliminate distractions with integrated focus timer intervals, ambient binaural beats, soundscapes, and focus streak tracking log.',
      badge: 'Deep Focus',
      previewCode: `Focus Session: 25:00 Remaining
Soundscape: 🌧️ Gentle Rain + Lo-Fi Beats
Streak:  🔥 7 Days Consecutive Focus`
    }
  ];

  const currentTab = featureTabs.find(t => t.id === activeTab);

  return (
    <div className="landing-page">
      {/* Background Ambient Glows */}
      <div className="glow-ambient glow-purple" style={{ top: '-10%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
      <div className="glow-ambient glow-cyan" style={{ top: '30%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }} />

      {/* Landing Top Header */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="brand-icon-wrap">
            <span className="brand-icon">L</span>
          </div>
          <span className="brand-name">Learnozi</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#demo">AI Preview</a>
          <a href="#testimonials">Testimonials</a>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-ghost">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-badge animate-fade-in">
          <span className="badge-sparkle">✨</span>
          <span>NEXT-GEN AI STUDY & PRODUCTIVITY SUITE</span>
        </div>

        <h1 className="hero-title animate-fade-in">
          Study 10x Faster with <br />
          <span className="gradient-text">AI-Powered Intelligence</span>
        </h1>

        <p className="hero-subtitle animate-fade-in">
          Master any subject, auto-generate 3D flashcards, chat with uploaded PDF documents, track focus sessions, and ace your exams effortlessly.
        </p>

        <div className="hero-cta-group animate-fade-in">
          <Link to="/signup" className="btn btn-primary btn-lg">
            <span>🚀 Start Learning Now</span>
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            <span>⚡ Quick Demo Access</span>
          </Link>
        </div>

        {/* Stats Counter Bar */}
        <div className="hero-stats-bar glass-card">
          <div className="stat-item">
            <span className="stat-number">50,000+</span>
            <span className="stat-label">Flashcards Generated</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">98.4%</span>
            <span className="stat-label">Exam Pass Rate</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">12,000+</span>
            <span className="stat-label">Active Learners</span>
          </div>
        </div>
      </header>

      {/* Interactive App Mockup Showcase */}
      <section className="app-preview-section" id="demo">
        <div className="section-header text-center">
          <span className="badge badge-cyan">INTERACTIVE DEMO</span>
          <h2>Explore Learnozi AI Features</h2>
          <p>Experience the all-in-one workspace designed specifically for high-achieving students.</p>
        </div>

        <div className="preview-container glass-card">
          {/* Feature Selector Tabs */}
          <div className="preview-tabs">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                className={`preview-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Feature Display */}
          <div className="preview-body grid-2">
            <div className="preview-info">
              <span className="badge badge-primary mb-2">{currentTab.badge}</span>
              <h3>{currentTab.title}</h3>
              <p>{currentTab.desc}</p>
              <Link to="/signup" className="btn btn-accent btn-sm mt-3">
                Try {currentTab.label} →
              </Link>
            </div>

            <div className="preview-screen-box">
              <div className="window-bar">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span className="window-title">learnozi-ai-studio // {currentTab.id}</span>
              </div>
              <pre className="screen-code-content">
                <code>{currentTab.previewCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section" id="features">
        <div className="section-header text-center">
          <span className="badge badge-primary">POWERFUL TOOLKIT</span>
          <h2>Everything You Need To Top Your Class</h2>
        </div>

        <div className="grid-3 mt-4">
          <div className="glass-card glass-card-hover feature-card">
            <div className="feature-icon">✨</div>
            <h3>AI Explainer Studio</h3>
            <p>Convert lengthy textbook chapters into structured summaries, key bullet points, and instant Q&A breakdowns.</p>
          </div>

          <div className="glass-card glass-card-hover feature-card">
            <div className="feature-icon">📄</div>
            <h3>Document & PDF Chat</h3>
            <p>Upload lecture slides, research papers, and notes. Chat directly with your documents with page citations.</p>
          </div>

          <div className="glass-card glass-card-hover feature-card">
            <div className="feature-icon">🃏</div>
            <h3>3D Interactive Flashcards</h3>
            <p>Smart active recall flashcards with spaced repetition difficulty scoring (Easy, Good, Hard).</p>
          </div>

          <div className="glass-card glass-card-hover feature-card">
            <div className="feature-icon">📅</div>
            <h3>Study Timetable & Planner</h3>
            <p>Automated study schedule creation based on your exam dates, priority tags, and study goals.</p>
          </div>

          <div className="glass-card glass-card-hover feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Pomodoro Focus Room</h3>
            <p>Custom focus timers bundled with ambient Lofi beats, rain soundscapes, and streak counters.</p>
          </div>

          <div className="glass-card glass-card-hover feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Peer Study Community</h3>
            <p>Connect with fellow learners, exchange notes, post exam queries, and collaborate in public study groups.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-header text-center">
          <span className="badge badge-cyan">STUDENT TESTIMONIALS</span>
          <h2>Loved By Learners Worldwide</h2>
        </div>

        <div className="grid-3 mt-4">
          <div className="glass-card testimonial-card">
            <p>"Learnozi transformed how I prepare for my medical exams. The AI Explainer simplified complex Physiology topics in minutes!"</p>
            <div className="testimonial-user mt-3">
              <div className="avatar">A</div>
              <div>
                <strong>Ayesha Khan</strong>
                <p>Pre-Med Student</p>
              </div>
            </div>
          </div>

          <div className="glass-card testimonial-card">
            <p>"The 3D flashcards and ambient rain timer kept me focused for 4+ hours straight. Got an A in Organic Chemistry thanks to this!"</p>
            <div className="testimonial-user mt-3">
              <div className="avatar" style={{ background: '#06b6d4' }}>M</div>
              <div>
                <strong>Muhammad Ali</strong>
                <p>Engineering Major</p>
              </div>
            </div>
          </div>

          <div className="glass-card testimonial-card">
            <p>"Document chat is a lifesaver! I dropped a 60-page PDF slide deck and it answered all my revision questions with exact page references."</p>
            <div className="testimonial-user mt-3">
              <div className="avatar" style={{ background: '#ec4899' }}>S</div>
              <div>
                <strong>Sara Ahmed</strong>
                <p>Computer Science Senior</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer className="landing-cta-footer">
        <div className="glass-card cta-banner text-center">
          <h2>Ready To Supercharge Your Learning?</h2>
          <p>Join thousands of students achieving top grades with Learnozi today.</p>
          <div className="mt-4">
            <Link to="/signup" className="btn btn-primary btn-lg">
              🚀 Create Your Free Account
            </Link>
          </div>
          <p className="mt-3 text-muted" style={{ fontSize: '0.8rem' }}>No credit card required. Free instant access.</p>
        </div>
      </footer>
    </div>
  );
}
