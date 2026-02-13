const BASE_PATH = import.meta.env.BASE_URL + 'data';
const cache = new Map();

async function fetchJSON(path) {
  if (cache.has(path)) return cache.get(path);
  
  try {
    const response = await fetch(`${BASE_PATH}/${path}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    cache.set(path, data);
    return data;
  } catch (error) {
    console.error(`Failed to load ${path}:`, error);
    return null;
  }
}

// Vocabulary
export async function loadVocabStats() {
  return fetchJSON('vocabulary/stats.json');
}

export async function loadVocabIndex(level) {
  return fetchJSON(`vocabulary/${level.toLowerCase()}/index.json`);
}

export async function loadVocabModules(level, chunkNum) {
  return fetchJSON(`vocabulary/${level.toLowerCase()}/modules_${chunkNum}.json`);
}

export async function loadAllVocabModules(level) {
  const index = await loadVocabIndex(level);
  if (!index) return [];
  
  const totalModules = index.length;
  const chunksNeeded = Math.ceil(totalModules / 20);
  const chunks = [];
  
  for (let i = 1; i <= chunksNeeded; i++) {
    const chunk = await loadVocabModules(level, i);
    if (chunk) chunks.push(...chunk);
  }
  
  return chunks;
}

// Grammar
export async function loadGrammarMeta() {
  return fetchJSON('grammar/meta.json');
}

export async function loadGrammarLevel(level) {
  return fetchJSON(`grammar/${level.toLowerCase()}.json`);
}

// Verbs
export async function loadVerbStats() {
  return fetchJSON('verbs/stats.json');
}

export async function loadVerbIndex() {
  return fetchJSON('verbs/index.json');
}

export async function loadVerbChunk(chunkNum) {
  return fetchJSON(`verbs/verbs_${chunkNum}.json`);
}

export async function loadAllVerbs() {
  const stats = await loadVerbStats();
  if (!stats) return [];
  
  const totalVerbs = stats.totalVerbs || 414;
  const chunksNeeded = Math.ceil(totalVerbs / 50);
  const allVerbs = [];
  
  for (let i = 1; i <= chunksNeeded; i++) {
    const chunk = await loadVerbChunk(i);
    if (chunk) allVerbs.push(...chunk);
  }
  
  return allVerbs;
}

// Preload commonly used data
export function preloadLevel(level) {
  loadVocabIndex(level);
  loadGrammarLevel(level);
}

export function clearCache() {
  cache.clear();
}
