import React, { useState } from 'react';
import Icons from '../components/Icons';
import { useData } from '../DataContext';

export default function LessonsPage({ onNavigate }) {
  const { LESSONS_DATA } = useData();
  const [progress, setProgress] = useState(() => { try{return JSON.parse(localStorage.getItem('dm_lessons_progress')||'{}')}catch{return {}} });

  const toggleLesson = (id) => {
    setProgress(prev => { const next = {...prev}; if(next[id]) delete next[id]; else next[id]=true; try{localStorage.setItem('dm_lessons_progress',JSON.stringify(next))}catch{} return next; });
  };

  const completedCount = Object.keys(progress).length;
  const lessons = LESSONS_DATA || [];
  const passiva = lessons.filter(l => l.phase === 'passiva');
  const attiva = lessons.filter(l => l.phase === 'attiva');

  const renderLesson = (lesson) => (
    <div key={lesson.id} className={`lesson-card ${lesson.isReview?'review':''} ${progress[lesson.id]?'completed':''}`} onClick={() => toggleLesson(lesson.id)}>
      <div className="lesson-num">{lesson.number}</div>
      <div className="lesson-info">
        <div className="lesson-title">{lesson.title}</div>
        <div className="lesson-meta">
          <span className={`lesson-phase-badge ${lesson.phase}`}>{lesson.phase==='passiva'?'Fase passiva':'Fase attiva'}</span>
          <span className="lesson-tag">{lesson.tag}</span>
        </div>
      </div>
      <div className={`lesson-check ${progress[lesson.id]?'done':''}`}>{progress[lesson.id] && <Icons.Check />}</div>
    </div>
  );

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
