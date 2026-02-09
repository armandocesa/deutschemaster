import React, { useState } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { getGrammarStatus } from '../utils/storage';

function ExerciseCard({ exercise, index }) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="exercise-card">
      <div className="exercise-header"><span className="exercise-number">#{index}</span></div>
      <p className="exercise-question">{exercise.question}</p>
      <button className="show-answer-btn" onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? 'Nascondi' : 'Mostra'} risposta</button>
      {showAnswer && (
        <div className="exercise-answer">
          <div className="answer-text"><strong>Risposta:</strong> {exercise.answer}</div>
          {exercise.explanation && <div className="answer-explanation"><strong>Spiegazione:</strong> {exercise.explanation}</div>}
        </div>
      )}
    </div>
  );
}

function GrammarTopicDetail({ topic, level, colors }) {
  const [showExercises, setShowExercises] = useState(false);
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    if (topic.content) Object.keys(topic.content).forEach(k => { initial[k] = true; });
    return initial;
  });

  const toggleSection = (key) => setOpenSections(prev => ({...prev, [key]: !prev[key]}));

  const renderValue = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return <span>{value}</span>;
    if (Array.isArray(value)) {
      return <ul className="content-list">{value.map((item, i) => (
        <li key={i}>{typeof item === 'object' ? renderValue(item) : item}</li>
      ))}</ul>;
    }
    if (typeof value === 'object') {
      return Object.entries(value).map(([k, v]) => {
        if (k.startsWith('_')) return null;
        if (k === 'tedesco' || k === 'german') return <div key={k} className="example-german">{'🇩🇪'} {v}</div>;
        if (k === 'italiano' || k === 'italian') return <div key={k} className="example-italian">{'🇮🇹'} {v}</div>;
        if (k === 'esempio' || k === 'example') return <div key={k} className="content-example">{v}</div>;
        const displayK = k.replace(/_/g, ' ');
        return <div key={k} style={{marginTop: '4px'}}><strong style={{color: 'var(--accent)', fontSize: '12px'}}>{displayK}:</strong> {typeof v === 'object' ? renderValue(v) : <span style={{color: 'var(--text-secondary)'}}>{v}</span>}</div>;
      });
    }
    return <span>{String(value)}</span>;
  };

  const renderContent = (content) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return null;
    return Object.entries(content).map(([key, value]) => {
      if (key.startsWith('_')) return null;
      const displayKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
      const isOpen = openSections[key];
      return (
        <div key={key} className="content-block">
          <div className="content-block-header" onClick={() => toggleSection(key)}>
            <h4 className="content-key">{displayKey}</h4>
            <span className={`content-block-toggle ${isOpen ? 'open' : ''}`}>{'▼'}</span>
          </div>
          {isOpen && <div className="content-value">{renderValue(value)}</div>}
        </div>
      );
    });
  };

  return (
    <div className="grammar-detail">
      <div className="page-header" style={{'--level-color': colors.bg}}>
        <span className="page-level-badge" style={{backgroundColor: colors.bg}}>{level}</span>
        <h1 className="page-title">{topic.name}</h1>
        <p className="page-subtitle">{topic.explanation}</p>
      </div>
      <div className="grammar-content">{topic.content && renderContent(topic.content)}</div>
      {topic.exercises && topic.exercises.length > 0 && (
        <div className="exercises-section">
          <button className="exercises-toggle" onClick={() => setShowExercises(!showExercises)}>{showExercises ? 'Nascondi' : 'Mostra'} Esercizi ({topic.exercises.length})</button>
          {showExercises && <div className="exercises-list">{topic.exercises.map((ex, idx) => <ExerciseCard key={idx} exercise={ex} index={idx + 1} />)}</div>}
        </div>
      )}
    </div>
  );
}

export default function GrammarPage({ level, topic, onNavigate }) {
  const { GRAMMAR_DATA } = useData();
  const [internalLevel, setInternalLevel] = useState(level || (() => { try { return localStorage.getItem('dm_last_level') || 'A1'; } catch { return 'A1'; } }));
  const activeLevel = level || internalLevel;

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    try { localStorage.setItem('dm_last_level', lvl); } catch {}
    if (level) onNavigate('grammar', { level: lvl });
  };

  const levelData = GRAMMAR_DATA.levels?.[activeLevel];
  const topics = levelData?.topics || [];
  const colors = LEVEL_COLORS[activeLevel];

  if (!topic) {
    return (
      <div className="grammar-page">
        <div className="page-header" style={{'--level-color': colors.bg}}>
          <h1 className="page-title">Grammatica</h1>
          <p className="page-subtitle">{levelData?.title || getLevelName(activeLevel)} - {topics.length} argomenti</p>
        </div>
        <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} />
        <div className="topics-list">
          {topics.map((t, idx) => {
            const topicId = t.id || `${activeLevel}_${idx}`;
            const topicStatus = getGrammarStatus(topicId);
            return (
              <div key={t.id || idx} className={`topic-card status-${topicStatus}`} onClick={() => onNavigate('grammar', {level: activeLevel, topic: t})}>
                <span className={`progress-dot ${topicStatus}`}></span>
                <div className="topic-number">{idx + 1}</div>
                <div className="topic-content"><h3 className="topic-title">{t.name}</h3><p className="topic-explanation">{t.explanation}</p></div>
                <div className="topic-meta">{t.exercises && <span className="exercise-count">{t.exercises.length} esercizi</span>}<Icons.ChevronRight /></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <GrammarTopicDetail topic={topic} level={activeLevel} colors={colors} />;
}
