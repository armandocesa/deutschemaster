// ============================================================================
// DEUTSCHE MASTER NOTIFICATIONS SYSTEM
// Push notification support for streak reminders using Notification API
// ============================================================================

/**
 * Request permission from user for notifications
 * @returns {Promise<boolean>} - true if permission granted
 */
export const requestPermission = async () => {
  if (!('Notification' in window)) {
    if (import.meta.env.DEV) console.warn('Notification API not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  return false;
};

/**
 * Check if notifications are enabled in user preferences
 * @returns {boolean}
 */
export const isEnabled = () => {
  const value = localStorage.getItem('dm_notifications_enabled');
  return value === 'true';
};

/**
 * Enable/disable notifications in user preferences
 * @param {boolean} enabled
 */
export const setEnabled = (enabled) => {
  localStorage.setItem('dm_notifications_enabled', enabled ? 'true' : 'false');
};

/**
 * Get the user's preferred reminder time (HH:00 format, default 20:00)
 * @returns {string} - Time in "HH:00" format (e.g., "20:00")
 */
export const getReminderTime = () => {
  const value = localStorage.getItem('dm_reminder_time');
  return value || '20:00';
};

/**
 * Set the user's preferred reminder time
 * @param {string} time - Time in "HH:00" format (e.g., "20:00")
 */
export const setReminderTime = (time) => {
  localStorage.setItem('dm_reminder_time', time);
};

/**
 * Display a notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options (body, icon, badge, etc.)
 */
export const showNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    if (import.meta.env.DEV) console.warn('Notification API not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    if (import.meta.env.DEV) console.warn('Notification permission not granted');
    return;
  }

  try {
    // Use service worker if available for more reliable notifications
    if ('serviceWorker' in navigator && 'registration' in navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icon-192x192.svg',
          badge: '/icon-192x192.svg',
          ...options
        });
      }).catch(() => {
        // Fallback to regular notification if service worker fails
        new Notification(title, {
          icon: '/icon-192x192.svg',
          badge: '/icon-192x192.svg',
          ...options
        });
      });
    } else {
      // Fallback to regular Notification API
      new Notification(title, {
        icon: '/icon-192x192.svg',
        badge: '/icon-192x192.svg',
        ...options
      });
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error showing notification:', error);
  }
};

/**
 * Get random notification message based on current streak
 * @param {number} streak - Current streak days
 * @returns {object} - { title, body }
 */
const getRandomNotificationMessage = (streak) => {
  let lang = 'en';
  try {
    const saved = localStorage.getItem('dm_ui_language');
    if (saved && ['it', 'en', 'de'].includes(saved)) lang = saved;
  } catch {}

  const messages = {
    it: [
      { title: 'DeutschMaster', body: `Non perdere il tuo streak di ${streak} giorni! Studia 5 minuti oggi.` },
      { title: 'DeutschMaster', body: 'È ora di studiare tedesco! Il tuo streak ti aspetta.' },
      { title: 'DeutschMaster', body: `Mantieni il tuo streak! ${streak} giorni di impegno, continua così!` },
      { title: 'DeutschMaster', body: 'Ricorda: ogni giorno conta. Studia un po\' di tedesco oggi.' },
      { title: 'DeutschMaster', body: `${streak} giorni consecutivi! Non mollare adesso!` },
      { title: 'DeutschMaster', body: 'Il tuo impegno sta pagando. Apri l\'app e continua a imparare!' },
    ],
    en: [
      { title: 'DeutschMaster', body: `Don't lose your ${streak}-day streak! Study for 5 minutes today.` },
      { title: 'DeutschMaster', body: 'Time to study German! Your streak is waiting.' },
      { title: 'DeutschMaster', body: `Keep your streak! ${streak} days of commitment, keep going!` },
      { title: 'DeutschMaster', body: 'Remember: every day counts. Study a little German today.' },
      { title: 'DeutschMaster', body: `${streak} consecutive days! Don't give up now!` },
      { title: 'DeutschMaster', body: 'Your effort is paying off. Open the app and keep learning!' },
    ],
    de: [
      { title: 'DeutschMaster', body: `Verlier nicht deine ${streak}-Tage-Serie! Lerne heute 5 Minuten.` },
      { title: 'DeutschMaster', body: 'Zeit, Deutsch zu lernen! Deine Serie wartet.' },
      { title: 'DeutschMaster', body: `Halte deine Serie! ${streak} Tage Einsatz, mach weiter!` },
      { title: 'DeutschMaster', body: 'Denk daran: Jeder Tag zählt. Lerne heute ein bisschen Deutsch.' },
      { title: 'DeutschMaster', body: `${streak} Tage in Folge! Gib jetzt nicht auf!` },
      { title: 'DeutschMaster', body: 'Dein Einsatz zahlt sich aus. Öffne die App und lerne weiter!' },
    ],
  };

  const langMessages = messages[lang] || messages.en;
  return langMessages[Math.floor(Math.random() * langMessages.length)];
};

/**
 * Check if user has studied today (simple check based on streak calendar)
 * @returns {boolean}
 */
const hasStudiedToday = () => {
  // Use local date (not UTC) to match gamification.js getToday() format
  const date = new Date();
  const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  try {
    const streakData = localStorage.getItem('dm_streak');
    if (!streakData) return false;
    const data = JSON.parse(streakData);
    return data.calendar && data.calendar[today] === true;
  } catch {
    return false;
  }
};

/**
 * Get current streak
 * @returns {number}
 */
const getCurrentStreak = () => {
  try {
    const streakData = localStorage.getItem('dm_streak');
    if (!streakData) return 0;
    const data = JSON.parse(streakData);
    return data.currentStreak || 0;
  } catch {
    return 0;
  }
};

/**
 * Schedule a daily reminder notification
 * Checks the current time and schedules notification for the specified time
 * Returns a cleanup function to cancel the timeout
 *
 * @param {string} reminderTime - Time in "HH:00" format (e.g., "20:00")
 * @returns {function} - Cleanup function to cancel the scheduled reminder
 */
export const scheduleReminder = (reminderTime = '20:00') => {
  if (!isEnabled() || !('Notification' in window)) {
    return () => {};
  }

  let timeoutId = null;

  const scheduleNextReminder = () => {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);

    // Calculate next reminder time
    let nextReminder = new Date();
    nextReminder.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (nextReminder <= now) {
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    const timeUntilReminder = nextReminder - now;

    // Schedule the reminder
    timeoutId = setTimeout(() => {
      // Only show if user hasn't studied today
      if (!hasStudiedToday()) {
        const streak = getCurrentStreak();
        const message = getRandomNotificationMessage(streak);

        showNotification(message.title, {
          body: message.body,
          tag: 'streak-reminder',
          requireInteraction: false,
          silent: false
        });
      }

      // Schedule next day's reminder
      scheduleNextReminder();
    }, timeUntilReminder);
  };

  // Initial schedule
  scheduleNextReminder();

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};

export default {
  requestPermission,
  isEnabled,
  setEnabled,
  getReminderTime,
  setReminderTime,
  showNotification,
  scheduleReminder
};
