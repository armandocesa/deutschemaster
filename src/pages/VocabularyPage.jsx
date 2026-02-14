import React, { useState, useRef, useCallback } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { speak } from '../utils/speech';
import { getWordStatus, isDifficultWord, saveDifficultWord, removeDifficultWord } from '../utils/storage';
import { saveAndSync } from '../utils/cloudSync';

function WordCard({ word, viewMode, onRemove }) {
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(isDifficultWord(word.german));
  const wordStatus = getWordStatus(word.german);
  const toggleSave = (e) => {
    e.stopPropagation();
    if (saved) { removeDifficultWord(word.german); if (onRemove) onRemove(word.german); }
    else { saveDifficultWord(word, 'word'); }
    setSaved(!saved);
  };

  if (viewMode === 'list') {
    return (
      <div className={`word-row status-${wordStatus}`}>
        <span className={`progress-dot ${wordStatus}`}></span>
        <div className="word-german"><span className="article">{word.article}</span><span className="word">{word.german}</span>{word.plural && <span className="plural">({word.plural})</span>}</div>
        <div className="word-italian">{word.italian}</div>
        <button className="save-btn" onClick={toggleSave}>{saved ? <Icons.StarFilled /> : <Icons.Star />}</button>
        <button className="speak-btn" onClick={() => speak(word.german)}><Icons.Volume /></button>
      </div>
    );
  }

  return (
    <div className={`word-card ${flipped ? 'flipped' : ''} status-${wordStatus}`} onClick={() => setFlipped(!flipped)}>
      <span className={`progress-indicator ${wordStatus}`}></span>
      <div className="word-card-inner">
        <div className="word-card-front">
          <button className={`save-btn ${saved ? 'saved' : ''}`} onClick={toggleSave}>{saved ? <Icons.StarFilled /> : <Icons.Star />}</button>
          <div className="word-main">{word.article && <span className="word-article">{word.article}</span>}<span className="word-german">{word.german}</span></div>
          {word.plural && <div className="word-plural">Pl: {word.plural}</div>}
          <button className="speak-btn" onClick={(e) => { e.stopPropagation(); speak(word.german); }}><Icons.Volume /></button>
        </div>
        <div className="word-card-back">
          <div className="word-italian">{word.italian}</div>
          {word.example && <div className="word-example">"{word.example}"</div>}
        </div>
      </div>
    </div>
  );
}

export default function VocabularyPage({ level, module, onNavigate }) {
  const { t } = useLanguage();
  const { VOCABULARY_DATA } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [internalLevel, setInternalLevel] = useState(level || (() => { try { return localStorage.getItem('dm_last_level') || 'A1'; } catch { return 'A1'; } }));
  const activeLevel = level || internalLevel;

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    try { saveAndSync('dm_last_level', lvl); } catch {}
    if (level) onNavigate('vocabulary', { level: lvl });
  };

  const levelData = VOCABULARY_DATA.levels?.[activeLevel];
  const modules = levelData?.modules || [];
  const colors = LEVEL_COLORS[activeLevel];

  if (!module) {
    return (
      <div className="vocabulary-page">
        <div className="page-header" style={{'--level-color': colors.bg}}>
          <h1 className="page-title">{t('vocabulary.title')}</h1>
          <p className="page-subtitle">{getLevelName(activeLevel)} - {modules.length} {t('vocabulary.modules')}</p>
        </div>
        <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} onNavigate={onNavigate} />
        <div className="modules-grid">
          {modules.map((mod, idx) => {
            const modWords = mod.words || [];
            const correctCount = modWords.filter(w => getWordStatus(w.german) === 'correct').length;
            const incorrectCount = modWords.filter(w => getWordStatus(w.german) === 'incorrect').length;
            const totalWords = modWords.length;
            return (
              <div key={mod.id || idx} className="module-card" onClick={() => onNavigate('vocabulary', {level: activeLevel, module: mod})}>
                <div className="module-icon">{mod.icon || '\u{1F4D6}'}</div>
                <h3 className="module-title">{mod.name || mod.category}</h3>
                <p className="module-count">{totalWords} {t('vocabulary.words')}</p>
                <div className="module-progress">
                  <span className="module-progress-item correct">{correctCount}</span>
                  <span className="module-progress-item incorrect">{incorrectCount}</span>
                  <span className="module-progress-item unseen">{totalWords - correctCount - incorrectCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const words = module.words || [];
  const [displayCount, setDisplayCount] = useState(50);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setDisplayCount(50); // Reset pagination on search
    }, 300);
  }, []);

  const filteredWords = debouncedSearch
    ? words.filter(w => (w.german || '').toLowerCase().includes(debouncedSearch.toLowerCase()) || (w.italian || '').toLowerCase().includes(debouncedSearch.toLowerCase()))
    : words;

  const visibleWords = filteredWords.slice(0, displayCount);
  const hasMore = displayCount < filteredWords.length;

  return (
    <div className="vocabulary-page">
      <div className="page-header" style={{'--level-color': colors.bg}}>
        <span className="page-level-badge" style={{backgroundColor: colors.bg}}>{activeLevel}</span>
        <h1 className="page-title">{module.icon} {module.name}</h1>
        <p className="page-subtitle">{words.length} {t('vocabulary.words')}</p>
      </div>
      <div className="progress-summary">
        <div className="progress-summary-item correct"><span className="progress-dot correct"></span><span className="count">{words.filter(w => getWordStatus(w.german) === 'correct').length}</span> {t('vocabulary.correct')}</div>
        <div className="progress-summary-item incorrect"><span className="progress-dot incorrect"></span><span className="count">{words.filter(w => getWordStatus(w.german) === 'incorrect').length}</span> {t('vocabulary.incorrect')}</div>
        <div className="progress-summary-item unseen"><span className="progress-dot unseen"></span><span className="count">{words.filter(w => getWordStatus(w.german) === 'unseen').length}</span> {t('vocabulary.unseen')}</div>
      </div>
      <div className="vocab-toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder={t('vocabulary.search')} value={searchTerm} onChange={handleSearch} /></div>
        <div className="view-toggle">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>{t('vocabulary.grid')}</button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>{t('vocabulary.list')}</button>
        </div>
      </div>
      <div className={`words-container ${viewMode}`}>
        {visibleWords.map((word) => <WordCard key={`${word.german}_${word.article || ''}`} word={word} viewMode={viewMode} />)}
      </div>
      {hasMore && (
        <div style={{textAlign:'center',padding:'20px'}}>
          <button
            onClick={() => setDisplayCount(prev => prev + 50)}
            style={{padding:'10px 24px',background:'var(--bg-secondary)',color:'var(--text-primary)',border:'1px solid var(--border)',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}
          >
            {t('vocabulary.loadMore') || 'Carica altre'} ({filteredWords.length - displayCount} {t('vocabulary.remaining') || 'rimanenti'})
          </button>
        </div>
      )}
      {filteredWords.length === 0 && <div className="empty-state"><p>{t('vocabulary.noResults')}</p></div>}
    </div>
  );
}
