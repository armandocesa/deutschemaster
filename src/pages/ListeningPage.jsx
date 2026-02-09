import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS, fisherYatesShuffle } from '../utils/constants';
import { useData } from '../DataContext';
import { addXP, recordActivity } from '../utils/gamification';
import { speak } from '../utils/speech';
import { useLevelAccess } from '../hooks/useLevelAccess';
import LevelAccessModal from '../components/LevelAccessModal';

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
  const [mode, setMode] = useState('setup');
  const [exerciseType, setExerciseType] = useState('word');
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

  // Generate questions for word listening (Ascolta e scegli)
  const generateWordQuestions = (level, count) => {
    const allWords = [];
    const levelData = VOCABULARY_DATA.levels?.[level];
    levelData?.modules?.forEach(m => {
      m.words?.forEach(w => allWords.push({ german: w.german, italian: w.italian }));
    });

    if (allWords.length === 0) return [];

    const shuffled = fisherYatesShuffle(allWords);
    const selected = shuffled.slice(0, count);
    const allItalian = [...new Set(allWords.map(w => w.italian))];

    return selected.map(word => {
      const wrongAnswers = allItalian
        .filter(i => i !== word.italian)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      return {
        german: word.german,
        correctAnswer: word.italian,
        options: fisherYatesShuffle([word.italian, ...wrongAnswers]),
        type: 'word'
      };
    });
  };

  // Generate questions for dictation mode
  const generateDictationQuestions = (level, count) => {
    const allWords = [];
    const levelData = VOCABULARY_DATA.levels?.[level];
    levelData?.modules?.forEach(m => {
      m.words?.forEach(w => allWords.push({ german: w.german }));
    });

    if (allWords.length === 0) return [];

    const shuffled = fisherYatesShuffle(allWords);
    return shuffled.slice(0, count).map(word => ({
      german: word.german,
      answer: word.german,
      type: 'dictation'
    }));
  };

  const startExercise = () => {
    const qs = exerciseType === 'word'
      ? generateWordQuestions(selectedLevel, exerciseCount)
      : generateDictationQuestions(selectedLevel, exerciseCount);

    setQuestions(qs);
    setCurrentIndex(0);
    setUserAnswer('');
    setSelectedOption(null);
    setShowResult(false);
    setResults([]);
    setPlayCount(0);
    setTotalXP(0);
    setMode('playing');
  };

  // Auto-play audio when question loads
  useEffect(() => {
    if (mode === 'playing' && questions.length > 0 && currentIndex < questions.length) {
      setPlayCount(1);
      speak(questions[currentIndex].german);
    }
  }, [currentIndex, mode, questions]);

  const playAudio = () => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setPlayCount(p => p + 1);
      speak(questions[currentIndex].german);
    }
  };

  const playSlowAudio = () => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setPlayCount(p => p + 1);
      const word = questions[currentIndex].german;
      if (!word) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      utterance.rate = 0.5;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const germanVoice = voices.find(v => v.lang.startsWith('de'));
      if (germanVoice) utterance.voice = germanVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWordAnswer = (option) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);

    const current = questions[currentIndex];
    const isCorrect = option === current.correctAnswer;
    const xpEarned = isCorrect ? 15 : 0;

    setResults(prev => [...prev, {
      question: current.german,
      userAnswer: option,
      correctAnswer: current.correctAnswer,
      isCorrect,
      xpEarned,
      type: 'word'
    }]);

    if (isCorrect) {
      setTotalXP(p => p + xpEarned);
      addXP(xpEarned, 'listening_correct');
    }
  };

  const handleDictationVerify = () => {
    if (showResult || !userAnswer.trim()) return;
    setShowResult(true);

    const current = questions[currentIndex];
    const distance = levenshteinDistance(userAnswer, current.answer);
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
      question: current.german,
      userAnswer,
      correctAnswer: current.answer,
      distance,
      isExact,
      isClose,
      xpEarned,
      resultType,
      type: 'dictation'
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

  const colors = LEVEL_COLORS[selectedLevel];

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
          <h1 className="page-title">Esercizi di Ascolto</h1>
          <p className="page-subtitle">Ascolta e rispondi</p>

          <div className="listening-setup">
            <div className="setup-section">
              <h3>Tipo di esercizio</h3>
              <div className="setup-options">
                <button
                  className={`setup-option ${exerciseType === 'word' ? 'active' : ''}`}
                  onClick={() => setExerciseType('word')}
                >
                  <Icons.Volume /> Ascolta e scegli
                </button>
                <button
                  className={`setup-option ${exerciseType === 'dictation' ? 'active' : ''}`}
                  onClick={() => setExerciseType('dictation')}
                >
                  <Icons.Pen /> Dettato
                </button>
              </div>
            </div>

            <div className="setup-section">
              <h3>Livello</h3>
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
                      {isLocked && <span style={{marginLeft: '4px', fontSize: '12px'}}>🔒</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="setup-section">
              <h3>Numero di esercizi</h3>
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

            <button className="start-btn" onClick={startExercise} style={{ backgroundColor: colors.bg }}>
              Inizia
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
    const correctCount = results.filter(r => r.isCorrect || r.resultType === 'perfect').length;
    const percentage = Math.round((correctCount / results.length) * 100);
    const mistakes = results.filter(r => !r.isCorrect && r.resultType !== 'perfect' && r.resultType !== 'close');

    return (
      <div className="listening-page">
        <div className="finished-container">
          <div className="score-circle" style={{ borderColor: colors.bg }}>
            <span className="score-value">{percentage}%</span>
          </div>
          <h2>Esercizio completato!</h2>
          <p className="score-text">{correctCount} risposte corrette su {results.length}</p>
          <p className="xp-earned">+{totalXP} XP</p>

          {mistakes.length > 0 && (
            <div className="mistakes-section">
              <h3>Errori</h3>
              <div className="mistakes-list">
                {mistakes.map((r, idx) => (
                  <div key={idx} className="mistake-item">
                    <p className="mistake-question">
                      <strong>Domanda {results.indexOf(r) + 1}:</strong> {r.question}
                    </p>
                    <p className="mistake-yours">La tua risposta: {r.userAnswer}</p>
                    <p className="mistake-correct">Risposta corretta: {r.correctAnswer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="finished-actions">
            <button className="retry-btn" onClick={startExercise}>
              Riprova
            </button>
            <button className="new-session-btn" onClick={() => setMode('setup')}>
              Nuova Sessione
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

    // Word mode (Ascolta e scegli)
    if (exerciseType === 'word') {
      const isAnswered = selectedOption !== null;
      const isAnswerCorrect = selectedOption === current.correctAnswer;

      return (
        <div className="listening-page">
          <div className="playing-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: colors.bg }}></div>
            </div>
            <p className="question-counter">Domanda {currentIndex + 1} di {questions.length}</p>

            <div className="listening-content">
              <button
                className="speaker-btn"
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
                  <Icons.Repeat /> Ripeti
                </button>
                <p className="play-count">Ascolti: {playCount}</p>
              </div>

              <button className="slow-btn" onClick={playSlowAudio}>
                <Icons.Slow /> Lento
              </button>

              <div className="options-grid">
                {current.options.map((option, idx) => {
                  let buttonClass = 'option-btn';
                  if (isAnswered) {
                    if (option === current.correctAnswer) buttonClass += ' correct';
                    if (option === selectedOption && !isAnswerCorrect) buttonClass += ' incorrect';
                  }

                  return (
                    <button
                      key={idx}
                      className={buttonClass}
                      onClick={() => handleWordAnswer(option)}
                      disabled={isAnswered}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className={`result-message ${isAnswerCorrect ? 'correct' : 'incorrect'}`}>
                  {isAnswerCorrect ? (
                    <div>
                      <p>✓ Corretto! +15 XP</p>
                      <p className="word-display">{current.german}</p>
                    </div>
                  ) : (
                    <div>
                      <p>✗ La parola era: <strong>{current.german}</strong></p>
                    </div>
                  )}
                </div>
              )}

              {isAnswered && (
                <button className="next-btn" onClick={nextQuestion} style={{ backgroundColor: colors.bg }}>
                  Prossimo
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Dictation mode
    else {
      const resultItem = results.find(r => results.indexOf(r) === currentIndex);

      return (
        <div className="listening-page">
          <div className="playing-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: colors.bg }}></div>
            </div>
            <p className="question-counter">Domanda {currentIndex + 1} di {questions.length}</p>

            <div className="listening-content">
              <button
                className="speaker-btn"
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
                  <Icons.Repeat /> Ripeti
                </button>
                <p className="play-count">Ascolti: {playCount}</p>
              </div>

              <button className="slow-btn" onClick={playSlowAudio}>
                <Icons.Slow /> Lento
              </button>

              <input
                type="text"
                className="dictation-input"
                placeholder="Scrivi quello che senti..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={showResult}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
                    handleDictationVerify();
                  }
                }}
              />

              {!showResult ? (
                <button
                  className="verify-btn"
                  onClick={handleDictationVerify}
                  disabled={!userAnswer.trim()}
                  style={{ backgroundColor: colors.bg }}
                >
                  Verifica
                </button>
              ) : (
                <div>
                  {resultItem && (
                    <div className={`result-message ${resultItem.resultType === 'perfect' ? 'perfect' : resultItem.resultType === 'close' ? 'close' : 'wrong'}`}>
                      {resultItem.resultType === 'perfect' && (
                        <div>
                          <p>✓ Perfetto! +15 XP</p>
                          <p className="word-display">{resultItem.correctAnswer}</p>
                        </div>
                      )}
                      {resultItem.resultType === 'close' && (
                        <div>
                          <p>~ Quasi! +5 XP</p>
                          <p className="word-display">{resultItem.correctAnswer}</p>
                        </div>
                      )}
                      {resultItem.resultType === 'wrong' && (
                        <div>
                          <p>✗ La risposta corretta è:</p>
                          <p className="word-display">{resultItem.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button className="next-btn" onClick={nextQuestion} style={{ backgroundColor: colors.bg }}>
                    Prossimo
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
