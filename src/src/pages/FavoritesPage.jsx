import React, { useState } from 'react';
import Icons from '../components/Icons';
import { getDifficultWords, removeDifficultWord } from '../utils/storage';

export default function FavoritesPage({ onNavigate }) {
  const [words, setWords] = useState(getDifficultWords());
  const [filter, setFilter] = useState('all');
  const filteredWords = filter === 'all' ? words : words.filter(w => w.type === filter);
  const wordCount = words.filter(w => w.type === 'word').length;
  const verbCount = words.filter(w => w.type === 'verb').length;

  const handleRemove = (id) => { removeDifficultWord(id); setWords(getDifficultWords()); };

  return (
    <div className="favorites-page">
      <h1 className="page-title">Parole Salvate</h1>
      <p className="page-subtitle">{words.length} elementi salvati ({wordCount} parole, {verbCount} verbi)</p>
      {words.length > 0 && (
        <div className="favorites-toolbar">
          <div className="filter-btns">
            <button className={filter==='all'?'active':''} onClick={() => setFilter('all')}>Tutti ({words.length})</button>
            <button className={filter==='word'?'active':''} onClick={() => setFilter('word')}>Parole ({wordCount})</button>
            <button className={filter==='verb'?'active':''} onClick={() => setFilter('verb')}>Verbi ({verbCount})</button>
          </div>
          {words.length >= 4 && <button className="quiz-favorites-btn" onClick={() => onNavigate('quiz', {difficultOnly: true})}><Icons.Quiz /> Quiz parole salvate</button>}
        </div>
      )}
      {filteredWords.length === 0 ? (
        <div className="empty-state">
          <p>Nessuna parola salvata</p>
          <p style={{fontSize:'14px',marginTop:'10px'}}>Clicca sulla stella su qualsiasi parola o verbo per salvarla qui!</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {filteredWords.map(item => (
            <div key={item.id} className="favorite-card">
              <button className="remove-btn" onClick={() => handleRemove(item.id)}><Icons.X /></button>
              {item.type === 'verb' ? (
                <><div className="favorite-main">{item.infinitiv}</div><div className="favorite-translation">{item.italiano}</div><span className="favorite-type">verbo</span></>
              ) : (
                <><div className="favorite-main">{item.article} {item.german}</div><div className="favorite-translation">{item.italian}</div><span className="favorite-type">parola</span></>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
