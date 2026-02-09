import React, { useState, useEffect, useMemo } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useLevelAccess } from '../hooks/useLevelAccess';
import { saveAndSync } from '../utils/cloudSync';
import { addXP } from '../utils/gamification';

function StoryReader({ story, level, colors, onBack }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [tooltipWord, setTooltipWord] = useState(null);

  const currentLine = story.lines[currentLineIndex];
  const questions = story.lines.filter(l => l.type === 'question');
  const completedQuestions = questions.filter(q => answers[story.lines.indexOf(q)] !== undefined).length;

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
          localStorage.setItem('dm_completed_stories', JSON.stringify(completed));
          saveAndSync('dm_completed_stories', JSON.stringify(completed));
        }
      } catch {}
    }
  };

  const handleAnswer = (answer) => {
    setAnswers(prev => ({...prev, [currentLineIndex]: answer}));
    setShowQuestion(false);
    setTimeout(() => handleNext(), 500);
  };

  const readAloud = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(currentLine.text);
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
            <p className="page-subtitle">Storie - {story.titleIt}</p>
          </div>
          <div className="reading-score">
            <h3>Complimenti! 🎉</h3>
            <p>Hai completato la storia: <strong>{story.title}</strong></p>
            <div style={{marginTop: '20px', padding: '16px', background: 'rgba(108,92,231,0.1)', borderRadius: 'var(--radius)', textAlign: 'center'}}>
              <div style={{fontSize: '32px', fontWeight: '800', color: 'var(--accent)'}}>+20 XP</div>
              <p style={{color: 'var(--text-secondary)', marginTop: '8px'}}>Hai guadagnato 20 XP!</p>
            </div>
            {questions.length > 0 && (
              <div style={{marginTop: '20px', padding: '16px', background: 'rgba(108,92,231,0.05)', borderRadius: 'var(--radius)'}}>
                <h4>Risultati della comprensione:</h4>
                <p style={{fontSize: '18px', fontWeight: '700', marginTop: '8px'}}>
                  {correctCount}/{questions.length} domande corrette
                </p>
                <p style={{color: 'var(--text-secondary)', marginTop: '8px'}}>
                  {correctCount === questions.length ? 'Perfetto! Hai capito tutto!' : correctCount >= questions.length / 2 ? 'Buon lavoro!' : 'Prova a rileggere la storia per migliorare!'}
                </p>
              </div>
            )}
            <button onClick={onBack} style={{marginTop: '24px', padding: '12px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>
              Torna alle storie
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isQuestion = currentLine.type === 'question';
  const question = isQuestion ? currentLine : null;

  return (
    <div className="reading-page">
      <div className="reading-text-container">
        <div className="page-header">
          <span className="page-level-badge" style={{backgroundColor: colors.bg}}>{level}</span>
          <h1 className="page-title">{story.title}</h1>
          <p className="page-subtitle">{story.titleIt}</p>
        </div>

        <div style={{display: 'flex', gap: '12px', marginBottom: '20px', fontSize: '12px'}}>
          <div style={{padding: '6px 12px', background: 'rgba(108,92,231,0.1)', borderRadius: 'var(--radius)', color: 'var(--accent)'}}>
            Riga {currentLineIndex + 1} di {story.lines.length}
          </div>
          {questions.length > 0 && (
            <div style={{padding: '6px 12px', background: 'rgba(108,92,231,0.1)', borderRadius: 'var(--radius)', color: 'var(--accent)'}}>
              Domande: {completedQuestions}/{questions.length}
            </div>
          )}
        </div>

        {!isQuestion ? (
          <>
            <div className="reading-toolbar">
              <button className="read-aloud-btn" onClick={readAloud}>
                <Icons.Volume /> Leggi ad alta voce
              </button>
            </div>
            <div style={{background: 'rgba(108,92,231,0.05)', padding: '24px', borderRadius: 'var(--radius)', marginBottom: '24px'}}>
              <div style={{fontSize: '14px', lineHeight: '1.8', color: 'var(--text-primary)'}}>
                <span style={{fontWeight: '600', color: 'var(--accent)', marginRight: '12px'}}>
                  {currentLine.speaker === 'narrator' ? '📖 Narratore' : `${currentLine.speaker}:`}
                </span>
                <span>{renderTextWithTooltips(currentLine.text)}</span>
              </div>
              {currentLine.translation && (
                <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(108,92,231,0.2)'}}>
                  <strong>Italiano:</strong> {currentLine.translation}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{background: 'rgba(108,92,231,0.1)', padding: '24px', borderRadius: 'var(--radius)', marginBottom: '24px'}}>
              <h3 style={{marginBottom: '16px', fontSize: '16px', fontWeight: '700'}}>
                ❓ {question.question || question.questionIt}
              </h3>
              <div style={{display: 'grid', gap: '12px'}}>
                {(question.options || []).map((opt, idx) => {
                  const answered = answers[currentLineIndex] !== undefined;
                  const isCorrect = idx === question.correctAnswer;
                  const selected = answers[currentLineIndex] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt)}
                      disabled={answered}
                      style={{
                        padding: '12px 16px',
                        background: answered ? (isCorrect ? 'rgba(16,185,129,0.2)' : selected ? 'rgba(239,68,68,0.2)' : 'rgba(108,92,231,0.05)') : 'rgba(108,92,231,0.1)',
                        border: answered ? (isCorrect ? '2px solid #10b981' : selected ? '2px solid #ef4444' : '1px solid rgba(108,92,231,0.2)') : '1px solid rgba(108,92,231,0.2)',
                        color: answered ? (isCorrect ? '#10b981' : selected ? '#ef4444' : 'var(--text-primary)') : 'var(--text-primary)',
                        borderRadius: 'var(--radius)',
                        textAlign: 'left',
                        cursor: answered ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.3s'
                      }}
                    >
                      {isCorrect && answered && '✓ '}
                      {selected && answered && !isCorrect && '✗ '}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div style={{display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '24px'}}>
          <button onClick={onBack} style={{padding: '12px 24px', background: 'rgba(108,92,231,0.1)', color: 'var(--accent)', border: '1px solid rgba(108,92,231,0.2)', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>
            Indietro
          </button>
          <button
            onClick={handleNext}
            disabled={isQuestion && answers[currentLineIndex] === undefined}
            style={{padding: '12px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600', cursor: isQuestion && answers[currentLineIndex] === undefined ? 'not-allowed' : 'pointer', opacity: isQuestion && answers[currentLineIndex] === undefined ? 0.5 : 1}}
          >
            {currentLineIndex === story.lines.length - 1 ? 'Completa' : 'Avanti'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoriesPage({ level, reading, onNavigate }) {
  const { canAccessLevel, requiresAuth } = useLevelAccess();
  const [internalLevel, setInternalLevel] = useState(level || (() => {
    try { return localStorage.getItem('dm_last_level') || 'A1'; } catch { return 'A1'; }
  }));
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [completedStories, setCompletedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeLevel = level || internalLevel;
  const colors = LEVEL_COLORS[activeLevel];
  const canAccess = canAccessLevel(activeLevel);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch('/data/stories.json');
        const data = await res.json();
        setStories(data.levels || {});
        const completed = JSON.parse(localStorage.getItem('dm_completed_stories') || '[]');
        setCompletedStories(completed);
      } catch (e) {
        console.error('Error loading stories:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const currentStories = useMemo(() => {
    return stories[activeLevel]?.stories || [];
  }, [stories, activeLevel]);

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    try { saveAndSync('dm_last_level', lvl); } catch {}
    if (level) onNavigate('stories', { level: lvl });
  };

  if (loading) {
    return (
      <div className="reading-page">
        <div className="reading-text-container">
          <p style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)'}}>Caricamento storie...</p>
        </div>
      </div>
    );
  }

  if (selectedStory) {
    return <StoryReader story={selectedStory} level={activeLevel} colors={colors} onBack={() => setSelectedStory(null)} />;
  }

  if (!canAccess) {
    return (
      <div className="reading-page">
        <div className="reading-text-container">
          <div className="page-header">
            <h1 className="page-title">Storie</h1>
          </div>
          <div style={{textAlign: 'center', padding: '40px', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)', border: '1px solid rgba(239,68,68,0.3)'}}>
            <span style={{fontSize: '48px', display: 'block', marginBottom: '16px'}}>🔒</span>
            <h3 style={{marginBottom: '8px'}}>Accesso limitato</h3>
            <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>Il livello {activeLevel} richiede l'autenticazione. Accedi o fai l'upgrade al tuo piano!</p>
            <button onClick={() => onNavigate('login')} style={{padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>
              Accedi Ora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reading-page">
      <div className="page-header">
        <h1 className="page-title">Storie Interattive</h1>
        <p className="page-subtitle">{getLevelName(activeLevel)} - {currentStories.length} storie</p>
      </div>

      <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />

      <div className="reading-list">
        {currentStories.map(story => {
          const isCompleted = completedStories.includes(story.id);
          return (
            <div
              key={story.id}
              className="reading-card"
              onClick={() => setSelectedStory(story)}
              style={{cursor: 'pointer', position: 'relative', overflow: 'hidden'}}
            >
              {isCompleted && (
                <div style={{position: 'absolute', top: '12px', right: '12px', background: '#10b981', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', zIndex: 10}}>
                  ✓
                </div>
              )}
              <div style={{fontSize: '48px', marginBottom: '12px'}}>{story.emoji}</div>
              <h3>{story.title}</h3>
              <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px'}}>{story.titleIt}</p>
              <div style={{marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {story.characters.map(char => (
                  <span key={char} style={{background: 'rgba(108,92,231,0.1)', padding: '2px 8px', borderRadius: '4px'}}>
                    {char}
                  </span>
                ))}
              </div>
              {isCompleted && (
                <div style={{marginTop: '12px', padding: '8px 12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 'var(--radius)', fontSize: '11px', fontWeight: '600'}}>
                  Completata! +20 XP
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentStories.length === 0 && (
        <div className="empty-state">
          <p>Nessuna storia disponibile per questo livello. Torna dopo!</p>
        </div>
      )}
    </div>
  );
}
