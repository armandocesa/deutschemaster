import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS } from '../utils/constants';
import { speak } from '../utils/speech';
import { saveDifficultWord, isDifficultWord, removeDifficultWord } from '../utils/storage';
import { useLanguage } from '../contexts/LanguageContext';

function ExampleBadge({ level }) {
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.A1;
  return (
    <span style={{
      display: 'inline-block',
      background: colors.light,
      color: colors.text,
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '10px',
      fontWeight: 600,
      marginRight: '4px'
    }}>
      {level}
    </span>
  );
}

function VerbCard({ verb, prefix, onToggleFavorite, saved }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      marginBottom: '8px'
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: '14px',
          fontWeight: 600,
          textAlign: 'left',
          transition: 'all 0.2s'
        }}
      >
        <span>{verb.verb}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(verb.verb);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              color: saved ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.2s'
            }}
          >
            {saved ? <Icons.StarFilled /> : <Icons.Star />}
          </button>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px',
          background: 'rgba(99, 102, 241, 0.02)'
        }}>
          {verb.conjugation && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '4px',
                textTransform: 'uppercase'
              }}>
                {t('verbPrefixes.conjugation')}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                padding: '8px',
                background: 'var(--bg-primary)',
                borderRadius: '4px',
                border: '1px solid var(--border)'
              }}>
                {verb.conjugation}
              </div>
            </div>
          )}

          {verb.examples && verb.examples.length > 0 && (
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                {t('verbPrefixes.examples')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {verb.examples.map((example, idx) => (
                  <div key={idx} style={{
                    padding: '8px',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '12px'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      <ExampleBadge level={example.level} />
                    </div>
                    <div style={{
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                      fontStyle: 'italic'
                    }}>
                      "{example.de || example.german}"
                    </div>
                    <div style={{
                      color: 'var(--text-secondary)',
                      fontSize: '11px'
                    }}>
                      {example.it || example.italian}
                    </div>
                    <button
                      onClick={() => speak(example.de || example.german)}
                      style={{
                        marginTop: '6px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '3px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: 'var(--accent)',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icons.Volume /> {t('verbPrefixes.listen')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrefixCard({ prefix, onToggleFavorite, savedVerbs }) {
  const [expanded, setExpanded] = useState(false);

  const verbs = prefix.verbs || [];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      marginBottom: '12px'
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: '15px',
          fontWeight: 700,
          textAlign: 'left',
          transition: 'all 0.2s'
        }}
      >
        <div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)' }}>
            {prefix.prefix}
          </span>
          {(prefix.translation || prefix.meaning) && (
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              fontWeight: 400,
              marginTop: '2px'
            }}>
              {prefix.translation || prefix.meaning}
            </div>
          )}
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </div>
      </button>

      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px',
          background: 'rgba(99, 102, 241, 0.02)'
        }}>
          {verbs.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              {t('verbPrefixes.noVerbs')}
            </div>
          ) : (
            verbs.map((verb, idx) => (
              <VerbCard
                key={idx}
                verb={verb}
                prefix={prefix.prefix}
                saved={savedVerbs.has(verb.verb)}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function VerbPrefixesPage({ onNavigate }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trennbar');
  const [savedVerbs, setSavedVerbs] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}data/verb-prefixes.json`)
      .then(r => r.json())
      .then(d => {
        // Transform sections array into keyed format if needed
        let normalized = d;
        if (d.sections && Array.isArray(d.sections)) {
          normalized = {};
          d.sections.forEach(section => {
            // Map 'wechsel' type to 'variabel' key
            const key = section.type === 'wechsel' ? 'variabel' : section.type;
            normalized[key] = section.prefixes || [];
          });
        }
        setData(normalized);
        const allVerbs = [];
        ['trennbar', 'untrennbar', 'variabel'].forEach(key => {
          if (normalized[key]) {
            normalized[key].forEach(prefix => {
              if (prefix.verbs) {
                allVerbs.push(...prefix.verbs.map(v => v.verb));
              }
            });
          }
        });
        setSavedVerbs(new Set(allVerbs.filter(v => isDifficultWord(v))));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleFavorite = (verbName) => {
    const allPrefixes = [
      ...(data?.trennbar || []),
      ...(data?.untrennbar || []),
      ...(data?.variabel || [])
    ];

    let foundVerb = null;
    for (const prefix of allPrefixes) {
      const verb = (prefix.verbs || []).find(v => v.verb === verbName);
      if (verb) {
        foundVerb = verb;
        break;
      }
    }

    if (!foundVerb) return;

    if (savedVerbs.has(verbName)) {
      removeDifficultWord(verbName);
      setSavedVerbs(new Set([...savedVerbs].filter(v => v !== verbName)));
    } else {
      saveDifficultWord(foundVerb, 'verb');
      setSavedVerbs(new Set([...savedVerbs, verbName]));
    }
  };

  if (loading || !data) {
    return (
      <div className="vp-loading-placeholder">
        <div className="skeleton vp-skeleton-title" />
        <div className="skeleton vp-skeleton-subtitle" />
        <div className="vp-skeleton-tabs">
          {[1,2].map(i => <div key={i} className="skeleton vp-skeleton-tab" />)}
        </div>
        <div className="vp-skeleton-cards">
          {[1,2,3,4].map(i => <div key={i} className="skeleton vp-skeleton-card" />)}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'trennbar', label: t('verbPrefixes.separable'), count: data.trennbar?.length || 0 },
    { id: 'untrennbar', label: t('verbPrefixes.inseparable'), count: data.untrennbar?.length || 0 },
    { id: 'variabel', label: t('verbPrefixes.variable'), count: data.variabel?.length || 0 }
  ];

  const currentData = data[activeTab] || [];

  return (
    <div className="vp-container">
      <div className="vp-header">
        <h1 className="vp-header-title">
          {t('verbPrefixes.title')}
        </h1>
        <p className="vp-header-subtitle">
          {t('verbPrefixes.subtitle')}
        </p>
      </div>

      <div className="vp-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`vp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label} <span className="vp-tab-count">({tab.count})</span>
          </button>
        ))}
      </div>

      <div className="vp-content">
        {currentData.length === 0 ? (
          <div className="vp-empty-state">
            <p>{t('verbPrefixes.noPrefixes')}</p>
          </div>
        ) : (
          currentData.map((prefix, idx) => (
            <PrefixCard
              key={idx}
              prefix={prefix}
              onToggleFavorite={toggleFavorite}
              savedVerbs={savedVerbs}
            />
          ))
        )}
      </div>
    </div>
  );
}
