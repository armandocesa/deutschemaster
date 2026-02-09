import React, { useState } from 'react';
import Icons from '../components/Icons';
import LevelTabs from '../components/LevelTabs';
import { LEVEL_COLORS, getLevelName } from '../utils/constants';
import { useData } from '../DataContext';
import { speak } from '../utils/speech';
import { getWordStatus, isDifficultWord, saveDifficultWord, removeDifficultWord } from '../utils/storage';

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
  const { VOCABULARY_DATA } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [internalLevel, setInternalLevel] = useState(level || (() => { try { return localStorage.getItem('dm_last_level') || 'A1'; } catch { return 'A1'; } }));
  const activeLevel = level || internalLevel;

  const handleLevelChange = (lvl) => {
    setInternalLevel(lvl);
    try { localStorage.setItem('dm_last_level', lvl); } catch {}
    if (level) onNavigate('vocabulary', { level: lvl });
  };

  const levelData = VOCABULARY_DATA.levels?.[activeLevel];
  const modules = levelData?.modules || [];
  const colors = LEVEL_COLORS[activeLevel];

  if (!module) {
    return (
      <div className="vocabulary-page">
        <div className="page-header" style={{'--level-color': colors.bg}}>
          <h1 className="page-title">Vocabolario</h1>
          <p className="page-subtitle">{getLevelName(activeLevel)} - {modules.length} moduli</p>
        </div>
        <LevelTabs currentLevel={activeLevel} onLevelChange={handleLevelChange} />
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
                <p className="module-count">{totalWords} parole</p>
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
  const filteredWords = searchTerm ? words.filter(w => (w.german || '').toLowerCase().includes(searchTerm.toLowerCase()) || (w.italian || '').toLowerCase().includes(searchTerm.toLowerCase())) : words;

  return (
    <div className="vocabulary-page">
      <div className="page-header" style={{'--level-color': colors.bg}}>
        <span className="page-level-badge" style={{backgroundColor: colors.bg}}>{activeLevel}</span>
        <h1 className="page-title">{module.icon} {module.name}</h1>
        <p className="page-subtitle">{words.length} parole</p>
      </div>
      <div className="progress-summary">
        <div className="progress-summary-item correct"><span className="progress-dot correct"></span><span className="count">{words.filter(w => getWordStatus(w.german) === 'correct').length}</span> corrette</div>
        <div className="progress-summary-item incorrect"><span className="progress-dot incorrect"></span><span className="count">{words.filter(w => getWordStatus(w.german) === 'incorrect').length}</span> errate</div>
        <div className="progress-summary-item unseen"><span className="progress-dot unseen"></span><span className="count">{words.filter(w => getWordStatus(w.german) === 'unseen').length}</span> da fare</div>
      </div>
      <div className="vocab-toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder="Cerca parola..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="view-toggle">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>Griglia</button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>Lista</button>
        </div>
      </div>
      <div className={`words-container ${viewMode}`}>
        {filteredWords.map((word, idx) => <WordCard key={idx} word={word} viewMode={viewMode} />)}
      </div>
      {filteredWords.length === 0 && <div className="empty-state"><p>Nessuna parola trovata</p></div>}
    </div>
  );
}
