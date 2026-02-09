// ============================================================================
// DEUTSCHE MASTER GAMIFICATION ENGINE
// Complete gamification system with localStorage persistence (dm_ prefix)
// Cloud sync: all writes use saveAndSync for real-time Firestore sync
// ============================================================================

import { saveAndSync } from './cloudSync';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get today's date in YYYY-MM-DD format
 */
const getToday = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

/**
 * Get date N days ago in YYYY-MM-DD format
 */
const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Get the number of days between two YYYY-MM-DD dates
 */
const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Initialize localStorage if needed
 */
const initStorage = (key, defaultValue) => {
  const existing = localStorage.getItem(`dm_${key}`);
  if (!existing) {
    saveAndSync(`dm_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    console.warn(`Failed to parse dm_${key}, resetting to default`);
    saveAndSync(`dm_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
};

// ============================================================================
// 1. STREAK SYSTEM
// ============================================================================

/**
 * Get current streak data
 * @returns {{ currentStreak: number, longestStreak: number, lastActiveDate: string, calendar: object }}
 */
export const getStreak = () => {
  const data = initStorage('streak', {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    calendar: {}
  });
  return data;
};

/**
 * Record an activity and update streak
 * Call this whenever user completes any learning activity
 */
export const recordActivity = () => {
  const today = getToday();
  const data = getStreak();

  // Mark today as active
  if (!data.calendar[today]) {
    data.calendar[today] = true;

    const yesterday = getDaysAgo(1);

    if (data.lastActiveDate === null) {
      // First activity ever
      data.currentStreak = 1;
      data.longestStreak = 1;
    } else if (data.lastActiveDate === yesterday) {
      // Consecutive day
      data.currentStreak += 1;
      if (data.currentStreak > data.longestStreak) {
        data.longestStreak = data.currentStreak;
      }
    } else {
      // Gap in streak
      const daysSinceActive = daysBetween(data.lastActiveDate, today);
      if (daysSinceActive > 1) {
        data.currentStreak = 1;
      }
    }
  }

  data.lastActiveDate = today;
  saveAndSync('dm_streak', JSON.stringify(data));
  return data;
};

/**
 * Get streak calendar for a specific month
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @returns {array} Array of { day: number, active: boolean }
 */
export const getStreakCalendar = (year, month) => {
  const data = getStreak();
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendar = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendar.push({
      day,
      active: data.calendar[dateStr] === true
    });
  }

  return calendar;
};

// ============================================================================
// 2. XP SYSTEM
// ============================================================================

const XP_SOURCES = {
  quiz_correct: 10,
  quiz_complete: 50,
  lesson_complete: 100,
  reading_complete: 75,
  writing_correct: 15,
  listening_correct: 15,
  flashcard_review: 5,
  streak_bonus: null // Special: streak * 5
};

/**
 * Get current XP and level data
 * @returns {{ totalXP: number, level: number, xpForNextLevel: number, xpInCurrentLevel: number, todayXP: number }}
 */
export const getXP = () => {
  const data = initStorage('xp', {
    totalXP: 0,
    todayXP: 0,
    todayDate: getToday(),
    history: []
  });

  // Reset todayXP if it's a new day
  if (data.todayDate !== getToday()) {
    data.todayDate = getToday();
    data.todayXP = 0;
  }

  const levelInfo = getLevel(data.totalXP);

  return {
    totalXP: data.totalXP,
    level: levelInfo.level,
    xpForNextLevel: levelInfo.xpForNext,
    xpInCurrentLevel: levelInfo.xpInCurrent,
    todayXP: data.todayXP
  };
};

/**
 * Add XP for a specific activity
 * @param {number} amount - XP amount
 * @param {string} source - Source of XP (e.g., 'quiz_correct')
 * @param {number} [streakMultiplier] - Optional streak multiplier (e.g., for streak_bonus)
 */
export const addXP = (amount, source, streakMultiplier = 1) => {
  if (source === 'streak_bonus') {
    amount = streakMultiplier * 5;
  }

  const data = initStorage('xp', {
    totalXP: 0,
    todayXP: 0,
    todayDate: getToday(),
    history: []
  });

  // Reset todayXP if it's a new day
  if (data.todayDate !== getToday()) {
    data.todayDate = getToday();
    data.todayXP = 0;
  }

  data.totalXP += amount;
  data.todayXP += amount;

  // Log to history
  const today = getToday();
  const timestamp = new Date().toISOString();
  data.history.push({
    amount,
    source,
    date: today,
    timestamp
  });

  saveAndSync('dm_xp', JSON.stringify(data));

  // Check for level-up
  const levelInfo = getLevel(data.totalXP);

  return {
    totalXP: data.totalXP,
    level: levelInfo.level,
    xpAdded: amount,
    source
  };
};

/**
 * Calculate level from total XP
 * Each level requires: level * 100 XP
 * @param {number} totalXP - Total XP accumulated
 * @returns {{ level: number, xpForNext: number, xpInCurrent: number }}
 */
export const getLevel = (totalXP) => {
  let level = 0;
  let xpUsed = 0;

  while (true) {
    const xpForNextLevel = (level + 1) * 100;
    if (xpUsed + xpForNextLevel <= totalXP) {
      xpUsed += xpForNextLevel;
      level += 1;
    } else {
      break;
    }
  }

  const xpForNext = (level + 1) * 100;
  const xpInCurrent = totalXP - xpUsed;

  return {
    level: Math.max(1, level),
    xpForNext,
    xpInCurrent
  };
};

/**
 * Get XP history for the last N days
 * @param {number} days - Number of days to retrieve
 * @returns {array} Array of { date: string, xp: number }
 */
export const getXPHistory = (days) => {
  const data = initStorage('xp', {
    totalXP: 0,
    todayXP: 0,
    todayDate: getToday(),
    history: []
  });

  const startDate = getDaysAgo(days || 30);
  const history = {};

  data.history.forEach(entry => {
    if (entry.date >= startDate) {
      if (!history[entry.date]) {
        history[entry.date] = 0;
      }
      history[entry.date] += entry.amount;
    }
  });

  return Object.entries(history)
    .map(([date, xp]) => ({ date, xp }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// ============================================================================
// 3. DAILY GOALS
// ============================================================================

/**
 * Get current daily goal status
 * @returns {{ target: number, progress: number, completed: boolean, streak: number }}
 */
export const getDailyGoal = () => {
  const data = initStorage('daily_goal', {
    target: 50,
    completedDates: []
  });

  const xpData = getXP();
  const completed = xpData.todayXP >= data.target;

  const today = getToday();
  if (!data.completedDates.includes(today) && completed) {
    data.completedDates.push(today);
    saveAndSync('dm_daily_goal', JSON.stringify(data));
  }

  // Calculate streak of completed daily goals
  let goalStreak = 0;
  let checkDate = getToday();
  const completedSet = new Set(data.completedDates);

  while (completedSet.has(checkDate)) {
    goalStreak += 1;
    const prevDate = new Date(checkDate);
    prevDate.setDate(prevDate.getDate() - 1);
    checkDate = prevDate.toISOString().split('T')[0];
  }

  return {
    target: data.target,
    progress: xpData.todayXP,
    completed,
    streak: goalStreak
  };
};

/**
 * Set target XP for daily goal
 * @param {number} target - Target XP (10, 30, 50, 100, 150)
 */
export const setDailyGoal = (target) => {
  if (![10, 30, 50, 100, 150].includes(target)) {
    console.warn(`Invalid daily goal target: ${target}`);
    return false;
  }

  const data = initStorage('daily_goal', {
    target: 50,
    completedDates: []
  });

  data.target = target;
  localStorage.setItem('dm_daily_goal', JSON.stringify(data));
  return true;
};

/**
 * Check daily goal completion
 * @returns {{ completed: boolean, progress: number, target: number, percentage: number }}
 */
export const checkDailyGoal = () => {
  const goal = getDailyGoal();
  return {
    completed: goal.completed,
    progress: goal.progress,
    target: goal.target,
    percentage: Math.min(100, Math.round((goal.progress / goal.target) * 100))
  };
};

// ============================================================================
// 4. BADGES/ACHIEVEMENTS
// ============================================================================

const BADGES = [
  // Streak badges
  {
    id: 'first_day',
    name: 'Primo Giorno',
    description: 'Completa la tua prima attività',
    icon: '🌱',
    category: 'streak'
  },
  {
    id: 'week_streak',
    name: 'Una Settimana!',
    description: '7 giorni consecutivi',
    icon: '🔥',
    category: 'streak'
  },
  {
    id: 'month_streak',
    name: 'Un Mese!',
    description: '30 giorni consecutivi',
    icon: '💪',
    category: 'streak'
  },
  {
    id: 'century_streak',
    name: '100 Giorni!',
    description: '100 giorni consecutivi',
    icon: '💯',
    category: 'streak'
  },

  // XP badges
  {
    id: 'first_100xp',
    name: 'Primi Passi',
    description: 'Guadagna 100 XP',
    icon: '⭐',
    category: 'xp'
  },
  {
    id: 'xp_1000',
    name: 'Studente Dedicato',
    description: 'Guadagna 1000 XP',
    icon: '🏆',
    category: 'xp'
  },
  {
    id: 'xp_5000',
    name: 'Esperto',
    description: 'Guadagna 5000 XP',
    icon: '👑',
    category: 'xp'
  },
  {
    id: 'xp_10000',
    name: 'Maestro',
    description: 'Guadagna 10000 XP',
    icon: '🎓',
    category: 'xp'
  },

  // Vocabulary badges
  {
    id: 'first_word',
    name: 'Prima Parola',
    description: 'Studia la tua prima parola',
    icon: '📖',
    category: 'vocabulary'
  },
  {
    id: 'words_100',
    name: 'Vocabolario Base',
    description: 'Studia 100 parole',
    icon: '📚',
    category: 'vocabulary'
  },
  {
    id: 'words_500',
    name: 'Vocabolario Avanzato',
    description: 'Studia 500 parole',
    icon: '🧠',
    category: 'vocabulary'
  },
  {
    id: 'words_1000',
    name: 'Poliglotta',
    description: 'Studia 1000 parole',
    icon: '🌍',
    category: 'vocabulary'
  },

  // Quiz badges
  {
    id: 'first_quiz',
    name: 'Primo Quiz',
    description: 'Completa il tuo primo quiz',
    icon: '❓',
    category: 'quiz'
  },
  {
    id: 'perfect_quiz',
    name: 'Perfezione!',
    description: '10/10 in un quiz',
    icon: '💎',
    category: 'quiz'
  },
  {
    id: 'quiz_50',
    name: 'Quiz Master',
    description: 'Completa 50 quiz',
    icon: '🎯',
    category: 'quiz'
  },
  {
    id: 'correct_100',
    name: '100 Corrette!',
    description: '100 risposte corrette',
    icon: '✅',
    category: 'quiz'
  },

  // Lesson badges
  {
    id: 'first_lesson',
    name: 'Prima Lezione',
    description: 'Completa la prima lezione',
    icon: '📝',
    category: 'lessons'
  },
  {
    id: 'lessons_10',
    name: 'Studente Modello',
    description: 'Completa 10 lezioni',
    icon: '🎒',
    category: 'lessons'
  },
  {
    id: 'lessons_50',
    name: 'Metà Strada!',
    description: 'Completa 50 lezioni',
    icon: '🚀',
    category: 'lessons'
  },
  {
    id: 'all_lessons',
    name: 'Corso Completo!',
    description: 'Completa tutte le 100 lezioni',
    icon: '🏅',
    category: 'lessons'
  },

  // Reading badges
  {
    id: 'first_reading',
    name: 'Primo Testo',
    description: 'Leggi il tuo primo testo',
    icon: '📰',
    category: 'reading'
  },
  {
    id: 'readings_20',
    name: 'Lettore',
    description: 'Leggi 20 testi',
    icon: '📖',
    category: 'reading'
  },

  // Level badges
  {
    id: 'reach_a2',
    name: 'Livello A2',
    description: 'Raggiungi il livello A2',
    icon: '🟢',
    category: 'level'
  },
  {
    id: 'reach_b1',
    name: 'Livello B1',
    description: 'Raggiungi il livello B1',
    icon: '🔵',
    category: 'level'
  },
  {
    id: 'reach_b2',
    name: 'Livello B2',
    description: 'Raggiungi il livello B2',
    icon: '🟡',
    category: 'level'
  },
  {
    id: 'reach_c1',
    name: 'Livello C1',
    description: 'Raggiungi il livello C1',
    icon: '🔴',
    category: 'level'
  }
];

/**
 * Get all badges with unlock status
 * @returns {array} Array of badge objects with unlocked status
 */
export const getBadges = () => {
  const unlockedData = initStorage('badges', { unlocked: {} });
  const unlockedSet = new Set(Object.keys(unlockedData.unlocked));

  return BADGES.map(badge => ({
    ...badge,
    unlocked: unlockedSet.has(badge.id),
    unlockedDate: unlockedData.unlocked[badge.id] || null
  }));
};

/**
 * Check all badge conditions and unlock new ones
 * @returns {array} Array of newly unlocked badges
 */
export const checkBadges = () => {
  const unlockedData = initStorage('badges', { unlocked: {} });
  const newlyUnlocked = [];
  const today = getToday();

  // Get all required data
  const streakData = getStreak();
  const xpData = getXP();
  const lessonProgress = initStorage('lessons_progress', {});
  const quizStats = initStorage('quizStats', { completed: 0, correct: 0, perfect: 0 });
  const learningProgress = initStorage('learningProgress', { words: {} });
  const readingStats = initStorage('readingStats', { completed: 0 });

  const wordCount = Object.keys(learningProgress.words || {}).length;

  // Badge condition checks
  const badgeConditions = {
    first_day: () => streakData.currentStreak >= 1,
    week_streak: () => streakData.currentStreak >= 7,
    month_streak: () => streakData.currentStreak >= 30,
    century_streak: () => streakData.currentStreak >= 100,

    first_100xp: () => xpData.totalXP >= 100,
    xp_1000: () => xpData.totalXP >= 1000,
    xp_5000: () => xpData.totalXP >= 5000,
    xp_10000: () => xpData.totalXP >= 10000,

    first_word: () => wordCount >= 1,
    words_100: () => wordCount >= 100,
    words_500: () => wordCount >= 500,
    words_1000: () => wordCount >= 1000,

    first_quiz: () => quizStats.completed >= 1,
    perfect_quiz: () => quizStats.perfect >= 1,
    quiz_50: () => quizStats.completed >= 50,
    correct_100: () => quizStats.correct >= 100,

    first_lesson: () => Object.keys(lessonProgress).length >= 1,
    lessons_10: () => Object.keys(lessonProgress).length >= 10,
    lessons_50: () => Object.keys(lessonProgress).length >= 50,
    all_lessons: () => Object.keys(lessonProgress).length >= 100,

    first_reading: () => readingStats.completed >= 1,
    readings_20: () => readingStats.completed >= 20,

    reach_a2: () => xpData.level >= 2,
    reach_b1: () => xpData.level >= 5,
    reach_b2: () => xpData.level >= 8,
    reach_c1: () => xpData.level >= 11
  };

  // Check each badge
  for (const badge of BADGES) {
    const isUnlocked = unlockedData.unlocked[badge.id] !== undefined;
    const condition = badgeConditions[badge.id];

    if (!isUnlocked && condition && condition()) {
      unlockedData.unlocked[badge.id] = today;
      newlyUnlocked.push(badge);
    }
  }

  saveAndSync('dm_badges', JSON.stringify(unlockedData));
  return newlyUnlocked;
};

// ============================================================================
// 5. SPACED REPETITION
// ============================================================================

/**
 * Get words due for review today
 * @returns {array} Array of word objects
 */
export const getReviewWords = () => {
  const data = initStorage('spaced_repetition', { words: {} });
  const today = getToday();
  const dueWords = [];

  Object.entries(data.words).forEach(([wordId, word]) => {
    if (word.nextReview <= today) {
      dueWords.push({
        wordId,
        german: word.german,
        italian: word.italian
      });
    }
  });

  return dueWords;
};

/**
 * Record a review result and update spaced repetition algorithm
 * Implements simplified SM-2 algorithm
 * @param {string} wordId - Word identifier
 * @param {boolean} correct - Whether the review was correct
 */
export const recordReview = (wordId, correct) => {
  const data = initStorage('spaced_repetition', { words: {} });

  if (!data.words[wordId]) {
    console.warn(`Word ${wordId} not found in spaced repetition system`);
    return false;
  }

  const word = data.words[wordId];
  const today = getToday();

  if (correct) {
    word.repetitions = (word.repetitions || 0) + 1;

    // Grow interval: 1, 3, 7, 14, 30, 60, 120...
    const intervals = [1, 3, 7, 14, 30, 60, 120];
    const nextInterval = word.repetitions <= intervals.length
      ? intervals[word.repetitions - 1]
      : intervals[intervals.length - 1] * 2;

    word.interval = nextInterval;

    // Ease factor increases slightly (max 2.5)
    word.easeFactor = Math.min(2.5, (word.easeFactor || 2.5) + 0.1);
  } else {
    // Reset on incorrect
    word.repetitions = 0;
    word.interval = 1;
    word.easeFactor = Math.max(1.3, (word.easeFactor || 2.5) - 0.2);
  }

  // Calculate next review date
  const nextReviewDate = new Date(today);
  nextReviewDate.setDate(nextReviewDate.getDate() + word.interval);
  word.nextReview = nextReviewDate.toISOString().split('T')[0];
  word.lastReview = today;

  saveAndSync('dm_spaced_repetition', JSON.stringify(data));
  return true;
};

/**
 * Add a word to the spaced repetition system
 * @param {string} wordId - Word identifier
 * @param {string} german - German word
 * @param {string} italian - Italian translation
 */
export const addToReview = (wordId, german, italian) => {
  const data = initStorage('spaced_repetition', { words: {} });
  const today = getToday();

  data.words[wordId] = {
    german,
    italian,
    interval: 1,
    easeFactor: 2.5,
    nextReview: today,
    repetitions: 0,
    lastReview: null,
    dateAdded: today
  };

  saveAndSync('dm_spaced_repetition', JSON.stringify(data));
  return true;
};

/**
 * Get spaced repetition statistics
 * @returns {{ totalWords: number, dueToday: number, mastered: number, learning: number }}
 */
export const getReviewStats = () => {
  const data = initStorage('spaced_repetition', { words: {} });
  const today = getToday();

  let dueToday = 0;
  let mastered = 0;
  let learning = 0;

  Object.values(data.words).forEach(word => {
    if (word.nextReview <= today) {
      dueToday += 1;
    }
    if (word.interval >= 30) {
      mastered += 1;
    } else {
      learning += 1;
    }
  });

  return {
    totalWords: Object.keys(data.words).length,
    dueToday,
    mastered,
    learning
  };
};

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

export default {
  // Streak System
  getStreak,
  recordActivity,
  getStreakCalendar,

  // XP System
  getXP,
  addXP,
  getLevel,
  getXPHistory,

  // Daily Goals
  getDailyGoal,
  setDailyGoal,
  checkDailyGoal,

  // Badges/Achievements
  getBadges,
  checkBadges,

  // Spaced Repetition
  getReviewWords,
  recordReview,
  addToReview,
  getReviewStats
};
