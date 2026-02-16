import { db, auth, hasConfig } from '../firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { LIMITS } from './rateLimit';

/**
 * Analytics Module for Deutsche Master
 * Tracks user activity, sessions, page views, and events in Firestore
 */

let currentSessionId = null;
let sessionStartTime = null;
let pageVisitsInSession = [];
let currentPageStartTime = null;
let currentPage = null;
let eventQueue = [];
let isSyncing = false;

// Device info utilities
function getDeviceInfo() {
  return {
    type: /Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    browser: getBrowserName(),
    userAgent: navigator.userAgent,
  };
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Chromium') === -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  return 'Other';
}

/**
 * Initialize a new session when app loads
 * Called once on app startup
 */
export async function initSession() {
  if (!hasConfig) return;

  currentSessionId = generateSessionId();
  sessionStartTime = new Date();
  pageVisitsInSession = [];
  eventQueue = [];

  // Get user ID or use 'anonymous'
  const userId = auth?.currentUser?.uid || 'anonymous';

  // Store session in memory and queue for sync
  const sessionData = {
    sessionId: currentSessionId,
    userId,
    startTime: sessionStartTime,
    device: getDeviceInfo(),
    country: navigator.language || 'unknown',
  };

  // Try to save to Firestore immediately if user is authenticated
  if (auth?.currentUser?.uid) {
    try {
      await setDoc(doc(db, 'sessions', currentSessionId), {
        userId,
        startTime: serverTimestamp(),
        device: sessionData.device,
        country: sessionData.country,
        pagesVisited: [],
        eventCount: 0,
      });
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Failed to initialize session in Firestore:', e);
      // Queue for later sync
      eventQueue.push({ type: 'session_init', data: sessionData, timestamp: new Date() });
    }
  } else {
    // Queue for anonymous users
    eventQueue.push({ type: 'session_init', data: sessionData, timestamp: new Date() });
  }

}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Track page view when user navigates to a new page
 * @param {string} pageName - Name of the page (e.g., 'vocabulary', 'grammar')
 */
export async function trackPageView(pageName) {
  if (!currentSessionId) return;

  // End previous page visit
  if (currentPage && currentPageStartTime) {
    const duration = Date.now() - currentPageStartTime.getTime();
    pageVisitsInSession.push({
      page: currentPage,
      enterTime: currentPageStartTime,
      exitTime: new Date(),
      duration, // in milliseconds
    });
  }

  // Start new page visit
  currentPage = pageName;
  currentPageStartTime = new Date();

  const userId = auth?.currentUser?.uid || 'anonymous';

  // Log page view to Firestore (with rate limiting)
  if (auth?.currentUser?.uid && LIMITS.analytics('page-view')) {
    try {
      await addDoc(collection(db, 'pageViews'), {
        page: pageName,
        userId,
        sessionId: currentSessionId,
        timestamp: serverTimestamp(),
        device: getDeviceInfo().type,
      });
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Failed to log page view:', e);
      eventQueue.push({
        type: 'page_view',
        data: { page: pageName, userId, sessionId: currentSessionId },
        timestamp: new Date(),
      });
    }
  } else {
    eventQueue.push({
      type: 'page_view',
      data: { page: pageName, userId, sessionId: currentSessionId },
      timestamp: new Date(),
    });
  }
}

/**
 * Track custom events (exercise completed, quiz passed, story read, etc.)
 * @param {string} eventName - Name of the event
 * @param {object} eventData - Additional event data
 */
export async function trackEvent(eventName, eventData = {}) {
  if (!currentSessionId) return;

  const userId = auth?.currentUser?.uid || 'anonymous';
  const eventDoc = {
    eventName,
    userId,
    sessionId: currentSessionId,
    page: currentPage,
    timestamp: serverTimestamp(),
    data: eventData,
  };

  if (auth?.currentUser?.uid && LIMITS.analytics('track-event')) {
    try {
      await addDoc(collection(db, 'events'), eventDoc);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Failed to log event:', e);
      eventQueue.push({
        type: 'event',
        data: { ...eventDoc, timestamp: new Date() },
        timestamp: new Date(),
      });
    }
  } else {
    eventQueue.push({
      type: 'event',
      data: { ...eventDoc, timestamp: new Date() },
      timestamp: new Date(),
    });
  }
}

/**
 * End the current session
 * Called on window unload/before page close
 */
