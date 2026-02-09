import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS, fisherYatesShuffle } from '../utils/constants';
import { useData } from '../DataContext';
import { addXP, recordActivity } from '../utils/gamification';
import { speak } from '../utils/speech';
import { useLevelAccess } from '../hooks/useLevelAccess';
import LevelAccessModal from '../components/LevelAccessModal';

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
  const [mode, setMode] = useState('setup');
  const [exerciseType, setExerciseType] = useState('word');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [exerciseCount, setExerciseCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState([]);
  const [lockedLevel, setLockedLevel] = useState(null);

  // Generate hint from German word (first letter + dashes)
  const getHint = (word) => {
    if (!word || word.length === 0) return '';
    return word[0] + '_'.repeat(Math.max(0, word.length - 1));
  };

  // Generate questions based on exercise type
  const generateQuestions = (type, level, count) => {
    const qs = [];
    const levelData = VOCABULARY_DATA.levels?.[level];
    if (!levelData?.modules) return qs;

    let allWords = [];
    levelData.modules.forEach(mod => {
      if (mod.words) {
        mod.words.forEach(word => allWords.push(word));
      }
    });

    if (type === 'word') {
      // Word translation: Italian to German
      const selected = fisherYatesShuffle(allWords).slice(0, count);
      selected.forEach(word => {
        qs.push({
          prompt: word.italian,
          answer: (word.german || '').split(' ')[0], // Remove article if present
          fullGerman: word.german,
          hint: getHint(word.german)
        });
      });
    } else {
      // Sentence translation: use example field if available
      const wordsWithExamples = allWords.filter(w => w.example && w.example.trim());
      const selected = fisherYatesShuffle(wordsWithExamples).slice(0, count);
      selected.forEach(word => {
        // Parse example - expected format: "German example - Italian example"
        const exampleText = word.example || '';
        const parts = exampleText.split(' - ');

        if (parts.length === 2) {
          const germanPart = parts[0].trim();
          const italianPart = parts[1].trim();
          qs.push({
            prompt: italianPart,
            answer: germanPart,
            fullGerman: germanPart,
            hint: ''
          });
        } else {
          // Fallback: use the example as-is or create a simple sentence
          qs.push({
            prompt: exampleText,
            answer: word.german,
            fullGerman: word.german,
            hint: ''
          });
        }
      });
    }

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

  // Check answer
  const checkAnswer = () => {
    if (!userInput.trim()) return;

    const currentQuestion = questions[currentIndex];
    const userAnswer = userInput.trim();
    const correctAnswer = currentQuestion.answer.toLowerCase().trim();
    const userAnswerLower = userAnswer.toLowerCase();

    let isCorrect = userAnswerLower === correctAnswer;
    let feedback = 'incorrect';
    let xpGain = 0;

    if (isCorrect) {
      feedback = 'correct';
      xpGain = 15;
    } else {
      // Check for "almost correct" using Levenshtein distance
      const distance = levenshtein(userAnswer, correctAnswer);
      if (distance <= 2 && correctAnswer.length > 3) {
        feedback = 'almost';
        xpGain = 5;
      }
    }

    const result = {
      question: currentQuestion.prompt,
      userAnswer: userInput,
      correctAnswer: currentQuestion.fullGerman,
      isCorrect,
      feedback,
      xpGain
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
      setShowResult(false);
    } else {
      setMode('finished');
    }
  };

  // Reset and go back to setup
  const resetExercise = () => {
    setMode('setup');
    setUserInput('');
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
    return (
      <div className="writing-page">
        <h1 className="page-title">Esercizi di Scrittura</h1>
        <p className="page-subtitle">Scrivi la traduzione tedesca</p>

        <div className="writing-setup" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
          {/* Exercise Type Selector */}
          <div className="setup-section" style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Tipo di esercizio</h3>
            <div className="setup-options" style={{ display: 'flex', gap: '12px' }}>
              <button
                className={`setup-option ${exerciseType === 'word' ? 'active' : ''}`}
                onClick={() => setExerciseType('word')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: exerciseType === 'word' ? 'var(--primary-color)' : 'var(--bg-secondary)',
                  color: exerciseType === 'word' ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Parole
              </button>
              <button
                className={`setup-option ${exerciseType === 'sentence' ? 'active' : ''}`}
                onClick={() => setExerciseType('sentence')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: exerciseType === 'sentence' ? 'var(--primary-color)' : 'var(--bg-secondary)',
                  color: exerciseType === 'sentence' ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                Frasi
              </button>
            </div>
          </div>

          {/* Level Selector */}
          <div className="setup-section" style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Livello</h3>
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
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Numero di esercizi</h3>
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
            Inizia
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
          Esercizio {currentIndex + 1} di {questions.length}
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
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>
              Traduci in tedesco:
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {currentQuestion.prompt}
            </p>

            {/* Show hint for word type */}
            {exerciseType === 'word' && currentQuestion.hint && (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px', fontFamily: 'monospace' }}>
                {currentQuestion.hint}
              </p>
            )}
          </div>

          {/* Input and Button */}
          {!isAnswered ? (
            <>
              <input
                type="text"
                className="writing-input"
                placeholder="Scrivi in tedesco..."
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
                  fontSize: '18px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  fontWeight: '500',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              />
              <button
                onClick={checkAnswer}
                disabled={!userInput.trim()}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '700',
                  backgroundColor: userInput.trim() ? 'var(--primary-color)' : 'var(--bg-secondary)',
                  color: userInput.trim() ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: userInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                Verifica
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
                  showResult && results[currentIndex]?.feedback === 'correct' ? 'var(--success-light, #d1fae5)' :
                  showResult && results[currentIndex]?.feedback === 'almost' ? 'var(--warning-light, #fef3c7)' :
                  'var(--error-light, #fee2e2)',
                borderLeft: `4px solid ${
                  showResult && results[currentIndex]?.feedback === 'correct' ? 'var(--success-color, #10b981)' :
                  showResult && results[currentIndex]?.feedback === 'almost' ? 'var(--warning-color, #f59e0b)' :
                  'var(--error-color, #ef4444)'
                }`
              }}>
                {results[currentIndex]?.feedback === 'correct' && (
                  <p style={{ color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                    <Icons.Check style={{ display: 'inline', marginRight: '8px' }} /> Corretto! +{results[currentIndex]?.xpGain} XP
                  </p>
                )}
                {results[currentIndex]?.feedback === 'almost' && (
                  <p style={{ color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
                    <Icons.Check style={{ display: 'inline', marginRight: '8px' }} /> Quasi! +{results[currentIndex]?.xpGain} XP
                  </p>
                )}
                {results[currentIndex]?.feedback === 'incorrect' && (
                  <p style={{ color: '#991b1b', fontWeight: '600', marginBottom: '8px' }}>
                    <Icons.X style={{ display: 'inline', marginRight: '8px' }} /> Non corretto
                  </p>
                )}

                {results[currentIndex]?.feedback !== 'correct' && (
                  <>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                      La tua risposta: <strong>{results[currentIndex]?.userAnswer}</strong>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Risposta corretta: <strong>{results[currentIndex]?.correctAnswer}</strong>
                    </p>
                  </>
                )}
              </div>

              {/* Pronunciation button */}
              <button
                onClick={() => speak(currentQuestion.fullGerman)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Icons.Volume /> Ascolta la pronuncia
              </button>

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
                {currentIndex < questions.length - 1 ? 'Prossimo' : 'Vedi risultati'}
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
    const incorrect = results.filter(r => r.feedback === 'incorrect').length;
    const percentage = Math.round((correct / results.length) * 100);
    const totalXP = results.reduce((sum, r) => sum + (r.xpGain || 0), 0);

    // Determine color based on percentage
    let scoreColor = '#10b981'; // Green for A1
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
            Esercizi completati!
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
                {correct} Corretto{correct !== 1 ? 'i' : ''}
              </span>
              <span style={{ display: 'block', color: '#f59e0b', fontWeight: '700', fontSize: '16px', marginTop: '8px' }}>
                {almost} Quasi{almost !== 1 ? ' corretti' : ' corretto'}
              </span>
              <span style={{ display: 'block', color: '#ef4444', fontWeight: '700', fontSize: '16px', marginTop: '8px' }}>
                {incorrect} Sbagliato{incorrect !== 1 ? 'i' : ''}
              </span>
            </p>
            <p style={{ color: 'var(--text-secondary)', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              su <strong>{results.length}</strong> esercizi
            </p>
          </div>

          {/* XP Earned */}
          <div style={{
            backgroundColor: 'var(--primary-light, rgba(124, 58, 248, 0.1))',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Punti esperienza guadagnati</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-color)' }}>
              +{totalXP} XP
            </p>
          </div>

          {/* Mistakes List */}
          {incorrect > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                Errori da rivedere
              </h3>
              {results.filter(r => r.feedback === 'incorrect').map((result, idx) => (
                <div key={idx} style={{
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '12px',
                  marginBottom: '12px'
                }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>
                    {result.question}
                  </p>
                  <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '4px' }}>
                    La tua risposta: <strong>{result.userAnswer}</strong>
                  </p>
                  <p style={{ color: '#10b981', fontSize: '13px' }}>
                    Risposta corretta: <strong>{result.correctAnswer}</strong>
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
              Riprova
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
              Nuova sessione
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
