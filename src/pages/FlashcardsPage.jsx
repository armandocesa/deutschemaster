import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS, fisherYatesShuffle } from '../utils/constants';
import { useData } from '../DataContext';
import { speak } from '../utils/speech';
import {
  getDifficultWords,
  getProgress,
  markWordStatus,
  saveProgress
} from '../utils/storage';
import { addXP, recordActivity } from '../utils/gamification';
import { useLevelAccess } from '../hooks/useLevelAccess';
import LevelAccessModal from '../components/LevelAccessModal';
import { useLanguage } from '../contexts/LanguageContext';

// Helper to get review words - words marked as incorrect in practice
function getReviewWords() {
  const progress = getProgress();
  return Object.entries(progress.words || {})
    .filter(([_, data]) => data?.status === 'incorrect')
    .map(([wordId]) => wordId);
}

// Helper to record review session (uses saveProgress for cloud sync)
function recordReview(wordId, correct) {
  const progress = getProgress();
  if (!progress.reviews) progress.reviews = {};
  if (!progress.reviews[wordId]) progress.reviews[wordId] = [];
  progress.reviews[wordId].push({ correct, date: Date.now() });
  saveProgress(progress);
}

// Helper to add word to review pile (uses saveProgress for cloud sync)
function addToReview(wordId, german, italian) {
  const progress = getProgress();
  if (!progress.wordsToReview) progress.wordsToReview = [];
  if (!progress.wordsToReview.find(w => w.id === wordId)) {
    progress.wordsToReview.push({ id: wordId, german, italian, addedAt: Date.now() });
    saveProgress(progress);
  }
}

