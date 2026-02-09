import { db, auth, hasConfig } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// All localStorage keys to sync
const SYNC_KEYS = [
  'dm_streak',
  'dm_xp',
  'dm_daily_goal',
  'dm_badges',
  'dm_spaced_repetition',
  'dm_lessons_progress',
  'dm_difficultWords',
  'dm_reviewQuestions',
  'dm_quizStats',
  'dm_learningProgress',
  'dm_last_level',
  'dm_path_progress',
];

function getLocalData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

/**
 * Upload all localStorage data to Firestore
 */
export async function syncToCloud(uid) {
  if (!hasConfig || !uid) return;

  const payload = {};
  for (const key of SYNC_KEYS) {
    const data = getLocalData(key);
    if (data !== null) {
      payload[key] = data;
    }
  }

  if (Object.keys(payload).length === 0) return;

  try {
    await setDoc(doc(db, 'users', uid, 'data', 'progress'), payload, { merge: true });
  } catch (e) {
    console.warn('syncToCloud failed:', e);
  }
}

/**
 * Download Firestore data and merge with localStorage
 * Cloud data wins for numeric values (takes higher), arrays get merged
 */
export async function syncFromCloud(uid) {
  if (!hasConfig || !uid) return;

  try {
    const snapshot = await getDoc(doc(db, 'users', uid, 'data', 'progress'));
    if (!snapshot.exists()) return;

    const cloudData = snapshot.data();

    for (const key of SYNC_KEYS) {
      if (!(key in cloudData)) continue;

      const cloudValue = cloudData[key];
      const localValue = getLocalData(key);

      if (localValue === null) {
        // No local data, use cloud
        setLocalData(key, cloudValue);
        continue;
      }

      // Merge strategies based on key type
      const merged = mergeData(key, localValue, cloudValue);
      setLocalData(key, merged);
    }
  } catch (e) {
    console.warn('syncFromCloud failed:', e);
  }
}

/**
 * Sync a single key to cloud (called after local updates)
 */
export async function syncKeyToCloud(uid, key) {
  if (!hasConfig || !uid) return;

  const data = getLocalData(key);
  if (data === null) return;

  try {
    await setDoc(doc(db, 'users', uid, 'data', 'progress'), {
      [key]: data,
    }, { merge: true });
  } catch (e) {
    console.warn(`syncKeyToCloud(${key}) failed:`, e);
  }
}

/**
 * Smart merge: take the "best" value between local and cloud
 */
function mergeData(key, local, cloud) {
  switch (key) {
    case 'dm_streak':
      return mergeStreak(local, cloud);
    case 'dm_xp':
      return mergeXP(local, cloud);
    case 'dm_quizStats':
      return mergeQuizStats(local, cloud);
    case 'dm_badges':
      return mergeBadges(local, cloud);
    case 'dm_lessons_progress':
    case 'dm_path_progress':
      return { ...cloud, ...local }; // Union of completed items
    case 'dm_difficultWords':
    case 'dm_reviewQuestions':
      return mergeArrays(local, cloud);
    case 'dm_daily_goal':
      return mergeDailyGoal(local, cloud);
    case 'dm_learningProgress':
      return mergeLearningProgress(local, cloud);
    case 'dm_spaced_repetition':
      return mergeSpacedRepetition(local, cloud);
    default:
      return local || cloud;
  }
}

function mergeStreak(local, cloud) {
  return {
    currentStreak: Math.max(local.currentStreak || 0, cloud.currentStreak || 0),
    longestStreak: Math.max(local.longestStreak || 0, cloud.longestStreak || 0),
    lastActiveDate: [local.lastActiveDate, cloud.lastActiveDate].sort().pop(),
    calendar: { ...(cloud.calendar || {}), ...(local.calendar || {}) },
  };
}

function mergeXP(local, cloud) {
  const merged = {
    totalXP: Math.max(local.totalXP || 0, cloud.totalXP || 0),
    todayXP: local.todayDate === cloud.todayDate
      ? Math.max(local.todayXP || 0, cloud.todayXP || 0)
      : local.todayXP || 0,
    todayDate: local.todayDate || cloud.todayDate,
    history: mergeArrays(local.history || [], cloud.history || []),
  };
  return merged;
}

function mergeQuizStats(local, cloud) {
  return {
    totalAnswered: Math.max(local.totalAnswered || 0, cloud.totalAnswered || 0),
    correctAnswers: Math.max(local.correctAnswers || 0, cloud.correctAnswers || 0),
  };
}

function mergeBadges(local, cloud) {
  const localUnlocked = local.unlocked || local || {};
  const cloudUnlocked = cloud.unlocked || cloud || {};
  return {
    unlocked: { ...cloudUnlocked, ...localUnlocked },
  };
}

function mergeArrays(local, cloud) {
  if (!Array.isArray(local)) return cloud;
  if (!Array.isArray(cloud)) return local;
  const ids = new Set(local.map(i => i.id || JSON.stringify(i)));
  const merged = [...local];
  for (const item of cloud) {
    const itemId = item.id || JSON.stringify(item);
    if (!ids.has(itemId)) {
      merged.push(item);
    }
  }
  return merged;
}

function mergeDailyGoal(local, cloud) {
  const localDates = new Set(local.completedDates || []);
  const cloudDates = new Set(cloud.completedDates || []);
  return {
    target: local.target || cloud.target || 30,
    completedDates: [...new Set([...localDates, ...cloudDates])].sort(),
  };
}

function mergeLearningProgress(local, cloud) {
  const merged = { ...cloud };
  for (const category of ['words', 'grammar', 'verbs', 'reviews']) {
    if (local[category]) {
      merged[category] = { ...(cloud[category] || {}), ...(local[category] || {}) };
    }
  }
  if (local.wordsToReview || cloud.wordsToReview) {
    merged.wordsToReview = mergeArrays(local.wordsToReview || [], cloud.wordsToReview || []);
  }
  return merged;
}

function mergeSpacedRepetition(local, cloud) {
  const localWords = local.words || {};
  const cloudWords = cloud.words || {};
  const merged = { ...cloudWords };
  for (const [id, data] of Object.entries(localWords)) {
    if (!merged[id] || (data.lastReview && data.lastReview > (merged[id].lastReview || ''))) {
      merged[id] = data;
    }
  }
  return { words: merged };
}

/**
 * Save to localStorage AND sync to Firestore if user is authenticated.
 * Drop-in replacement for localStorage.setItem for dm_ keys.
 * @param {string} key - localStorage key (e.g., 'dm_streak')
 * @param {string} jsonString - JSON stringified value
 */
export function saveAndSync(key, jsonString) {
  // Always write to localStorage first
  localStorage.setItem(key, jsonString);

  // If Firebase is configured and user is logged in, sync to cloud
  if (hasConfig && auth && auth.currentUser && SYNC_KEYS.includes(key)) {
    syncKeyToCloud(auth.currentUser.uid, key).catch(() => {
      // Silent fail — localStorage is the source of truth
    });
  }
}
