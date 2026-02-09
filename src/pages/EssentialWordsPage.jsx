import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { speak } from '../utils/speech';
import { saveDifficultWord, isDifficultWord, removeDifficultWord } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';

function WordCard({ word, onToggleFavorite, saved }) {
  const [expandedExample, setExpandedExample] = useState(false);

  const articleText = word.article ? `${word.article} ` : '';
  const pluralText = word.plural ? ` (Pl: ${word.plural})` : '';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '12px',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            {articleText}<strong>{word.german}</strong>{pluralText}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '6px'
          }}>
            {word.italian}
          </div>
          {word.type && (
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 600,
              background: 'var(--accent)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '4px'
            }}>
              {word.type}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(word.german);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            color: saved ? 'var(--accent)' : 'var(--text-secondary)',
            transition: 'color 0.2s'
          }}
        >
          {saved ? <Icons.StarFilled /> : <Icons.Star />}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
        <button
          onClick={() => speak(word.german)}
          style={{
            flex: 1,
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '4px',
            padding: '6px',
            cursor: 'pointer',
            color: 'var(--accent)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.2s'
          }}
        >
          <Icons.Volume /> Ascolta
        </button>
        {word.example && (
          <button
            onClick={() => setExpandedExample(!expandedExample)}
            style={{
              flex: 1,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '4px',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {expandedExample ? 'Nascondi' : 'Esempio'}
          </button>
        )}
      </div>

      {expandedExample && word.example && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
          padding: '8px',
          background: 'rgba(99, 102, 241, 0.05)',
          borderRadius: '4px',
          marginTop: '4px',
          borderLeft: '2px solid var(--accent)'
        }}>
          "{word.example}"
        </div>
      )}
    </div>
  );
}

export default function EssentialWordsPage({ level, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalLevel, setInternalLevel] = useState(() => {
    try { return localStorage.getItem('dm_last_level') || 'A1'; } catch { return 'A1'; }
  });
  const activeLevel = level || internalLevel;
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [savedWords, setSavedWords] = useState(new Set());

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    try { saveAndSync('dm_last_level', lvl); } catch {}
    if (level) onNavigate('essential-words', { level: lvl });
  };

  useEffect(() => {
    setLoading(true);
    setExpandedCategory(null);
    fetch(`${import.meta.env.BASE_URL}data/essential-words-${activeLevel.toLowerCase()}.json`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setSavedWords(new Set(
          (d.categories || []).flatMap(cat => (cat.words || []))
            .filter(w => isDifficultWord(w.german))
            .map(w => w.german)
        ));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeLevel]);

  const toggleFavorite = (germanWord) => {
    const word = data?.categories
      .flatMap(c => c.words || [])
      .find(w => w.german === germanWord);

    if (!word) return;

    if (savedWords.has(germanWord)) {
      removeDifficultWord(germanWord);
      setSavedWords(new Set([...savedWords].filter(w => w !== germanWord)));
    } else {
      saveDifficultWord(word, 'word');
      setSavedWords(new Set([...savedWords, germanWord]));
    }
  };

  const colors = LEVEL_COLORS[activeLevel];

  if (loading || !data) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--text-secondary)'
      }}>
        <div>Caricamento...</div>
      </div>
    );
  }

  const categories = data.categories || [];

  let filteredCategories = categories.map(cat => ({
    ...cat,
    words: (cat.words || []).filter(w =>
      search === '' ||
      (w.german || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.italian || '').toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.words.length > 0);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 20px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <span style={{
            background: colors.bg,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {activeLevel}
          </span>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Parole Essenziali
          </h1>
        </div>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          {getLevelName(activeLevel)} - {categories.length} categorie
        </p>
      </div>

      <div style={{ padding: '0 20px' }}>
        <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} />
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '8px 12px',
          gap: '8px'
        }}>
          <Icons.Search />
          <input
            type="text"
            placeholder="Cerca parola..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {filteredCategories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <p>Nessuna parola trovata</p>
          </div>
        ) : (
          filteredCategories.map((category, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                <span>{category.name}</span>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  {category.words.length}
                </span>
              </button>

              {expandedCategory === idx && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px',
                  marginTop: '12px'
                }}>
                  {category.words.map((word, wIdx) => (
                    <WordCard
                      key={wIdx}
                      word={word}
                      saved={savedWords.has(word.german)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
