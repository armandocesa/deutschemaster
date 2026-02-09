import React, { useState } from 'react';
import Icons from '../components/Icons';
import { useData } from '../DataContext';

export default function LessonsPage({ onNavigate }) {
  const { LESSONS_DATA } = useData();
  const [progress, setProgress] = useState(() => { try{return JSON.parse(localStorage.getItem('dm_lessons_progress')||'{}')}catch{return {}} });
  const [expandedId, setExpandedId] = useState(null);

  const toggleCompletion = (id, e) => {
    e.stopPropagation();
    setProgress(prev => { const next = {...prev}; if(next[id]) delete next[id]; else next[id]=true; try{localStorage.setItem('dm_lessons_progress',JSON.stringify(next))}catch{} return next; });
  };

  const expandLesson = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const completedCount = Object.keys(progress).length;
  const lessons = LESSONS_DATA || [];
  const passiva = lessons.filter(l => l.phase === 'passiva');
  const attiva = lessons.filter(l => l.phase === 'attiva');

  const renderLesson = (lesson) => {
    const isExpanded = expandedId === lesson.id;
    const isCompleted = progress[lesson.id];

    return (
      <div key={lesson.id}>
        <div
          className={`lesson-card ${lesson.isReview?'review':''} ${isCompleted?'completed':''}`}
          onClick={() => expandLesson(lesson.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="lesson-num">{lesson.number}</div>
          <div className="lesson-info">
            <div className="lesson-title">{lesson.title}</div>
            <div className="lesson-meta">
              <span className={`lesson-phase-badge ${lesson.phase}`}>{lesson.phase==='passiva'?'Fase passiva':'Fase attiva'}</span>
              <span className="lesson-tag">{lesson.tag}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isCompleted && <span style={{ fontSize: '12px', color: 'var(--accent-light)', fontWeight: 'bold' }}>Completata</span>}
            <div style={{ fontSize: '18px', color: isExpanded ? 'var(--accent-light)' : '#999', transition: 'transform 0.2s' }}>
              {isExpanded ? '▼' : '▶'}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderTop: 'none',
            padding: '16px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>Titolo</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>{lesson.title}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>Fase</div>
                  <span className={`lesson-phase-badge ${lesson.phase}`} style={{ display: 'inline-block' }}>
                    {lesson.phase==='passiva'?'Fase passiva':'Fase attiva'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>Categoria</div>
                  <span className="lesson-tag">{lesson.tag}</span>
                </div>
              </div>

              {lesson.isReview && (
                <div style={{
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#ffc107',
                  fontWeight: '500',
                  display: 'inline-block',
                  width: 'fit-content',
                }}>
                  📚 Lezione di revisione
                </div>
              )}

              <button
                onClick={(e) => toggleCompletion(lesson.id, e)}
                style={{
                  backgroundColor: isCompleted ? '#4caf50' : 'var(--bg-tertiary)',
                  color: isCompleted ? 'white' : 'var(--text-primary)',
                  border: isCompleted ? 'none' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                {isCompleted ? (
                  <>
                    <Icons.Check style={{ width: '16px', height: '16px' }} /> Completata
                  </>
                ) : (
                  'Segna come completata'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lessons-page">
      <div className="lessons-progress">
        <div className="lessons-progress-header"><h3>Progresso Lezioni</h3><span>{completedCount}/{lessons.length} completate</span></div>
        <div className="lessons-progress-bar"><div className="lessons-progress-fill" style={{width:`${lessons.length?completedCount/lessons.length*100:0}%`}}></div></div>
      </div>
      <div className="lessons-phase-group">
        <h3 className="lessons-phase-title" style={{color:'var(--accent-light)'}}>Fase passiva</h3>
        <p className="lessons-phase-subtitle">Lezioni 1-49 - Ascolto e comprensione</p>
        <div className="lessons-list">{passiva.map(renderLesson)}</div>
      </div>
      <div className="lessons-phase-group">
        <h3 className="lessons-phase-title" style={{color:'#00cec9'}}>Fase attiva</h3>
        <p className="lessons-phase-subtitle">Lezioni 50-100 - Produzione e pratica attiva</p>
        <div className="lessons-list">{attiva.map(renderLesson)}</div>
      </div>
    </div>
  );
}
