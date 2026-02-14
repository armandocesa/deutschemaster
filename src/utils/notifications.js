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
  const messages = [
    {
      title: 'Deutsche Master',
      body: `Non perdere il tuo streak di ${streak} giorni! Studia 5 minuti oggi.`
    },
    {
      title: 'Deutsche Master',
      body: 'È ora di studiare tedesco! Il tuo streak ti aspetta.'
    },
    {
      title: 'Deutsche Master',
      body: `Mantieni il tuo streak! ${streak} giorni di impegno, continua così!`
    },
    {
      title: 'Deutsche Master',
      body: 'Ricorda: ogni giorno conta. Studia un po\' di tedesco oggi.'
    },
    {
      title: 'Deutsche Master',
      body: `${streak} giorni consecutivi! Non mollare adesso!`
    },
    {
      title: 'Deutsche Master',
      body: 'Il tuo impegno sta pagando. Apri l\'app e continua a imparare!'
    }
  ];

  return messages[Math.floor(Math.random() * messages.length)];
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
