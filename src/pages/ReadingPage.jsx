import React, { useState } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { saveAndSync } from '../utils/cloudSync';

function ReadingDetail({ reading, level, colors }) {
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const handleAnswer = (qIdx, answer) => { if(answers[qIdx]!==undefined) return; setAnswers(prev => ({...prev,[qIdx]:answer})); if(Object.keys({...answers,[qIdx]:answer}).length===reading.questions.length) setShowScore(true); };
  const score = Object.entries(answers).filter(([idx, ans]) => ans === reading.questions[parseInt(idx)]?.correctAnswer).length;
  const readAloud = () => { try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(reading.text); u.lang='de-DE'; u.rate=0.85; speechSynthesis.speak(u); } catch {} };
  const renderTextWithTooltips = (text) => {
    const words = reading.difficultWords || [];
    const matches = [];
    words.forEach(dw => { const idx = text.indexOf(dw.word); if(idx!==-1) matches.push({start:idx,end:idx+dw.word.length,...dw}); });
    matches.sort((a,b) => a.start - b.start);
    const parts = [];
    let lastIndex = 0;
    matches.forEach((m, i) => {
      if(m.start > lastIndex) parts.push(text.substring(lastIndex, m.start));
      parts.push(<span key={i} className="tooltip-word">{m.word}<span className="tooltip-content"><div className="tooltip-translation">{m.translation}</div><div className="tooltip-explanation">{m.explanation}</div></span></span>);
      lastIndex = m.end;
    });
    if(lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="reading-page">
      <div className="reading-text-container">
        <div className="page-header"><span className="page-level-badge" style={{backgroundColor: colors.bg}}>{level}</span><h1 className="page-title">{reading.title}</h1><p className="page-subtitle">{reading.theme}</p></div>
        <div className="reading-toolbar"><button className="read-aloud-btn" onClick={readAloud}><Icons.Volume /> Leggi ad alta voce</button></div>
        <div className="reading-text">{reading.text.split('\n').filter(p => p.trim()).map((p, i) => <p key={i}>{renderTextWithTooltips(p)}</p>)}</div>
        <div className="comprehension-section">
          <h3>Comprensione del testo</h3>
          {reading.questions.map((q, qIdx) => {
            const userAnswer = answers[qIdx]; const hasAnswered = userAnswer !== undefined; const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={qIdx} className="comprehension-question">
                <p>{qIdx+1}. {q.question}</p>
                <div className="comprehension-options">
                  {q.options.map((opt, oIdx) => (<button key={oIdx} className={`comprehension-option ${hasAnswered?(opt===q.correctAnswer?'correct':opt===userAnswer?'incorrect':''):''}`} onClick={() => handleAnswer(qIdx, opt)} disabled={hasAnswered}>{opt}</button>))}
                </div>
                {hasAnswered && !isCorrect && q.explanation && <div className="comprehension-explanation">{q.explanation}</div>}
              </div>
            );
          })}
          {showScore && <div className="reading-score"><h3>Punteggio: {score}/{reading.questions.length}</h3><p>{score===reading.questions.length?'Perfetto!':score>=reading.questions.length/2?'Buon lavoro!':'Riprova dopo aver riletto.'}</p></div>}
        </div>
      </div>
    </div>
  );
}

export default function ReadingPage({ level, reading, onNavigate }) {
  const { READING_DATA } = useData();
  const [internalLevel, setInternalLevel] = useState(level || (() => { try{return localStorage.getItem('dm_last_level')||'A1'}catch{return 'A1'} }));
  const activeLevel = level || internalLevel;
  const texts = READING_DATA.levels?.[activeLevel]?.texts || [];
  const colors = LEVEL_COLORS[activeLevel];
  const handleLevelChange = (lvl) => { setInternalLevel(lvl); try{saveAndSync('dm_last_level',lvl)}catch{} if(level) onNavigate('reading',{level:lvl}); };

  if (reading) return <ReadingDetail reading={reading} level={activeLevel} colors={colors} />;

  return (
    <div className="reading-page">
      <div className="page-header"><h1 className="page-title">Lettura</h1><p className="page-subtitle">{getLevelName(activeLevel)} - {texts.length} testi</p></div>
      <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} />
      <div className="reading-list">
        {texts.map(t => (<div key={t.id} className="reading-card" onClick={() => onNavigate('reading',{level:activeLevel,reading:t})}><span className="theme-badge">{t.theme}</span><h3>{t.title}</h3><p>{t.text.substring(0,100)}...</p></div>))}
      </div>
      {texts.length === 0 && <div className="empty-state"><p>Nessun testo disponibile per questo livello</p></div>}
    </div>
  );
}
