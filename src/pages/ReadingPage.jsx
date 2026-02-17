import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { saveDifficultWord, removeDifficultWord, isDifficultWord } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';

function ReadingDetail({ reading, level, colors, allTexts, onNavigate }) {
  const { t } = useLanguage();
  const currentIndex = allTexts ? allTexts.findIndex(tx => tx.id === reading.id) : -1;
  const nextReading = currentIndex >= 0 && currentIndex < allTexts.length - 1 ? allTexts[currentIndex + 1] : null;
  const prevReading = currentIndex > 0 ? allTexts[currentIndex - 1] : null;
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [savedWords, setSavedWords] = useState({});

  useEffect(() => {
    if (reading.difficultWords) {
      const initial = {};
      reading.difficultWords.forEach((dw, idx) => {
        initial[idx] = isDifficultWord(`reading_${reading.id}_${dw.word}`);
      });
      setSavedWords(initial);
    }
  }, [reading]);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const handleAnswer = (qIdx, answerIdx) => {
    if (answers[qIdx] !== undefined) return;
    const newAnswers = {...answers, [qIdx]: answerIdx};
    setAnswers(newAnswers);
    if (Object.keys(newAnswers).length === reading.questions.length) setShowScore(true);
  };

  const score = Object.entries(answers).filter(([qIdx, ansIdx]) => ansIdx === reading.questions[parseInt(qIdx)]?.correctAnswer).length;

  const readAloud = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(reading.text);
      u.lang = 'de-DE';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch {}
  };

  const toggleSaveWord = (dw, idx) => {
    const id = `reading_${reading.id}_${dw.word}`;
    const isSaved = savedWords[idx];
    if (isSaved) {
      removeDifficultWord(id);
      setSavedWords(prev => ({...prev, [idx]: false}));
    } else {
      saveDifficultWord({ german: dw.word, italian: dw.translation, id }, 'word');
      setSavedWords(prev => ({...prev, [idx]: true}));
    }
  };

  const renderTextWithTooltips = (text) => {
    const words = reading.difficultWords || [];
    const matches = [];
    words.forEach(dw => {
      const idx = text.indexOf(dw.word);
      if (idx !== -1) matches.push({start: idx, end: idx + dw.word.length, ...dw});
    });
    matches.sort((a, b) => a.start - b.start);
    const parts = [];
    let lastIndex = 0;
    matches.forEach((m, i) => {
      if (m.start > lastIndex) parts.push(text.substring(lastIndex, m.start));
      parts.push(
        <span key={i} className="tooltip-word">
          {m.word}
          <span className="tooltip-content">
            <div className="tooltip-translation">{m.translation}</div>
            <div className="tooltip-explanation">{m.explanation}</div>
          </span>
        </span>
      );
      lastIndex = m.end;
    });
    if (lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="reading-page">
      <div className="reading-text-container">
        {/* Header */}
        <div className="reading-header">
          <div className="reading-header-meta">
            <span className="reading-level-badge" style={{backgroundColor: colors.bg}}>{level}</span>
            <span className="reading-theme-label">{reading.theme}</span>
            {currentIndex >= 0 && (
              <span className="reading-counter">{currentIndex + 1}/{allTexts.length}</span>
            )}
          </div>
          <h1 className="reading-title">{reading.title}</h1>
          <div className="reading-toolbar">
            <button className="read-aloud-btn" onClick={readAloud}>
              <Icons.Volume /> {t('reading.readAloud')}
            </button>
          </div>
        </div>

        {/* Text body */}
        <article className="reading-article">
          {reading.text.split('\n').filter(p => p.trim()).map((p, i) => (
            <p key={i}>{renderTextWithTooltips(p)}</p>
          ))}
        </article>

        {/* Vocabulary section */}
        {reading.difficultWords && reading.difficultWords.length > 0 && (
          <section className="reading-vocab-section">
            <div className="reading-section-divider">
              <span className="reading-section-label">
                <Icons.Book /> {t('vocabulary.colWord')}
              </span>
            </div>
            <div className="reading-vocab-grid">
              {reading.difficultWords.map((dw, idx) => (
                <div key={idx} className="reading-vocab-chip">
                  <span className="reading-vocab-de">{dw.word}</span>
                  <span className="reading-vocab-tr">{dw.translation}</span>
                  <button
                    className={`reading-vocab-save ${savedWords[idx] ? 'saved' : ''}`}
                    onClick={() => toggleSaveWord(dw, idx)}
                    title={savedWords[idx] ? t('favorites.title') : t('common.save')}
                  >
                    {savedWords[idx] ? <Icons.StarFilled /> : <Icons.Star />}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comprehension section */}
        <section className="reading-comprehension">
          <div className="reading-section-divider">
            <span className="reading-section-label">
              <Icons.Check /> {t('reading.comprehension')}
            </span>
          </div>
          <div className="reading-questions-list">
            {reading.questions.map((q, qIdx) => {
              const userAnswer = answers[qIdx];
              const hasAnswered = userAnswer !== undefined;
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={qIdx} className={`reading-question-card ${hasAnswered ? (isCorrect ? 'answered-correct' : 'answered-wrong') : ''}`}>
                  <p className="reading-q-number">
                    <span className="reading-q-badge">{qIdx + 1}</span>
                    {q.question}
                  </p>
                  <div className="reading-q-options">
                    {q.options.map((opt, oIdx) => {
                      let optClass = 'reading-q-option';
                      if (hasAnswered) {
                        if (oIdx === q.correctAnswer) optClass += ' correct';
                        else if (oIdx === userAnswer) optClass += ' incorrect';
                        else optClass += ' dimmed';
                      }
                      return (
                        <button
                          key={oIdx}
                          className={optClass}
                          onClick={() => handleAnswer(qIdx, oIdx)}
                          disabled={hasAnswered}
                        >
                          <span className="reading-q-option-letter">{String.fromCharCode(65 + oIdx)}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {hasAnswered && !isCorrect && q.explanation && (
                    <div className="reading-q-explanation">{q.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>
          {showScore && (
            <div className={`reading-score-card ${score === reading.questions.length ? 'perfect' : score >= reading.questions.length / 2 ? 'good' : 'retry'}`}>
              <div className="reading-score-number">{score}/{reading.questions.length}</div>
              <div className="reading-score-message">
                {score === reading.questions.length
                  ? t('reading.perfect')
                  : score >= reading.questions.length / 2
                    ? t('reading.goodJob')
                    : t('reading.tryAgain')}
              </div>
            </div>
          )}
        </section>

        {/* Navigation */}
        <div className="reading-nav">
          <button className="reading-nav-btn back" onClick={() => onNavigate('reading', {level})}>
            &larr; {t('stories.back')}
          </button>
          <div className="reading-nav-arrows">
            {prevReading && (
              <button className="reading-nav-btn prev" onClick={() => onNavigate('reading', {level, reading: prevReading})}>
                &larr;
              </button>
            )}
            {nextReading && (
              <button className="reading-nav-btn next" onClick={() => onNavigate('reading', {level, reading: nextReading})}>
                &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReadingPage({ level, reading, onNavigate }) {
  const { t, language } = useLanguage();
  const { READING_DATA } = useData();
  const [internalLevel, setInternalLevel] = useState(level || (() => { try { const v = localStorage.getItem('dm_last_level'); return v ? JSON.parse(v) : 'A1'; } catch { return 'A1'; } }));
  const activeLevel = level || internalLevel;
  const texts = READING_DATA.levels?.[activeLevel]?.texts || [];
  const colors = LEVEL_COLORS[activeLevel] || { bg: '#6c5ce7', text: '#fff' };

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    try { saveAndSync('dm_last_level', JSON.stringify(lvl)); } catch {}
    if (level) onNavigate('reading', { level: lvl });
  };

  if (reading) return <ReadingDetail reading={reading} level={activeLevel} colors={colors} allTexts={texts} onNavigate={onNavigate} />;

  return (
    <div className="reading-page">
      <div className="page-header">
        <h1 className="page-title">{t('reading.title')}</h1>
        <p className="page-subtitle">{getLevelName(activeLevel, language)} - {texts.length} {t('reading.texts')}</p>
      </div>
      <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />
      <div className="compact-list">
        {texts.map((text, idx) => (
          <div key={text.id} className="compact-list-item" onClick={() => onNavigate('reading', {level: activeLevel, reading: text})}>
            <span className="compact-number">{idx + 1}.</span>
            <div className="compact-info">
              <div className="compact-title">{text.title}</div>
              <div className="compact-subtitle">{text.theme}</div>
            </div>
            <span className="compact-chevron">&rsaquo;</span>
          </div>
        ))}
      </div>
      {texts.length === 0 && <div className="empty-state"><p>{t('reading.noTexts')}</p></div>}
    </div>
  );
}
