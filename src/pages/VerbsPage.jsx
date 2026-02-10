import React, { useState } from 'react';
import Icons from '../components/Icons';
import { useData } from '../DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { speak } from '../utils/speech';
import { isDifficultWord, saveDifficultWord, removeDifficultWord } from '../utils/storage';

function VerbDetail({ verb }) {
  const { t } = useLanguage();
  const [activeTense, setActiveTense] = useState('präsens');
  const tenses = [{key:'präsens',label:'Präsens'},{key:'präteritum',label:'Präteritum'},{key:'perfekt',label:'Perfekt'},{key:'konjunktiv2',label:'Konj. II'},{key:'imperativ',label:'Imperativ'}];
  const pronouns = ['ich','du','er','wir','ihr','sie'];
  const conjugations = verb.konjugation || {};
  const currentTense = conjugations[activeTense] || {};

  return (
    <div className="verb-detail">
      <div className="verb-header">
        <h1 className="verb-title">{verb.infinitiv}</h1>
        <p className="verb-meaning">{verb.italiano}</p>
        <div className="verb-meta">
          {verb.hilfsverb && <span className={`verb-aux-badge ${verb.hilfsverb}`}>{t('verbs.auxiliary')}: {verb.hilfsverb}</span>}
          {verb.irregular && <span className="verb-irregular-badge">{t('verbs.irregular')}</span>}
        </div>
        <button className="speak-btn large" onClick={() => speak(verb.infinitiv)}><Icons.Volume /> {t('verbs.listen')}</button>
      </div>
      <div className="tense-tabs">
        {tenses.map(t => <button key={t.key} className={`tense-tab ${activeTense === t.key ? 'active' : ''}`} onClick={() => setActiveTense(t.key)}>{t.label}</button>)}
      </div>
      <div className="conjugation-table">
        {(activeTense === 'imperativ' ? ['du','ihr','Sie'] : pronouns).map(pronoun => (
          <div key={pronoun} className="conjugation-row">
            <span className="pronoun">{pronoun}</span>
            <span className="form">{currentTense[pronoun] || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VerbsPage({ selectedVerb, onNavigate }) {
  const { VERBS_DATA } = useData();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const allVerbs = VERBS_DATA.verbs || [];
  const filteredVerbs = searchTerm ? allVerbs.filter(v => (v.infinitiv||'').toLowerCase().includes(searchTerm.toLowerCase()) || (v.italiano||'').toLowerCase().includes(searchTerm.toLowerCase())) : allVerbs;

  if (selectedVerb) return <VerbDetail verb={selectedVerb} />;

  return (
    <div className="verbs-page">
      <h1 className="page-title">{t('verbs.title')}</h1>
      <p className="page-subtitle">{allVerbs.length} {t('verbs.subtitle')}</p>
      <div className="vocab-toolbar">
        <div className="search-box"><Icons.Search /><input type="text" placeholder={t('verbs.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      </div>
      <div className="verbs-list">
        {filteredVerbs.map((verb) => (
          <div key={verb.infinitiv} className="verb-row" onClick={() => onNavigate('verbs', {module: verb})}>
            <span className="verb-infinitive">{verb.infinitiv}</span>
            <span className="verb-translation">{verb.italiano}</span>
            <span className="verb-badges">
              {verb.hilfsverb && <span className={`verb-aux ${verb.hilfsverb}`}>{verb.hilfsverb}</span>}
              {verb.irregular && <span className="verb-irregular">irr.</span>}
            </span>
            <button className={`save-btn ${isDifficultWord(verb.infinitiv) ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); if(isDifficultWord(verb.infinitiv)){removeDifficultWord(verb.infinitiv)}else{saveDifficultWord(verb,'verb')} }}>{isDifficultWord(verb.infinitiv) ? <Icons.StarFilled /> : <Icons.Star />}</button>
            <button className="speak-btn" onClick={(e) => { e.stopPropagation(); speak(verb.infinitiv); }}><Icons.Volume /></button>
          </div>
        ))}
      </div>
      {filteredVerbs.length === 0 && <div className="empty-state"><p>{t('verbs.noResults')}</p></div>}
    </div>
  );
}
