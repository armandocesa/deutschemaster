import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLanguage } from './contexts/LanguageContext';

const DataContext = createContext(null);

const BASE = import.meta.env.BASE_URL + 'data';

async function fetchJSON(path, language = 'en') {
  try {
    // Try language-specific path first
    if (language && language !== 'it') {
      try {
        const res = await fetch(`${BASE}/${language}/${path}`);
        if (res.ok) return await res.json();
      } catch {
        // Fall back to default (Italian) data if language version doesn't exist
      }
    }

    // Fall back to default path (Italian data)
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
      const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

      // Phase 1: Fetch all indexes and metadata in parallel
      const [vocabIndexes, vocabStats, grammarMeta, grammarResults, verbStats, READING_DATA, LESSONS_DATA] = await Promise.all([
        // All vocab indexes in parallel
        Promise.all(levels.map(lvl => fetchJSON(`vocabulary/${lvl}/index.json`, language))),
        fetchJSON('vocabulary/stats.json', language),
        fetchJSON('grammar/meta.json', language),
        // All grammar levels in parallel
        Promise.all(levels.map(lvl => fetchJSON(`grammar/${lvl}.json`, language))),
        fetchJSON('verbs/stats.json', language),
        fetchJSON('reading.json', language),
        fetchJSON('lessons.json', language),
      ]);

      // Phase 2: Fetch all vocab chunks in parallel (based on indexes)
      const vocabChunkPromises = [];
      const vocabChunkMap = {};
      levels.forEach((lvl, idx) => {
        const index = vocabIndexes[idx];
        if (!index) return;
        const chunksNeeded = Math.ceil(index.length / 20);
        vocabChunkMap[lvl] = { start: vocabChunkPromises.length, count: chunksNeeded };
        for (let i = 1; i <= chunksNeeded; i++) {
          vocabChunkPromises.push(fetchJSON(`vocabulary/${lvl}/modules_${i}.json`, language));
        }
      });

      // Fetch all verb chunks in parallel
      const totalVerbs = verbStats?.totalVerbs || 414;
      const verbChunksNeeded = Math.ceil(totalVerbs / 50);
      const verbChunkPromises = [];
      for (let i = 1; i <= verbChunksNeeded; i++) {
        verbChunkPromises.push(fetchJSON(`verbs/verbs_${i}.json`, language));
      }

      const [vocabChunks, verbChunks] = await Promise.all([
        Promise.all(vocabChunkPromises),
        Promise.all(verbChunkPromises),
      ]);

      // Assemble vocab data
      const vocabLevels = {};
      levels.forEach((lvl) => {
        const info = vocabChunkMap[lvl];
        if (!info) return;
        const modules = [];
        for (let i = 0; i < info.count; i++) {
          const chunk = vocabChunks[info.start + i];
          if (chunk) modules.push(...chunk);
        }
        vocabLevels[lvl.toUpperCase()] = { modules };
      });
      const VOCABULARY_DATA = { statistics: vocabStats || { totalWords: 14315 }, levels: vocabLevels };

      // Assemble grammar data
      const grammarLevels = {};
      let totalTopics = 0, totalExercises = 0;
      levels.forEach((lvl, idx) => {
        const d = grammarResults[idx];
        if (d) {
          grammarLevels[lvl.toUpperCase()] = d;
          totalTopics += (d.topics || []).length;
          (d.topics || []).forEach(t => { totalExercises += (t.exercises || []).length; });
        }
      });
      const GRAMMAR_DATA = { ...grammarMeta, levels: grammarLevels, statistics: { totalTopics, totalExercises } };

      // Assemble verb data
      const allVerbs = [];
      verbChunks.forEach(chunk => { if (chunk) allVerbs.push(...chunk); });
      const VERBS_DATA = { statistics: verbStats || { totalVerbs: 414 }, verbs: allVerbs };

      setData({ VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA, READING_DATA: READING_DATA || { levels: {} }, LESSONS_DATA: LESSONS_DATA || [] });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Data loading failed:', err);
      setError(err.message || 'Failed to load data');
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
        <div style={{fontSize:'20px',fontWeight:700}}>{({it:'Errore di caricamento',de:'Ladefehler',en:'Loading error'})[language] || 'Loading error'}</div>
        <div style={{color:'var(--text-secondary, #8888a0)',fontSize:'14px',textAlign:'center',maxWidth:'300px'}}>{error}</div>
        <button
          onClick={loadAll}
          style={{padding:'10px 24px',background:'var(--gradient-1)',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer',marginTop:'8px'}}
        >
          {({it:'Riprova',de:'Erneut versuchen',en:'Retry'})[language] || 'Retry'}
        </button>
      </div>
    );
  }

  if (loading) {
    const loadingMessages = {
      it: 'Caricamento dati...',
      en: 'Loading data...',
      de: 'Daten werden geladen...'
    };

    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--bg-primary)',color:'var(--text-primary)',flexDirection:'column',gap:'16px'}}>
        <div style={{fontSize:'48px'}}>{'\u{1F1E9}\u{1F1EA}'}</div>
        <div style={{fontSize:'24px',fontWeight:800,background:'var(--gradient-1)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>DeutschMaster</div>
        <div style={{color:'var(--text-secondary)',fontSize:'14px'}}>{loadingMessages[language] || loadingMessages['en']}</div>
      </div>
    );
  }

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
