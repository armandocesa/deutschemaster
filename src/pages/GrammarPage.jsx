import React, { useState } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { getGrammarStatus, markGrammarStatus, saveDifficultWord, removeDifficultWord, isDifficultWord } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';

function GrammarTopicDetail({ topic, level, colors, onNavigate }) {
  const { t } = useLanguage();
  const [answerVisibility, setAnswerVisibility] = useState({});
  const [savedPhrases, setSavedPhrases] = useState({});

  const toggleAnswer = (index) => {
    setAnswerVisibility(prev => ({...prev, [index]: !prev[index]}));
  };

  const toggleSavePhrase = (phrase, index) => {
    const id = `grammar_${topic.id || topic.name}_ex${index}`;
    const isSaved = savedPhrases[index] || isDifficultWord(id);
    if (isSaved) {
      removeDifficultWord(id);
      setSavedPhrases(prev => ({...prev, [index]: false}));
    } else {
      saveDifficultWord({ german: phrase, italian: '', id }, 'word');
      setSavedPhrases(prev => ({...prev, [index]: true}));
    }
  };

  // Render regola as numbered list (split on newlines or periods for structure)
  const renderRegola = (text) => {
    if (!text) return null;
    const lines = text.split(/\n\n+/).filter(p => p.trim());
    if (lines.length <= 1) {
      return <p className="grammar-rule-text">{text}</p>;
    }
    return (
      <ol className="grammar-rule-list">
        {lines.map((line, idx) => (
          <li key={idx} className="grammar-rule-item">{line.trim()}</li>
        ))}
      </ol>
    );
  };

  // Render schema as a formatted table-like block
  const renderSchema = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim());
    return (
      <div className="grammar-schema-table">
        {lines.map((line, idx) => {
          const parts = line.split(/\s{2,}|\t|→|->|:/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            return (
              <div key={idx} className="schema-row">
                <span className="schema-cell-left">{parts[0]}</span>
                <span className="schema-cell-right">{parts.slice(1).join(' ')}</span>
              </div>
            );
          }
          return <div key={idx} className="schema-row-single">{line.trim()}</div>;
        })}
      </div>
    );
  };

  // Render examples as numbered list
  const renderEsempi = (examples) => {
    if (!Array.isArray(examples) || examples.length === 0) return null;
    return (
      <ol className="grammar-examples-list">
        {examples.map((ex, idx) => (
          <li key={idx} className="grammar-example-item">
            {(ex.tedesco || ex.german) && (
              <div className="grammar-example-de">{ex.tedesco || ex.german}</div>
            )}
            {(ex.italiano || ex.italian) && (
              <div className="grammar-example-it">{ex.italiano || ex.italian}</div>
            )}
          </li>
        ))}
      </ol>
    );
  };

  const renderTextSection = (text) => {
    if (!text) return null;
    return <p className="grammar-text-section">{text}</p>;
  };

  // Section rendering with icons
  const sectionConfig = {
    regola: { icon: '1.', label: t('grammar.rule') },
    schema: { icon: '2.', label: t('grammar.schema') },
    esempi: { icon: '3.', label: t('grammar.examples') },
    uso: { icon: '4.', label: t('grammar.usage') },
    eccezioni: { icon: '5.', label: t('grammar.exceptions') }
  };

  const renderContent = (content) => {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return null;
    const sectionOrder = ['regola', 'schema', 'esempi', 'uso', 'eccezioni'];
    const allKeys = Object.keys(content).filter(k => !k.startsWith('_'));
    const orderedKeys = [
      ...sectionOrder.filter(k => allKeys.includes(k)),
      ...allKeys.filter(k => !sectionOrder.includes(k))
    ];

    return orderedKeys.map((key, idx) => {
      const value = content[key];
      if (value === undefined || value === null) return null;
      const config = sectionConfig[key] || { icon: `${idx + 1}.`, label: key.toUpperCase() };

      return (
        <div key={key} className="grammar-section">
          <div className="grammar-section-header">
            <span className="grammar-section-num">{config.icon}</span>
            <h3 className="grammar-section-label">{config.label}</h3>
          </div>
          <div className="grammar-section-body">
            {key === 'regola' && renderRegola(value)}
            {key === 'schema' && renderSchema(value)}
            {key === 'esempi' && renderEsempi(value)}
            {key === 'uso' && renderTextSection(value)}
            {key === 'eccezioni' && (
              <div className="grammar-exceptions">{renderTextSection(value)}</div>
            )}
            {!['regola', 'schema', 'esempi', 'uso', 'eccezioni'].includes(key) && (
              typeof value === 'string' ? renderTextSection(value) :
              Array.isArray(value) ? renderEsempi(value) : null
            )}
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
          <div className="grammar-section-header">
            <span className="grammar-section-num">#</span>
            <h3 className="grammar-section-label">{t('lessons.exercises')} ({topic.exercises.length})</h3>
          </div>
          <div className="exercises-list">
            {topic.exercises.map((ex, idx) => {
              const phraseId = `grammar_${topic.id || topic.name}_ex${idx}`;
              const isSaved = savedPhrases[idx] !== undefined ? savedPhrases[idx] : isDifficultWord(phraseId);
              return (
                <div key={idx} className="exercise-card-simple">
                  <div className="exercise-top-row">
                    <span className="exercise-number">#{idx + 1}</span>
                    <button
                      className={`exercise-save-btn ${isSaved ? 'saved' : ''}`}
                      onClick={() => toggleSavePhrase(ex.question, idx)}
                      title={isSaved ? t('favorites.title') : t('common.save')}
                    >
                      {isSaved ? <Icons.StarFilled /> : <Icons.Star />}
                    </button>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrammarPage({ level, topic, onNavigate }) {
  const { t, language } = useLanguage();
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
          <p className="page-subtitle">{levelData?.title || getLevelName(activeLevel, language)} - {topics.length} {t('grammar.topics')}</p>
        </div>
        <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />
        <div className="compact-list">
          {topics.map((topic, idx) => {
            const topicId = topic.id || `${activeLevel}_${idx}`;
            const topicStatus = getGrammarStatus(topicId);
            return (
              <div key={topic.id || idx} className="compact-list-item" onClick={() => onNavigate('grammar', {level: activeLevel, topic: topic})}>
                <span className="compact-number">{idx + 1}.</span>
                <span className={`progress-dot compact-dot ${topicStatus}`}></span>
                <div className="compact-info">
                  <div className="compact-title">{topic.name}</div>
                  <div className="compact-subtitle">{topic.explanation}</div>
                </div>
                {topic.exercises && <span className="compact-meta">{topic.exercises.length} ex.</span>}
                <span className="compact-chevron">&rsaquo;</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <GrammarTopicDetail topic={topic} level={activeLevel} colors={colors} onNavigate={onNavigate} />;
}
