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
  }, [mode, flipped]);

  // Return to setup
  const backToSetup = () => {
    setMode('setup');
    setFlipped(false);
  };

  // SETUP SCREEN
  if (mode === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '100px' }}>
        <div style={{ padding: '20px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '20px 0 5px 0' }}>{t('flashcards.title')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0' }}>{t('flashcards.subtitle')}</p>
        </div>

        {/* Source Selection */}
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>{t('flashcards.chooseSource')}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Per Livello */}
            <div
              onClick={() => { setSource('level'); setSelectedLevel('A1'); }}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: source === 'level' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                border: source === 'level' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: source === 'level' ? 'white' : 'var(--text-primary)',
              }}
            >
              <p style={{ fontWeight: 600, margin: '0 0 8px 0' }}>{t('flashcards.byLevel')}</p>
              <p style={{ fontSize: '13px', margin: '0', opacity: 0.8 }}>{t('flashcards.byLevelDescription')}</p>
            </div>

            {/* Ripasso Programmato */}
            <div
              onClick={() => setSource('review')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: source === 'review' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                border: source === 'review' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: source === 'review' ? 'white' : 'var(--text-primary)',
                opacity: reviewWordsCount === 0 ? 0.6 : 1,
                pointerEvents: reviewWordsCount === 0 ? 'none' : 'auto',
              }}
            >
              <p style={{ fontWeight: 600, margin: '0 0 8px 0' }}>{t('flashcards.scheduledReview')}</p>
              <p style={{ fontSize: '13px', margin: '0', opacity: 0.8 }}>{reviewWordsCount} {t('flashcards.reviewWaiting')}</p>
            </div>

            {/* Parole Difficili */}
            <div
              onClick={() => setSource('difficult')}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: source === 'difficult' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                border: source === 'difficult' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: source === 'difficult' ? 'white' : 'var(--text-primary)',
                opacity: difficultWordsCount === 0 ? 0.6 : 1,
                pointerEvents: difficultWordsCount === 0 ? 'none' : 'auto',
              }}
            >
              <p style={{ fontWeight: 600, margin: '0 0 8px 0' }}>{t('flashcards.difficultWords')}</p>
              <p style={{ fontSize: '13px', margin: '0', opacity: 0.8 }}>{difficultWordsCount} {t('flashcards.wordsSaved')}</p>
            </div>
          </div>
        </div>

        {/* Level Selector (if 'Per Livello' is selected) */}
        {source === 'level' && (
          <div style={{ padding: '0 20px', marginBottom: '30px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>{t('flashcards.level')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
                const colors = LEVEL_COLORS[level];
                const isLocked = level !== 'A1' && !canAccessLevel(level);
                return (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level)}
                    disabled={isLocked}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: selectedLevel === level ? `2px solid ${colors.bg}` : '2px solid transparent',
                      background: selectedLevel === level && !isLocked ? colors.light : isLocked ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                      color: selectedLevel === level && !isLocked ? colors.text : isLocked ? 'var(--text-secondary)' : 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    {level}
                    {isLocked && <span style={{marginLeft: '4px', fontSize: '12px'}}>🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cards Per Session */}
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>{t('flashcards.cardCount')}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[10, 20, 30, 50].map(num => (
              <button
                key={num}
                onClick={() => setCardsPerSession(num)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: cardsPerSession === num ? '2px solid var(--accent-primary)' : '2px solid var(--bg-secondary)',
                  background: cardsPerSession === num ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: cardsPerSession === num ? 'white' : 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div style={{ padding: '20px', paddingTop: '40px' }}>
          <button
            onClick={startSession}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
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
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>📭</div>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('flashcards.noCards') || 'Nessuna carta disponibile'}</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{t('flashcards.noCardsHint') || 'Prova a cambiare la sorgente o il livello'}</p>
        <button onClick={backToSetup} style={{ padding: '10px 24px', background: 'var(--gradient-1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
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
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '100px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 0 20px' }}>
          <button
            onClick={backToSetup}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '0',
              marginBottom: '20px',
            }}
          >
            <Icons.Back />
          </button>

          {/* Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                width: `${progress}%`,
                transition: 'width 0.3s',
              }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0', textAlign: 'right' }}>
              {t('flashcards.card')} {currentIndex + 1} {t('flashcards.of')} {cards.length}
            </p>
          </div>
        </div>

        {/* Flashcard */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 40px 20px' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              height: '320px',
              position: 'relative',
              cursor: 'pointer',
              perspective: '1000px',
            }}
            onClick={() => setFlipped(!flipped)}
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transition: 'transform 0.6s',
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-secondary))',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--accent-primary)',
                  backfaceVisibility: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Article */}
                {currentCard.article && (
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    marginBottom: '8px',
                  }}>
                    {currentCard.article}
                  </span>
                )}

                {/* German Word */}
                <p style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: '0 0 20px 0',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                  {currentCard.german}
                </p>

                {/* Plural */}
                {currentCard.plural && (
                  <p style={{
                    fontSize: '16px',
                    color: 'var(--text-secondary)',
                    margin: '0 0 20px 0',
                    fontStyle: 'italic',
                  }}>
                    Pl: {currentCard.plural}
                  </p>
                )}

                {/* Speaker Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentCard.german);
                  }}
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <Icons.Volume />
                </button>

                {/* Tap to flip hint */}
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginTop: '20px',
                  textAlign: 'center',
                  opacity: 0.7,
                }}>
                  {t('flashcards.tap')}
                </p>
              </div>

              {/* Back */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Italian */}
                <p style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: 'white',
                  margin: '0 0 20px 0',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                  {currentCard.italian}
                </p>

                {/* Example */}
                {currentCard.example && (
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    margin: '0',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    marginTop: '20px',
                  }}>
                    "{currentCard.example}"
                  </p>
                )}

                {/* Tap to flip hint */}
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: 'auto',
                  paddingTop: '20px',
                  textAlign: 'center',
                }}>
                  {t('flashcards.tap')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Hint */}
        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', margin: '0', padding: '0 20px' }}>
          {flipped ? '← Non lo so  |  Lo so →' : 'Spazio per girare'}
        </p>

        {/* Action Buttons */}
        {flipped && (
          <div style={{ padding: '20px', display: 'flex', gap: '12px' }}>
            <button
              onClick={handleIncorrect}
              style={{
                flex: 1,
                padding: '14px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.96)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
              <Icons.X />
              {t('flashcards.iDontKnow')}
            </button>

            <button
              onClick={handleCorrect}
              style={{
                flex: 1,
                padding: '14px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.96)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
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
    let percentageColor = '#10b981'; // green
    if (percentage < 50) percentageColor = '#ef4444'; // red
    else if (percentage < 70) percentageColor = '#f59e0b'; // yellow

    const xpEarned = sessionStats.correct * 5;

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '20px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Score Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>{t('flashcards.sessionCompleted')}</h1>

          {/* Percentage Circle */}
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: `8px solid ${percentageColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px auto',
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '48px',
                fontWeight: 800,
                color: percentageColor,
                margin: '0',
              }}>
                {Math.round(percentage)}%
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>{t('flashcards.results')}</p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', margin: '0' }}>
                  {sessionStats.correct}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {t('flashcards.correct')}
                </p>
              </div>
              <div style={{ width: '1px', background: 'var(--bg-primary)' }} />
              <div>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444', margin: '0' }}>
                  {sessionStats.incorrect}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {t('flashcards.incorrect')}
                </p>
              </div>
              <div style={{ width: '1px', background: 'var(--bg-primary)' }} />
              <div>
                <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)', margin: '0' }}>
                  {sessionStats.total}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {t('flashcards.total')}
                </p>
              </div>
            </div>
          </div>

          {/* XP */}
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '30px',
          }}>
            <p style={{ fontSize: '12px', opacity: 0.9, margin: '0 0 4px 0' }}>{t('flashcards.xpEarned')}</p>
            <p style={{ fontSize: '32px', fontWeight: 800, margin: '0' }}>+{xpEarned}</p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={restartSession}
            style={{
              padding: '14px',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.96)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            {t('flashcards.retry')}
          </button>

          <button
            onClick={backToSetup}
            style={{
              padding: '14px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '2px solid var(--bg-secondary)',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.96)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            {t('flashcards.newSession')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
