import React, { useState } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { getGrammarStatus, saveDifficultWord, removeDifficultWord, isDifficultWord } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';

// Single rule card displayed inline in the all-rules view
function GrammarRuleCard({ topic, index, colors, onNavigate, level, totalTopics, topics }) {
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);
  const [answerVisibility, setAnswerVisibility] = useState({});
  const [savedPhrases, setSavedPhrases] = useState({});
  const content = topic.content || {};
  const topicId = topic.id || `rule_${index}`;
  const topicStatus = getGrammarStatus(topicId);

  const scrollToRule = (targetIndex) => {
    const targetTopic = topics[targetIndex];
    const targetId = targetTopic?.id || `rule_${targetIndex}`;
    const el = document.getElementById(`rule-${targetId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleAnswer = (idx) => {
    setAnswerVisibility(prev => ({...prev, [idx]: !prev[idx]}));
  };

  const toggleSavePhrase = (phrase, idx) => {
    const id = `grammar_${topic.id || topic.name}_ex${idx}`;
    const isSaved = savedPhrases[idx] || isDifficultWord(id);
    if (isSaved) {
      removeDifficultWord(id);
      setSavedPhrases(prev => ({...prev, [idx]: false}));
    } else {
      saveDifficultWord({ german: phrase, italian: '', id }, 'word');
      setSavedPhrases(prev => ({...prev, [idx]: true}));
    }
  };

  // Split rule text into bullet points
  const renderBulletPoints = (text) => {
    if (!text) return null;
    const points = text.split(/\n\n+/).filter(p => p.trim());
    if (points.length <= 1) {
      return <p className="gr-rule-text">{text}</p>;
    }
    return (
      <ul className="gr-bullet-list">
        {points.map((point, i) => (
          <li key={i}>{point.trim()}</li>
        ))}
      </ul>
    );
  };

  // Render schema as formatted table
  const renderSchema = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim());
    return (
      <div className="gr-schema">
        {lines.map((line, idx) => {
          const parts = line.split(/\s{2,}|\t|→|->|:/).map(p => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            return (
              <div key={idx} className="gr-schema-row">
                <span className="gr-schema-left">{parts[0]}</span>
                <span className="gr-schema-right">{parts.slice(1).join(' ')}</span>
              </div>
            );
          }
          return <div key={idx} className="gr-schema-single">{line.trim()}</div>;
        })}
      </div>
    );
  };

  // Render examples inline
  const renderExamples = (examples) => {
    if (!Array.isArray(examples) || examples.length === 0) return null;
    return (
      <div className="gr-examples">
        {examples.map((ex, i) => (
          <div key={i} className="gr-example-item">
            {(ex.tedesco || ex.german) && (
              <span className="gr-example-de">{ex.tedesco || ex.german}</span>
            )}
            {(ex.italiano || ex.italian) && (
              <span className="gr-example-it">{ex.italiano || ex.italian}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <article className="gr-card" id={`rule-${topicId}`}>
      {/* Header */}
      <div className="gr-card-header">
        <div className="gr-card-num" style={{ background: colors.bg }}>{index + 1}</div>
        <div className="gr-card-title-area">
          <h2 className="gr-card-title">{topic.name}</h2>
          <p className="gr-card-desc">{topic.explanation}</p>
        </div>
        <span className={`progress-dot ${topicStatus}`}></span>
      </div>

      {/* Rule - always shown as bullet points */}
      {content.regola && (
        <div className="gr-section">
          <div className="gr-section-label">
            <span className="gr-section-icon">&#9679;</span>
            {t('grammar.rule')}
          </div>
          {renderBulletPoints(content.regola)}
        </div>
      )}

      {/* Schema */}
      {content.schema && (
        <div className="gr-section">
          <div className="gr-section-label">
            <span className="gr-section-icon">&#9632;</span>
            {t('grammar.schema')}
          </div>
          {renderSchema(content.schema)}
        </div>
      )}

      {/* Examples - show first 4 */}
      {content.esempi && (
        <div className="gr-section">
          <div className="gr-section-label">
            <span className="gr-section-icon">&#9654;</span>
            {t('grammar.examples')}
          </div>
          {renderExamples(showMore ? content.esempi : content.esempi.slice(0, 4))}
        </div>
      )}

      {/* Usage */}
      {content.uso && (
        <div className="gr-section">
          <div className="gr-section-label">
            <span className="gr-section-icon">&#10003;</span>
            {t('grammar.usage')}
          </div>
          <p className="gr-text">{content.uso}</p>
        </div>
      )}

      {/* Exceptions */}
      {content.eccezioni && (
        <div className="gr-section gr-section-warning">
          <div className="gr-section-label gr-label-warning">
            <span className="gr-section-icon">&#9888;</span>
            {t('grammar.exceptions')}
          </div>
          <p className="gr-text">{content.eccezioni}</p>
        </div>
      )}

      {/* Exercises - expandable */}
      {topic.exercises && topic.exercises.length > 0 && (
        <div className="gr-exercises-area">
          <button className="gr-toggle-btn" onClick={() => setShowMore(!showMore)}>
            {showMore ? t('grammar.hideAnswer') || 'Nascondi' : `${t('lessons.exercises')} (${topic.exercises.length})`}
            <span className={`gr-chevron ${showMore ? 'open' : ''}`}>&#9662;</span>
          </button>
          {showMore && (
            <div className="gr-exercises-list">
              {topic.exercises.map((ex, idx) => {
                const phraseId = `grammar_${topic.id || topic.name}_ex${idx}`;
                const isSaved = savedPhrases[idx] !== undefined ? savedPhrases[idx] : isDifficultWord(phraseId);
                return (
                  <div key={idx} className="gr-exercise">
                    <div className="gr-exercise-top">
                      <span className="gr-exercise-num">#{idx + 1}</span>
                      <button
                        className={`exercise-save-btn ${isSaved ? 'saved' : ''}`}
                        onClick={() => toggleSavePhrase(ex.question, idx)}
                        title={isSaved ? t('favorites.title') : t('common.save')}
                      >
                        {isSaved ? <Icons.StarFilled /> : <Icons.Star />}
                      </button>
                    </div>
                    <p className="gr-exercise-q">{ex.question}</p>
                    <button className="gr-answer-btn" onClick={() => toggleAnswer(idx)}>
                      {answerVisibility[idx] ? (t('hide') || 'Nascondi') : (t('show') || 'Mostra')} {t('answer') || 'risposta'}
                    </button>
                    {answerVisibility[idx] && (
                      <div className="gr-answer">
                        <div className="gr-answer-text">{t('grammar.answer')} {ex.answer}</div>
                        {ex.explanation && <div className="gr-answer-expl">{t('grammar.explanation')} {ex.explanation}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation: Previous / Next */}
      <div className="gr-nav-footer">
        {index > 0 ? (
          <button className="gr-nav-btn gr-nav-prev" onClick={() => scrollToRule(index - 1)}>
            <span className="gr-nav-arrow">&larr;</span>
            <span className="gr-nav-label">{topics[index - 1]?.name}</span>
          </button>
        ) : <span />}
        <span className="gr-nav-counter">{index + 1} / {totalTopics}</span>
        {index < totalTopics - 1 ? (
          <button className="gr-nav-btn gr-nav-next" onClick={() => scrollToRule(index + 1)}>
            <span className="gr-nav-label">{topics[index + 1]?.name}</span>
            <span className="gr-nav-arrow">&rarr;</span>
          </button>
        ) : <span />}
      </div>
    </article>
  );
}

// Detail view for single topic (kept for backward compatibility)
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
          <p className="page-subtitle">{levelData?.title || getLevelName(activeLevel, language)} &middot; {topics.length} {t('grammar.topics')}</p>
        </div>
        <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />

        <div className="gr-all-rules">
          {topics.map((topicItem, idx) => (
            <GrammarRuleCard
              key={topicItem.id || idx}
              topic={topicItem}
              index={idx}
              level={activeLevel}
              colors={colors}
              onNavigate={onNavigate}
              totalTopics={topics.length}
              topics={topics}
            />
          ))}
        </div>
      </div>
    );
  }

  return <GrammarTopicDetail topic={topic} level={activeLevel} colors={colors} onNavigate={onNavigate} />;
}
