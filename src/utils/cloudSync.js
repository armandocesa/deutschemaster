import { db, auth, hasConfig } from '../firebase';
import { doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { LIMITS } from './rateLimit';
import { firestoreRetry } from './retry';

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
  'dm_placement_level',
  'dm_completed_stories',
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

  if (!LIMITS.firestoreWrite('sync-to-cloud')) {
    if (import.meta.env.DEV) console.warn('syncToCloud rate limited');
    return;
  }

  try {
    await firestoreRetry(() => setDoc(doc(db, 'users', uid, 'data', 'progress'), payload, { merge: true }));
  } catch (e) {
    if (import.meta.env.DEV) console.warn('syncToCloud failed:', e);
  }
}

/**
 * Download Firestore data and merge with localStorage
 * Cloud data wins for numeric values (takes higher), arrays get merged
 */
export async function syncFromCloud(uid) {
  if (!hasConfig || !uid) return;

  if (!LIMITS.firestoreRead('sync-from-cloud')) {
    if (import.meta.env.DEV) console.warn('syncFromCloud rate limited');
    return;
  }

  try {
    const snapshot = await firestoreRetry(() => getDoc(doc(db, 'users', uid, 'data', 'progress')));
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
    if (import.meta.env.DEV) console.warn('syncFromCloud failed:', e);
  }
}

/**
 * Sync a single key to cloud (called after local updates)
 */
export async function syncKeyToCloud(uid, key) {
  if (!hasConfig || !uid) return;

  if (!LIMITS.firestoreWrite(`sync-key-${key}`)) {
    if (import.meta.env.DEV) console.warn(`syncKeyToCloud(${key}) rate limited`);
    return;
  }

  const data = getLocalData(key);
  if (data === null) return;

  try {
    await setDoc(doc(db, 'users', uid, 'data', 'progress'), {
      [key]: data,
    }, { merge: true });
  } catch (e) {
    if (import.meta.env.DEV) console.warn(`syncKeyToCloud(${key}) failed:`, e);
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
    case 'dm_completed_stories':
      // Union of completed story IDs
      return [...new Set([...(Array.isArray(local) ? local : []), ...(Array.isArray(cloud) ? cloud : [])])];
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

function newerDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) >= new Date(b) ? a : b;
}

function mergeStreak(local, cloud) {
  return {
    currentStreak: Math.max(local.currentStreak || 0, cloud.currentStreak || 0),
    longestStreak: Math.max(local.longestStreak || 0, cloud.longestStreak || 0),
    lastActiveDate: newerDate(local.lastActiveDate, cloud.lastActiveDate),
    calendar: { ...(cloud.calendar || {}), ...(local.calendar || {}) },
  };
}

function mergeXP(local, cloud) {
  // Determine the newest todayDate
  const localDate = local.todayDate || '';
  const cloudDate = cloud.todayDate || '';
  const newestDate = newerDate(localDate, cloudDate) || localDate;

  let todayXP;
  if (localDate === cloudDate) {
    // Same day: take the higher value
    todayXP = Math.max(local.todayXP || 0, cloud.todayXP || 0);
  } else if (newestDate === localDate) {
    // Local is newer day
    todayXP = local.todayXP || 0;
  } else {
    // Cloud is newer day
    todayXP = cloud.todayXP || 0;
  }

  return {
    totalXP: Math.max(local.totalXP || 0, cloud.totalXP || 0),
    todayXP,
    todayDate: newestDate,
    history: mergeArrays(local.history || [], cloud.history || []),
  };
}

function mergeQuizStats(local, cloud) {
  // Pick the dataset with more answers as the "winner"
  const localTotal = local.totalAnswered || 0;
  const cloudTotal = cloud.totalAnswered || 0;
  const winner = localTotal >= cloudTotal ? local : cloud;
  return {
    totalAnswered: winner.totalAnswered || 0,
    correctAnswers: winner.correctAnswers || 0,
  };
}

function mergeBadges(local, cloud) {
  const localUnlocked = (local && typeof local === 'object' && local.unlocked) ? local.unlocked : {};
  const cloudUnlocked = (cloud && typeof cloud === 'object' && cloud.unlocked) ? cloud.unlocked : {};
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
    const localReview = data.lastReview || '';
    const cloudReview = merged[id]?.lastReview || '';
    if (!merged[id] || (localReview && new Date(localReview) >= new Date(cloudReview || '1970-01-01'))) {
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
    syncKeyToCloud(auth.currentUser.uid, key).catch((e) => {
      if (import.meta.env.DEV) console.warn(`Cloud sync failed for ${key}:`, e);
    });
  }
}

/**
 * Batch write utility for analytics and other batch operations
 * More efficient than individual writes
 * @param {Function} operations - Async function that receives the batch
 */
export async function batchWrite(operations) {
  if (!hasConfig || !db) return;

  try {
    const batch = writeBatch(db);
    await operations(batch);
    await batch.commit();
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Batch write failed:', e);
  }
}
