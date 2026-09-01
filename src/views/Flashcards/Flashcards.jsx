import { useState } from 'react';
import './Flashcards.css';

export default function Flashcards() {
  const [activeDeck, setActiveDeck] = useState('Organic Chemistry');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flashcardsData = [
    {
      id: 1,
      deck: 'Organic Chemistry',
      question: 'What is the Markovnikov Rule in alkene addition reactions?',
      answer: 'In the addition of HX to an unsymmetrical alkene, the hydrogen atom adds to the carbon with the greater number of hydrogen atoms, yielding the more substituted alkyl halide.',
      mastery: 'Good'
    },
    {
      id: 2,
      deck: 'Organic Chemistry',
      question: 'What is the difference between SN1 and SN2 substitution mechanisms?',
      answer: 'SN1 is a two-step mechanism forming a carbocation intermediate (favored in tertiary substrates), whereas SN2 is a single-step concerted mechanism with inversion of stereochemistry (favored in primary substrates).',
      mastery: 'Hard'
    },
    {
      id: 3,
      deck: 'Quantum Physics',
      question: 'What does Heisenberg’s Uncertainty Principle state?',
      answer: 'It is impossible to simultaneously measure both the exact position and exact momentum of a quantum particle with absolute precision (Δx * Δp >= ℏ/2).',
      mastery: 'Easy'
    }
  ];

  const filteredCards = flashcardsData.filter((card) => card.deck === activeDeck);
  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  return (
    <div className="flashcards-view animate-fade-in">
      <div className="flashcards-header">
        <div>
          <h2>🃏 Smart 3D Flashcards & Active Recall</h2>
          <p>Test your memory, rate your recall confidence, and review AI-generated decks.</p>
        </div>
        <button className="btn btn-primary btn-md">
          ✨ Generate AI Flashcards
        </button>
      </div>

      {/* Deck Selector Tabs */}
      <div className="deck-selector-row mt-3">
        <button
          className={`deck-tab-btn ${activeDeck === 'Organic Chemistry' ? 'active' : ''}`}
          onClick={() => { setActiveDeck('Organic Chemistry'); setCurrentIndex(0); setIsFlipped(false); }}
        >
          🧪 Organic Chemistry ({flashcardsData.filter(c => c.deck === 'Organic Chemistry').length})
        </button>
        <button
          className={`deck-tab-btn ${activeDeck === 'Quantum Physics' ? 'active' : ''}`}
          onClick={() => { setActiveDeck('Quantum Physics'); setCurrentIndex(0); setIsFlipped(false); }}
        >
          ⚛️ Quantum Physics ({flashcardsData.filter(c => c.deck === 'Quantum Physics').length})
        </button>
      </div>

      {/* 3D Flashcard Container */}
      <div className="flashcard-workspace mt-4">
        <div className="card-progress-counter mb-2">
          Card <strong>{currentIndex + 1}</strong> of <strong>{filteredCards.length}</strong>
        </div>

        {/* 3D Flip Card */}
        <div
          className={`flashcard-3d-scene ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="flashcard-3d-inner glass-card">
            {/* Front Side */}
            <div className="flashcard-face flashcard-front">
              <span className="badge badge-cyan mb-3">{currentCard.deck} • QUESTION</span>
              <h3 className="card-question-text">{currentCard.question}</h3>
              <span className="flip-hint mt-4">🔄 Click to Flip Card</span>
            </div>

            {/* Back Side */}
            <div className="flashcard-face flashcard-back">
              <span className="badge badge-success mb-3">ANSWER & EXPLANATION</span>
              <p className="card-answer-text">{currentCard.answer}</p>
              <span className="flip-hint mt-4">🔄 Click to Flip Back</span>
            </div>
          </div>
        </div>

        {/* Mastery Confidence Feedback Buttons */}
        <div className="mastery-feedback-bar mt-4">
          <span className="bar-label">Rate Your Confidence:</span>
          <div className="feedback-btns">
            <button className="btn-feedback hard" onClick={handleNext}>🔴 Hard (Review Soon)</button>
            <button className="btn-feedback medium" onClick={handleNext}>🟡 Medium (Good)</button>
            <button className="btn-feedback easy" onClick={handleNext}>🟢 Easy (Mastered)</button>
          </div>
        </div>

        {/* Prev / Next Controls */}
        <div className="nav-controls mt-3">
          <button className="btn btn-secondary btn-sm" onClick={handlePrev}>← Previous Card</button>
          <button className="btn btn-secondary btn-sm" onClick={handleNext}>Next Card →</button>
        </div>
      </div>
    </div>
  );
}