export async function endSession() {
  if (!currentSessionId) return;

  // Close current page visit
  if (currentPage && currentPageStartTime) {
    const duration = Date.now() - currentPageStartTime.getTime();
    pageVisitsInSession.push({
      page: currentPage,
      enterTime: currentPageStartTime,
      exitTime: new Date(),
      duration,
    });
  }

  const sessionDuration = Date.now() - sessionStartTime.getTime();
  const userId = auth?.currentUser?.uid || 'anonymous';

  const sessionDoc = {
    userId,
    startTime: sessionStartTime,
    endTime: new Date(),
    duration: sessionDuration, // in milliseconds
    pagesVisited: pageVisitsInSession,
    device: getDeviceInfo(),
    country: navigator.language || 'unknown',
  };

  // Update session in Firestore
  if (auth?.currentUser?.uid) {
    try {
      await setDoc(doc(db, 'sessions', currentSessionId), sessionDoc, { merge: true });

      // Update daily stats
      await updateDailyStats(userId, pageVisitsInSession);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Failed to end session:', e);
    }
  }


  // Clear session data
  currentSessionId = null;
  sessionStartTime = null;
  pageVisitsInSession = [];
  currentPage = null;
  currentPageStartTime = null;
}

/**
 * Update daily statistics
 */
async function updateDailyStats(userId, pagesVisited) {
  if (!hasConfig || !auth?.currentUser?.uid) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'dailyStats', today);
    const docSnap = await getDoc(docRef);

    const pageNames = pagesVisited.map(p => p.page);
    const pageViewCounts = pageNames.reduce((acc, page) => {
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {});

    const totalSessionDuration = pagesVisited.reduce((sum, p) => sum + (p.duration || 0), 0);

    const newData = {
      date: today,
      totalSessions: (docSnap.data()?.totalSessions || 0) + 1,
      uniqueUsers: new Set([userId, ...(docSnap.data()?.uniqueUsers || [])]),
      pageViews: { ...docSnap.data()?.pageViews, ...pageViewCounts },
      avgSessionDuration: totalSessionDuration / (pagesVisited.length || 1),
      lastUpdated: serverTimestamp(),
    };

    // Convert Set to array for Firestore
    const dataToSave = {
      ...newData,
      uniqueUsers: Array.from(newData.uniqueUsers),
    };

    await setDoc(docRef, dataToSave, { merge: true });
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Failed to update daily stats:', e);
  }
}

/**
 * Sync queued events to Firestore when connection is restored
 */
export async function syncQueuedEvents() {
  if (!hasConfig || !auth?.currentUser?.uid || isSyncing || eventQueue.length === 0) return;

  isSyncing = true;
  const batch = writeBatch(db);
  let successCount = 0;

  try {
    for (const queuedEvent of eventQueue) {
      try {
        if (queuedEvent.type === 'event') {
          const docRef = doc(collection(db, 'events'));
          batch.set(docRef, queuedEvent.data);
          successCount++;
        } else if (queuedEvent.type === 'page_view') {
          const docRef = doc(collection(db, 'pageViews'));
          batch.set(docRef, queuedEvent.data);
          successCount++;
        }
      } catch (e) {
        if (import.meta.env.DEV) console.warn('Error queuing event for batch:', e);
      }
    }

    if (successCount > 0) {
      await batch.commit();
      eventQueue.splice(0, successCount);
    }
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Failed to sync queued events:', e);
  } finally {
    isSyncing = false;
  }
}

/**
 * Get analytics data for a specific date range (admin use)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<object>} Analytics data
 */
export async function getAnalytics(startDate, endDate) {
  if (!hasConfig || !auth?.currentUser?.uid) return null;

  try {
    const analyticsData = {
      dateRange: { start: startDate, end: endDate },
      sessions: [],
      pageViews: {},
      events: {},
      dailyStats: [],
    };

    // Fetch daily stats
    const statsQuery = query(
      collection(db, 'dailyStats'),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      where('date', '<=', endDate.toISOString().split('T')[0])
    );
    const statsSnap = await getDocs(statsQuery);
    analyticsData.dailyStats = statsSnap.docs.map(d => d.data());

    // Fetch all sessions
    const sessionsQuery = query(
      collection(db, 'sessions')
    );
    const sessionsSnap = await getDocs(sessionsQuery);
    analyticsData.sessions = sessionsSnap.docs.map(d => d.data());

    // Fetch all events
    const eventsQuery = query(
      collection(db, 'events')
    );
    const eventsSnap = await getDocs(eventsQuery);

    eventsSnap.docs.forEach(doc => {
      const data = doc.data();
      const eventName = data.eventName || 'unknown';
      analyticsData.events[eventName] = (analyticsData.events[eventName] || 0) + 1;
    });

    return analyticsData;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Failed to fetch analytics:', e);
    return null;
  }
}