export default function FlashcardsPage({ onNavigate }) {
  const { VOCABULARY_DATA } = useData();
  const { canAccessLevel } = useLevelAccess();
  const { t } = useLanguage();

  // States
  const [mode, setMode] = useState('setup'); // 'setup' | 'playing' | 'finished'
  const [source, setSource] = useState('level'); // 'level' | 'review' | 'difficult'
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [cardsPerSession, setCardsPerSession] = useState(20);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState([]);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [reviewWordsCount, setReviewWordsCount] = useState(0);
  const [difficultWordsCount, setDifficultWordsCount] = useState(0);
  const [lockedLevel, setLockedLevel] = useState(null);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Initialize counts when component mounts
  useEffect(() => {
    const reviewWords = getReviewWords();
    setReviewWordsCount(reviewWords.length);

    const diffWords = getDifficultWords().filter(w => w.type === 'word');
    setDifficultWordsCount(diffWords.length);
  }, []);

  // Generate cards based on source
  const generateCards = (src, level, count) => {
    let allWords = [];

    if (src === 'level') {
      // Get words from the selected level
      const levelData = VOCABULARY_DATA.levels?.[level];
      levelData?.modules?.forEach(module => {
        if (module.words) {
          allWords.push(...module.words.map(w => ({ ...w, id: w.german })));
        }
      });
    } else if (src === 'review') {
      // Get words that were marked as incorrect
      const reviewWordIds = getReviewWords();
      allWords = [];
      Object.values(VOCABULARY_DATA.levels || {}).forEach(levelData => {
        levelData?.modules?.forEach(module => {
          module.words?.forEach(w => {
            if (reviewWordIds.includes(w.german)) {
              allWords.push({ ...w, id: w.german });
            }
          });
        });
      });
    } else if (src === 'difficult') {
      // Get saved difficult words
      const diffWords = getDifficultWords().filter(w => w.type === 'word');
      allWords = diffWords.map(w => ({ ...w, id: w.id || w.german }));
    }

    // Shuffle and take requested amount
    const shuffled = fisherYatesShuffle(allWords);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  const handleLevelChange = (level) => {
    if (!canAccessLevel(level)) {
      setLockedLevel(level);
      return;
    }
    setSelectedLevel(level);
  };

  const handleLoginClick = () => {
    setLockedLevel(null);
    onNavigate('login');
  };

  // Start the flashcard session
  const startSession = () => {
    const newCards = generateCards(source, selectedLevel, cardsPerSession);
    if (newCards.length === 0) {
      setCards([]);
      setMode('empty');
      return;
    }
    setCards(newCards);
    setCurrentIndex(0);
    setFlipped(false);
    setResults([]);
    setSessionStats({ correct: 0, incorrect: 0, total: newCards.length });
    setMode('playing');
  };

  // Mark card as correct
  const handleCorrect = () => {
    const card = cards[currentIndex];
    if (!card) return;

    setResults(prev => [...prev, { id: card.id, correct: true }]);
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + 1
    }));
    addXP(5, 'flashcard_review');
    recordActivity();

    if (source === 'review') {
      recordReview(card.id, true);
    }
    markWordStatus(card.id, true);

    // Auto-advance with functional update to avoid stale closure
    setTimeout(() => {
      setCurrentIndex(prev => {
        if (prev < cards.length - 1) {
          setFlipped(false);
          return prev + 1;
        } else {
          setMode('finished');
          return prev;
        }
      });
    }, 300);
  };

  // Mark card as incorrect
  const handleIncorrect = () => {
    const card = cards[currentIndex];
    if (!card) return;

    setResults(prev => [...prev, { id: card.id, correct: false }]);
    setSessionStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1
    }));

    if (source === 'review') {
      recordReview(card.id, false);
    }
    addToReview(card.id, card.german, card.italian);
    markWordStatus(card.id, false);

    // Auto-advance with functional update to avoid stale closure
    setTimeout(() => {
      setCurrentIndex(prev => {
        if (prev < cards.length - 1) {
          setFlipped(false);
          return prev + 1;
        } else {
          setMode('finished');
          return prev;
        }
      });
    }, 300);
  };

  // Restart with same cards shuffled
  const restartSession = () => {
    const shuffledCards = fisherYatesShuffle(cards);
    setCards(shuffledCards);
    setCurrentIndex(0);
    setFlipped(false);
    setResults([]);
    setSessionStats({ correct: 0, incorrect: 0, total: shuffledCards.length });
    setMode('playing');
  };

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (mode !== 'playing') return;
    const handleKeyDown = (e) => {
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          setFlipped(prev => !prev);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          if (flipped) handleCorrect();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (flipped) handleIncorrect();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, flipped, cards, currentIndex]);

  // Return to setup
  const backToSetup = () => {
    setMode('setup');
    setFlipped(false);
  };

  // SETUP SCREEN
  if (mode === 'setup') {
    return (
      <div className="fc-page">
        <div className="fc-header">
          <h1 className="fc-title">{t('flashcards.title')}</h1>
          <p className="fc-subtitle">{t('flashcards.subtitle')}</p>
        </div>

        {/* Source Selection */}
        <div className="fc-source-section">
          <p className="fc-source-label">{t('flashcards.chooseSource')}</p>

          <div className="fc-source-options">
            {/* Per Livello */}
            <div
              onClick={() => { setSource('level'); setSelectedLevel('A1'); }}
              className={`fc-source-card ${source === 'level' ? 'active' : ''}`}
            >
              <p className="fc-source-card-title">{t('flashcards.byLevel')}</p>
              <p className="fc-source-card-desc">{t('flashcards.byLevelDescription')}</p>
            </div>

            {/* Ripasso Programmato */}
            <div
              onClick={() => setSource('review')}
              className={`fc-source-card ${source === 'review' ? 'active' : ''} ${reviewWordsCount === 0 ? 'disabled' : ''}`}
              style={{ opacity: reviewWordsCount === 0 ? 0.6 : 1, pointerEvents: reviewWordsCount === 0 ? 'none' : 'auto' }}
            >
              <p className="fc-source-card-title">{t('flashcards.scheduledReview')}</p>
              <p className="fc-source-card-desc">{reviewWordsCount} {t('flashcards.reviewWaiting')}</p>
            </div>

            {/* Parole Difficili */}
            <div
              onClick={() => setSource('difficult')}
              className={`fc-source-card ${source === 'difficult' ? 'active' : ''} ${difficultWordsCount === 0 ? 'disabled' : ''}`}
              style={{ opacity: difficultWordsCount === 0 ? 0.6 : 1, pointerEvents: difficultWordsCount === 0 ? 'none' : 'auto' }}
            >
              <p className="fc-source-card-title">{t('flashcards.difficultWords')}</p>
              <p className="fc-source-card-desc">{difficultWordsCount} {t('flashcards.wordsSaved')}</p>
            </div>
          </div>
        </div>

        {/* Level Selector (if 'Per Livello' is selected) */}
        {source === 'level' && (
          <div className="fc-level-section">
            <p className="fc-source-label">{t('flashcards.level')}</p>
            <div className="fc-level-grid">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
                const colors = LEVEL_COLORS[level];
                const isLocked = level !== 'A1' && !canAccessLevel(level);
                return (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level)}
                    disabled={isLocked}
                    className={`fc-level-btn ${selectedLevel === level && !isLocked ? 'fc-level-btn--active' : ''}`}
                    style={{
                      borderColor: selectedLevel === level ? colors.bg : 'transparent',
                      background: selectedLevel === level && !isLocked ? colors.light : 'var(--bg-secondary)',
                      color: selectedLevel === level && !isLocked ? colors.text : isLocked ? 'var(--text-secondary)' : 'var(--text-primary)',
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    {level}
                    {isLocked && <span className="fc-level-lock">🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cards Per Session */}
        <div className="fc-cardcount-section">
          <p className="fc-source-label">{t('flashcards.cardCount')}</p>
          <div className="fc-cardcount-grid">
            {[10, 20, 30, 50].map(num => (
              <button
                key={num}
                onClick={() => setCardsPerSession(num)}
                className={`fc-cardcount-btn ${cardsPerSession === num ? 'active' : ''}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="fc-start-section">
          <button
            onClick={startSession}
            className="fc-start-btn"
          >
            {t('flashcards.start')}
          </button>
        </div>

        <LevelAccessModal
          isOpen={lockedLevel !== null}
          level={lockedLevel}
          onClose={() => setLockedLevel(null)}
          onLoginClick={handleLoginClick}
        />
      </div>
    );
  }

  // EMPTY STATE
  if (mode === 'empty') {
    return (
      <div className="fc-empty">
        <div className="fc-empty-icon">📭</div>
        <h2 className="fc-empty-title">{t('flashcards.noCards') || 'Nessuna carta disponibile'}</h2>
        <p className="fc-empty-desc">{t('flashcards.noCardsHint') || 'Prova a cambiare la sorgente o il livello'}</p>
        <button onClick={backToSetup} className="fc-empty-btn">
          {t('flashcards.back') || 'Torna indietro'}
        </button>
      </div>
    );
  }

  // PLAYING SCREEN
  if (mode === 'playing' && cards.length > 0) {
    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
      <div className="fc-playing">
        {/* Header */}
        <div className="fc-header-section">
          <button
            onClick={backToSetup}
            aria-label="Back to setup"
            className="fc-back-btn"
          >
            <Icons.Back />
          </button>

          {/* Progress bar */}
          <div className="fc-progress-section">
            <div className="fc-progress-track">
              <div className="fc-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="fc-progress-text">
              {t('flashcards.card')} {currentIndex + 1} {t('flashcards.of')} {cards.length}
            </p>
          </div>
        </div>

        {/* Flashcard */}
        <div className="fc-card-container">
          <div
            className="fc-card-wrapper"
            onClick={() => setFlipped(!flipped)}
          >
            <div className={`fc-card-inner ${flipped ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="fc-card-face fc-card-front">
                {/* German Word + Article */}
                <p className="fc-word-main">
                  {currentCard.german}
                  {currentCard.article && <span className="fc-article"> ({currentCard.article})</span>}
                </p>

                {/* Plural */}
                {currentCard.plural && (
                  <p className="fc-word-plural">
                    Pl: {currentCard.plural}
                  </p>
                )}

                {/* Speaker Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.german);
                  }}
                  aria-label="Listen to pronunciation"
                  className="fc-speaker-btn"
                >
                  <Icons.Volume />
                </button>

                {/* Tap to flip hint */}
                <p className="fc-hint">
                  {t('flashcards.tap')}
                </p>
              </div>

              {/* Back */}
              <div className="fc-card-face fc-card-back">
                {/* Italian */}
                <p className="fc-word-translation">
                  {currentCard.italian}
                </p>

                {/* Example */}
                {currentCard.example && (
                  <p className="fc-example">
                    "{currentCard.example}"
                  </p>
                )}

                {/* Tap to flip hint */}
                <p className="fc-hint">
                  {t('flashcards.tap')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Hint */}
        <p className="fc-keyboard-hint">
          {flipped ? '← Non lo so  |  Lo so →' : 'Spazio per girare'}
        </p>

        {/* Action Buttons */}
        {flipped && (
          <div className="fc-action-buttons">
            <button
              onClick={handleIncorrect}
              className="fc-action-btn incorrect"
            >
              <Icons.X />
              {t('flashcards.iDontKnow')}
            </button>

            <button
              onClick={handleCorrect}
              className="fc-action-btn correct"
            >
              <Icons.Check />
              {t('flashcards.iKnow')}
            </button>
          </div>
        )}
      </div>
    );
  }

  // FINISHED SCREEN
  if (mode === 'finished') {
    const percentage = (sessionStats.correct / sessionStats.total) * 100;
    let percentageColor = 'var(--success)'; // green
    if (percentage < 50) percentageColor = 'var(--error)'; // red
    else if (percentage < 70) percentageColor = 'var(--warning)'; // yellow

    const xpEarned = sessionStats.correct * 5;

    return (
      <div className="fc-results">
        {/* Score Section */}
        <div className="fc-results-score">
          <h1 className="fc-results-title">{t('flashcards.sessionCompleted')}</h1>

          {/* Percentage Circle */}
          <div className="fc-results-circle" style={{ borderColor: percentageColor }}>
            <p className="fc-results-percentage" style={{ color: percentageColor }}>
              {Math.round(percentage)}%
            </p>
          </div>

          {/* Stats */}
          <div className="fc-results-stats">
            <p className="fc-results-stats-label">{t('flashcards.results')}</p>
            <div className="fc-results-stats-grid">
              <div className="fc-results-stat">
                <p className="fc-results-stat-value" style={{ color: 'var(--success)' }}>
                  {sessionStats.correct}
                </p>
                <p className="fc-results-stat-label">
                  {t('flashcards.correct')}
                </p>
              </div>
              <div className="fc-results-stat-divider" />
              <div className="fc-results-stat">
                <p className="fc-results-stat-value" style={{ color: 'var(--error)' }}>
                  {sessionStats.incorrect}
                </p>
                <p className="fc-results-stat-label">
                  {t('flashcards.incorrect')}
                </p>
              </div>
              <div className="fc-results-stat-divider" />
              <div className="fc-results-stat">
                <p className="fc-results-stat-value" style={{ color: 'var(--accent-primary)' }}>
                  {sessionStats.total}
                </p>
                <p className="fc-results-stat-label">
                  {t('flashcards.total')}
                </p>
              </div>
            </div>
          </div>

          {/* XP */}
          <div className="fc-results-xp">
            <p className="fc-results-xp-label">{t('flashcards.xpEarned')}</p>
            <p className="fc-results-xp-value">+{xpEarned}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="fc-results-buttons">
          <button
            onClick={restartSession}
            className="fc-results-btn primary"
          >
            {t('flashcards.retry')}
          </button>

          <button
            onClick={backToSetup}
            className="fc-results-btn secondary"
          >
            {t('flashcards.newSession')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
