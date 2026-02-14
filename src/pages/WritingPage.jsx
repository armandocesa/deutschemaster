import React, { useState, useEffect } from 'react';
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

        <div className="writing-setup" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          {/* Exercise Type Selector */}
          <div className="setup-section" style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('writing.exerciseType')}</h3>
            <div className="setup-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['traduzione', 'completamento', 'riordina', 'scrittura_libera'].map(type => (
                <button
                  key={type}
                  className={`setup-option ${exerciseType === type ? 'active' : ''}`}
                  onClick={() => setExerciseType(type)}
                  style={{
                    padding: '12px 16px',
                    border: exerciseType === type ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: exerciseType === type ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  {exerciseTypeLabels[type]}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
              {exerciseType === 'traduzione' && `🇮🇹 ${t('writing.translateTo')}`}
              {exerciseType === 'completamento' && `✏️ ${t('writing.complete')}`}
              {exerciseType === 'riordina' && `🔀 ${t('writing.order')}`}
              {exerciseType === 'scrittura_libera' && `📝 ${t('writing.write')}`}
            </p>
          </div>

          {/* Level Selector */}
          <div className="setup-section" style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('writing.level')}</h3>
            <div className="setup-options levels" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {Object.entries(LEVEL_COLORS).map(([lvl, colors]) => {
                const isLocked = lvl !== 'A1' && !canAccessLevel(lvl);
                return (
                  <button
                    key={lvl}
                    className={`setup-option level ${selectedLevel === lvl ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => handleLevelChange(lvl)}
                    disabled={isLocked}
                    style={{
                      padding: '12px 16px',
                      border: selectedLevel === lvl ? '2px solid' : '1px solid transparent',
                      borderColor: selectedLevel === lvl ? colors.bg : 'var(--border-color)',
                      borderRadius: '8px',
                      backgroundColor: selectedLevel === lvl ? colors.light : isLocked ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                      color: isLocked ? 'var(--text-secondary)' : colors.text,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      opacity: isLocked ? 0.5 : 1
                    }}
                  >
                    {lvl}
                    {isLocked && <span style={{marginLeft: '4px', fontSize: '12px'}}>🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise Count Selector */}
          <div className="setup-section" style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('writing.exerciseCount')}</h3>
            <div className="setup-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[10, 15, 20].map(count => (
                <button
                  key={count}
                  onClick={() => setExerciseCount(count)}
                  style={{
                    padding: '12px 16px',
                    border: exerciseCount === count ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: exerciseCount === count ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
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
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: writingData ? 'var(--primary-color)' : 'var(--bg-secondary)',
              color: writingData ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px',
              cursor: writingData ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
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
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>
              {t('writing.translateTo')}
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontStyle: 'italic' }}>
              {currentQuestion.prompt}
            </p>
          </>
        );
      } else if (currentQuestion.type === 'completamento') {
        return (
          <>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>
              {t('writing.complete')}
            </p>
            <p style={{ fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)' }}>
              {currentQuestion.prompt}
            </p>
          </>
        );
      } else if (currentQuestion.type === 'riordina') {
        return (
          <>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>
              {t('writing.order')}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t('writing.clickWords')}
            </p>
          </>
        );
      } else if (currentQuestion.type === 'scrittura_libera') {
        return (
          <>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>
              {t('writing.write')}
            </p>
            <p style={{ fontSize: '16px', color: 'var(--text-primary)', fontStyle: 'italic' }}>
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
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              minHeight: '60px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'flex-start'
            }}>
              {selectedWords.length === 0 ? (
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('writing.clickWords')}</span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedWords(selectedWords.filter((_, i) => i !== idx))}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '16px'
            }}>
              {words.map((word, idx) => {
                const isSelected = selectedWords.includes(word);
                return (
                  <button
                    key={idx}
                    onClick={() => !isSelected && setSelectedWords([...selectedWords, word])}
                    disabled={isSelected}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                      color: isSelected ? 'var(--text-secondary)' : 'var(--text-primary)',
                      border: `2px solid ${isSelected ? 'var(--bg-secondary)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      cursor: isSelected ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      opacity: isSelected ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
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
            className="writing-input"
            placeholder={currentQuestion.type === 'scrittura_libera' ? t('writing.writeYourAnswer') : t('writing.writeAnswer')}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                checkAnswer();
              }
            }}
            autoFocus
            style={{
              width: '100%',
              padding: '16px',
              fontSize: currentQuestion.type === 'scrittura_libera' ? '16px' : '18px',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              marginBottom: '16px',
              fontWeight: '500',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              minHeight: currentQuestion.type === 'scrittura_libera' ? '120px' : 'auto',
              resize: currentQuestion.type === 'scrittura_libera' ? 'vertical' : 'none'
            }}
          />
        );
      }
    };

    return (
      <div className="writing-page">
        {/* Progress Bar */}
        <div className="quiz-progress" style={{ marginBottom: '24px' }}>
          <div className="progress-bar" style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              className="progress-fill"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                backgroundColor: 'var(--primary-color)',
                height: '100%',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Counter */}
        <div style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>
          {t('writing.exercise')} {currentIndex + 1} {t('writing.of')} {questions.length}
        </div>

        {/* Question Card */}
        <div className="quiz-card" style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px auto'
        }}>
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            {renderExerciseContent()}
            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--primary-color)', marginTop: '12px' }}>
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
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '700',
                  backgroundColor:
                    currentQuestion.type === 'riordina'
                      ? selectedWords.length > 0 ? 'var(--primary-color)' : 'var(--bg-secondary)'
                      : userInput.trim() ? 'var(--primary-color)' : 'var(--bg-secondary)',
                  color:
                    currentQuestion.type === 'riordina'
                      ? selectedWords.length > 0 ? 'white' : 'var(--text-secondary)'
                      : userInput.trim() ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor:
                    currentQuestion.type === 'riordina'
                      ? selectedWords.length > 0 ? 'pointer' : 'not-allowed'
                      : userInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                {t('writing.verify')}
              </button>
            </>
          ) : (
            // Result feedback
            <>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor:
                  results[currentIndex]?.feedback === 'correct' ? 'var(--success-light, #d1fae5)' :
                  results[currentIndex]?.feedback === 'almost' ? 'var(--warning-light, #fef3c7)' :
                  results[currentIndex]?.feedback === 'submitted' ? 'var(--primary-light, rgba(124, 58, 248, 0.1))' :
                  'var(--error-light, #fee2e2)',
                borderLeft: `4px solid ${
                  results[currentIndex]?.feedback === 'correct' ? 'var(--success-color, #10b981)' :
                  results[currentIndex]?.feedback === 'almost' ? 'var(--warning-color, #f59e0b)' :
                  results[currentIndex]?.feedback === 'submitted' ? 'var(--primary-color)' :
                  'var(--error-color, #ef4444)'
                }`
              }}>
                {results[currentIndex]?.feedback === 'correct' && (
                  <p style={{ color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                    {t('writing.correct')}{results[currentIndex]?.xpGain} XP
                  </p>
                )}
                {results[currentIndex]?.feedback === 'almost' && (
                  <p style={{ color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
                    {t('writing.almost')}{results[currentIndex]?.xpGain} XP
                  </p>
                )}
                {results[currentIndex]?.feedback === 'submitted' && (
                  <p style={{ color: 'var(--primary-color)', fontWeight: '600', marginBottom: '8px' }}>
                    {t('writing.submitted')}{results[currentIndex]?.xpGain} XP
                  </p>
                )}
                {results[currentIndex]?.feedback === 'incorrect' && (
                  <p style={{ color: '#991b1b', fontWeight: '600', marginBottom: '8px' }}>
                    {t('writing.incorrect')}
                  </p>
                )}

                {results[currentIndex]?.feedback !== 'correct' && results[currentIndex]?.feedback !== 'submitted' && (
                  <>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                      {t('writing.yourAnswer')} <strong>{results[currentIndex]?.userAnswer}</strong>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {t('writing.correctAnswerIs')} <strong>{results[currentIndex]?.correctAnswer}</strong>
                    </p>
                    {results[currentIndex]?.alternatives && results[currentIndex]?.alternatives.length > 0 && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>
                        {t('writing.alternativeAnswers')} {results[currentIndex]?.alternatives.join(', ')}
                      </p>
                    )}
                  </>
                )}

                {results[currentIndex]?.feedback === 'submitted' && (
                  <>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                      {t('writing.yourAnswer')}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px', fontStyle: 'italic' }}>
                      "{results[currentIndex]?.userAnswer}"
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                      {t('writing.modelAnswer')}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
                      "{results[currentIndex]?.correctAnswer}"
                    </p>
                  </>
                )}
              </div>

              {/* Next button */}
              <button
                onClick={nextQuestion}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '700',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
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
    let scoreColor = '#10b981'; // Green
    if (percentage < 50) scoreColor = '#ef4444'; // Red
    else if (percentage < 70) scoreColor = '#f59e0b'; // Orange
    else if (percentage < 85) scoreColor = '#3b82f6'; // Blue
    else scoreColor = '#10b981'; // Green

    return (
      <div className="writing-page">
        <div className="quiz-finished" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '24px' }}>
          {/* Score Circle */}
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            backgroundColor: scoreColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: `0 8px 32px rgba(0,0,0,0.1)`
          }}>
            <span style={{ fontSize: '48px', fontWeight: '700', color: 'white' }}>
              {percentage}%
            </span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t('writing.completed')}
          </h2>

          {/* Results Summary */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '14px' }}>
              <span style={{ display: 'block', color: '#10b981', fontWeight: '700', fontSize: '16px' }}>
                {correct} {t('writing.correct_count')}
              </span>
              {almost > 0 && (
                <span style={{ display: 'block', color: '#f59e0b', fontWeight: '700', fontSize: '16px', marginTop: '8px' }}>
                  {almost} {t('writing.almost_count')}
                </span>
              )}
              {submitted > 0 && (
                <span style={{ display: 'block', color: 'var(--primary-color)', fontWeight: '700', fontSize: '16px', marginTop: '8px' }}>
                  {submitted} {t('writing.submitted_count')}
                </span>
              )}
              {incorrect > 0 && (
                <span style={{ display: 'block', color: '#ef4444', fontWeight: '700', fontSize: '16px', marginTop: '8px' }}>
                  {incorrect} {t('writing.wrong_count')}
                </span>
              )}
            </p>
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              {t('writing.of')} <strong>{results.length}</strong> {t('writing.exercises')}
            </p>
          </div>

          {/* XP Earned */}
          <div style={{
            backgroundColor: 'var(--primary-light, rgba(124, 58, 248, 0.1))',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{t('writing.xpEarned')}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-color)' }}>
              +{totalXP} XP
            </p>
          </div>

          {/* Mistakes List */}
          {(incorrect > 0 || almost > 0) && (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left',
              maxHeight: '350px',
              overflowY: 'auto'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                {t('writing.reviewAnswers')}
              </h3>
              {results.filter(r => r.feedback === 'incorrect' || r.feedback === 'almost').map((result, idx) => (
                <div key={idx} style={{
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '12px',
                  marginBottom: '12px'
                }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px', fontWeight: '600' }}>
                    {result.question}
                  </p>
                  <p style={{ color: result.feedback === 'almost' ? '#f59e0b' : '#ef4444', fontSize: '13px', marginBottom: '4px' }}>
                    {t('writing.yourAnswer')} <strong>{result.userAnswer}</strong>
                  </p>
                  <p style={{ color: '#10b981', fontSize: '13px' }}>
                    {t('writing.correctAnswerIs')} <strong>{result.correctAnswer}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={startExercise}
              style={{
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '700',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {t('writing.retry')}
            </button>
            <button
              onClick={resetExercise}
              style={{
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '700',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
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
