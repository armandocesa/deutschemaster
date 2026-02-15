import React, { useState, useEffect } from 'react';
import '../styles/pages/writing.css';
import Icons from '../components/Icons';
import { LEVEL_COLORS, fisherYatesShuffle } from '../utils/constants';
import { useData } from '../DataContext';
import { addXP, recordActivity } from '../utils/gamification';
import { speak } from '../utils/speech';
import { useLevelAccess } from '../hooks/useLevelAccess';
import LevelAccessModal from '../components/LevelAccessModal';
import { useLanguage } from '../contexts/LanguageContext';

const fetchLangJSON = async (path, language) => {
  if (language === 'en') {
    try {
      const res = await fetch(`/data/en/${path}`);
      if (res.ok) return await res.json();
    } catch {}
  }
  const res = await fetch(`/data/${path}`);
  return res.ok ? await res.json() : null;
};

// Levenshtein distance function for checking "almost correct" answers
function levenshtein(a, b) {
  const aStr = (a || '').toLowerCase().trim();
  const bStr = (b || '').toLowerCase().trim();
  const matrix = [];

  for (let i = 0; i <= bStr.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= aStr.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bStr.length; i++) {
    for (let j = 1; j <= aStr.length; j++) {
      if (bStr.charAt(i - 1) === aStr.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[bStr.length][aStr.length];
}

export default function WritingPage({ onNavigate }) {
  const { VOCABULARY_DATA } = useData();
  const { canAccessLevel } = useLevelAccess();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState('setup');
  const [exerciseType, setExerciseType] = useState('traduzione');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [exerciseCount, setExerciseCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState([]);
  const [lockedLevel, setLockedLevel] = useState(null);
  const [writingData, setWritingData] = useState(null);

  // Load writing data on mount or language change
  useEffect(() => {
    const loadWritingData = async () => {
      try {
        const data = await fetchLangJSON('writing.json', language);
        setWritingData(data);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error loading writing data:', error);
      }
    };
    loadWritingData();
  }, [language]);

  // Generate questions based on exercise type
  const generateQuestions = (type, level, count) => {
    const qs = [];

    if (!writingData) return qs;

    const levelData = writingData.levels?.[level];
    if (!levelData?.exercises) return qs;

    // Filter exercises by type
    const typeExercises = levelData.exercises.filter(ex => ex.type === type);

    // Shuffle and select
    const selected = fisherYatesShuffle(typeExercises).slice(0, count);

    selected.forEach(exercise => {
      qs.push({
        ...exercise,
        id: exercise.id,
        type: exercise.type,
        prompt: exercise.prompt,
        answer: exercise.answer,
        hints: exercise.hints || [],
        alternatives: exercise.alternatives || []
      });
    });

    return qs;
  };

  const handleLevelChange = (lvl) => {
    if (!canAccessLevel(lvl)) {
      setLockedLevel(lvl);
      return;
    }
    setSelectedLevel(lvl);
  };

  const handleLoginClick = () => {
    setLockedLevel(null);
    onNavigate('login');
  };

  // Start the exercise
  const startExercise = () => {
    const qs = generateQuestions(exerciseType, selectedLevel, exerciseCount);
    setQuestions(qs);
    setCurrentIndex(0);
    setUserInput('');
    setShowResult(false);
    setResults([]);
    setMode('playing');
  };

  // Check answer based on exercise type
  const checkAnswer = () => {
    if (!userInput.trim() && questions[currentIndex]?.type !== 'riordina') return;

    const currentQuestion = questions[currentIndex];
    let isCorrect = false;
    let feedback = 'incorrect';
    let xpGain = 0;
    let userAnswerToShow = userInput;

    if (currentQuestion.type === 'riordina') {
      // For riordina, check word order
      const userAnswer = selectedWords.join(' ').trim();
      const correctAnswer = currentQuestion.answer.toLowerCase().trim();
      const userAnswerLower = userAnswer.toLowerCase();

      isCorrect = userAnswerLower === correctAnswer;
      if (isCorrect) {
        feedback = 'correct';
        xpGain = 20;
      } else {
        feedback = 'incorrect';
      }
      userAnswerToShow = userAnswer;
    } else if (currentQuestion.type === 'scrittura_libera') {
      // For free writing, just check if something was written
      if (userInput.trim()) {
        feedback = 'submitted';
        xpGain = 10;
        isCorrect = true;
      }
    } else {
      // For traduzione and completamento
      const userAnswer = userInput.trim();
      const correctAnswer = currentQuestion.answer.toLowerCase().trim();
      const userAnswerLower = userAnswer.toLowerCase();

      isCorrect = userAnswerLower === correctAnswer;

      if (isCorrect) {
        feedback = 'correct';
        xpGain = 15;
      } else {
        // Check alternatives
        const isAlternative = currentQuestion.alternatives.some(alt =>
          alt.toLowerCase().trim() === userAnswerLower
        );

        if (isAlternative) {
          feedback = 'correct';
          xpGain = 15;
          isCorrect = true;
        } else {
          // Check for "almost correct" using Levenshtein distance
          const distance = levenshtein(userAnswer, correctAnswer);
          if (distance <= 2 && correctAnswer.length > 3) {
            feedback = 'almost';
            xpGain = 5;
          }
        }
      }
    }

    const result = {
      question: currentQuestion.prompt,
      userAnswer: userAnswerToShow,
      correctAnswer: currentQuestion.answer,
      alternatives: currentQuestion.alternatives || [],
      isCorrect,
      feedback,
      xpGain,
      type: currentQuestion.type
    };

    setResults(prev => [...prev, result]);
    setShowResult(true);

    // Add XP
    if (xpGain > 0) {
      addXP(xpGain, 'writing_correct');
      recordActivity();
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setSelectedWords([]);
      setShowResult(false);
    } else {
      setMode('finished');
    }
  };

  // Reset and go back to setup
  const resetExercise = () => {
    setMode('setup');
    setUserInput('');
    setSelectedWords([]);
    setShowResult(false);
    setCurrentIndex(0);
    setResults([]);
  };

  // Keyboard handler
  useEffect(() => {
    if (mode !== 'playing') return;

    const handler = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!showResult) {
          checkAnswer();
        } else {
          nextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, showResult, userInput, currentIndex, questions]);

  // SETUP SCREEN
  if (mode === 'setup') {
    const exerciseTypeLabels = {
      traduzione: t('writing.translate'),
      completamento: t('writing.completion'),
      riordina: t('writing.reorder'),
      scrittura_libera: t('writing.freeWriting')
    };

    return (
      <div className="writing-page">
        <h1 className="page-title">{t('writing.title')}</h1>
        <p className="page-subtitle">{t('writing.setupSubtitle')}</p>

        <div className="writing-setup">
          {/* Exercise Type Selector */}
          <div className="setup-section">
            <h3>{t('writing.exerciseType')}</h3>
            <div className="setup-options">
              {['traduzione', 'completamento', 'riordina', 'scrittura_libera'].map(type => (
                <button
                  key={type}
                  className={`setup-option ${exerciseType === type ? 'active' : ''}`}
                  onClick={() => setExerciseType(type)}
                >
                  {exerciseTypeLabels[type]}
                </button>
              ))}
            </div>
            <p>
              {exerciseType === 'traduzione' && `🇮🇹 ${t('writing.translateTo')}`}
              {exerciseType === 'completamento' && `✏️ ${t('writing.complete')}`}
              {exerciseType === 'riordina' && `🔀 ${t('writing.order')}`}
              {exerciseType === 'scrittura_libera' && `📝 ${t('writing.write')}`}
            </p>
          </div>

          {/* Level Selector */}
          <div className="setup-section">
            <h3>{t('writing.level')}</h3>
            <div className="setup-options levels">
              {Object.entries(LEVEL_COLORS).map(([lvl, colors]) => {
                const isLocked = lvl !== 'A1' && !canAccessLevel(lvl);
                return (
                  <button
                    key={lvl}
                    className={`setup-option ${selectedLevel === lvl ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => handleLevelChange(lvl)}
                    disabled={isLocked}
                  >
                    {lvl}
                    {isLocked && <span>🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise Count Selector */}
          <div className="setup-section">
            <h3>{t('writing.exerciseCount')}</h3>
            <div className="setup-options">
              {[10, 15, 20].map(count => (
                <button
                  key={count}
                  className={`setup-option ${exerciseCount === count ? 'active' : ''}`}
                  onClick={() => setExerciseCount(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startExercise}
            disabled={!writingData}
            className="writing-start-btn"
          >
            {writingData ? t('writing.start') : t('writing.loading')}
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

  // PLAYING SCREEN
  if (mode === 'playing' && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const isAnswered = showResult;

    const renderExerciseContent = () => {
      if (currentQuestion.type === 'traduzione') {
        return (
          <>
            <p className="writing-card__label">
              {t('writing.translateTo')}
            </p>
            <p className="writing-card__prompt">
              {currentQuestion.prompt}
            </p>
          </>
        );
      } else if (currentQuestion.type === 'completamento') {
        return (
          <>
            <p className="writing-card__label">
              {t('writing.complete')}
            </p>
            <p className="writing-card__prompt writing-card__prompt--completion">
              {currentQuestion.prompt}
            </p>
          </>
        );
      } else if (currentQuestion.type === 'riordina') {
        return (
          <>
            <p className="writing-card__label">
              {t('writing.order')}
            </p>
            <p className="writing-card__instruction">
              {t('writing.clickWords')}
            </p>
          </>
        );
      } else if (currentQuestion.type === 'scrittura_libera') {
        return (
          <>
            <p className="writing-card__label">
              {t('writing.write')}
            </p>
            <p className="writing-card__prompt">
              {currentQuestion.prompt}
            </p>
          </>
        );
      }
    };

    const renderInput = () => {
      if (currentQuestion.type === 'riordina') {
        // Word chips for reordering
        const words = currentQuestion.prompt;
        const availableWords = words.filter((_, idx) => !selectedWords.includes(currentQuestion.prompt[idx]));

        return (
          <>
            <div className="writing-word-container">
              {selectedWords.length === 0 ? (
                <span className="writing-word-placeholder">{t('writing.clickWords')}</span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedWords(selectedWords.filter((_, i) => i !== idx))}
                    className="writing-word-selected"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            <div className="writing-words-available">
              {words.map((word, idx) => {
                const isSelected = selectedWords.includes(word);
                return (
                  <button
                    key={idx}
                    onClick={() => !isSelected && setSelectedWords([...selectedWords, word])}
                    disabled={isSelected}
                    className="writing-word-available"
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </>
        );
      } else {
        // Text input for other types
        return (
          <input
            type="text"
            className={`writing-input ${currentQuestion.type === 'scrittura_libera' ? 'writing-input--free-writing' : ''}`}
            placeholder={currentQuestion.type === 'scrittura_libera' ? t('writing.writeYourAnswer') : t('writing.writeAnswer')}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                checkAnswer();
              }
            }}
            autoFocus
          />
        );
      }
    };

    return (
      <div className="writing-page">
        {/* Progress Bar */}
        <div className="writing-progress">
          <div className="writing-progress__bar">
            <div
              className="writing-progress__fill"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Counter */}
        <div className="writing-counter">
          {t('writing.exercise')} {currentIndex + 1} {t('writing.of')} {questions.length}
        </div>

        {/* Question Card */}
        <div className="writing-card">
          <div className="writing-card__content">
            {renderExerciseContent()}
            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <p className="writing-card__hint">
                💡 {currentQuestion.hints[0]}
              </p>
            )}
          </div>

          {/* Input and Button */}
          {!isAnswered ? (
            <>
              {renderInput()}
              <button
                onClick={checkAnswer}
                disabled={currentQuestion.type === 'riordina' ? selectedWords.length === 0 : !userInput.trim()}
                className="writing-check-btn"
              >
                {t('writing.verify')}
              </button>
            </>
          ) : (
            // Result feedback
            <>
              <div className={`writing-feedback writing-feedback--${results[currentIndex]?.feedback}`}>
                {results[currentIndex]?.feedback === 'correct' && (
                  <p className="writing-feedback__text">
                    {t('writing.correct')} {results[currentIndex]?.xpGain} XP
                  </p>
                )}
                {results[currentIndex]?.feedback === 'almost' && (
                  <p className="writing-feedback__text">
                    {t('writing.almost')} {results[currentIndex]?.xpGain} XP
                  </p>
                )}
                {results[currentIndex]?.feedback === 'submitted' && (
                  <p className="writing-feedback__text">
                    {t('writing.submitted')} {results[currentIndex]?.xpGain} XP
                  </p>
                )}
                {results[currentIndex]?.feedback === 'incorrect' && (
                  <p className="writing-feedback__text">
                    {t('writing.incorrect')}
                  </p>
                )}

                {results[currentIndex]?.feedback !== 'correct' && results[currentIndex]?.feedback !== 'submitted' && (
                  <>
                    <p className="writing-feedback__detail">
                      {t('writing.yourAnswer')} <strong>{results[currentIndex]?.userAnswer}</strong>
                    </p>
                    <p className="writing-feedback__detail">
                      {t('writing.correctAnswerIs')} <strong>{results[currentIndex]?.correctAnswer}</strong>
                    </p>
                    {results[currentIndex]?.alternatives && results[currentIndex]?.alternatives.length > 0 && (
                      <p className="writing-feedback__answer">
                        {t('writing.alternativeAnswers')} {results[currentIndex]?.alternatives.join(', ')}
                      </p>
                    )}
                  </>
                )}

                {results[currentIndex]?.feedback === 'submitted' && (
                  <>
                    <p className="writing-feedback__detail">
                      {t('writing.yourAnswer')}
                    </p>
                    <p className="writing-feedback__answer">
                      "{results[currentIndex]?.userAnswer}"
                    </p>
                    <p className="writing-feedback__detail">
                      {t('writing.modelAnswer')}
                    </p>
                    <p className="writing-feedback__answer">
                      "{results[currentIndex]?.correctAnswer}"
                    </p>
                  </>
                )}
              </div>

              {/* Next button */}
              <button
                onClick={nextQuestion}
                className="writing-next-btn"
              >
                {currentIndex < questions.length - 1 ? t('writing.next') : t('writing.seeResults')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // FINISHED SCREEN
  if (mode === 'finished') {
    const correct = results.filter(r => r.feedback === 'correct').length;
    const almost = results.filter(r => r.feedback === 'almost').length;
    const submitted = results.filter(r => r.feedback === 'submitted').length;
    const incorrect = results.filter(r => r.feedback === 'incorrect').length;
    const totalScored = correct + almost + submitted;
    const percentage = results.length > 0 ? Math.round((totalScored / results.length) * 100) : 0;
    const totalXP = results.reduce((sum, r) => sum + (r.xpGain || 0), 0);

    // Determine color based on percentage
    let scoreColor = 'var(--success)'; // Green
    if (percentage < 50) scoreColor = 'var(--error)'; // Red
    else if (percentage < 70) scoreColor = 'var(--warning)'; // Orange
    else if (percentage < 85) scoreColor = 'var(--info)'; // Blue
    else scoreColor = 'var(--success)'; // Green

    return (
      <div className="writing-page">
        <div className="writing-finished">
          {/* Score Circle */}
          <div className="writing-score-circle" style={{ backgroundColor: scoreColor }}>
            <span className="writing-score-percentage">
              {percentage}%
            </span>
          </div>

          <h2 className="page-title">
            {t('writing.completed')}
          </h2>

          {/* Results Summary */}
          <div className="writing-results-summary">
            <div>
              <div className="writing-results__item writing-results__item--correct">
                <span>{correct} {t('writing.correct_count')}</span>
              </div>
              {almost > 0 && (
                <div className="writing-results__item writing-results__item--almost">
                  <span>{almost} {t('writing.almost_count')}</span>
                </div>
              )}
              {submitted > 0 && (
                <div className="writing-results__item writing-results__item--submitted">
                  <span>{submitted} {t('writing.submitted_count')}</span>
                </div>
              )}
              {incorrect > 0 && (
                <div className="writing-results__item writing-results__item--incorrect">
                  <span>{incorrect} {t('writing.wrong_count')}</span>
                </div>
              )}
            </div>
            <p className="writing-results-summary__footer">
              {t('writing.of')} <strong>{results.length}</strong> {t('writing.exercises')}
            </p>
          </div>

          {/* XP Earned */}
          <div className="writing-xp-earned">
            <p className="writing-xp-earned__label">{t('writing.xpEarned')}</p>
            <p className="writing-xp-earned__value">
              +{totalXP} XP
            </p>
          </div>

          {/* Mistakes List */}
          {(incorrect > 0 || almost > 0) && (
            <div className="writing-mistakes-section">
              <h3>
                {t('writing.reviewAnswers')}
              </h3>
              {results.filter(r => r.feedback === 'incorrect' || r.feedback === 'almost').map((result, idx) => (
                <div key={idx} className="writing-mistake-item">
                  <p className="writing-mistake-item__question">
                    {result.question}
                  </p>
                  <p className="writing-mistake-item__yours">
                    {t('writing.yourAnswer')} <strong>{result.userAnswer}</strong>
                  </p>
                  <p className="writing-mistake-item__correct">
                    {t('writing.correctAnswerIs')} <strong>{result.correctAnswer}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="writing-actions">
            <button
              onClick={startExercise}
              className="writing-retry-btn"
            >
              {t('writing.retry')}
            </button>
            <button
              onClick={resetExercise}
              className="writing-new-session-btn"
            >
              {t('writing.newSession')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
