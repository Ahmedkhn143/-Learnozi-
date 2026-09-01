import { useState } from 'react';
import './AiExplainer.css';

export default function AiExplainer() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your AI Explainer Assistant. Ask me any complex concept in Organic Chemistry, Calculus, Physics, or Computer Science, and I will break it down into easy digestible points.',
      takeaways: ['Supports 5-year-old summaries to Expert deep dives', 'Instant formula explanations with step-by-step examples']
    }
  ]);
  const [promptInput, setPromptInput] = useState('');
  const [depthLevel, setDepthLevel] = useState('High School');
  const [loading, setLoading] = useState(false);

  const presets = [
    '🧪 Explain Bayes Theorem with a simple example',
    '⚡ How does React Virtual DOM work?',
    '⚛️ What is Quantum Entanglement in plain English?',
    '📐 Derive the Quadratic Formula step-by-step'
  ];

  const handleSend = (e) => {
    e?.preventDefault();
    if (!promptInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: promptInput };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = promptInput;
    setPromptInput('');
    setLoading(true);

    setTimeout(() => {
      let aiResponseText = `Here is a breakdown of "${currentQuery}" customized for the [${depthLevel}] level:\n\n1. Core Concept:\nThis topic revolves around understanding how fundamental variables interact under specific rules.\n\n2. Key Formula / Logic:\nF(x) = ∫ (f(x) * g(x)) dx\n\n3. Practical Analogy:\nThink of this system like a balance scale — when you modify one input parameter, the equilibrium shifts predictably.`;

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        takeaways: [
          'Master the fundamental formula before working through edge cases',
          'Practice 3 sample problems to lock in your understanding'
        ]
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="ai-explainer-view animate-fade-in">
      <div className="explainer-header">
        <div>
          <h2>✨ AI Explainer Studio</h2>
          <p>Get instant crystal-clear breakdowns for difficult concepts and exam questions.</p>
        </div>
        <div className="depth-selector-box">
          <label>Explanation Depth:</label>
          <select value={depthLevel} onChange={(e) => setDepthLevel(e.target.value)}>
            <option value="5-Year-Old">👶 Like I am 5</option>
            <option value="High School">🎓 High School</option>
            <option value="University">🏛️ University Level</option>
            <option value="Expert">🔬 Expert Deep Dive</option>
          </select>
        </div>
      </div>

      {/* Preset Prompt Pills */}
      <div className="preset-pills-row mt-3">
        {presets.map((preset, idx) => (
          <button key={idx} className="preset-pill-btn" onClick={() => setPromptInput(preset.replace(/^[^\s]+\s/, ''))}>
            {preset}
          </button>
        ))}
      </div>

      {/* Main Chat Workspace */}
      <div className="glass-card ai-chat-container mt-3">
        <div className="chat-messages-box">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrap ${msg.sender}`}>
              <div className="chat-avatar">
                {msg.sender === 'ai' ? '🤖' : '👤'}
              </div>
              <div className="chat-bubble-content">
                <div className="bubble-header">
                  <span className="sender-name">{msg.sender === 'ai' ? 'Learnozi AI' : 'You'}</span>
                </div>
                <div className="bubble-text">{msg.text}</div>

                {msg.takeaways && (
                  <div className="takeaways-box mt-3">
                    <span className="takeaways-title">💡 Key Takeaways:</span>
                    <ul>
                      {msg.takeaways.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-wrap ai">
              <div className="chat-avatar">🤖</div>
              <div className="chat-bubble-content">
                <span className="typing-indicator">Learnozi AI is thinking... ✨</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form className="chat-input-bar mt-3" onSubmit={handleSend}>
          <input
            type="text"
            placeholder={`Ask AI Explainer at [${depthLevel}] depth...`}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !promptInput.trim()}>
            Send Prompt ✨
          </button>
        </form>
      </div>
    </div>
  );
}
