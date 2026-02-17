import React, { useState, useEffect, useMemo, useRef } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useLevelAccess } from '../hooks/useLevelAccess';
import { saveAndSync } from '../utils/cloudSync';
import { addXP } from '../utils/gamification';
import { useLanguage } from '../contexts/LanguageContext';

function StoryReader({ story, level, colors, onBack, onNextStory, hasNext }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [tooltipWord, setTooltipWord] = useState(null);
  const { t } = useLanguage();
  const storyEndRef = useRef(null);
  const currentLineRef = useRef(null);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineRef.current) {
      currentLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLineIndex]);

  const currentLine = story.lines[currentLineIndex];
  const totalLines = story.lines.length;
  const textLines = story.lines.filter(l => l.type !== 'question');
  const questions = story.lines.filter(l => l.type === 'question');
  const completedQuestions = questions.filter(q => answers[story.lines.indexOf(q)] !== undefined).length;
  const progressPercent = Math.round(((currentLineIndex + 1) / totalLines) * 100);

  const handleNext = () => {
    if (currentLineIndex < story.lines.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1);
    } else {
      setShowScore(true);
      addXP(20, 'story');
      try {
        const completed = JSON.parse(localStorage.getItem('dm_completed_stories') || '[]');
        if (!completed.includes(story.id)) {
          completed.push(story.id);
          saveAndSync('dm_completed_stories', JSON.stringify(completed));
        }
      } catch {}
    }
  };

  const handleAnswer = (answerIdx) => {
    setAnswers(prev => ({...prev, [currentLineIndex]: answerIdx}));
    setShowQuestion(false);
    setTimeout(() => handleNext(), 500);
  };

  const readAloud = (text) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text || currentLine.text);
      u.lang = 'de-DE';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch {}
  };

  const renderTextWithTooltips = (text) => {
    const words = story.difficultWords || [];
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
        <span key={i} className="tooltip-word" onMouseEnter={() => setTooltipWord(m)} onMouseLeave={() => setTooltipWord(null)}>
          {m.word}
          {tooltipWord === m && <span className="tooltip-content"><div className="tooltip-translation">{m.translation}</div></span>}
        </span>
      );
      lastIndex = m.end;
    });
    if (lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  if (showScore) {
    const correctCount = Object.entries(answers).filter(([idx, ans]) => {
      const q = story.lines[parseInt(idx)];
      return q && q.type === 'question' && ans === q.correctAnswer;
    }).length;
    return (
      <div className="reading-page">
        <div className="reading-text-container">
          <div className="page-header">
            <span className="page-level-badge" style={{backgroundColor: colors.bg}}>{level}</span>
            <h1 className="page-title">{story.title}</h1>
            <p className="page-subtitle">{t('stories.title')} - {story.titleIt}</p>
          </div>
          <div className="reading-score">
            <h2>{t('stories.completed')}</h2>
            <p>{t('stories.completedText')} <strong>{story.title}</strong></p>
            <div className="stories-score-section">
              <div className="stories-score-xp">+20 XP</div>
              <p className="stories-score-xp-label">{t('stories.xpEarned')}</p>
            </div>
            {questions.length > 0 && (
              <div className="stories-comprehension-box">
                <h4>{t('stories.comprehension')}</h4>
                <p className="stories-comprehension-score">
                  {correctCount}/{questions.length} {t('stories.questions')}
                </p>
                <p className="stories-comprehension-message">
                  {correctCount === questions.length ? t('stories.perfect') : correctCount >= questions.length / 2 ? t('stories.goodJob') : t('stories.retry')}
                </p>
              </div>
            )}
            <div className="stories-navigation" style={{marginTop: '16px'}}>
              <button onClick={onBack} className="stories-nav-back-btn">
                {t('stories.backToStories')}
              </button>
              {hasNext && (
                <button onClick={onNextStory} className="stories-nav-next-btn">
                  {t('stories.nextLine')} &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isQuestion = currentLine.type === 'question';
  const question = isQuestion ? currentLine : null;

  // Get all lines up to and including current index (for accumulated view)
  const visibleLines = story.lines.slice(0, currentLineIndex + 1);

  return (
    <div className="reading-page">
      <div className="reading-text-container">
        <div className="page-header">
          <span className="page-level-badge" style={{backgroundColor: colors.bg}}>{level}</span>
          <h1 className="page-title">{story.title}</h1>
          <p className="page-subtitle">{story.titleIt}</p>
        </div>

        {/* Progress bar */}
        <div className="stories-progress-wrapper">
          <div className="stories-progress-bar">
            <div className="stories-progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: colors.bg }} />
          </div>
          <div className="stories-progress-info">
            <span>{currentLineIndex + 1}/{totalLines}</span>
            {questions.length > 0 && (
              <span>{completedQuestions}/{questions.length} {t('stories.questions')}</span>
            )}
          </div>
        </div>

        {/* Difficult words legend */}
        {story.difficultWords && story.difficultWords.length > 0 && (
          <div className="stories-vocab-bar">
            {story.difficultWords.map((dw, i) => (
              <span key={i} className="stories-vocab-chip">
                <strong>{dw.word}</strong> <span className="stories-vocab-meaning">{dw.translation}</span>
              </span>
            ))}
          </div>
        )}

        {/* Accumulated story view - all previous lines */}
        <div className="stories-book">
          {visibleLines.map((line, idx) => {
            const lineIdx = idx;
            const isCurrent = idx === currentLineIndex;
            const isQ = line.type === 'question';
            const isPast = idx < currentLineIndex;

            if (isQ) {
              const qAnswered = answers[idx] !== undefined;
              return (
                <div key={idx} ref={isCurrent ? currentLineRef : null}
                     className={`stories-book-question ${isCurrent ? 'current' : 'past'}`}>
                  <div className="stories-question-marker">?</div>
                  <div className="stories-question-text-book">
                    {line.question || line.questionIt}
                  </div>
                  {isCurrent && !qAnswered && (
                    <div className="stories-options-grid">
                      {(line.options || []).map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswer(optIdx)}
                          className="stories-option-btn"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {qAnswered && (
                    <div className={`stories-answer-result ${answers[idx] === line.correctAnswer ? 'correct' : 'incorrect'}`}>
                      {answers[idx] === line.correctAnswer ? '✓' : '✗'} {line.options[answers[idx]]}
                      {answers[idx] !== line.correctAnswer && (
                        <span className="stories-correct-answer"> → {line.options[line.correctAnswer]}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            const isNarrator = line.speaker === 'narrator';
            return (
              <div key={idx} ref={isCurrent ? currentLineRef : null}
                   className={`stories-book-line ${isCurrent ? 'current' : 'past'} ${isNarrator ? 'narrator' : 'dialogue'}`}>
                <div className="stories-book-text-row">
                  {!isNarrator && (
                    <span className="stories-book-speaker" style={{ color: colors.bg }}>
                      {line.speaker}:
                    </span>
                  )}
                  <span className={`stories-book-text ${isNarrator ? 'narrator-text' : ''}`}>
                    {isCurrent ? renderTextWithTooltips(line.text) : line.text}
                  </span>
                  {isCurrent && (
                    <button className="stories-inline-audio" onClick={() => readAloud(line.text)} title={t('stories.readAloud')}>
                      <Icons.Volume />
                    </button>
                  )}
                </div>
                {line.translation && (
                  <div className={`stories-book-translation ${isPast ? 'dimmed' : ''}`}>
                    {line.translation}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={storyEndRef} />
        </div>

        {/* Navigation */}
        <div className="stories-navigation">
          <button onClick={onBack} className="stories-nav-back-btn">
            {t('stories.back')}
          </button>
          <button
            onClick={handleNext}
            disabled={isQuestion && answers[currentLineIndex] === undefined}
            className="stories-nav-next-btn"
          >
            {currentLineIndex === story.lines.length - 1 ? t('stories.completeStory') : t('stories.nextLine')} →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoriesPage({ level, reading, onNavigate }) {
  const { canAccessLevel } = useLevelAccess();
  const { t, language } = useLanguage();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = LEVEL_COLORS[level || 'A1'] || { bg: '#6c5ce7', text: '#fff' };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const base = import.meta.env.BASE_URL + 'data';
        const langPath = language && language !== 'it' ? `${base}/${language}/stories.json` : null;
        let data = null;
        if (langPath) {
          try { const r = await fetch(langPath); if (r.ok) data = await r.json(); } catch {}
        }
        if (!data) {
          const r = await fetch(`${base}/stories.json`);
          data = await r.json();
        }
        setStories(data.levels || {});
        const completed = JSON.parse(localStorage.getItem('dm_completed_stories') || '[]');
        setCompletedStories(completed);
      } catch (e) {
        if (import.meta.env.DEV) console.error('Error loading stories:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [language]);

  // All stories from all levels, flattened for reader navigation
  const allStoriesFlat = useMemo(() => {
    const result = [];
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    levels.forEach(lvl => {
      (stories[lvl]?.stories || []).forEach(s => result.push({ ...s, _level: lvl }));
    });
    return result;
  }, [stories]);

  if (loading) {
    return (
      <div className="reading-page" style={{ padding: '20px' }}>
        <div className="skeleton" style={{ width: '180px', height: '28px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '280px', height: '16px', marginBottom: '24px' }} />
        <div className="stories-card-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius)' }} />)}
        </div>
      </div>
    );
  }

  if (selectedStory) {
    const storyLevel = selectedStory._level || 'A1';
    const storyColors = LEVEL_COLORS[storyLevel] || colors;
    const storyIdx = allStoriesFlat.findIndex(s => s.id === selectedStory.id);
    const nextStory = storyIdx >= 0 && storyIdx < allStoriesFlat.length - 1 ? allStoriesFlat[storyIdx + 1] : null;
    return (
      <StoryReader
        story={selectedStory}
        level={storyLevel}
        colors={storyColors}
        onBack={() => setSelectedStory(null)}
        hasNext={!!nextStory}
        onNextStory={() => nextStory && setSelectedStory(nextStory)}
      />
    );
  }

  const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const totalStories = allStoriesFlat.length;

  return (
    <div className="reading-page">
      <div className="page-header">
        <h1 className="page-title">{t('stories.interactive')}</h1>
        <p className="page-subtitle">{totalStories} {t('stories.stories')}</p>
      </div>

      {allLevels.map(lvl => {
        const lvlStories = stories[lvl]?.stories || [];
        if (lvlStories.length === 0) return null;
        const lvlColors = LEVEL_COLORS[lvl] || colors;
        const lvlCompleted = lvlStories.filter(s => completedStories.includes(s.id)).length;
        const lvlCanAccess = canAccessLevel(lvl);
        const lvlProgress = Math.round((lvlCompleted / lvlStories.length) * 100);

        return (
          <div key={lvl} className="stories-level-section">
            <div className="stories-level-header" style={{ borderBottomColor: lvlColors.bg }}>
              <div className="stories-level-header-left">
                <span className="stories-level-badge" style={{ background: lvlColors.bg }}>
                  {lvl}
                </span>
                <span className="stories-level-name">
                  {getLevelName(lvl, language)}
                </span>
              </div>
              <div className="stories-level-header-right">
                <div className="stories-level-progress-mini">
                  <div className="stories-level-progress-mini-fill" style={{ width: `${lvlProgress}%`, backgroundColor: lvlColors.bg }} />
                </div>
                <span className="stories-level-count">
                  {lvlCompleted}/{lvlStories.length}
                </span>
              </div>
            </div>

            {!lvlCanAccess ? (
              <div className="stories-locked-box">
                🔒 {t('stories.limitedMessage')} {lvl} {t('stories.requiresAuth')}
              </div>
            ) : (
              <div className="stories-card-grid">
                {lvlStories.map(story => {
                  const isCompleted = completedStories.includes(story.id);
                  const storyTextLines = story.lines.filter(l => l.type !== 'question').length;
                  const storyQuestions = story.lines.filter(l => l.type === 'question').length;
                  return (
                    <div
                      key={story.id}
                      className={`stories-card ${isCompleted ? 'completed' : ''}`}
                      onClick={() => setSelectedStory({ ...story, _level: lvl })}
                      style={{ '--card-accent': lvlColors.bg }}
                    >
                      <div className="stories-card-emoji">{story.emoji}</div>
                      <div className="stories-card-body">
                        <div className="stories-card-title">{story.title}</div>
                        <div className="stories-card-subtitle">{story.titleIt}</div>
                        <div className="stories-card-meta">
                          <span>{storyTextLines} righe</span>
                          <span className="stories-card-meta-dot">·</span>
                          <span>{storyQuestions} domande</span>
                          {story.characters && story.characters.length > 0 && (
                            <>
                              <span className="stories-card-meta-dot">·</span>
                              <span>{story.characters.join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {isCompleted && <span className="stories-card-check">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {totalStories === 0 && (
        <div className="empty-state">
          <p>{t('stories.noStories')}</p>
        </div>
      )}
    </div>
  );
}
