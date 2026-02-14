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
    <div style={{ maxWidth: '700px', margin: '0 auto', animation: 'slideIn 0.2s ease-out' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{
            width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 800, background: 'rgba(108,92,231,0.15)', color: 'var(--accent-light)', flexShrink: 0
          }}>{lesson.number}</span>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{lesson.title}</h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span className={`lesson-phase-badge ${lesson.phase}`}>{lesson.phase === 'passiva' ? t('lessons.passive') : t('lessons.active')}</span>
              <span className="lesson-tag">{lesson.tag}</span>
              {lesson.isReview && <span style={{ background: 'var(--warning-dim)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{t('lessons.review')}</span>}
            </div>
          </div>
        </div>
        <button onClick={toggleCompletion} style={{
          marginTop: '12px', padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          background: isCompleted ? 'var(--success)' : 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {isCompleted ? <><Icons.Check /> {t('lessons.completed_label')}</> : t('lessons.markCompleted')}
        </button>
      </div>

      {!hasContent && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>{t('lessons.notAvailable')}</p>
          <p style={{ fontSize: '13px' }}>{t('lessons.futureAdded')}</p>
        </div>
      )}

      {lesson.dialogue && lesson.dialogue.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '20px' }}>💬</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px' }}>{t('lessons.dialog')}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lesson.dialogue.map((line, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 14px',
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{line.de}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{line.it}</div>
                </div>
                <button className="speak-btn" onClick={() => speak(line.de)} style={{ flexShrink: 0, marginTop: 0 }}><Icons.Volume /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.vocabulary && lesson.vocabulary.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '20px' }}>📖</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px' }}>{t('lessons.vocabulary')}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {lesson.vocabulary.map((word, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', flexWrap: 'wrap'
              }}>
                <span style={{ fontWeight: 600, fontSize: '15px', minWidth: '120px' }}>{word.de}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', flex: 1 }}>{word.it}</span>
                {word.example && <span style={{ color: 'var(--accent-light)', fontSize: '12px', fontStyle: 'italic' }}>"{word.example}"</span>}
                <button className="speak-btn" onClick={() => speak(word.de)} style={{ flexShrink: 0, marginTop: 0 }}><Icons.Volume /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.grammar && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '20px' }}>📝</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px' }}>{t('lessons.grammar')}</h3>
          </div>
          <div style={{
            padding: '16px', background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)',
            borderRadius: '8px', lineHeight: '1.7', fontSize: '14px'
          }}>
            {lesson.grammar}
          </div>
        </div>
      )}

      {lesson.exercises && lesson.exercises.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '20px' }}>📚</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px' }}>{t('lessons.exercises')} ({lesson.exercises.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        className={`lesson-card ${lesson.isReview ? 'review' : ''} ${isCompleted ? 'completed' : ''}`}
        onClick={() => onNavigate('lessons', { lesson })}
        style={{ cursor: 'pointer' }}
      >
        <div className="lesson-num">{lesson.number}</div>
        <div className="lesson-info">
          <div className="lesson-title">{lesson.title}</div>
          <div className="lesson-meta">
            <span className={`lesson-phase-badge ${lesson.phase}`}>{lesson.phase === 'passiva' ? t('lessons.passive') : t('lessons.active')}</span>
            <span className="lesson-tag">{lesson.tag}</span>
            {!hasContent && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>in arrivo</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCompleted && <Icons.Check style={{ color: 'var(--success)', width: '20px', height: '20px' }} />}
          <Icons.ChevronRight />
        </div>
      </div>
    );
  };

  return (
    <div className="lessons-page">
      <div className="lessons-progress">
        <div className="lessons-progress-header"><h3>{t('lessons.progress')}</h3><span>{completedCount}/{lessons.length} {t('lessons.completed')}</span></div>
        <div className="lessons-progress-bar"><div className="lessons-progress-fill" style={{ width: `${lessons.length ? completedCount / lessons.length * 100 : 0}%` }}></div></div>
      </div>
      <div className="lessons-phase-group">
        <h3 className="lessons-phase-title" style={{ color: 'var(--accent-light)' }}>{t('lessons.passive')}</h3>
        <p className="lessons-phase-subtitle">{t('lessons.title')} 1-49 - {t('lessons.listeningComprehension')}</p>
        <div className="lessons-list">{passiva.map(renderLesson)}</div>
      </div>
      <div className="lessons-phase-group">
        <h3 className="lessons-phase-title" style={{ color: 'var(--highlight)' }}>{t('lessons.active')}</h3>
        <p className="lessons-phase-subtitle">{t('lessons.title')} 50-100 - {t('lessons.activeProduction')}</p>
        <div className="lessons-list">{attiva.map(renderLesson)}</div>
      </div>
    </div>
  );
}
