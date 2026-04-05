import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">

      {/* NAV */}
      <nav className="ln-nav">
        <div className="ln-logo">Learn<span>ozi</span></div>
        <div className="ln-nav-links">
          <a href="#features">Features</a>
          <a href="#compare">Why Learnozi</a>
          <Link to="/login" className="ln-btn-ghost">Log In</Link>
          <Link to="/signup" className="ln-btn-primary">Shuru Karo — Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="ln-hero">
        <div className="ln-hero-content">
          <div className="ln-badge">
            <span className="ln-badge-dot" />
            Pakistan ka AI Study Companion
          </div>
          <h1>Padhna hua<br /><em>asan aur smart</em></h1>
          <p className="ln-sub">AI jo samjhata hai, planner jo guide karta hai — exam tak saath.</p>
          <p className="ln-urdu">ذہین مطالعہ، بہتر نتائج</p>
          <div className="ln-cta">
            <Link to="/signup" className="ln-btn-primary ln-btn-lg">
              Muft Account Banao →
            </Link>
            <a href="#features" className="ln-btn-text">Dekho kaise kaam karta hai ↓</a>
          </div>
          <p className="ln-note">Bilkul free. Koi credit card nahi.</p>
        </div>

        <div className="ln-hero-card">
          <div className="ln-card-header">
            <div className="ln-avatar">🤖</div>
            <div>
              <div className="ln-ai-name">Learnozi AI</div>
              <div className="ln-ai-status">● Online</div>
            </div>
          </div>
          <div className="ln-msg ln-msg-user">Newton ka 2nd law Urdu mein explain karo</div>
          <div className="ln-msg ln-msg-ai">
            Newton ka doosra qanoon kehta hai ke kisi cheez ki speed mein tabdeeli us par lagi taqat ke barabar hoti hai.<br /><br />
            <strong>F = ma</strong> — Taqat = Mass × Acceleration
          </div>
          <div className="ln-typing">
            <span /><span /><span />
          </div>
          {/* Floating badges */}
          <div className="ln-float-badge ln-float-streak">🔥 7 din ki streak!</div>
          <div className="ln-float-badge ln-float-progress">
            <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:'4px'}}>Physics Progress</div>
            <div className="ln-prog-bar"><div className="ln-prog-fill" /></div>
            <div style={{fontSize:'0.72rem',color:'#4f46e5',marginTop:'3px',fontWeight:600}}>78%</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="ln-stats">
        <div className="ln-stat"><div className="ln-stat-num">6</div><div className="ln-stat-label">AI Features</div></div>
        <div className="ln-stat"><div className="ln-stat-num">Urdu</div><div className="ln-stat-label">Language Support</div></div>
        <div className="ln-stat"><div className="ln-stat-num">Free</div><div className="ln-stat-label">Forever Basic Plan</div></div>
        <div className="ln-stat"><div className="ln-stat-num">24/7</div><div className="ln-stat-label">AI Tutor Available</div></div>
      </div>

      {/* FEATURES */}
      <section className="ln-features" id="features">
        <div className="ln-section-tag">FEATURES</div>
        <h2 className="ln-section-title">Har student ki zaroorat<br />ek jagah</h2>
        <p className="ln-section-sub">ChatGPT generic hai — Learnozi Pakistani students ke liye bana hai.</p>

        <div className="ln-features-grid">
          {[
            { icon: '🧠', title: 'AI Concept Explainer', desc: 'Koi bhi topic likho — AI Urdu ya English mein explanation, example aur summary deta hai.', tag: 'FREE' },
            { icon: '🃏', title: 'AI Flashcards', desc: 'Topic likho — AI automatically flashcards bana deta hai. Daily review karo, exam se pehle yaad rahega.', tag: 'FREE' },
            { icon: '⏱️', title: 'Pomodoro Focus Timer', desc: '25 min study, 5 min break. Dashboard pe tera study time track hota hai. Streak banao.', tag: 'FREE' },
            { icon: '📅', title: 'Smart Study Planner', desc: 'Exam date daalo, subjects batao — AI tera poora schedule bana deta hai.', tag: 'FREE' },
            { icon: '📊', title: 'Progress Dashboard', desc: 'Focus time, AI uses, flashcard sets — sab ek jagah dikhta hai. Real data, koi hardcoded nahi.', tag: 'FREE' },
            { icon: '🇵🇰', title: 'Pakistan Focused', desc: 'Matric, FSc, MDCAT, CSS — Pakistani syllabus ke mutabiq. Urdu mein baat karo, Urdu mein samjho.', tag: 'FREE' },
          ].map((f) => (
            <div key={f.title} className="ln-feature-card">
              <div className="ln-feature-icon">{f.icon}</div>
              <div className="ln-feature-title">{f.title}</div>
              <div className="ln-feature-desc">{f.desc}</div>
              <span className="ln-feature-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="ln-how">
        <div className="ln-section-tag">HOW IT WORKS</div>
        <h2 className="ln-section-title">3 steps mein shuru karo</h2>
        <div className="ln-steps">
          {[
            { n: '1', title: 'Account Banao — Free', desc: 'Email se signup karo. 60 seconds mein ready.' },
            { n: '2', title: 'Apni Details Daalo', desc: 'Class, subjects, exam date batao. AI plan banata hai.' },
            { n: '3', title: 'Padhna Shuru Karo', desc: 'AI se poocho, flashcards banao, timer chalao.' },
          ].map((s, i) => (
            <div key={i} className="ln-step">
              <div className={`ln-step-num${i === 0 ? ' active' : ''}`}>{s.n}</div>
              <div className="ln-step-title">{s.title}</div>
              <div className="ln-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="ln-compare" id="compare">
        <div className="ln-section-tag">WHY LEARNOZI</div>
        <h2 className="ln-section-title">ChatGPT se better kyun?</h2>
        <table className="ln-table">
          <thead>
            <tr>
              <th style={{textAlign:'left'}}>Feature</th>
              <th className="ln-th-highlight">Learnozi</th>
              <th>ChatGPT</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Urdu mein explain karta hai', '✓', 'Partial'],
              ['Pakistani syllabus aware', '✓', '✗'],
              ['Study Planner built-in', '✓', '✗'],
              ['AI Flashcards', '✓', '✗'],
              ['Focus Timer + Streak', '✓', '✗'],
              ['Student ke liye design', '✓', '✗'],
              ['Free to use', '✓', '✓'],
            ].map(([feat, l, c]) => (
              <tr key={feat}>
                <td className="ln-td-feat">{feat}</td>
                <td className="ln-td-check">{l}</td>
                <td className="ln-td-cross">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* CTA */}
      <section className="ln-cta-section">
        <h2>Aaj se smarter padhna shuru karo</h2>
        <p>Bilkul free. Koi credit card nahi. Abhi signup karo.</p>
        <Link to="/signup" className="ln-btn-white">Muft Account Banao →</Link>
        <p className="ln-cta-note">Free plan mein 10 AI explanations daily.</p>
      </section>

      {/* FOOTER */}
      <footer className="ln-footer">
        <div className="ln-footer-logo">Learnozi</div>
        <div className="ln-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="mailto:hello@learnozi.com">Contact</a>
        </div>
        <div>Made in Pakistan 🇵🇰</div>
      </footer>
    </div>
  );
}
