// ============ NAMESPACED LOCALSTORAGE ============
export const getDifficultWords = () => {
  try { return JSON.parse(localStorage.getItem('dm_difficultWords')) || []; } catch { return []; }
};

export const saveDifficultWord = (word, type = 'word') => {
  const words = getDifficultWords();
  const id = type === 'verb' ? word.infinitiv : word.german;
  if (!words.find(w => w.id === id)) {
    words.push({ ...word, id, type, savedAt: Date.now() });
    localStorage.setItem('dm_difficultWords', JSON.stringify(words));
  }
};

export const removeDifficultWord = (id) => {
  const words = getDifficultWords().filter(w => w.id !== id);
  localStorage.setItem('dm_difficultWords', JSON.stringify(words));
};

export const isDifficultWord = (id) => getDifficultWords().some(w => w.id === id);

export const getReviewQuestions = () => {
  try { return JSON.parse(localStorage.getItem('dm_reviewQuestions')) || []; } catch { return []; }
};

export const saveReviewQuestion = (question) => {
  const questions = getReviewQuestions();
  const id = question.question;
  if (!questions.find(q => q.id === id)) {
    questions.push({ ...question, id, savedAt: Date.now() });
    localStorage.setItem('dm_reviewQuestions', JSON.stringify(questions));
  }
};

export const removeReviewQuestion = (id) => {
  const questions = getReviewQuestions().filter(q => q.id !== id);
  localStorage.setItem('dm_reviewQuestions', JSON.stringify(questions));
};

export const isReviewQuestion = (id) => getReviewQuestions().some(q => q.id === id);

export const getQuizStats = () => {
  try { return JSON.parse(localStorage.getItem('dm_quizStats')) || { totalAnswered: 0, correctAnswers: 0 }; } catch { return { totalAnswered: 0, correctAnswers: 0 }; }
};

export const updateQuizStats = (correct) => {
  const stats = getQuizStats();
  stats.totalAnswered++;
  if (correct) stats.correctAnswers++;
  localStorage.setItem('dm_quizStats', JSON.stringify(stats));
};

export const getProgress = () => {
  try { return JSON.parse(localStorage.getItem('dm_learningProgress')) || { words: {}, grammar: {}, verbs: {} }; }
  catch { return { words: {}, grammar: {}, verbs: {} }; }
};

export const saveProgress = (progress) => { localStorage.setItem('dm_learningProgress', JSON.stringify(progress)); };

export const markWordStatus = (wordId, correct) => { const p = getProgress(); p.words[wordId] = { status: correct ? 'correct' : 'incorrect', date: Date.now() }; saveProgress(p); };
export const markGrammarStatus = (topicId, correct) => { const p = getProgress(); p.grammar[topicId] = { status: correct ? 'correct' : 'incorrect', date: Date.now() }; saveProgress(p); };
export const markVerbStatus = (verbId, correct) => { const p = getProgress(); p.verbs[verbId] = { status: correct ? 'correct' : 'incorrect', date: Date.now() }; saveProgress(p); };
export const getWordStatus = (wordId) => getProgress().words[wordId]?.status || 'unseen';
export const getGrammarStatus = (topicId) => getProgress().grammar[topicId]?.status || 'unseen';
export const getVerbStatus = (verbId) => getProgress().verbs[verbId]?.status || 'unseen';

export const getProgressStats = () => {
  const progress = getProgress();
  const ws = Object.values(progress.words);
  const gs = Object.values(progress.grammar);
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
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quiz_') && !key.startsWith('dm_quiz_')) {
        localStorage.setItem('dm_' + key, localStorage.getItem(key));
        localStorage.removeItem(key);
      }
    }
  } catch(e) {}
})();
