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

function VerbCard({ verb, onToggleFavorite, saved }) {
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
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>{verb.verb}</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--accent)',
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '2px 6px',
              borderRadius: '3px'
            }}>
              {verb.preposition}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {verb.translation}
          </div>
        </div>
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              speak(verb.verb);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px',
              color: 'var(--accent)',
              transition: 'color 0.2s'
            }}
          >
            <Icons.Volume />
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
          {verb.examples && verb.examples.length > 0 && (
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                {t('verbsPrepositions.examples')}
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
                      "{example.de}"
                    </div>
                    <div style={{
                      color: 'var(--text-secondary)',
                      fontSize: '11px'
                    }}>
                      {example.it}
                    </div>
                    <button
                      onClick={() => speak(example.de)}
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
                      <Icons.Volume /> {t('verbsPrepositions.listen')}
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

function CategoryCard({ category, onToggleFavorite, savedVerbs, searchTerm }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const verbs = (category.verbs || []).filter(v => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return v.verb.toLowerCase().includes(s) ||
           v.translation.toLowerCase().includes(s) ||
           v.preposition.toLowerCase().includes(s);
  });

  if (searchTerm && verbs.length === 0) return null;

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
            {category.label}
          </span>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: 400,
            marginTop: '2px'
          }}>
            {category.description} — {verbs.length} {t('verbsPrepositions.verbs')}
          </div>
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
              {t('verbsPrepositions.noResults')}
            </div>
          ) : (
            verbs.map((verb, idx) => (
              <VerbCard
                key={idx}
                verb={verb}
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

export default function VerbsPrepositionsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedVerbs, setSavedVerbs] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}data/verbs-prepositions.json`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        const allVerbNames = [];
        (d.categories || []).forEach(cat => {
          (cat.verbs || []).forEach(v => allVerbNames.push(v.verb));
        });
        setSavedVerbs(new Set(allVerbNames.filter(v => isDifficultWord(v))));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleFavorite = (verbName) => {
    const allVerbs = [];
    (data?.categories || []).forEach(cat => {
      (cat.verbs || []).forEach(v => allVerbs.push(v));
    });

    const foundVerb = allVerbs.find(v => v.verb === verbName);
    if (!foundVerb) return;

    if (savedVerbs.has(verbName)) {
      removeDifficultWord(verbName);
      setSavedVerbs(new Set([...savedVerbs].filter(v => v !== verbName)));
    } else {
      saveDifficultWord({ ...foundVerb, infinitiv: foundVerb.verb, italiano: foundVerb.translation }, 'verb');
      setSavedVerbs(new Set([...savedVerbs, verbName]));
    }
  };

  if (loading || !data) {
    return (
      <div className="vp-loading-placeholder">
        <div className="skeleton vp-skeleton-title" />
        <div className="skeleton vp-skeleton-subtitle" />
        <div className="vp-skeleton-tabs">
          {[1, 2, 3].map(i => <div key={i} className="skeleton vp-skeleton-tab" />)}
        </div>
        <div className="vp-skeleton-cards">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton vp-skeleton-card" />)}
        </div>
      </div>
    );
  }

  const categories = data.categories || [];

  const tabs = [
    { id: 'all', label: t('verbsPrepositions.all'), count: categories.reduce((s, c) => s + (c.verbs || []).length, 0) },
    ...categories.map(c => ({ id: c.id, label: c.label, count: (c.verbs || []).length }))
  ];

  const visibleCategories = activeTab === 'all' ? categories : categories.filter(c => c.id === activeTab);

  return (
    <div className="vp-container">
      <div className="vp-header">
        <h1 className="vp-header-title">
          {t('verbsPrepositions.title')}
        </h1>
        <p className="vp-header-subtitle">
          {t('verbsPrepositions.subtitle')}
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

      <div className="vocab-toolbar" style={{ marginBottom: '16px' }}>
        <div className="search-box">
          <Icons.Search />
          <input
            type="text"
            placeholder={t('verbsPrepositions.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="vp-content">
        {visibleCategories.map((category, idx) => (
          <CategoryCard
            key={idx}
            category={category}
            onToggleFavorite={toggleFavorite}
            savedVerbs={savedVerbs}
            searchTerm={searchTerm}
          />
        ))}
        {visibleCategories.length === 0 && (
          <div className="vp-empty-state">
            <p>{t('verbsPrepositions.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