/**
 * Get summary statistics for admin dashboard
 */
export async function getAnalyticsSummary(days = 30) {
  if (!hasConfig || !auth?.currentUser?.uid) return null;

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get today's date for today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayDocRef = doc(db, 'dailyStats', today);
    const todaySnap = await getDoc(todayDocRef);
    const todayStats = todaySnap.exists() ? todaySnap.data() : null;

    // Get all stats for the period
    const allStats = await getAnalytics(startDate, endDate);

    // Calculate weekly stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStats = await getAnalytics(weekStart, endDate);

    // Calculate monthly stats (30 days)
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    const monthStats = await getAnalytics(monthStart, endDate);

    const summary = {
      today: {
        sessions: todayStats?.totalSessions || 0,
        uniqueUsers: todayStats?.uniqueUsers?.length || 0,
        pageViews: todayStats?.pageViews || {},
        avgSessionDuration: todayStats?.avgSessionDuration || 0,
      },
      week: {
        sessions: weekStats?.sessions?.length || 0,
        uniqueUsers: new Set(weekStats?.sessions?.map(s => s.userId) || []).size,
        pageViews: weekStats?.dailyStats?.reduce((acc, day) => {
          Object.entries(day.pageViews || {}).forEach(([page, count]) => {
            acc[page] = (acc[page] || 0) + count;
          });
          return acc;
        }, {}) || {},
      },
      month: {
        sessions: monthStats?.sessions?.length || 0,
        uniqueUsers: new Set(monthStats?.sessions?.map(s => s.userId) || []).size,
        pageViews: monthStats?.dailyStats?.reduce((acc, day) => {
          Object.entries(day.pageViews || {}).forEach(([page, count]) => {
            acc[page] = (acc[page] || 0) + count;
          });
          return acc;
        }, {}) || {},
        newRegistrations: await countNewRegistrations(monthStart, endDate),
      },
      events: allStats?.events || {},
    };

    return summary;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Failed to fetch analytics summary:', e);
    return null;
  }
}

/**
 * Count new user registrations in date range
 */
async function countNewRegistrations(startDate, endDate) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Failed to count registrations:', e);
    return 0;
  }
}

/**
 * Get active sessions count (for real-time dashboard)
 */
export async function getActiveSessionsCount() {
  if (!hasConfig || !auth?.currentUser?.uid) return 0;

  try {
    const today = new Date().toISOString().split('T')[0];
    const todayDocRef = doc(db, 'dailyStats', today);
    const todaySnap = await getDoc(todayDocRef);
    return todaySnap.exists() ? (todaySnap.data().totalSessions || 0) : 0;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Failed to get active sessions:', e);
    return 0;
  }
}

/**
 * Get most visited pages
 */
export async function getMostVisitedPages(days = 7) {
  if (!hasConfig || !auth?.currentUser?.uid) return [];

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const allStats = await getAnalytics(startDate, endDate);

    const pageViews = allStats?.dailyStats?.reduce((acc, day) => {
      Object.entries(day.pageViews || {}).forEach(([page, count]) => {
        acc[page] = (acc[page] || 0) + count;
      });
      return acc;
    }, {}) || {};

    return Object.entries(pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Failed to get most visited pages:', e);
    return [];
  }
}

/**
 * Get exercise completion rates
 */
export async function getExerciseCompletionRates() {
  if (!hasConfig || !auth?.currentUser?.uid) return {};

  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('eventName', 'in', ['quiz_completed', 'exercise_completed', 'story_completed'])
    );
    const eventsSnap = await getDocs(eventsQuery);

    const rates = {};
    eventsSnap.docs.forEach(doc => {
      const data = doc.data();
      const eventName = data.eventName || 'unknown';
      rates[eventName] = (rates[eventName] || 0) + 1;
    });

    return rates;
  } catch (e) {
    if (import.meta.env.DEV) console.warn('Failed to get exercise completion rates:', e);
    return {};
  }
}

export default {
  initSession,
  trackPageView,
  trackEvent,
  endSession,
  syncQueuedEvents,
  getAnalytics,
  getAnalyticsSummary,
  getActiveSessionsCount,
  getMostVisitedPages,
  getExerciseCompletionRates,
};
