import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLanguage } from './contexts/LanguageContext';

const DataContext = createContext(null);

const BASE = import.meta.env.BASE_URL + 'data';

async function fetchJSON(path, language = 'it') {
  try {
    // Try language-specific path first if language is 'en'
    if (language === 'en') {
      try {
        const res = await fetch(`${BASE}/en/${path}`);
        if (res.ok) return await res.json();
      } catch {
        // Fall back to Italian if English version doesn't exist
      }
    }

    // Fall back to Italian (default path)
    const res = await fetch(`${BASE}/${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export function DataProvider({ children }) {
  const { language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load vocab for all levels
      const vocabLevels = {};
      const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

      // Load all vocab modules
      for (const lvl of levels) {
        const index = await fetchJSON(`vocabulary/${lvl}/index.json`, language);
        if (!index) continue;
        const totalModules = index.length;
        const chunksNeeded = Math.ceil(totalModules / 20);
        const modules = [];
        for (let i = 1; i <= chunksNeeded; i++) {
          const chunk = await fetchJSON(`vocabulary/${lvl}/modules_${i}.json`, language);
          if (chunk) modules.push(...chunk);
        }
        vocabLevels[lvl.toUpperCase()] = { modules };
      }

      const vocabStats = await fetchJSON('vocabulary/stats.json', language);
      const VOCABULARY_DATA = { statistics: vocabStats || { totalWords: 14315 }, levels: vocabLevels };

      // Load grammar
      const grammarLevels = {};
      const grammarMeta = await fetchJSON('grammar/meta.json', language);
      let totalTopics = 0, totalExercises = 0;
      for (const lvl of levels) {
        const d = await fetchJSON(`grammar/${lvl}.json`, language);
        if (d) {
          grammarLevels[lvl.toUpperCase()] = d;
          totalTopics += (d.topics || []).length;
          (d.topics || []).forEach(t => { totalExercises += (t.exercises || []).length; });
        }
      }
      const GRAMMAR_DATA = { ...grammarMeta, levels: grammarLevels, statistics: { totalTopics, totalExercises } };

      // Load verbs
      const verbStats = await fetchJSON('verbs/stats.json', language);
      const totalVerbs = verbStats?.totalVerbs || 414;
      const verbChunksNeeded = Math.ceil(totalVerbs / 50);
      const allVerbs = [];
      for (let i = 1; i <= verbChunksNeeded; i++) {
        const chunk = await fetchJSON(`verbs/verbs_${i}.json`, language);
        if (chunk) allVerbs.push(...chunk);
      }
      const VERBS_DATA = { statistics: verbStats || { totalVerbs: 414 }, verbs: allVerbs };

      // Load reading data
      const READING_DATA = await fetchJSON('reading.json', language) || { levels: {} };

      // Load lessons data
      const LESSONS_DATA = await fetchJSON('lessons.json', language) || [];

      setData({ VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA, READING_DATA, LESSONS_DATA });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Data loading failed:', err);
      setError(err.message || 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (error) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg-primary, #0f0f14)',color:'var(--text-primary, #eeeef2)',flexDirection:'column',gap:'16px'}}>
        <div style={{fontSize:'48px'}}>⚠️</div>
        <div style={{fontSize:'20px',fontWeight:700}}>Errore di caricamento</div>
        <div style={{color:'var(--text-secondary, #8888a0)',fontSize:'14px',textAlign:'center',maxWidth:'300px'}}>{error}</div>
        <button
          onClick={loadAll}
          style={{padding:'10px 24px',background:'var(--gradient-1)',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer',marginTop:'8px'}}
        >
          Riprova
        </button>
      </div>
    );
  }

  if (loading) {
    const loadingMessages = {
      it: 'Caricamento dati...',
      en: 'Loading data...'
    };

    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg-primary)',color:'var(--text-primary)',flexDirection:'column',gap:'16px'}}>
        <div style={{fontSize:'48px'}}>{'\u{1F1E9}\u{1F1EA}'}</div>
        <div style={{fontSize:'24px',fontWeight:800,background:'var(--gradient-1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>DeutschMaster</div>
        <div style={{color:'var(--text-secondary)',fontSize:'14px'}}>{loadingMessages[language] || loadingMessages['it']}</div>
      </div>
    );
  }

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
