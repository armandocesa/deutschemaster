import React, { useState } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { getGrammarStatus } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';

function GrammarTopicDetail({ topic, level, colors }) {
  const { t } = useLanguage();
  const [answerVisibility, setAnswerVisibility] = useState({});

  const toggleAnswer = (index) => {
    setAnswerVisibility(prev => ({...prev, [index]: !prev[index]}));
  };

  // Helper function to split text on double newlines for regola
  const splitParagraphs = (text) => {
    if (!text) return null;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    return paragraphs.length > 0 ? paragraphs : null;
  };

  // Render regola section with paragraph breaks
  const renderRegola = (text) => {
    const paragraphs = splitParagraphs(text);
    if (!paragraphs) return <span>{text}</span>;
    return (
      <div className="grammar-regola-container">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="grammar-regola-paragraph">{para}</p>
        ))}
      </div>
    );
  };

  // Render schema section (usually a table-like text)
  const renderSchema = (text) => {
    return (
      <div className="grammar-schema-container">
        {text}
      </div>
    );
  };

  // Render esempi (examples with German bold, Italian lighter)
  const renderEsempi = (examples) => {
    if (!Array.isArray(examples)) return null;
    return (
      <div className="grammar-esempi-container">
        {examples.map((ex, idx) => (
          <div key={idx} className="grammar-esempio-item">
            {(ex.tedesco || ex.german) && (
              <div className="grammar-esempio-german">
                🇩🇪 {ex.tedesco || ex.german}
              </div>
            )}
            {(ex.italiano || ex.italian) && (
              <div className="grammar-esempio-italian">
                🇮🇹 {ex.italiano || ex.italian}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render eccezioni with warning-style background
  const renderEccezioni = (text) => {
    return (
      <div className="grammar-eccezioni-container">
        {text}
      </div>
    );
  };

  // Render uso section (usage notes)
  const renderUso = (text) => {
    return (
      <div className="grammar-uso-container">
        {text}
      </div>
    );
  };

  // Generic renderer for other content types
  const renderGenericValue = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return <span>{value}</span>;
    if (Array.isArray(value)) {
      return <ul className="content-list">{value.map((item, i) => (
        <li key={i}>{typeof item === 'object' ? renderGenericValue(item) : item}</li>
      ))}</ul>;
    }
    if (typeof value === 'object') {
      return Object.entries(value).map(([k, v]) => {
        if (k.startsWith('_')) return null;
        const displayK = k.replace(/_/g, ' ');
        return <div key={k} className="grammar-generic-item"><strong className="grammar-generic-label">{displayK}:</strong> {typeof v === 'object' ? renderGenericValue(v) : <span className="grammar-generic-value">{v}</span>}</div>;
      });
    }
    return <span>{String(value)}</span>;
  };

  // Section header with icon/emoji
  const renderSectionHeader = (key) => {
    const iconMap = {
      regola: '📝',
      schema: '📊',
      esempi: '📌',
      uso: '💡',
      eccezioni: '⚠️'
    };
    const displayKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    return (
      <div className="grammar-section-header">
        <span className="grammar-section-icon">{iconMap[key] || '◆'}</span>
        <h2 className="grammar-section-title">{displayKey}</h2>
      </div>
    );
  };

  const renderContent = (content) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return null;

    // Define section order
    const sectionOrder = ['regola', 'schema', 'esempi', 'uso', 'eccezioni'];
    const allKeys = Object.keys(content).filter(k => !k.startsWith('_'));
    const orderedKeys = [
      ...sectionOrder.filter(k => allKeys.includes(k)),
      ...allKeys.filter(k => !sectionOrder.includes(k))
    ];

    return orderedKeys.map((key) => {
      const value = content[key];
      if (value === undefined || value === null) return null;

      return (
        <div key={key} className="grammar-content-block">
          {renderSectionHeader(key)}
          <div className="content-value">
            {key === 'regola' && renderRegola(value)}
            {key === 'schema' && renderSchema(value)}
            {key === 'esempi' && renderEsempi(value)}
            {key === 'uso' && renderUso(value)}
            {key === 'eccezioni' && renderEccezioni(value)}
            {!['regola', 'schema', 'esempi', 'uso', 'eccezioni'].includes(key) && renderGenericValue(value)}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="grammar-detail">
      <div className="page-header" style={{'--level-color': colors.bg}}>
        <span className="page-level-badge">{level}</span>
        <h1 className="page-title">{topic.name}</h1>
        <p className="page-subtitle">{topic.explanation}</p>
      </div>
      <div className="grammar-content">{topic.content && renderContent(topic.content)}</div>
      {topic.exercises && topic.exercises.length > 0 && (
        <div className="exercises-section">
          <div className="grammar-section-header">
            <span className="grammar-section-icon">📚</span>
            <h2 className="grammar-section-title">{t('lessons.exercises')} ({topic.exercises.length})</h2>
          </div>
          <div className="exercises-list">
            {topic.exercises.map((ex, idx) => (
              <div key={idx} className="exercise-card">
                <div className="exercise-header">
                  <span className="exercise-number">#{idx + 1}</span>
                </div>
                <p className="exercise-question">{ex.question}</p>
                <button
                  className="show-answer-btn"
                  onClick={() => toggleAnswer(idx)}
                >
                  {answerVisibility[idx] ? t('hide') : t('show')} {t('answer')}
                </button>
                {answerVisibility[idx] && (
                  <div className="exercise-answer">
                    <div className="answer-text"><strong>{t('grammar.answer')}</strong> {ex.answer}</div>
                    {ex.explanation && <div className="answer-explanation"><strong>{t('grammar.explanation')}</strong> {ex.explanation}</div>}
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

export default function GrammarPage({ level, topic, onNavigate }) {
  const { t } = useLanguage();
  const { GRAMMAR_DATA } = useData();
  const [internalLevel, setInternalLevel] = useState(level || (() => { try { const v = localStorage.getItem('dm_last_level'); return v ? JSON.parse(v) : 'A1'; } catch { return 'A1'; } }));
  const activeLevel = level || internalLevel;

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    try { saveAndSync('dm_last_level', JSON.stringify(lvl)); } catch {}
    if (level) onNavigate('grammar', { level: lvl });
  };

  const levelData = GRAMMAR_DATA?.levels?.[activeLevel];
  const topics = levelData?.topics || [];
  const colors = LEVEL_COLORS[activeLevel] || { bg: '#6c5ce7', text: '#fff' };

  if (!topic) {
    return (
      <div className="grammar-page">
        <div className="page-header" style={{'--level-color': colors.bg}}>
          <h1 className="page-title">{t('grammar.title')}</h1>
          <p className="page-subtitle">{levelData?.title || getLevelName(activeLevel)} - {topics.length} {t('grammar.topics')}</p>
        </div>
        <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />
        <div className="compact-list">
          {topics.map((topic, idx) => {
            const topicId = topic.id || `${activeLevel}_${idx}`;
            const topicStatus = getGrammarStatus(topicId);
            return (
              <div key={topic.id || idx} className={`compact-list-item`} onClick={() => onNavigate('grammar', {level: activeLevel, topic: topic})}>
                <span className={`progress-dot compact-dot ${topicStatus}`}></span>
                <div className="compact-info">
                  <div className="compact-title">{topic.name}</div>
                  <div className="compact-subtitle">{topic.explanation}</div>
                </div>
                {topic.exercises && <span className="compact-meta">{topic.exercises.length} ex.</span>}
                <span className="compact-chevron">›</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <GrammarTopicDetail topic={topic} level={activeLevel} colors={colors} />;
}
