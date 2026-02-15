import React, { useState } from 'react';
import Icons from '../components/Icons';
import { useData } from '../DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { speak } from '../utils/speech';
import { saveAndSync } from '../utils/cloudSync';

function LessonDetail({ lesson }) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(() => { try { return JSON.parse(localStorage.getItem('dm_lessons_progress') || '{}'); } catch { return {}; } });
  const [showAnswers, setShowAnswers] = useState({});
  const isCompleted = progress[lesson.id];
  const hasContent = lesson.dialogue || lesson.vocabulary || lesson.grammar || lesson.exercises;

  const toggleCompletion = () => {
    setProgress(prev => {
      const next = { ...prev };
      if (next[lesson.id]) delete next[lesson.id]; else next[lesson.id] = true;
      try { saveAndSync('dm_lessons_progress', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const toggleAnswer = (idx) => {
    setShowAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="lessons-lesson-detail-container">
      <div className="lessons-detail-header">
        <div className="lessons-detail-title-section">
          <span className="lessons-detail-number">{lesson.number}</span>
          <div>
            <h1 className="lessons-detail-title">{lesson.title}</h1>
            <div className="lessons-detail-tags">
              <span className={`lesson-phase-badge ${lesson.phase}`}>{lesson.phase === 'passiva' ? t('lessons.passive') : t('lessons.active')}</span>
              <span className="lesson-tag">{lesson.tag}</span>
              {lesson.isReview && <span className="lessons-review-badge">{t('lessons.review')}</span>}
            </div>
          </div>
        </div>
        <button onClick={toggleCompletion} className={`lessons-mark-complete-btn ${isCompleted ? 'completed' : ''}`}>
          {isCompleted ? <><Icons.Check /> {t('lessons.completed_label')}</> : t('lessons.markCompleted')}
        </button>
      </div>

      {!hasContent && (
        <div className="lessons-no-content">
          <p className="lessons-no-content-msg">{t('lessons.notAvailable')}</p>
          <p className="lessons-no-content-hint">{t('lessons.futureAdded')}</p>
        </div>
      )}

      {lesson.dialogue && lesson.dialogue.length > 0 && (
        <div className="lessons-section">
          <div className="lessons-section-header">
            <span className="lessons-section-icon">💬</span>
            <h2 className="lessons-section-title">{t('lessons.dialog')}</h2>
          </div>
          <div className="lessons-dialogue-items">
            {lesson.dialogue.map((line, idx) => (
              <div key={idx} className="lessons-dialogue-item">
                <div style={{ flex: 1 }}>
                  <div className="lessons-dialogue-speaker">{line.de}</div>
                  <div className="lessons-dialogue-translation">{line.it}</div>
                </div>
                <button className="speak-btn" onClick={() => speak(line.de)}><Icons.Volume /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.vocabulary && lesson.vocabulary.length > 0 && (
        <div className="lessons-section">
          <div className="lessons-section-header">
            <span className="lessons-section-icon">📖</span>
            <h2 className="lessons-section-title">{t('lessons.vocabulary')}</h2>
          </div>
          <div className="lessons-vocabulary-items">
            {lesson.vocabulary.map((word, idx) => (
              <div key={idx} className="lessons-vocab-item">
                <span className="lessons-vocab-de">{word.de}</span>
                <span className="lessons-vocab-it">{word.it}</span>
                {word.example && <span className="lessons-vocab-example">"{word.example}"</span>}
                <button className="speak-btn" onClick={() => speak(word.de)}><Icons.Volume /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.grammar && (
        <div className="lessons-section">
          <div className="lessons-section-header">
            <span className="lessons-section-icon">📝</span>
            <h2 className="lessons-section-title">{t('lessons.grammar')}</h2>
          </div>
          <div className="lessons-grammar-box">
            {lesson.grammar}
          </div>
        </div>
      )}

      {lesson.exercises && lesson.exercises.length > 0 && (
        <div className="lessons-exercises-section">
          <div className="lessons-section-header">
            <span className="lessons-section-icon">📚</span>
            <h2 className="lessons-section-title">{t('lessons.exercises')} ({lesson.exercises.length})</h2>
          </div>
          <div className="lessons-exercises-items">
            {lesson.exercises.map((ex, idx) => (
              <div key={idx} className="exercise-card">
                <span className="exercise-number">#{idx + 1}</span>
                <p className="exercise-question">{ex.q || ex.question}</p>
                <button className="show-answer-btn" onClick={() => toggleAnswer(idx)}>
                  {showAnswers[idx] ? t('lessons.hideAnswer') : t('lessons.showAnswer')} {t('lessons.answer')}
                </button>
                {showAnswers[idx] && (
                  <div className="exercise-answer">
                    <div className="answer-text"><strong>{t('lessons.answer')}:</strong> {ex.a || ex.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonsPage({ selectedLesson, onNavigate }) {
  const { LESSONS_DATA } = useData();
  const { t } = useLanguage();
  const [progress, setProgress] = useState(() => { try { return JSON.parse(localStorage.getItem('dm_lessons_progress') || '{}'); } catch { return {}; } });

  // If selectedLesson is a number (from PathsPage), look up the actual lesson object
  const resolvedLesson = (() => {
    if (!selectedLesson) return null;
    if (typeof selectedLesson === 'object') return selectedLesson;
    // It's a lesson number — find it in LESSONS_DATA
    const lessons = LESSONS_DATA || [];
    return lessons.find(l => l.number === selectedLesson) || null;
  })();

  if (resolvedLesson) {
    return <LessonDetail lesson={resolvedLesson} />;
  }

  const completedCount = Object.keys(progress).length;
  const lessons = LESSONS_DATA || [];
  const passiva = lessons.filter(l => l.phase === 'passiva');
  const attiva = lessons.filter(l => l.phase === 'attiva');

  const renderLesson = (lesson) => {
    const isCompleted = progress[lesson.id];
    const hasContent = lesson.dialogue || lesson.vocabulary;

    return (
      <div key={lesson.id}
        className={`compact-list-item ${isCompleted ? 'completed' : ''}`}
        onClick={() => onNavigate('lessons', { lesson })}
        style={{ cursor: 'pointer' }}
      >
        <span className="compact-icon" style={{fontSize:'14px',fontWeight:800,width:'28px',height:'28px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(108,92,231,0.15)',color:'var(--accent-light)',flexShrink:0, margin: 0}}>{lesson.number}</span>
        <div className="compact-info">
          <div className="compact-title">{lesson.title}</div>
          <div className="compact-subtitle">
            {lesson.phase === 'passiva' ? t('lessons.passive') : t('lessons.active')} · {lesson.tag}
            {!hasContent && <span style={{fontStyle:'italic'}}> · {t('lessons.comingSoon')}</span>}
          </div>
        </div>
        {isCompleted && <span className="compact-badge success">✓</span>}
        <span className="compact-chevron">›</span>
      </div>
    );
  };

  return (
    <div className="lessons-page">
      <div className="lessons-progress">
        <div className="lessons-progress-header"><h2>{t('lessons.progress')}</h2><span>{completedCount}/{lessons.length} {t('lessons.completed')}</span></div>
        <div className="lessons-progress-bar"><div className="lessons-progress-fill" style={{ width: `${lessons.length ? completedCount / lessons.length * 100 : 0}%` }}></div></div>
      </div>
      <div className="lessons-phase-group">
        <h2 className="lessons-phase-title" style={{ color: 'var(--accent-light)' }}>{t('lessons.passive')}</h2>
        <p className="lessons-phase-subtitle">{t('lessons.title')} 1-49 - {t('lessons.listeningComprehension')}</p>
        <div className="compact-list">{passiva.map(renderLesson)}</div>
      </div>
      <div className="lessons-phase-group">
        <h2 className="lessons-phase-title" style={{ color: 'var(--highlight)' }}>{t('lessons.active')}</h2>
        <p className="lessons-phase-subtitle">{t('lessons.title')} 50-100 - {t('lessons.activeProduction')}</p>
        <div className="compact-list">{attiva.map(renderLesson)}</div>
      </div>
    </div>
  );
}
