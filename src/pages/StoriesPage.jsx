import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useLevelAccess } from '../hooks/useLevelAccess';
import { saveAndSync } from '../utils/cloudSync';
import { addXP } from '../utils/gamification';
import { useLanguage } from '../contexts/LanguageContext';

function InlineStory({ story, level, colors, storyRef, onNextStory, hasNext, t, isCompleted: initialCompleted }) {
  const [answers, setAnswers] = useState({});
  const [markedComplete, setMarkedComplete] = useState(initialCompleted);

  const questions = story.lines.filter(l => l.type === 'question');
  const correctCount = Object.entries(answers).filter(([idx, ans]) => {
    const q = story.lines[parseInt(idx)];
    return q && q.type === 'question' && ans === q.correctAnswer;
  }).length;
  const allQuestionsAnswered = questions.length > 0 && questions.every(q => answers[story.lines.indexOf(q)] !== undefined);

  const handleAnswer = (lineIdx, answerIdx) => {
    setAnswers(prev => ({ ...prev, [lineIdx]: answerIdx }));
  };

  const readAloud = (text) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch {}
  };

  const handleNextStory = () => {
    if (!markedComplete) {
      addXP(20, 'story');
      try {
        const completed = JSON.parse(localStorage.getItem('dm_completed_stories') || '[]');
        if (!completed.includes(story.id)) {
          completed.push(story.id);
          saveAndSync('dm_completed_stories', JSON.stringify(completed));
        }
      } catch {}
      setMarkedComplete(true);
    }
    if (onNextStory) onNextStory();
  };

  const storyTextLines = story.lines.filter(l => l.type !== 'question').length;
  const storyQuestions = questions.length;

  return (
    <div ref={storyRef} className="inline-story" id={`story-${story.id}`}>
      <div className="inline-story-header">
        <span className="inline-story-emoji">{story.emoji}</span>
        <div className="inline-story-header-text">
          <h3 className="inline-story-title">
            {story.title}
            {markedComplete && <span className="inline-story-check">✓</span>}
          </h3>
          <p className="inline-story-subtitle">{story.titleIt}</p>
          <div className="inline-story-meta">
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
        <span className="page-level-badge" style={{ backgroundColor: colors.bg }}>{level}</span>
      </div>

      {story.difficultWords?.length > 0 && (
        <div className="stories-vocab-bar">
          {story.difficultWords.map((dw, i) => (
            <span key={i} className="stories-vocab-chip">
              <strong>{dw.word}</strong> <span className="stories-vocab-meaning">{dw.translation}</span>
            </span>
          ))}
        </div>
      )}

      <div className="stories-book inline-story-book">
        {story.lines.map((line, idx) => {
          if (line.type === 'question') {
            const qAnswered = answers[idx] !== undefined;
            return (
              <div key={idx} className="stories-book-question current">
                <div className="stories-question-marker">?</div>
                <div className="stories-question-text-book">{line.question || line.questionIt}</div>
                {!qAnswered ? (
                  <div className="stories-options-grid">
                    {(line.options || []).map((opt, optIdx) => (
                      <button key={optIdx} onClick={() => handleAnswer(idx, optIdx)} className="stories-option-btn">
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
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
            <div key={idx} className={`stories-book-line current ${isNarrator ? 'narrator' : 'dialogue'}`}>
              <div className="stories-book-text-row">
                {!isNarrator && (
                  <span className="stories-book-speaker" style={{ color: colors.bg }}>
                    {line.speaker}:
                  </span>
                )}
                <span className={`stories-book-text ${isNarrator ? 'narrator-text' : ''}`}>
                  {line.text}
                </span>
                <button className="stories-inline-audio" onClick={() => readAloud(line.text)} title={t('stories.readAloud')}>
                  <Icons.Volume />
                </button>
              </div>
              {line.translation && (
                <div className="stories-book-translation">{line.translation}</div>
              )}
            </div>
          );
        })}
      </div>

      {allQuestionsAnswered && (
        <div className="inline-story-score">
          <span>{correctCount}/{questions.length} {t('stories.questions')}</span>
          <span className="inline-story-score-msg">
            {correctCount === questions.length ? t('stories.perfect') : correctCount >= questions.length / 2 ? t('stories.goodJob') : t('stories.retry')}
          </span>
        </div>
      )}

      {hasNext && (
        <div className="stories-navigation inline-story-nav">
          <button onClick={handleNextStory} className="stories-nav-next-btn inline-story-next-btn">
            {t('stories.nextStory')} →
          </button>
        </div>
      )}
    </div>
  );
}

export default function StoriesPage({ level, reading, onNavigate }) {
  const { canAccessLevel } = useLevelAccess();
  const { t, language } = useLanguage();
  const [stories, setStories] = useState([]);
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const storyRefs = useRef({});

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

  const allStoriesFlat = useMemo(() => {
    const result = [];
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    levels.forEach(lvl => {
      (stories[lvl]?.stories || []).forEach(s => result.push({ ...s, _level: lvl }));
    });
    return result;
  }, [stories]);

  const scrollToStory = useCallback((storyId) => {
    const ref = storyRefs.current[storyId];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (loading) {
    return (
      <div className="reading-page" style={{ padding: '20px' }}>
        <div className="skeleton" style={{ width: '180px', height: '28px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '280px', height: '16px', marginBottom: '24px' }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius)', marginBottom: '16px' }} />
        ))}
      </div>
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
                <span className="stories-level-badge" style={{ background: lvlColors.bg }}>{lvl}</span>
                <span className="stories-level-name">{getLevelName(lvl, language)}</span>
              </div>
              <div className="stories-level-header-right">
                <div className="stories-level-progress-mini">
                  <div className="stories-level-progress-mini-fill" style={{ width: `${lvlProgress}%`, backgroundColor: lvlColors.bg }} />
                </div>
                <span className="stories-level-count">{lvlCompleted}/{lvlStories.length}</span>
              </div>
            </div>

            {!lvlCanAccess ? (
              <div className="stories-locked-box">
                🔒 {t('stories.limitedMessage')} {lvl} {t('stories.requiresAuth')}
              </div>
            ) : (
              <div className="inline-stories-list">
                {lvlStories.map(story => {
                  const globalIdx = allStoriesFlat.findIndex(s => s.id === story.id);
                  const nextStory = globalIdx >= 0 && globalIdx < allStoriesFlat.length - 1 ? allStoriesFlat[globalIdx + 1] : null;
                  return (
                    <InlineStory
                      key={story.id}
                      story={story}
                      level={lvl}
                      colors={lvlColors}
                      storyRef={el => { storyRefs.current[story.id] = el; }}
                      hasNext={!!nextStory}
                      onNextStory={() => nextStory && scrollToStory(nextStory.id)}
                      t={t}
                      isCompleted={completedStories.includes(story.id)}
                    />
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
