import React, { useState } from 'react';
import Icons from '../components/Icons';
import { useData } from '../DataContext';
import { speak } from '../utils/speech';

function LessonDetail({ lesson }) {
  const [progress, setProgress] = useState(() => { try { return JSON.parse(localStorage.getItem('dm_lessons_progress') || '{}'); } catch { return {}; } });
  const [showAnswers, setShowAnswers] = useState({});
  const isCompleted = progress[lesson.id];
  const hasContent = lesson.dialogue || lesson.vocabulary || lesson.grammar || lesson.exercises;

  const toggleCompletion = () => {
    setProgress(prev => {
      const next = { ...prev };
      if (next[lesson.id]) delete next[lesson.id]; else next[lesson.id] = true;
      try { localStorage.setItem('dm_lessons_progress', JSON.stringify(next)); } catch {}
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
              <span className={`lesson-phase-badge ${lesson.phase}`}>{lesson.phase === 'passiva' ? 'Fase passiva' : 'Fase attiva'}</span>
              <span className="lesson-tag">{lesson.tag}</span>
              {lesson.isReview && <span style={{ background: 'rgba(255,193,7,0.12)', color: '#ffc107', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Revisione</span>}
            </div>
          </div>
        </div>
        <button onClick={toggleCompletion} style={{
          marginTop: '12px', padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          background: isCompleted ? '#22c55e' : 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {isCompleted ? <><Icons.Check /> Completata</> : 'Segna come completata'}
        </button>
      </div>

      {!hasContent && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>Contenuto della lezione non ancora disponibile.</p>
          <p style={{ fontSize: '13px' }}>Le lezioni 1-14 hanno contenuto completo. Le altre saranno aggiunte in futuro.</p>
        </div>
      )}

      {lesson.dialogue && lesson.dialogue.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '20px' }}>💬</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px' }}>DIALOGO</h3>
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px' }}>VOCABOLARIO</h3>
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px' }}>GRAMMATICA</h3>
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px' }}>ESERCIZI ({lesson.exercises.length})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lesson.exercises.map((ex, idx) => (
              <div key={idx} className="exercise-card">
                <span className="exercise-number">#{idx + 1}</span>
                <p className="exercise-question">{ex.q || ex.question}</p>
                <button className="show-answer-btn" onClick={() => toggleAnswer(idx)}>
                  {showAnswers[idx] ? 'Nascondi' : 'Mostra'} risposta
                </button>
                {showAnswers[idx] && (
                  <div className="exercise-answer">
                    <div className="answer-text"><strong>Risposta:</strong> {ex.a || ex.answer}</div>
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
  const [progress, setProgress] = useState(() => { try { return JSON.parse(localStorage.getItem('dm_lessons_progress') || '{}'); } catch { return {}; } });

  if (selectedLesson) {
    return <LessonDetail lesson={selectedLesson} />;
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
            <span className={`lesson-phase-badge ${lesson.phase}`}>{lesson.phase === 'passiva' ? 'Fase passiva' : 'Fase attiva'}</span>
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
        <div className="lessons-progress-header"><h3>Progresso Lezioni</h3><span>{completedCount}/{lessons.length} completate</span></div>
        <div className="lessons-progress-bar"><div className="lessons-progress-fill" style={{ width: `${lessons.length ? completedCount / lessons.length * 100 : 0}%` }}></div></div>
      </div>
      <div className="lessons-phase-group">
        <h3 className="lessons-phase-title" style={{ color: 'var(--accent-light)' }}>Fase passiva</h3>
        <p className="lessons-phase-subtitle">Lezioni 1-49 - Ascolto e comprensione</p>
        <div className="lessons-list">{passiva.map(renderLesson)}</div>
      </div>
      <div className="lessons-phase-group">
        <h3 className="lessons-phase-title" style={{ color: '#00cec9' }}>Fase attiva</h3>
        <p className="lessons-phase-subtitle">Lezioni 50-100 - Produzione e pratica attiva</p>
        <div className="lessons-list">{attiva.map(renderLesson)}</div>
      </div>
    </div>
  );
}
