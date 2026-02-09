import React, { useState, useMemo } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS } from '../utils/constants';
import { useData } from '../DataContext';
import { speak } from '../utils/speech';
import { getWordStatus } from '../utils/storage';

export default function PracticePage({ onNavigate }) {
  const { VOCABULARY_DATA } = useData();
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
      <h1 className="page-title">Pratica Vocabolario</h1>
      <p className="page-subtitle">Clicca su una parola per vedere la traduzione</p>
      <div className="practice-toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder="Cerca parola..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="mode-toggle">
          <button className={mode==='de-it'?'active':''} onClick={() => {setMode('de-it');setRevealedWords({});setShowAll(false);}}>{'\u{1F1E9}\u{1F1EA}'} {'\u2192'} {'\u{1F1EE}\u{1F1F9}'}</button>
          <button className={mode==='it-de'?'active':''} onClick={() => {setMode('it-de');setRevealedWords({});setShowAll(false);}}>{'\u{1F1EE}\u{1F1F9}'} {'\u2192'} {'\u{1F1E9}\u{1F1EA}'}</button>
        </div>
        <button className="show-all-btn" onClick={toggleShowAll}>{showAll ? <><Icons.EyeOff /> Nascondi tutto</> : <><Icons.Eye /> Mostra tutto</>}</button>
      </div>
      <div className="practice-stats"><span>{sortedWords.length.toLocaleString()} parole</span><span>{'\u2022'}</span><span>{Object.keys(revealedWords).filter(k => revealedWords[k]).length} rivelate</span></div>
      <div className="practice-list">
        {sortedWords.map((word, index) => {
          const mainWord = mode === 'de-it' ? word.german : word.italian;
          const translation = mode === 'de-it' ? word.italian : word.german;
          const isRevealed = revealedWords[index];
          const status = getWordStatus(word.german);
          return (
            <div key={`${word.german}-${index}`} className={`practice-card ${isRevealed?'revealed':''} status-${status}`} onClick={() => toggleReveal(index)}>
              <span className={`progress-dot ${status}`}></span>
              <div className="practice-main">
                <span className="practice-word">{mainWord}</span>
                {mode === 'de-it' && <button className="speak-btn-small" onClick={(e) => {e.stopPropagation();speak(word.german);}}><Icons.Volume /></button>}
              </div>
              <div className={`practice-translation ${isRevealed?'visible':''}`}>{isRevealed ? translation : '\u2022 \u2022 \u2022'}</div>
              {isRevealed && mode === 'it-de' && <button className="speak-btn-small after" onClick={(e) => {e.stopPropagation();speak(word.german);}}><Icons.Volume /></button>}
              <span className="practice-level" style={{backgroundColor: LEVEL_COLORS[word.level]?.bg || '#666'}}>{word.level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
