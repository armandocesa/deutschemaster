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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {paragraphs.map((para, idx) => (
          <p key={idx} style={{ margin: 0, lineHeight: '1.6' }}>{para}</p>
        ))}
      </div>
    );
  };

  // Render schema section (usually a table-like text)
  const renderSchema = (text) => {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '12px',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '13px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: '1.6',
        border: '1px solid var(--border-color)'
      }}>
        {text}
      </div>
    );
  };

  // Render esempi (examples with German bold, Italian lighter)
  const renderEsempi = (examples) => {
    if (!Array.isArray(examples)) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {examples.map((ex, idx) => (
          <div key={idx} style={{
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: '4px'
          }}>
            {(ex.tedesco || ex.german) && (
              <div style={{
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '8px',
                fontSize: '15px'
              }}>
                🇩🇪 {ex.tedesco || ex.german}
              </div>
            )}
            {(ex.italiano || ex.italian) && (
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
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
      <div style={{
        backgroundColor: 'var(--warning-dim)',
        border: '1px solid var(--warning)',
        borderLeft: '4px solid var(--warning)',
        padding: '12px',
        borderRadius: '4px',
        lineHeight: '1.6'
      }}>
        {text}
      </div>
    );
  };

  // Render uso section (usage notes)
  const renderUso = (text) => {
    return (
      <div style={{
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
        padding: '12px',
        borderRadius: '4px',
        lineHeight: '1.6',
        fontSize: '14px'
      }}>
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
        return <div key={k} style={{marginTop: '4px'}}><strong style={{color: 'var(--accent)', fontSize: '12px'}}>{displayK}:</strong> {typeof v === 'object' ? renderGenericValue(v) : <span style={{color: 'var(--text-secondary)'}}>{v}</span>}</div>;
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '20px' }}>{iconMap[key] || '◆'}</span>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--accent)',
          letterSpacing: '0.5px'
        }}>{displayKey}</h3>
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
        <div key={key} className="content-block" style={{ marginBottom: '24px' }}>
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
        <span className="page-level-badge" style={{backgroundColor: colors.bg}}>{level}</span>
        <h1 className="page-title">{topic.name}</h1>
        <p className="page-subtitle">{topic.explanation}</p>
      </div>
      <div className="grammar-content">{topic.content && renderContent(topic.content)}</div>
      {topic.exercises && topic.exercises.length > 0 && (
        <div className="exercises-section">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '20px' }}>📚</span>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--accent)',
              letterSpacing: '0.5px'
            }}>ESERCIZI ({topic.exercises.length})</h3>
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
        <div className="topics-list">
          {topics.map((topic, idx) => {
            const topicId = topic.id || `${activeLevel}_${idx}`;
            const topicStatus = getGrammarStatus(topicId);
            return (
              <div key={topic.id || idx} className={`topic-card status-${topicStatus}`} onClick={() => onNavigate('grammar', {level: activeLevel, topic: topic})}>
                <span className={`progress-dot ${topicStatus}`}></span>
                <div className="topic-number">{idx + 1}</div>
                <div className="topic-content"><h3 className="topic-title">{topic.name}</h3><p className="topic-explanation">{topic.explanation}</p></div>
                <div className="topic-meta">{topic.exercises && <span className="exercise-count">{topic.exercises.length} {t('grammar.exercises')}</span>}<Icons.ChevronRight /></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <GrammarTopicDetail topic={topic} level={activeLevel} colors={colors} />;
}
