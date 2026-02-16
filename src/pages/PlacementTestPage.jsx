import React, { useState, useEffect, useMemo } from 'react';
import '../styles/pages/placement.css';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { saveAndSync } from '../utils/cloudSync';
import { recordActivity } from '../utils/gamification';
import Icons from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const QUESTIONS_PER_LEVEL = 5;

export default function PlacementTestPage({ onNavigate }) {
  const { t, language } = useLanguage();
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
      .catch(err => { if (import.meta.env.DEV) console.error('Failed to load placement test:', err); });
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
    if (selectedOption === null || !currentQuestion) return;

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
      if (import.meta.env.DEV) console.warn('Failed to save placement test result:', e);
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
      <div className="placement-page placement-page--welcome">
        <div className="placement-welcome-content">
          <div className="placement-welcome-icon">📍</div>
          <h1 className="placement-welcome-title">
            {t('placement.title')}
          </h1>
          <p className="placement-welcome-description">
            {t('placement.discover')}
          </p>

          <div className="placement-info-box">
            <div className="placement-info-box-title">
              {t('placement.how')}
            </div>
            <ul className="placement-info-box-list">
              <li>{t('placement.questions')}</li>
              <li>{t('placement.progressive')}</li>
              <li>{t('placement.stop')}</li>
              <li>{t('placement.result')}</li>
              <li>{t('placement.saved')}</li>
            </ul>
          </div>

          <div className="placement-buttons">
            <button
              onClick={() => setTestStarted(true)}
              className="placement-button"
            >
              {t('placement.start')}
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="placement-button placement-button--secondary"
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
    const levelName = getLevelName(detectedLevel, language);
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
      <div className="placement-results">
        <div className="placement-results-container">
          <div className="placement-results-card">
            <div className="placement-results-icon">🎉</div>
            <h1 className="placement-results-title">
              {t('placement.completed')}
            </h1>

            <div
              className="placement-results-level-badge"
              style={{
                background: `linear-gradient(135deg, ${levelColor.bg}, ${levelColor.light})`,
                color: levelColor.text,
              }}
            >
              <div className="placement-results-level-text">{detectedLevel}</div>
              <div className="placement-results-level-name">
                {levelName}
              </div>
            </div>

            <div className="placement-results-goethe">
              {goetheNames[detectedLevel]}
            </div>

            <div className="placement-results-stats">
              <div className="placement-stats-card">
                <div className="placement-stats-value" style={{ color: 'var(--accent)' }}>
                  {accuracy}%
                </div>
                <div className="placement-stats-label">{t('placement.accuracy')}</div>
              </div>
              <div className="placement-stats-card">
                <div className="placement-stats-value" style={{ color: '#10b981' }}>
                  {correctAnswers}/{currentQuestionIndex + 1}
                </div>
                <div className="placement-stats-label">{t('placement.correct')}</div>
              </div>
              <div className="placement-stats-card">
                <div className="placement-stats-value" style={{ color: '#3b82f6' }}>
                  {minutes}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="placement-stats-label">{t('placement.time')}</div>
              </div>
            </div>

            <div
              className="placement-results-description"
              style={{
                background: levelColor.light,
                border: `1px solid ${levelColor.bg}`,
                color: levelColor.text,
              }}
            >
              {levelDescriptions[detectedLevel]}
            </div>

            {earlyStop && (
              <div className="placement-early-stop-warning">
                ⚠️ {t('placement.earlyStop')}
              </div>
            )}
          </div>

          <div className="placement-results-buttons">
            <button
              onClick={() => onNavigate('home')}
              className="placement-results-button"
            >
              {t('placement.goHome')}
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="placement-results-button placement-results-button--secondary"
            >
              {t('placement.goProfile')}
            </button>
            <button
              onClick={handleRetakeLevelOptions}
              className="placement-results-button placement-results-button--tertiary"
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
      <div className="placement-loading">
        <div className="placement-loading-content">
          <div className="placement-spinner" />
          <p>{t('placement.loading')}</p>
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
    <div className="placement-page">
      <div className="placement-container">
        <div className="placement-header">
          <div className="placement-header-left">
            <div className="placement-level-label">
              {t('placement.level')} {levelIndex + 1}/{LEVELS.length}
            </div>
            <div className="placement-level-badge">
              <div
                className="placement-level-circle"
                style={{
                  background: levelColor.bg,
                  color: levelColor.text,
                }}
              >
                {currentLevel}
              </div>
              <div className="placement-level-info">
                <div className="placement-question-counter">
                  {t('quiz.question')} {questionInLevel} {t('quiz.of')} {questionsInLevel}
                </div>
                <div className="placement-overall-counter">
                  {t('placement.overall')} {currentQuestionIndex + 1}/{questions.length}
                </div>
              </div>
            </div>
          </div>
          <div className="placement-header-right">
            <div className="placement-timer">
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="placement-timer-label">{t('placement.time')}</div>
          </div>
        </div>

        <div className="placement-progress-bar">
          <div
            className="placement-progress-fill"
            style={{
              background: `linear-gradient(90deg, ${levelColor.bg}, ${levelColor.light})`,
              width: `${progressPercent}%`,
            }}
          />
        </div>

        <div className="placement-question-card">
          <div className="placement-question-badges">
            <span
              className="placement-badge placement-badge--level"
              style={{
                background: levelColor.light,
                color: levelColor.text,
              }}
            >
              {currentLevel}
            </span>
            <span className="placement-badge placement-badge--type">
              {currentQuestion.type === 'grammar' && t('placement.grammar')}
              {currentQuestion.type === 'vocabulary' && t('vocabulary.title')}
              {currentQuestion.type === 'completion' && t('placement.completion')}
              {currentQuestion.type === 'comprehension' && t('placement.comprehension')}
            </span>
          </div>

          <h2 className="placement-question-text">
            {currentQuestion.question}
          </h2>

          <div className="placement-options">
            {currentQuestion.options.map((option, idx) => {
              let optionClass = 'placement-option';
              if (selectedOption === idx) optionClass += ' placement-option--selected';
              if (submitted && idx === currentQuestion.correctAnswer) optionClass += ' placement-option--correct';
              if (submitted && selectedOption === idx && selectedOption !== currentQuestion.correctAnswer) optionClass += ' placement-option--incorrect';

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={optionClass}
                  disabled={submitted}
                >
                  <span className="placement-option-letter">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div
              className={`placement-explanation ${selectedOption === currentQuestion.correctAnswer ? 'placement-explanation--correct' : 'placement-explanation--incorrect'}`}
            >
              <div className="placement-explanation-header">
                <span className="placement-explanation-icon">
                  {selectedOption === currentQuestion.correctAnswer ? '✓' : '✗'}
                </span>
                {selectedOption === currentQuestion.correctAnswer ? t('placement.correct_answer') : t('placement.wrong_answer')}
              </div>
              <div>{currentQuestion.explanation}</div>
            </div>
          )}
        </div>

        <div className="placement-actions">
          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="placement-submit-btn"
            >
              {t('placement.submit')}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="placement-next-btn"
            >
              {currentQuestionIndex === questions.length - 1 ? t('placement.completeTest') : t('placement.nextQuestion')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
