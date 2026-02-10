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
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
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
                      "{example.german}"
                    </div>
                    <div style={{
                      color: 'var(--text-secondary)',
                      fontSize: '11px'
                    }}>
                      {example.italian}
                    </div>
                    <button
                      onClick={() => speak(example.german)}
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
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
      >
        <div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)' }}>
            {prefix.prefix}
          </span>
          {prefix.translation && (
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              fontWeight: 400,
              marginTop: '2px'
            }}>
              {prefix.translation}
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
        setData(d);
        const allVerbs = [];
        ['trennbar', 'untrennbar', 'variabel'].forEach(key => {
          if (d[key]) {
            d[key].forEach(prefix => {
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--text-secondary)'
      }}>
        <div>{t('common.loading')}</div>
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
    <div style={{ background: 'var(--bg-primary)' }}>
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 20px',
        marginBottom: '16px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 12px 0'
        }}>
          {t('verbPrefixes.title')}
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          {t('verbPrefixes.subtitle')}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius)',
              border: activeTab === tab.id ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label} <span style={{ fontSize: '11px', opacity: 0.7 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {currentData.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
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
