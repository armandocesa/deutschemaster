import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { speak } from '../utils/speech';
import { getWordStatus, isDifficultWord, saveDifficultWord, removeDifficultWord } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';

// Format category names: "qualita_neg" → "Qualita neg", "ambiente" → "Ambiente"
const formatCategory = (cat) => {
  if (!cat) return '';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

function WordRow({ word, category, onSaveChange }) {
  const [saved, setSaved] = useState(isDifficultWord(word.german));
  useEffect(() => { setSaved(isDifficultWord(word.german)); }, [word.german]);
  const wordStatus = getWordStatus(word.german);

  const toggleSave = () => {
    if (saved) { removeDifficultWord(word.german); }
    else { saveDifficultWord(word, 'word'); }
    setSaved(!saved);
    if (onSaveChange) onSaveChange();
  };

  return (
    <tr className={`vocab-row status-${wordStatus}`}>
      <td className="vocab-cell-status"><span className={`progress-dot ${wordStatus}`}></span></td>
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
        <button className={`vocab-action-btn ${saved ? 'saved' : ''}`} onClick={toggleSave} title={saved ? 'Remove' : 'Save'} aria-label={saved ? 'Remove from saved' : 'Save word'}>
          {saved ? <Icons.StarFilled /> : <Icons.Star />}
        </button>
        <button className="vocab-action-btn" onClick={() => speak(word.german)} title="Listen" aria-label="Listen to pronunciation">
          <Icons.Volume />
        </button>
      </td>
    </tr>
  );
}

export default function VocabularyPage({ level, onNavigate }) {
  const { t } = useLanguage();
  const { VOCABULARY_DATA } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [internalLevel, setInternalLevel] = useState(level || (() => { try { const v = localStorage.getItem('dm_last_level'); return v ? JSON.parse(v) : 'A1'; } catch { return 'A1'; } }));
  const activeLevel = level || internalLevel;
  const [displayCount, setDisplayCount] = useState(100);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [saveVersion, setSaveVersion] = useState(0);
  const debounceRef = useRef(null);

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    setDisplayCount(100);
    setSearchTerm('');
    setDebouncedSearch('');
    setFilter('all');
    try { saveAndSync('dm_last_level', JSON.stringify(lvl)); } catch {}
    if (level) onNavigate('vocabulary', { level: lvl });
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

  const levelData = VOCABULARY_DATA?.levels?.[activeLevel];
  const modules = levelData?.modules || [];
  const colors = LEVEL_COLORS[activeLevel] || { bg: '#6c5ce7', text: '#fff' };

  // Flatten all words from all modules with category info
  const allWords = useMemo(() => {
    const words = [];
    modules.forEach(mod => {
      const cat = mod.name || mod.category || '';
      (mod.words || []).forEach(w => {
        words.push({ ...w, _category: cat });
      });
    });
    return words;
  }, [modules]);

  // Progress counts (re-compute when save changes)
  const progressCounts = useMemo(() => {
    const correct = allWords.filter(w => getWordStatus(w.german) === 'correct').length;
    const incorrect = allWords.filter(w => getWordStatus(w.german) === 'incorrect').length;
    const saved = allWords.filter(w => isDifficultWord(w.german)).length;
    return { correct, incorrect, unseen: allWords.length - correct - incorrect, saved };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, saveVersion]);

  // Apply search + filter
  const filteredWords = useMemo(() => {
    let result = allWords;

    // Search filter
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(w =>
        (w.german || '').toLowerCase().includes(q) ||
        (w.italian || '').toLowerCase().includes(q) ||
        (w._category || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filter === 'saved') result = result.filter(w => isDifficultWord(w.german));
    else if (filter === 'correct') result = result.filter(w => getWordStatus(w.german) === 'correct');
    else if (filter === 'incorrect') result = result.filter(w => getWordStatus(w.german) === 'incorrect');
    else if (filter === 'unseen') result = result.filter(w => getWordStatus(w.german) === 'unseen');

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, debouncedSearch, filter, saveVersion]);

  const visibleWords = filteredWords.slice(0, displayCount);
  const hasMore = displayCount < filteredWords.length;

  return (
    <div className="vocabulary-page">
      <div className="page-header" style={{'--level-color': colors.bg}}>
        <h1 className="page-title">{t('vocabulary.title')}</h1>
        <p className="page-subtitle">{getLevelName(activeLevel)} — {allWords.length} {t('vocabulary.words')}</p>
      </div>

      <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />

      {/* Progress summary */}
      <div className="progress-summary">
        <div className="progress-summary-item correct"><span className="progress-dot correct"></span><span className="count">{progressCounts.correct}</span> {t('vocabulary.correct')}</div>
        <div className="progress-summary-item incorrect"><span className="progress-dot incorrect"></span><span className="count">{progressCounts.incorrect}</span> {t('vocabulary.incorrect')}</div>
        <div className="progress-summary-item unseen"><span className="progress-dot unseen"></span><span className="count">{progressCounts.unseen}</span> {t('vocabulary.unseen')}</div>
      </div>

      {/* Toolbar: search + filters */}
      <div className="vocab-toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder={t('vocabulary.search')} value={searchTerm} onChange={handleSearch} /></div>
      </div>

      <div className="vocab-filters">
        {[
          { key: 'all', label: t('vocabulary.filterAll'), count: allWords.length },
          { key: 'saved', label: t('vocabulary.filterSaved'), count: progressCounts.saved },
          { key: 'correct', label: t('vocabulary.filterCorrect'), count: progressCounts.correct },
          { key: 'incorrect', label: t('vocabulary.filterIncorrect'), count: progressCounts.incorrect },
          { key: 'unseen', label: t('vocabulary.filterUnseen'), count: progressCounts.unseen },
        ].map(f => (
          <button
            key={f.key}
            className={`vocab-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => { setFilter(f.key); setDisplayCount(100); }}
          >
            {f.label} <span className="vocab-filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="vocab-table-wrapper">
        <table className="vocab-table">
          <thead>
            <tr>
              <th className="vocab-th-status"></th>
              <th className="vocab-th-word">{t('vocabulary.colWord')}</th>
              <th className="vocab-th-translation">{t('vocabulary.colTranslation')}</th>
              <th className="vocab-th-category">{t('vocabulary.colCategory')}</th>
              <th className="vocab-th-actions">{t('vocabulary.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {visibleWords.map((word) => (
              <WordRow
                key={`${word.german}_${word.article || ''}_${word._category}`}
                word={word}
                category={word._category}
                onSaveChange={() => setSaveVersion(v => v + 1)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div style={{textAlign:'center',padding:'20px'}}>
          <button
            onClick={() => setDisplayCount(prev => prev + 100)}
            className="vocab-load-more-btn"
          >
            {t('vocabulary.loadMore')} ({filteredWords.length - displayCount} {t('vocabulary.remaining')})
          </button>
        </div>
      )}

      {filteredWords.length === 0 && (
        <div className="empty-state" style={{textAlign:'center',padding:'40px 20px',color:'var(--text-secondary)'}}>
          <div style={{fontSize:'36px',marginBottom:'12px'}}>🔍</div>
          <p>{t('vocabulary.noResults')}</p>
        </div>
      )}
    </div>
  );
}
