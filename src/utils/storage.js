// ============ NAMESPACED LOCALSTORAGE WITH CLOUD SYNC ============
import { saveAndSync } from './cloudSync';

export const getDifficultWords = () => {
  try { return JSON.parse(localStorage.getItem('dm_difficultWords')) || []; } catch { return []; }
};

export const saveDifficultWord = (word, type = 'word') => {
  const words = getDifficultWords();
  const id = type === 'verb' ? (word.infinitiv || word.german) : (word.german || word.infinitiv);
  if (!id) { if (import.meta.env.DEV) console.warn('saveDifficultWord: word has no valid ID', word); return; }
  if (!words.find(w => w.id === id)) {
    words.push({ ...word, id, type, savedAt: Date.now() });
    saveAndSync('dm_difficultWords', JSON.stringify(words));
  }
};

export const removeDifficultWord = (id) => {
  const words = getDifficultWords().filter(w => w.id !== id);
  saveAndSync('dm_difficultWords', JSON.stringify(words));
};

export const isDifficultWord = (id) => getDifficultWords().some(w => w.id === id);

// ============ ARCHIVED (KNOWN) WORDS ============
export const getArchivedWords = () => {
  try { return JSON.parse(localStorage.getItem('dm_archivedWords')) || []; } catch { return []; }
};

export const archiveWord = (word, type = 'word') => {
  const words = getArchivedWords();
  const id = type === 'verb' ? (word.infinitiv || word.german) : (word.german || word.infinitiv);
  if (!id) return;
  if (!words.find(w => w.id === id)) {
    words.push({ ...word, id, type, archivedAt: Date.now() });
    saveAndSync('dm_archivedWords', JSON.stringify(words));
  }
};

export const unarchiveWord = (id) => {
  const words = getArchivedWords().filter(w => w.id !== id);
  saveAndSync('dm_archivedWords', JSON.stringify(words));
};

export const isArchivedWord = (id) => getArchivedWords().some(w => w.id === id);

export const getReviewQuestions = () => {
  try { return JSON.parse(localStorage.getItem('dm_reviewQuestions')) || []; } catch { return []; }
};

export const saveReviewQuestion = (question) => {
  const questions = getReviewQuestions();
  const id = question.question;
  if (!questions.find(q => q.id === id)) {
    questions.push({ ...question, id, savedAt: Date.now() });
    saveAndSync('dm_reviewQuestions', JSON.stringify(questions));
  }
};

export const removeReviewQuestion = (id) => {
  const questions = getReviewQuestions().filter(q => q.id !== id);
  saveAndSync('dm_reviewQuestions', JSON.stringify(questions));
};

export const isReviewQuestion = (id) => getReviewQuestions().some(q => q.id === id);

export const getQuizStats = () => {
  try { return JSON.parse(localStorage.getItem('dm_quizStats')) || { totalAnswered: 0, correctAnswers: 0 }; } catch { return { totalAnswered: 0, correctAnswers: 0 }; }
};

export const updateQuizStats = (correct) => {
  const stats = getQuizStats();
  stats.totalAnswered++;
  if (correct) stats.correctAnswers++;
  saveAndSync('dm_quizStats', JSON.stringify(stats));
};

export const getProgress = () => {
  try {
    const data = JSON.parse(localStorage.getItem('dm_learningProgress')) || {};
    return { words: data.words || {}, grammar: data.grammar || {}, verbs: data.verbs || {} };
  } catch { return { words: {}, grammar: {}, verbs: {} }; }
};

export const saveProgress = (progress) => { saveAndSync('dm_learningProgress', JSON.stringify(progress)); };

export const markWordStatus = (wordId, correct) => { const p = getProgress(); p.words[wordId] = { status: correct ? 'correct' : 'incorrect', date: Date.now() }; saveProgress(p); };
export const markGrammarStatus = (topicId, correct) => { const p = getProgress(); p.grammar[topicId] = { status: correct ? 'correct' : 'incorrect', date: Date.now() }; saveProgress(p); };
export const markVerbStatus = (verbId, correct) => { const p = getProgress(); p.verbs[verbId] = { status: correct ? 'correct' : 'incorrect', date: Date.now() }; saveProgress(p); };
export const getWordStatus = (wordId) => { const p = getProgress(); return (p.words || {})[wordId]?.status || 'unseen'; };
export const getGrammarStatus = (topicId) => { const p = getProgress(); return (p.grammar || {})[topicId]?.status || 'unseen'; };
export const getVerbStatus = (verbId) => { const p = getProgress(); return (p.verbs || {})[verbId]?.status || 'unseen'; };

export const getProgressStats = () => {
  const progress = getProgress();
  const ws = Object.values(progress.words || {});
  const gs = Object.values(progress.grammar || {});
  return { wordsCorrect: ws.filter(w => w.status === 'correct').length, wordsIncorrect: ws.filter(w => w.status === 'incorrect').length, grammarCorrect: gs.filter(g => g.status === 'correct').length, grammarIncorrect: gs.filter(g => g.status === 'incorrect').length };
};

// Migrate old localStorage keys
(function migrateStorage() {
  try {
    const migrations = [['difficultWords','dm_difficultWords'],['reviewQuestions','dm_reviewQuestions'],['quizStats','dm_quizStats'],['learningProgress','dm_learningProgress']];
    migrations.forEach(([old, nw]) => {
      if (localStorage.getItem(old) && !localStorage.getItem(nw)) {
        localStorage.setItem(nw, localStorage.getItem(old));
        localStorage.removeItem(old);
      }
    });
    // Collect keys first to avoid index shift during iteration
    const keysToMigrate = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quiz_') && !key.startsWith('dm_quiz_')) {
        keysToMigrate.push(key);
      }
    }
    keysToMigrate.forEach(key => {
      localStorage.setItem('dm_' + key, localStorage.getItem(key));
      localStorage.removeItem(key);
    });
  } catch(e) { if (import.meta.env.DEV) console.warn('Storage migration error:', e); }
})();
