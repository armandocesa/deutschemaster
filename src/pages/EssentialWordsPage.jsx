import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { speak } from '../utils/speech';
import { saveDifficultWord, isDifficultWord, removeDifficultWord } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';
import { useLanguage } from '../contexts/LanguageContext';

const formatCategory = (cat) => {
  if (!cat) return '';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

function EssentialWordRow({ word, category, saved, onToggleFavorite }) {
  return (
    <tr className="vocab-row">
      <td className="vocab-cell-word">
        <div className="vocab-word-main">
          {word.article && <span className="vocab-article">{word.article}</span>}
          <span className="vocab-german">{word.german}</span>
          {word.plural && <span className="vocab-plural">({word.plural})</span>}
        </div>
      </td>
      <td className="vocab-cell-translation">{word.italian || ''}</td>
      <td className="vocab-cell-category"><span className="vocab-category-badge">{formatCategory(category)}</span></td>
      <td className="vocab-cell-actions">
        <button className={`vocab-action-btn ${saved ? 'saved' : ''}`} onClick={() => onToggleFavorite(word.german)} title={saved ? 'Remove' : 'Save'}>
          {saved ? <Icons.StarFilled /> : <Icons.Star />}
        </button>
        <button className="vocab-action-btn" onClick={() => speak(word.german)} title="Listen">
          <Icons.Volume />
        </button>
      </td>
    </tr>
  );
}

export default function EssentialWordsPage({ level, onNavigate }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalLevel, setInternalLevel] = useState(() => {
    try { const v = localStorage.getItem('dm_last_level'); return v ? JSON.parse(v) : 'A1'; } catch { return 'A1'; }
  });
  const activeLevel = level || internalLevel;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(100);
  const [savedWords, setSavedWords] = useState(new Set());
  const [saveVersion, setSaveVersion] = useState(0);
  const debounceRef = useRef(null);

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    setSearchTerm('');
    setDebouncedSearch('');
    setDisplayCount(100);
    try { saveAndSync('dm_last_level', JSON.stringify(lvl)); } catch {}
    if (level) onNavigate('essential-words', { level: lvl });
  };

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setDisplayCount(100);
    }, 300);
  }, []);

  useEffect(() => {
    setLoading(true);
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

  const allWords = useMemo(() => {
    if (!data?.categories) return [];
    const words = [];
    data.categories.forEach(cat => {
      const catName = cat.name || '';
      (cat.words || []).forEach(w => {
        words.push({ ...w, _category: catName });
      });
    });
    return words;
  }, [data]);

  const filteredWords = useMemo(() => {
    if (!debouncedSearch) return allWords;
    const q = debouncedSearch.toLowerCase();
    return allWords.filter(w =>
      (w.german || '').toLowerCase().includes(q) ||
      (w.italian || '').toLowerCase().includes(q) ||
      (w._category || '').toLowerCase().includes(q)
    );
  }, [allWords, debouncedSearch]);

  const toggleFavorite = (germanWord) => {
    const word = allWords.find(w => w.german === germanWord);
    if (!word) return;
    if (savedWords.has(germanWord)) {
      removeDifficultWord(germanWord);
      setSavedWords(new Set([...savedWords].filter(w => w !== germanWord)));
    } else {
      saveDifficultWord(word, 'word');
      setSavedWords(new Set([...savedWords, germanWord]));
    }
    setSaveVersion(v => v + 1);
  };

  const colors = LEVEL_COLORS[activeLevel] || { bg: '#6c5ce7', text: '#fff' };
  const visibleWords = filteredWords.slice(0, displayCount);
  const hasMore = displayCount < filteredWords.length;

  if (loading || !data) {
    return (
      <div className="vocabulary-page" style={{ padding: '20px' }}>
        <div className="skeleton" style={{ width: '220px', height: '28px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '300px', height: '16px', marginBottom: '24px' }} />
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '40px', borderRadius: 'var(--radius)', marginBottom: '4px' }} />)}
      </div>
    );
  }

  return (
    <div className="vocabulary-page">
      <div className="page-header" style={{'--level-color': colors.bg}}>
        <h1 className="page-title">{t('essentialWords.title')}</h1>
        <p className="page-subtitle">{getLevelName(activeLevel)} — {allWords.length} {t('vocabulary.words')}</p>
      </div>

      <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />

      <div className="vocab-toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder={t('essentialWords.search')} value={searchTerm} onChange={handleSearch} /></div>
      </div>

      <div className="vocab-table-wrapper">
        <table className="vocab-table">
          <thead>
            <tr>
              <th className="vocab-th-word">{t('vocabulary.colWord')}</th>
              <th className="vocab-th-translation">{t('vocabulary.colTranslation')}</th>
              <th className="vocab-th-category">{t('vocabulary.colCategory')}</th>
              <th className="vocab-th-actions">{t('vocabulary.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {visibleWords.map((word) => (
              <EssentialWordRow
                key={`${word.german}_${word.article || ''}_${word._category}`}
                word={word}
                category={word._category}
                saved={savedWords.has(word.german)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div style={{textAlign:'center',padding:'20px'}}>
          <button onClick={() => setDisplayCount(prev => prev + 100)} className="vocab-load-more-btn">
            {t('vocabulary.loadMore')} ({filteredWords.length - displayCount} {t('vocabulary.remaining')})
          </button>
        </div>
      )}

      {filteredWords.length === 0 && (
        <div className="empty-state" style={{textAlign:'center',padding:'40px 20px',color:'var(--text-secondary)'}}>
          <div style={{fontSize:'36px',marginBottom:'12px'}}>🔍</div>
          <p>{t('essentialWords.noResults')}</p>
        </div>
      )}
    </div>
  );
}
