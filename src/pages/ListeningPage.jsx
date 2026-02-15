import React, { useState, useEffect, useRef } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS, fisherYatesShuffle } from '../utils/constants';
import { useData } from '../DataContext';
import { addXP, recordActivity } from '../utils/gamification';
import { speak } from '../utils/speech';
import { useLevelAccess } from '../hooks/useLevelAccess';
import LevelAccessModal from '../components/LevelAccessModal';
import { useLanguage } from '../contexts/LanguageContext';

// Levenshtein distance for dictation mode
function levenshteinDistance(a, b) {
  const aL = a.toLowerCase().trim();
  const bL = b.toLowerCase().trim();
  const dp = Array(aL.length + 1).fill(null).map(() => Array(bL.length + 1).fill(0));

  for (let i = 0; i <= aL.length; i++) dp[i][0] = i;
  for (let j = 0; j <= bL.length; j++) dp[0][j] = j;

  for (let i = 1; i <= aL.length; i++) {
    for (let j = 1; j <= bL.length; j++) {
      if (aL[i - 1] === bL[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[aL.length][bL.length];
}

export default function ListeningPage({ onNavigate }) {
  const { VOCABULARY_DATA } = useData();
  const { canAccessLevel } = useLevelAccess();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState('setup');
  const [exerciseType, setExerciseType] = useState('diktat');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [exerciseCount, setExerciseCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState([]);
  const [playCount, setPlayCount] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [lockedLevel, setLockedLevel] = useState(null);
  const [listeningData, setListeningData] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const utteranceRef = useRef(null);

  // Load listening data from JSON (language-aware)
  useEffect(() => {
    const loadData = async () => {
      try {
        if (language === 'en') {
          try {
            const res = await fetch('/data/en/listening.json');
            if (res.ok) { setListeningData(await res.json()); return; }
          } catch {}
        }
        const res = await fetch('/data/listening.json');
        if (res.ok) setListeningData(await res.json());
      } catch (err) { if (import.meta.env.DEV) console.error('Error loading listening data:', err); }
    };
    loadData();
  }, [language]);

  // Get exercises for current level and type
  const getExercises = (level, type) => {
    if (!listeningData) return [];
    const levelExercises = listeningData.levels?.[level]?.exercises || [];
    return levelExercises.filter(ex => ex.type === type);
  };

  // Generate questions from listening data
  const generateQuestionsFromData = (level, type, count) => {
    const exercises = getExercises(level, type);
    if (exercises.length === 0) return [];

    const shuffled = fisherYatesShuffle(exercises);
    return shuffled.slice(0, Math.min(count, exercises.length));
  };

  const startExercise = () => {
    const qs = generateQuestionsFromData(selectedLevel, exerciseType, exerciseCount);
    if (qs.length === 0) {
      alert(t('listening.noExercises'));
      return;
    }

    setQuestions(qs);
    setCurrentIndex(0);
    setUserAnswer('');
    setSelectedOption(null);
    setShowResult(false);
    setResults([]);
    setPlayCount(0);
    setTotalXP(0);
    setPlaybackSpeed(1);
    setMode('playing');
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-play audio when question loads
  useEffect(() => {
    if (mode === 'playing' && questions.length > 0 && currentIndex < questions.length) {
      setPlayCount(1);
      playAudioWithSpeed(questions[currentIndex].text, playbackSpeed);
    }
  }, [currentIndex, mode, questions]);

  const playAudioWithSpeed = (text, speed = 1) => {
    if (!text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(v => v.lang.startsWith('de'));
    if (germanVoice) utterance.voice = germanVoice;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = () => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setPlayCount(p => p + 1);
      playAudioWithSpeed(questions[currentIndex].text, playbackSpeed);
    }
  };

  const handleSpeedChange = (newSpeed) => {
    setPlaybackSpeed(newSpeed);
    if (questions.length > 0 && currentIndex < questions.length) {
      setPlayCount(p => p + 1);
      playAudioWithSpeed(questions[currentIndex].text, newSpeed);
    }
  };

  // Handle comprehension question answer
  const handleComprensionAnswer = (questionIndex, optionIndex) => {
    if (showResult) return;

    const current = questions[currentIndex];
    const question = current.questions[questionIndex];
    const isCorrect = optionIndex === question.correct;
    const xpEarned = isCorrect ? 15 : 5;

    if (!results[currentIndex]) {
      const newResults = [...results];
      newResults[currentIndex] = {
        text: current.text,
        answers: {},
        xpEarned: 0,
        type: 'comprensione'
      };
      setResults(newResults);
    }

    const updatedResult = { ...results[currentIndex] };
    updatedResult.answers[questionIndex] = {
      selected: optionIndex,
      correct: question.correct,
      isCorrect
    };
    updatedResult.xpEarned += (isCorrect ? 15 : 5);

    const newResults = [...results];
    newResults[currentIndex] = updatedResult;
    setResults(newResults);

    // Check if all questions answered
    const answered = Object.keys(updatedResult.answers).length;
    if (answered === current.questions.length) {
      setTotalXP(p => p + updatedResult.xpEarned);
      addXP(updatedResult.xpEarned, 'listening_correct');
      setShowResult(true);
    }
  };

  // Handle dictation verify
  const handleDikttatVerify = () => {
    if (showResult || !userAnswer.trim()) return;
    setShowResult(true);

    const current = questions[currentIndex];
    const distance = levenshteinDistance(userAnswer, current.text);
    const isExact = distance === 0;
    const isClose = distance <= 2;

    let xpEarned = 0;
    let resultType = 'wrong';

    if (isExact) {
      xpEarned = 15;
      resultType = 'perfect';
    } else if (isClose) {
      xpEarned = 5;
      resultType = 'close';
    }

    setResults(prev => [...prev, {
      text: current.text,
      userAnswer,
      distance,
      isExact,
      isClose,
      xpEarned,
      resultType,
      type: 'diktat'
    }]);

    if (xpEarned > 0) {
      setTotalXP(p => p + xpEarned);
      addXP(xpEarned, 'listening_correct');
    }
  };

  // Handle gap fill verify
  const handleLueckenTextVerify = () => {
    if (showResult || !userAnswer.trim()) return;
    setShowResult(true);

    const current = questions[currentIndex];
    const gap = current.gaps?.[0];
    if (!gap) return;

    const isCorrect = userAnswer.trim().toLowerCase() === gap.correct.toLowerCase();
    const xpEarned = isCorrect ? 15 : 5;

    setResults(prev => [...prev, {
      text: current.text,
      userAnswer,
      correct: gap.correct,
      isCorrect,
      xpEarned,
      type: 'lueckentext'
    }]);

    if (xpEarned > 0) {
      setTotalXP(p => p + xpEarned);
      addXP(xpEarned, 'listening_correct');
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
      setPlayCount(0);
    } else {
      recordActivity();
      setMode('finished');
    }
  };

  const colors = LEVEL_COLORS[selectedLevel] || { bg: '#6c5ce7', text: '#fff' };

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

  // Setup Screen
  if (mode === 'setup') {
    return (
      <div className="listening-page">
        <div className="setup-container">
          <h1 className="page-title">{t('listening.title')}</h1>
          <p className="page-subtitle">{t('listening.subtitle')}</p>

          <div className="listening-setup">
            <div className="setup-section">
              <h3>{t('listening.exerciseType')}</h3>
              <div className="setup-options">
                <button
                  className={`setup-option ${exerciseType === 'diktat' ? 'active' : ''}`}
                  onClick={() => setExerciseType('diktat')}
                >
                  <Icons.Pen /> {t('listening.dictation')}
                </button>
                <button
                  className={`setup-option ${exerciseType === 'comprensione' ? 'active' : ''}`}
                  onClick={() => setExerciseType('comprensione')}
                >
                  <Icons.Brain /> {t('listening.comprehension')}
                </button>
                <button
                  className={`setup-option ${exerciseType === 'lueckentext' ? 'active' : ''}`}
                  onClick={() => setExerciseType('lueckentext')}
                >
                  <Icons.Edit /> {t('listening.gapFill')}
                </button>
              </div>
            </div>

            <div className="setup-section">
              <h3>{t('listening.level')}</h3>
              <div className="setup-options levels">
                {Object.entries(LEVEL_COLORS).map(([lvl, col]) => {
                  const isLocked = lvl !== 'A1' && !canAccessLevel(lvl);
                  return (
                    <button
                      key={lvl}
                      className={`setup-option level ${selectedLevel === lvl ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                      style={{ '--level-color': col.bg }}
                      onClick={() => handleLevelChange(lvl)}
                      disabled={isLocked}
                    >
                      {lvl}
                      {isLocked && <span className="listening-lock-icon">🔒</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="setup-section">
              <h3>{t('listening.exerciseCount')}</h3>
              <div className="setup-options">
                {[5, 10, 15].map(count => (
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

            <button className="listening-start-btn" onClick={startExercise} style={{ backgroundColor: colors.bg }}>
              {t('listening.start')}
            </button>
          </div>
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

  if (mode === 'finished') {
    const correctCount = results.reduce((acc, r) => {
      if (r.type === 'diktat') return acc + (r.resultType === 'perfect' ? 1 : 0);
      if (r.type === 'lueckentext') return acc + (r.isCorrect ? 1 : 0);
      if (r.type === 'comprensione') {
        const answersCount = Object.values(r.answers || {}).length;
        const correctAnswers = Object.values(r.answers || {}).filter(a => a.isCorrect).length;
        return acc + (correctAnswers === answersCount ? 1 : 0);
      }
      return acc;
    }, 0);

    const percentage = Math.round((correctCount / results.length) * 100);

    return (
      <div className="listening-page">
        <div className="finished-container">
          <div className="listening-score-circle" style={{ borderColor: colors.bg }}>
            <span className="score-value">{percentage}%</span>
          </div>
          <h2>{t('listening.completed')}</h2>
          <p className="score-text">{correctCount} {t('listening.correct')} {results.length}</p>
          <p className="xp-earned">+{totalXP} XP</p>

          {results.length > 0 && (
            <div className="mistakes-section">
              <h3>{t('listening.results')}</h3>
              <div className="mistakes-list">
                {results.map((r, idx) => (
                  <div key={idx} className="mistake-item">
                    <p className="mistake-question">
                      <strong>{t('listening.exercise')} {idx + 1}:</strong> {r.text?.substring(0, 50)}...
                    </p>
                    {r.type === 'diktat' && (
                      <>
                        <p className="mistake-yours">{t('listening.yourAnswer')} {r.userAnswer}</p>
                        <p className="mistake-correct">{t('listening.correctAnswer')} {r.text}</p>
                      </>
                    )}
                    {r.type === 'lueckentext' && (
                      <>
                        <p className="mistake-yours">{t('listening.yourAnswer')} {r.userAnswer}</p>
                        <p className="mistake-correct">{t('listening.correctAnswer')} {r.correct}</p>
                      </>
                    )}
                    {r.type === 'comprensione' && (
                      <p className="mistake-correct">{t('listening.correct')} {Object.values(r.answers || {}).filter(a => a.isCorrect).length}/{Object.values(r.answers || {}).length}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="finished-actions">
            <button className="retry-btn" onClick={startExercise}>
              {t('listening.retry')}
            </button>
            <button className="new-session-btn" onClick={() => setMode('setup')}>
              {t('listening.newSession')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (mode === 'playing' && questions.length > 0) {
    const current = questions[currentIndex];
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    // Dictation mode (Dettato)
    if (exerciseType === 'diktat') {
      const resultItem = results[currentIndex];

      return (
        <div className="listening-page">
          <div className="playing-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: colors.bg }}></div>
            </div>
            <p className="question-counter">{t('listening.exercise')} {currentIndex + 1} {t('listening.of')} {questions.length}</p>

            <div className="listening-content">
              <h3>{current.title}</h3>

              <button
                className="listening-speaker-btn"
                onClick={playAudio}
                style={{
                  background: `linear-gradient(135deg, ${colors.bg}, ${colors.light})`,
                  borderColor: colors.bg
                }}
              >
                <Icons.Volume />
              </button>

              <div className="repeat-controls">
                <button className="repeat-btn" onClick={playAudio}>
                  <Icons.Repeat /> {t('listening.repeat')}
                </button>
                <p className="play-count">{t('listening.listens')} {playCount}</p>
              </div>

              <div className="speed-controls">
                <label>{t('listening.speed')}</label>
                <div className="speed-buttons">
                  {[0.75, 1, 1.25].map(speed => (
                    <button
                      key={speed}
                      className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                className="dictation-input"
                placeholder={t('listening.write')}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={showResult}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
                    handleDikttatVerify();
                  }
                }}
                autoFocus
              />

              {!showResult ? (
                <button
                  className="listening-verify-btn"
                  onClick={handleDikttatVerify}
                  disabled={!userAnswer.trim()}
                  style={{ backgroundColor: colors.bg }}
                >
                  {t('listening.verify')}
                </button>
              ) : (
                <div>
                  {resultItem && (
                    <div className={`result-message ${resultItem.resultType === 'perfect' ? 'perfect' : resultItem.resultType === 'close' ? 'close' : 'wrong'}`}>
                      {resultItem.resultType === 'perfect' && (
                        <div>
                          <p>{t('listening.perfect')}</p>
                          <p className="word-display">{resultItem.text}</p>
                        </div>
                      )}
                      {resultItem.resultType === 'close' && (
                        <div>
                          <p>{t('listening.almost')}</p>
                          <p className="word-display">{resultItem.text}</p>
                        </div>
                      )}
                      {resultItem.resultType === 'wrong' && (
                        <div>
                          <p>{t('listening.wrong')}</p>
                          <p className="word-display">{resultItem.text}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button className="listening-next-btn" onClick={nextQuestion} style={{ backgroundColor: colors.bg }}>
                    {t('listening.next')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Comprehension mode (Comprensione)
    if (exerciseType === 'comprensione') {
      const resultItem = results[currentIndex];
      const allAnswered = resultItem && Object.keys(resultItem.answers || {}).length === current.questions.length;

      return (
        <div className="listening-page">
          <div className="playing-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: colors.bg }}></div>
            </div>
            <p className="question-counter">{t('listening.exercise')} {currentIndex + 1} {t('listening.of')} {questions.length}</p>

            <div className="listening-content">
              <h3>{current.title}</h3>

              <button
                className="listening-speaker-btn"
                onClick={playAudio}
                style={{
                  background: `linear-gradient(135deg, ${colors.bg}, ${colors.light})`,
                  borderColor: colors.bg
                }}
              >
                <Icons.Volume />
              </button>

              <div className="repeat-controls">
                <button className="repeat-btn" onClick={playAudio}>
                  <Icons.Repeat /> {t('listening.repeat')}
                </button>
                <p className="play-count">{t('listening.listens')} {playCount}</p>
              </div>

              <div className="speed-controls">
                <label>{t('listening.speed')}</label>
                <div className="speed-buttons">
                  {[0.75, 1, 1.25].map(speed => (
                    <button
                      key={speed}
                      className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {showResult && (
                <div className="transcript-section">
                  <h4>{t('listening.text')}</h4>
                  <p className="transcript">{current.text}</p>
                </div>
              )}

              <div className="questions-container">
                {current.questions.map((q, qIdx) => (
                  <div key={qIdx} className="question-block">
                    <p className="question-text">{q.question}</p>
                    <div className="options-grid">
                      {q.options.map((option, oIdx) => {
                        const isSelected = resultItem?.answers[qIdx]?.selected === oIdx;
                        const isCorrectOption = oIdx === q.correct;
                        let btnClass = 'option-btn';
                        if (allAnswered) {
                          if (isCorrectOption) btnClass += ' correct';
                          if (isSelected && !isCorrectOption) btnClass += ' incorrect';
                        }
                        return (
                          <button
                            key={oIdx}
                            className={btnClass}
                            onClick={() => handleComprensionAnswer(qIdx, oIdx)}
                            disabled={allAnswered}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {allAnswered && (
                <button className="listening-next-btn" onClick={nextQuestion} style={{ backgroundColor: colors.bg }}>
                  {t('listening.next')}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Gap-fill mode (Lückentext)
    if (exerciseType === 'lueckentext') {
      const resultItem = results[currentIndex];

      return (
        <div className="listening-page">
          <div className="playing-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: colors.bg }}></div>
            </div>
            <p className="question-counter">{t('listening.exercise')} {currentIndex + 1} {t('listening.of')} {questions.length}</p>

            <div className="listening-content">
              <h3>{current.title}</h3>

              <button
                className="listening-speaker-btn"
                onClick={playAudio}
                style={{
                  background: `linear-gradient(135deg, ${colors.bg}, ${colors.light})`,
                  borderColor: colors.bg
                }}
              >
                <Icons.Volume />
              </button>

              <div className="repeat-controls">
                <button className="repeat-btn" onClick={playAudio}>
                  <Icons.Repeat /> {t('listening.repeat')}
                </button>
                <p className="play-count">{t('listening.listens')} {playCount}</p>
              </div>

              <div className="speed-controls">
                <label>{t('listening.speed')}</label>
                <div className="speed-buttons">
                  {[0.75, 1, 1.25].map(speed => (
                    <button
                      key={speed}
                      className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {showResult && (
                <div className="transcript-section">
                  <h4>{t('listening.text')}</h4>
                  <p className="transcript">{current.text}</p>
                </div>
              )}

              <div className="lueckentext-display">
                <p className="lueckentext-text">
                  {t('listening.complete')} ({t('listening.of')} {current.gaps?.length || 1}).
                </p>
              </div>

              <input
                type="text"
                className="dictation-input"
                placeholder={t('listening.complete')}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={showResult}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
                    handleLueckenTextVerify();
                  }
                }}
                autoFocus
              />

              {!showResult ? (
                <button
                  className="listening-verify-btn"
                  onClick={handleLueckenTextVerify}
                  disabled={!userAnswer.trim()}
                  style={{ backgroundColor: colors.bg }}
                >
                  {t('listening.verify')}
                </button>
              ) : (
                <div>
                  {resultItem && (
                    <div className={`result-message ${resultItem.isCorrect ? 'correct' : 'incorrect'}`}>
                      {resultItem.isCorrect ? (
                        <div>
                          <p>{t('listening.perfect')}</p>
                          <p className="word-display">{resultItem.correct}</p>
                        </div>
                      ) : (
                        <div>
                          <p>{t('listening.wrong')}</p>
                          <p className="word-display">{resultItem.correct}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button className="listening-next-btn" onClick={nextQuestion} style={{ backgroundColor: colors.bg }}>
                    {t('listening.next')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
}
