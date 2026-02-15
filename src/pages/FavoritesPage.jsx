import React, { useState } from 'react';
import Icons from '../components/Icons';
import { getDifficultWords, removeDifficultWord } from '../utils/storage';
import { useLanguage } from '../contexts/LanguageContext';

export default function FavoritesPage({ onNavigate }) {
  const { t } = useLanguage();
  const [words, setWords] = useState(getDifficultWords());
  const [filter, setFilter] = useState('all');
  const filteredWords = filter === 'all' ? words : words.filter(w => w.type === filter);
  const wordCount = words.filter(w => w.type === 'word').length;
  const verbCount = words.filter(w => w.type === 'verb').length;

  const handleRemove = (id) => { removeDifficultWord(id); setWords(prev => prev.filter(w => w.id !== id)); };

  return (
    <div className="favorites-page">
      <h1 className="page-title">{t('favorites.title')}</h1>
      <p className="page-subtitle">{words.length} {t('favorites.items')} ({wordCount} {t('favorites.words')}, {verbCount} {t('favorites.verbs')})</p>
      {words.length > 0 && (
        <div className="favorites-toolbar">
          <div className="filter-btns">
            <button className={filter==='all'?'active':''} onClick={() => setFilter('all')}>{t('favorites.filter')} ({words.length})</button>
            <button className={filter==='word'?'active':''} onClick={() => setFilter('word')}>{t('favorites.words_filter')} ({wordCount})</button>
            <button className={filter==='verb'?'active':''} onClick={() => setFilter('verb')}>{t('favorites.verbs_filter')} ({verbCount})</button>
          </div>
          {words.length >= 4 && <button className="quiz-favorites-btn" onClick={() => onNavigate('quiz', {difficultOnly: true})}><Icons.Quiz /> {t('favorites.quiz')}</button>}
        </div>
      )}
      {filteredWords.length === 0 ? (
        <div className="empty-state">
          <p>{t('favorites.empty')}</p>
          <p style={{fontSize:'14px',marginTop:'10px'}}>{t('favorites.hint')}</p>
        </div>
      ) : (
        <div className="compact-list">
          {filteredWords.map(item => (
            <div key={item.id} className="compact-list-item" style={{cursor:'default'}}>
              <div className="compact-info">
                <div className="compact-title">{item.type === 'verb' ? item.infinitiv : `${item.article || ''} ${item.german}`.trim()}</div>
                <div className="compact-subtitle">{item.type === 'verb' ? item.italiano : item.italian}</div>
              </div>
              <span className="compact-badge" style={{background:'var(--accent-dim)',color:'var(--accent-light)'}}>{item.type === 'verb' ? t('favorites.verb_type') : t('favorites.word_type')}</span>
              <button className="vocab-action-btn" onClick={() => handleRemove(item.id)} title="Remove" style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',padding:'4px'}}><Icons.X /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
