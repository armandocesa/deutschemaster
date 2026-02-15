import React, { useState, useMemo } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS } from '../utils/constants';
import { useData } from '../DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { speak } from '../utils/speech';
import { getWordStatus } from '../utils/storage';

export default function PracticePage({ onNavigate }) {
  const { VOCABULARY_DATA } = useData();
  const { t } = useLanguage();
  const [mode, setMode] = useState('de-it');
  const [searchTerm, setSearchTerm] = useState('');
  const [revealedWords, setRevealedWords] = useState({});
  const [showAll, setShowAll] = useState(false);

  const allWords = useMemo(() => {
    const words = [];
    if (VOCABULARY_DATA.levels) {
      Object.entries(VOCABULARY_DATA.levels).forEach(([lvl, levelData]) => {
        if (levelData.modules) {
          levelData.modules.forEach(mod => {
            if (mod.words) {
              mod.words.forEach(word => { words.push({...word, level: lvl, module: mod.name || mod.category}); });
            }
          });
        }
      });
    }
    return words;
  }, [VOCABULARY_DATA]);

  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) return allWords;
    const term = searchTerm.toLowerCase();
    return allWords.filter(w => w.german?.toLowerCase().includes(term) || w.italian?.toLowerCase().includes(term));
  }, [allWords, searchTerm]);

  const sortedWords = useMemo(() => {
    return [...filteredWords].sort((a, b) => {
      const keyA = mode === 'de-it' ? a.german : a.italian;
      const keyB = mode === 'de-it' ? b.german : b.italian;
      return (keyA || '').localeCompare(keyB || '');
    });
  }, [filteredWords, mode]);

  const toggleReveal = (index) => setRevealedWords(prev => ({...prev, [index]: !prev[index]}));
  const toggleShowAll = () => {
    if (showAll) setRevealedWords({});
    else { const all = {}; sortedWords.forEach((_, i) => all[i] = true); setRevealedWords(all); }
    setShowAll(!showAll);
  };

  return (
    <div className="practice-page">
      <h1 className="page-title">{t('practice.title')}</h1>
      <p className="page-subtitle">{t('practice.subtitle')}</p>
      <div className="practice-toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder={t('practice.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="mode-toggle">
          <button className={mode==='de-it'?'active':''} onClick={() => {setMode('de-it');setRevealedWords({});setShowAll(false);}}>{'\u{1F1E9}\u{1F1EA}'} {'\u2192'} {'\u{1F1EE}\u{1F1F9}'}</button>
          <button className={mode==='it-de'?'active':''} onClick={() => {setMode('it-de');setRevealedWords({});setShowAll(false);}}>{'\u{1F1EE}\u{1F1F9}'} {'\u2192'} {'\u{1F1E9}\u{1F1EA}'}</button>
        </div>
        <button className="show-all-btn" onClick={toggleShowAll}>{showAll ? <><Icons.EyeOff /> {t('practice.hideAll')}</> : <><Icons.Eye /> {t('practice.showAll')}</>}</button>
      </div>
      <div className="practice-stats"><span>{sortedWords.length.toLocaleString()} {t('practice.words')}</span><span>{'\u2022'}</span><span>{Object.keys(revealedWords).filter(k => revealedWords[k]).length} {t('practice.revealed')}</span></div>
      <div className="compact-list">
        {sortedWords.map((word, index) => {
          const mainWord = mode === 'de-it' ? word.german : word.italian;
          const translation = mode === 'de-it' ? word.italian : word.german;
          const isRevealed = revealedWords[index];
          const status = getWordStatus(word.german);
          return (
            <div key={`${word.german}-${index}`} className="practice-list-item" onClick={() => toggleReveal(index)}>
              <span className={`progress-dot compact-dot ${status}`}></span>
              <div className="compact-info">
                <div className="compact-title">{mainWord}</div>
                <div className="compact-subtitle" style={{opacity: isRevealed ? 1 : 0.3}}>{isRevealed ? translation : '• • •'}</div>
              </div>
              <span className="practice-level-badge" style={{background: LEVEL_COLORS[word.level]?.bg || '#666'}}>{word.level}</span>
              <button className="practice-speak-btn" onClick={(e) => {e.stopPropagation();speak(word.german);}} aria-label="Listen to pronunciation"><Icons.Volume /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
