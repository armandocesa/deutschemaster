import React, { useState, useEffect, useMemo } from 'react';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { saveAndSync } from '../utils/cloudSync';
import { recordActivity } from '../utils/gamification';
import Icons from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const QUESTIONS_PER_LEVEL = 5;

export default function PlacementTestPage({ onNavigate }) {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [detectedLevel, setDetectedLevel] = useState(null);
  const [startTime] = useState(Date.now());
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [earlyStop, setEarlyStop] = useState(false);

  // Load questions from JSON
  useEffect(() => {
    fetch('/data/placement-test.json')
      .then(res => res.json())
      .then(data => setQuestions(data.questions))
      .catch(err => console.error('Failed to load placement test:', err));
  }, []);

  const currentQuestion = useMemo(() => {
    if (!questions.length) return null;
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  // Calculate current level block
  const currentLevel = useMemo(() => {
    const levelIndex = Math.floor(currentQuestionIndex / QUESTIONS_PER_LEVEL);
    return LEVELS[Math.min(levelIndex, LEVELS.length - 1)];
  }, [currentQuestionIndex]);

  // Check if user should stop early (< 2 correct in current level)
  useEffect(() => {
    if (submitted && answers[currentQuestionIndex - 1] === true) return;

    const levelIndex = Math.floor(currentQuestionIndex / QUESTIONS_PER_LEVEL);
    const levelStartIdx = levelIndex * QUESTIONS_PER_LEVEL;

    // Count correct answers in current level
    let correctInLevel = 0;
    for (let i = levelStartIdx; i < currentQuestionIndex; i++) {
      if (answers[i] === true) correctInLevel++;
    }

    // If we've answered all questions in the level and got < 2 correct, stop
    if (
      currentQuestionIndex > 0 &&
      currentQuestionIndex % QUESTIONS_PER_LEVEL === 0 &&
      correctInLevel < 2
    ) {
      setEarlyStop(true);
      completeTest(true);
    }
  }, [currentQuestionIndex, answers, submitted]);

  const handleSelectOption = (index) => {
    if (!submitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: isCorrect
    }));
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      completeTest(false);
    }
  };

  const completeTest = (stopped = false) => {
    // Calculate detected level
    let detectedLvl = 'A1';

    for (const level of LEVELS) {
      const levelIndex = LEVELS.indexOf(level);
      const levelStart = levelIndex * QUESTIONS_PER_LEVEL;
      const levelEnd = levelStart + QUESTIONS_PER_LEVEL;

      let correctInLevel = 0;
      for (let i = levelStart; i < levelEnd && i <= currentQuestionIndex; i++) {
        if (answers[i] === true) correctInLevel++;
      }

      // If at least 3 correct in this level (60%), consider passing
      if (correctInLevel >= 3) {
        detectedLvl = level;
      } else if (levelIndex * QUESTIONS_PER_LEVEL > currentQuestionIndex) {
        break;
      }
    }

    setDetectedLevel(detectedLvl);
    setTestCompleted(true);

    // Save to localStorage and sync
    try {
      const testData = {
        level: detectedLvl,
        completedAt: new Date().toISOString(),
        totalQuestions: currentQuestionIndex + 1,
        correctAnswers: Object.values(answers).filter(v => v === true).length,
        earlyStop: stopped,
      };
      saveAndSync('dm_placement_level', JSON.stringify(testData));
    } catch (e) {
      console.warn('Failed to save placement test result:', e);
    }

    // Record activity for gamification
    recordActivity();
  };

  const handleRetakeLevelOptions = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setSubmitted(false);
    setEarlyStop(false);
    setDetectedLevel(null);
  };

  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  // Welcome Screen
  if (!testStarted && !testCompleted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📍</div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            {t('placement.title')}
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
            {t('placement.discover')}
          </p>

          <div style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
              {t('placement.how')}
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
              <li>{t('placement.questions')}</li>
              <li>{t('placement.progressive')}</li>
              <li>{t('placement.stop')}</li>
              <li>{t('placement.result')}</li>
              <li>{t('placement.saved')}</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button
              onClick={() => setTestStarted(true)}
              style={{
                padding: '14px 28px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(108,92,231,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {t('placement.start')}
            </button>
            <button
              onClick={() => onNavigate('home')}
              style={{
                padding: '14px 28px',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t('placement.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (testCompleted) {
    const correctAnswers = Object.values(answers).filter(v => v === true).length;
    const accuracy = Math.round((correctAnswers / (currentQuestionIndex + 1)) * 100);
    const levelColor = LEVEL_COLORS[detectedLevel];
    const levelName = getLevelName(detectedLevel);
    const goetheNames = {
      A1: 'Goethe-Zertifikat A1 (Start Deutsch 1)',
      A2: 'Goethe-Zertifikat A2',
      B1: 'Goethe-Zertifikat B1',
      B2: 'Goethe-Zertifikat B2',
      C1: 'Goethe-Zertifikat C1',
      C2: 'Goethe-Zertifikat C2 (GDS)',
    };

    const levelDescriptions = {
      A1: 'Sei un principiante assoluto. Puoi comprendere e usare espressioni quotidiane molto familiari e frasi basilari.',
      A2: 'Sei a livello elementare. Puoi affrontare situazioni comuni e comunicare su argomenti familiari.',
      B1: 'Sei a livello intermedio. Puoi comprendere gli aspetti principali di testi chiari e sostenere una conversazione.',
      B2: 'Sei a livello intermedio-superiore. Puoi comprendere testi complessi e comunicare con fluidità spontanea.',
      C1: 'Sei a livello avanzato. Puoi comprendere testi lunghi e complessi e usare la lingua con flessibilità.',
      C2: 'Sei a livello di padronanza. Hai una comprensione e un uso della lingua praticamente equivalenti a quelli di un madrelingua.',
    };

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Results Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '40px 32px', textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '60px', marginBottom: '24px' }}>🎉</div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>
              {t('placement.completed')}
            </h1>

            {/* Level Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${levelColor.bg}, ${levelColor.light})`,
                color: levelColor.text,
                marginBottom: '32px',
                margin: '0 auto 32px',
                boxShadow: `0 12px 32px ${levelColor.bg}40`,
              }}
            >
              <div style={{ fontSize: '64px', fontWeight: 800 }}>{detectedLevel}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
                {levelName}
              </div>
            </div>

            {/* Goethe Certification Name */}
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', fontStyle: 'italic' }}>
              {goetheNames[detectedLevel]}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'rgba(108,92,231,0.1)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>
                  {accuracy}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('placement.accuracy')}</div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                  {correctAnswers}/{currentQuestionIndex + 1}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('placement.correct')}</div>
              </div>
              <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>
                  {minutes}:{String(seconds).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('placement.time')}</div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: levelColor.light, border: `1px solid ${levelColor.bg}`, borderRadius: 'var(--radius)', padding: '16px', marginBottom: '32px', textAlign: 'left' }}>
              <div style={{ fontSize: '13px', color: levelColor.text, lineHeight: '1.6' }}>
                {levelDescriptions[detectedLevel]}
              </div>
            </div>

            {earlyStop && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  ⚠️ {t('placement.earlyStop')}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                padding: '14px 28px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(108,92,231,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {t('placement.goHome')}
            </button>
            <button
              onClick={() => onNavigate('profile')}
              style={{
                padding: '14px 28px',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t('placement.goProfile')}
            </button>
            <button
              onClick={handleRetakeLevelOptions}
              style={{
                padding: '14px 28px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t('placement.retakeTest')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test Questions Screen
  if (!questions.length) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(108,92,231,0.3)', borderTopColor: '#6c5ce7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p>{t('placement.loading')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const levelColor = LEVEL_COLORS[currentLevel];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  const levelIndex = LEVELS.indexOf(currentLevel);
  const questionsInLevel = QUESTIONS_PER_LEVEL;
  const questionInLevel = (currentQuestionIndex % QUESTIONS_PER_LEVEL) + 1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              {t('placement.level')} {levelIndex + 1}/{LEVELS.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: levelColor.bg,
                  color: levelColor.text,
                  fontWeight: 700,
                  fontSize: '18px',
                }}
              >
                {currentLevel}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('quiz.question')} {questionInLevel} {t('quiz.of')} {questionsInLevel}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {t('placement.overall')} {currentQuestionIndex + 1}/{questions.length}
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('placement.time')}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '32px' }}>
          <div
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${levelColor.bg}, ${levelColor.light})`,
              width: `${progressPercent}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Question Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', marginBottom: '24px' }}>
          {/* Question Type Badge */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-block',
                background: levelColor.light,
                color: levelColor.text,
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {currentLevel}
            </span>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(108,92,231,0.1)',
                color: 'var(--accent)',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {currentQuestion.type === 'grammar' && t('placement.grammar')}
              {currentQuestion.type === 'vocabulary' && t('vocabulary.title')}
              {currentQuestion.type === 'completion' && t('placement.completion')}
              {currentQuestion.type === 'comprehension' && t('placement.comprehension')}
            </span>
          </div>

          {/* Question Text */}
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '28px', lineHeight: '1.6' }}>
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                style={{
                  padding: '16px 20px',
                  background:
                    selectedOption === idx
                      ? 'var(--accent)'
                      : submitted && idx === currentQuestion.correctAnswer
                      ? '#10b981'
                      : submitted && selectedOption === idx
                      ? '#ef4444'
                      : 'var(--bg)',
                  color:
                    selectedOption === idx || (submitted && (idx === currentQuestion.correctAnswer || selectedOption === idx))
                      ? 'white'
                      : 'var(--text-primary)',
                  border:
                    selectedOption === idx
                      ? `2px solid var(--accent)`
                      : submitted && idx === currentQuestion.correctAnswer
                      ? '2px solid #10b981'
                      : submitted && selectedOption === idx
                      ? '2px solid #ef4444'
                      : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: submitted ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                disabled={submitted}
                onMouseEnter={(e) => {
                  if (!submitted && selectedOption !== idx) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitted && selectedOption !== idx) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }
                }}
              >
                <span style={{ fontWeight: 700, marginRight: '12px', fontSize: '16px' }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </button>
            ))}
          </div>

          {/* Explanation (shown after submission) */}
          {submitted && (
            <div
              style={{
                marginTop: '28px',
                padding: '16px',
                background: selectedOption === currentQuestion.correctAnswer ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${selectedOption === currentQuestion.correctAnswer ? '#10b981' : '#ef4444'}`,
                borderRadius: 'var(--radius)',
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedOption === currentQuestion.correctAnswer ? (
                  <>
                    <span style={{ fontSize: '16px' }}>✓</span>
                    {t('placement.correct_answer')}
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '16px' }}>✗</span>
                    {t('placement.wrong_answer')}
                  </>
                )}
              </div>
              <div>{currentQuestion.explanation}</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              style={{
                flex: 1,
                padding: '14px 28px',
                background: selectedOption === null ? 'rgba(108,92,231,0.3)' : 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: selectedOption === null ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: selectedOption === null ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (selectedOption !== null) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(108,92,231,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedOption !== null) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {t('placement.submit')}
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '14px 28px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(108,92,231,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {currentQuestionIndex === questions.length - 1 ? t('placement.completeTest') : t('placement.nextQuestion')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
