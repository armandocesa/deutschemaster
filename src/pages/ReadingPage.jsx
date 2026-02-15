import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { saveAndSync } from '../utils/cloudSync';

function ReadingDetail({ reading, level, colors }) {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);
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
        <div className="reading-toolbar"><button className="read-aloud-btn" onClick={readAloud}><Icons.Volume /> {t('reading.readAloud')}</button></div>
        <div className="reading-text">{reading.text.split('\n').filter(p => p.trim()).map((p, i) => <p key={i}>{renderTextWithTooltips(p)}</p>)}</div>
        <div className="comprehension-section">
          <h2>{t('reading.comprehension')}</h2>
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
          {showScore && <div className="reading-score"><h2>{t('reading.score')} {score}/{reading.questions.length}</h2><p>{score===reading.questions.length?t('reading.perfect'):score>=reading.questions.length/2?t('reading.goodJob'):t('reading.tryAgain')}</p></div>}
        </div>
      </div>
    </div>
  );
}

export default function ReadingPage({ level, reading, onNavigate }) {
  const { t } = useLanguage();
  const { READING_DATA } = useData();
  const [internalLevel, setInternalLevel] = useState(level || (() => { try{const v=localStorage.getItem('dm_last_level');return v?JSON.parse(v):'A1'}catch{return 'A1'} }));
  const activeLevel = level || internalLevel;
  const texts = READING_DATA.levels?.[activeLevel]?.texts || [];
  const colors = LEVEL_COLORS[activeLevel] || { bg: '#6c5ce7', text: '#fff' };
  const handleLevelChange = (lvl) => { setInternalLevel(lvl); try{saveAndSync('dm_last_level',JSON.stringify(lvl))}catch{} if(level) onNavigate('reading',{level:lvl}); };

  if (reading) return <ReadingDetail reading={reading} level={activeLevel} colors={colors} />;

  return (
    <div className="reading-page">
      <div className="page-header"><h1 className="page-title">{t('reading.title')}</h1><p className="page-subtitle">{getLevelName(activeLevel)} - {texts.length} {t('reading.texts')}</p></div>
      <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />
      <div className="compact-list">
        {texts.map(text => (
          <div key={text.id} className="compact-list-item" onClick={() => onNavigate('reading',{level:activeLevel,reading:text})}>
            <span className="compact-icon">📖</span>
            <div className="compact-info">
              <div className="compact-title">{text.title}</div>
              <div className="compact-subtitle">{text.theme}</div>
            </div>
            <span className="compact-chevron">›</span>
          </div>
        ))}
      </div>
      {texts.length === 0 && <div className="empty-state"><p>{t('reading.noTexts')}</p></div>}
    </div>
  );
}
