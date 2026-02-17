import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { speak } from '../utils/speech';
import { getWordStatus, markWordStatus, isDifficultWord, saveDifficultWord, removeDifficultWord, isArchivedWord, archiveWord, unarchiveWord } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';

function WordCard({ word, category, onSaveChange }) {
  const { t } = useLanguage();
  const [showTranslation, setShowTranslation] = useState(false);
  const [saved, setSaved] = useState(isDifficultWord(word.german));
  const [archived, setArchived] = useState(isArchivedWord(word.german));
  const wordStatus = getWordStatus(word.german);

  useEffect(() => { setSaved(isDifficultWord(word.german)); setArchived(isArchivedWord(word.german)); }, [word.german]);

  const toggleSave = () => {
    if (saved) { removeDifficultWord(word.german); }
    else { saveDifficultWord(word, 'word'); }
    setSaved(!saved);
    if (onSaveChange) onSaveChange();
  };

  const toggleArchive = () => {
    if (archived) { unarchiveWord(word.german); }
    else { archiveWord(word, 'word'); }
    setArchived(!archived);
    if (onSaveChange) onSaveChange();
  };

  const handleOk = () => {
    markWordStatus(word.german, true);
    if (onSaveChange) onSaveChange();
  };

  return (
    <div className={`word-card status-${wordStatus} ${archived ? 'archived' : ''}`}>
      <div className="word-card-main">
        <span className={`progress-dot ${wordStatus}`}></span>
        <div className="word-card-german" onClick={() => speak(word.german)}>
          <span className="word-card-text">{word.german}</span>
          {word.article && <span className="word-card-article"> ({word.article})</span>}
        </div>
        <span
          className={`word-card-translation ${showTranslation ? 'revealed' : ''}`}
          onClick={() => setShowTranslation(!showTranslation)}
        >
          {showTranslation ? (word.italian || '—') : '...'}
        </span>
        <button
          className={`word-card-btn save-btn ${saved ? 'saved' : ''}`}
          onClick={toggleSave}
          title={saved ? t('favorites.title') : t('common.save')}
        >
          {saved ? <Icons.StarFilled /> : <Icons.Star />}
        </button>
        <button
          className={`word-card-btn ok-btn ${wordStatus === 'correct' ? 'done' : ''}`}
          onClick={handleOk}
          title="OK"
        >
          <Icons.Check />
        </button>
        <button
          className={`word-card-btn archive-btn ${archived ? 'archived' : ''}`}
          onClick={toggleArchive}
          title={archived ? t('vocabulary.unarchive') : t('vocabulary.archive')}
        >
          <Icons.Archive />
        </button>
      </div>
    </div>
  );
}

export default function VocabularyPage({ level, onNavigate }) {
  const { t, language } = useLanguage();
  const { VOCABULARY_DATA } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [internalLevel, setInternalLevel] = useState(level || (() => { try { const v = localStorage.getItem('dm_last_level'); return v ? JSON.parse(v) : 'A1'; } catch { return 'A1'; } }));
  const activeLevel = level || internalLevel;
  const [displayCount, setDisplayCount] = useState(50);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [saveVersion, setSaveVersion] = useState(0);
  const debounceRef = useRef(null);

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    setDisplayCount(50);
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
      setDisplayCount(50);
    }, 300);
  }, []);

  const levelData = VOCABULARY_DATA?.levels?.[activeLevel];
  const modules = levelData?.modules || [];
  const colors = LEVEL_COLORS[activeLevel] || { bg: '#6c5ce7', text: '#fff' };

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

  const progressCounts = useMemo(() => {
    const correct = allWords.filter(w => getWordStatus(w.german) === 'correct').length;
    const incorrect = allWords.filter(w => getWordStatus(w.german) === 'incorrect').length;
    const saved = allWords.filter(w => isDifficultWord(w.german)).length;
    const archived = allWords.filter(w => isArchivedWord(w.german)).length;
    return { correct, incorrect, unseen: allWords.length - correct - incorrect, saved, archived };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, saveVersion]);

  const filteredWords = useMemo(() => {
    let result = allWords;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(w =>
        (w.german || '').toLowerCase().includes(q) ||
        (w.italian || '').toLowerCase().includes(q) ||
        (w._category || '').toLowerCase().includes(q)
      );
    }
    if (filter === 'saved') result = result.filter(w => isDifficultWord(w.german));
    else if (filter === 'correct') result = result.filter(w => getWordStatus(w.german) === 'correct');
    else if (filter === 'incorrect') result = result.filter(w => getWordStatus(w.german) === 'incorrect');
    else if (filter === 'unseen') result = result.filter(w => getWordStatus(w.german) === 'unseen');
    else if (filter === 'archived') result = result.filter(w => isArchivedWord(w.german));
    else if (filter === 'all') result = result.filter(w => !isArchivedWord(w.german));
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, debouncedSearch, filter, saveVersion]);

  const visibleWords = filteredWords.slice(0, displayCount);
  const hasMore = displayCount < filteredWords.length;

  return (
    <div className="vocabulary-page">
      <div className="page-header" style={{'--level-color': colors.bg}}>
        <h1 className="page-title">{t('vocabulary.title')}</h1>
        <p className="page-subtitle">{getLevelName(activeLevel, language)} — {allWords.length} {t('vocabulary.words')}</p>
      </div>

      <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />

      <div className="progress-summary">
        <div className="progress-summary-item correct"><span className="progress-dot correct"></span><span className="count">{progressCounts.correct}</span> {t('vocabulary.correct')}</div>
        <div className="progress-summary-item incorrect"><span className="progress-dot incorrect"></span><span className="count">{progressCounts.incorrect}</span> {t('vocabulary.incorrect')}</div>
        <div className="progress-summary-item unseen"><span className="progress-dot unseen"></span><span className="count">{progressCounts.unseen}</span> {t('vocabulary.unseen')}</div>
        <div className="progress-summary-item archived"><span className="progress-dot archived"></span><span className="count">{progressCounts.archived}</span> {t('vocabulary.archived')}</div>
      </div>

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
          { key: 'archived', label: t('vocabulary.filterArchived'), count: progressCounts.archived },
        ].map(f => (
          <button
            key={f.key}
            className={`vocab-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => { setFilter(f.key); setDisplayCount(50); }}
          >
            {f.label} <span className="vocab-filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="word-cards-list">
        {visibleWords.map((word) => (
          <WordCard
            key={`${word.german}_${word.article || ''}_${word._category}`}
            word={word}
            category={word._category}
            onSaveChange={() => setSaveVersion(v => v + 1)}
          />
        ))}
      </div>

      {hasMore && (
        <div style={{textAlign:'center',padding:'20px'}}>
          <button
            onClick={() => setDisplayCount(prev => prev + 50)}
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
