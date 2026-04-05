import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Landing.css';

export default function Landing() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <div className="landing">

      {/* NAV */}
      <nav className="ln-nav">
        <div className="ln-logo">Learn<span>ozi</span></div>
        <div className="ln-nav-links">
          <a href="#features">{t('nav.features')}</a>
          <a href="#compare">{t('nav.why_learnozi')}</a>
          <Link to="/login" className="ln-btn-ghost">{t('nav.login')}</Link>
          <Link to="/signup" className="ln-btn-primary">{t('nav.signup')}</Link>
          <button 
            className="ln-btn-ghost" 
            onClick={toggleLanguage} 
            style={{ fontWeight: 'bold' }}>
            {language === 'en' ? 'UR' : 'EN'}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="ln-hero">
        <div className="ln-hero-content">
          <div className="ln-badge">
            <span className="ln-badge-dot" />
            {t('landing.badge')}
          </div>
          <h1>{t('landing.hero_title_1')}<br /><em>{t('landing.hero_title_2')}</em></h1>
          <p className="ln-sub">{t('landing.hero_sub')}</p>
          <p className="ln-urdu">{t('landing.hero_urdu')}</p>
          <div className="ln-cta">
            <Link to="/signup" className="ln-btn-primary ln-btn-lg">
              {t('landing.btn_signup')}
            </Link>
            <a href="#features" className="ln-btn-text">{t('landing.btn_how')}</a>
          </div>
          <p className="ln-note">{t('landing.note_free')}</p>
        </div>

        <div className="ln-hero-card">
          <div className="ln-card-header">
            <div className="ln-avatar">🤖</div>
            <div>
              <div className="ln-ai-name">{t('landing.ai_bot_name')}</div>
              <div className="ln-ai-status">{t('landing.ai_bot_status')}</div>
            </div>
          </div>
          <div className="ln-msg ln-msg-user">{t('landing.ai_msg_user')}</div>
          <div className="ln-msg ln-msg-ai">
            {t('landing.ai_msg_reply').split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
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
        <div className="ln-stat"><div className="ln-stat-num">6</div><div className="ln-stat-label">{t('landing.stats.ai')}</div></div>
        <div className="ln-stat"><div className="ln-stat-num">{language === 'en' ? 'EN|UR' : 'Urdu'}</div><div className="ln-stat-label">{t('landing.stats.lang')}</div></div>
        <div className="ln-stat"><div className="ln-stat-num">Free</div><div className="ln-stat-label">{t('landing.stats.plan')}</div></div>
        <div className="ln-stat"><div className="ln-stat-num">24/7</div><div className="ln-stat-label">{t('landing.stats.tutor')}</div></div>
      </div>

      {/* FEATURES */}
      <section className="ln-features" id="features">
        <div className="ln-section-tag">FEATURES</div>
        <h2 className="ln-section-title" dangerouslySetInnerHTML={{ __html: t('landing.feat_subtitle') }}></h2>
        <p className="ln-section-sub">{t('landing.feat_desc')}</p>

        <div className="ln-features-grid">
          {[
            { icon: '🧠', title: t('landing.features_list.1.title'), desc: t('landing.features_list.1.desc'), tag: 'FREE' },
            { icon: '🃏', title: t('landing.features_list.2.title'), desc: t('landing.features_list.2.desc'), tag: 'FREE' },
            { icon: '⏱️', title: t('landing.features_list.3.title'), desc: t('landing.features_list.3.desc'), tag: 'FREE' },
            { icon: '📅', title: t('landing.features_list.4.title'), desc: t('landing.features_list.4.desc'), tag: 'FREE' },
            { icon: '📊', title: t('landing.features_list.5.title'), desc: t('landing.features_list.5.desc'), tag: 'FREE' },
            { icon: '🇵🇰', title: t('landing.features_list.6.title'), desc: t('landing.features_list.6.desc'), tag: 'FREE' },
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
        <h2 className="ln-section-title">{t('landing.how_title')}</h2>
        <div className="ln-steps">
          {[
            { n: '1', title: t('landing.how_steps.1.title'), desc: t('landing.how_steps.1.desc') },
            { n: '2', title: t('landing.how_steps.2.title'), desc: t('landing.how_steps.2.desc') },
            { n: '3', title: t('landing.how_steps.3.title'), desc: t('landing.how_steps.3.desc') },
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
        <h2 className="ln-section-title">{t('landing.compare_title')}</h2>
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
              [t('landing.compare_rows.1'), '✓', t('landing.compare_partial')],
              [t('landing.compare_rows.2'), '✓', '✗'],
              [t('landing.compare_rows.3'), '✓', '✗'],
              [t('landing.compare_rows.4'), '✓', '✗'],
              [t('landing.compare_rows.5'), '✓', '✗'],
              [t('landing.compare_rows.6'), '✓', '✗'],
              [t('landing.compare_rows.7'), '✓', '✓'],
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
        <h2>{t('landing.cta_title')}</h2>
        <p>{t('landing.cta_sub')}</p>
        <Link to="/signup" className="ln-btn-white">{t('landing.cta_btn')}</Link>
        <p className="ln-cta-note">{t('landing.cta_note')}</p>
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
