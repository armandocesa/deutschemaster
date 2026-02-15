import React, { useState, useMemo, useEffect } from 'react';
import {
  getStreak,
  getStreakCalendar,
  getXP,
  getXPHistory,
  getDailyGoal,
  setDailyGoal,
  checkDailyGoal,
  getBadges,
} from '../utils/gamification';
import { getQuizStats, getProgressStats, getDifficultWords } from '../utils/storage';
import {
  requestPermission,
  isEnabled as checkNotificationsEnabled,
  setEnabled as setNotificationsEnabled,
  getReminderTime,
  setReminderTime,
  scheduleReminder,
} from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const ADMIN_EMAILS = ['armandocesa@gmail.com'];

const ProfilePage = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, logout, firebaseEnabled } = useAuth();
  const dailyGoalData = getDailyGoal();
  const [selectedGoal, setSelectedGoal] = useState(dailyGoalData.target || 50);
  const [placementTestData, setPlacementTestData] = useState(null);
  const [notificationsEnabled, setNotificationsEnabledLocal] = useState(() => checkNotificationsEnabled());
  const [reminderHour, setReminderHour] = useState(() => {
    const time = getReminderTime();
    return parseInt(time.split(':')[0]);
  });
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const goalOptions = [10, 30, 50, 100, 150];

  // Load placement test data
  useEffect(() => {
    try {
      const testData = localStorage.getItem('dm_placement_level');
      if (testData) {
        setPlacementTestData(JSON.parse(testData));
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Failed to load placement test data:', e);
    }
  }, []);

  // Handle notification toggle
  const handleNotificationToggle = async (enabled) => {
    if (enabled) {
      // Request permission if not already granted
      const permission = await requestPermission();
      if (permission) {
        setNotificationsEnabled(true);
        setNotificationsEnabledLocal(true);
        // Reschedule with current time
        const reminderTime = `${String(reminderHour).padStart(2, '0')}:00`;
        scheduleReminder(reminderTime);
      } else {
        setShowNotificationPrompt(true);
      }
    } else {
      setNotificationsEnabled(false);
      setNotificationsEnabledLocal(false);
    }
  };

  // Handle reminder time change
  const handleReminderTimeChange = (hour) => {
    setReminderHour(hour);
    const time = `${String(hour).padStart(2, '0')}:00`;
    setReminderTime(time);
    // Reschedule with new time if enabled
    if (notificationsEnabled) {
      scheduleReminder(time);
    }
  };

  // Fetch all data
  const xpData = useMemo(() => getXP(), []);
  const streakData = useMemo(() => getStreak(), []);
  const today = new Date();
  const streakCalendar = useMemo(() => getStreakCalendar(today.getFullYear(), today.getMonth() + 1), []);
  const xpHistory = useMemo(() => getXPHistory(30), []);
  const quizStats = useMemo(() => getQuizStats(), []);
  const progressStats = useMemo(() => getProgressStats(), []);
  const difficultWords = useMemo(() => getDifficultWords(), []);
  const badges = useMemo(() => getBadges(), []);

  const level = xpData.level || 1;

  // Get level name
  const getLevelName = (lvl) => {
    if (lvl <= 5) return t('home.levels.beginner');
    if (lvl <= 10) return t('home.levels.student');
    if (lvl <= 20) return t('home.levels.intermediate');
    if (lvl <= 35) return t('home.levels.advanced');
    if (lvl <= 50) return t('home.levels.expert');
    return t('home.levels.master');
  };

  const levelName = getLevelName(level);

  // Handle goal change
  const handleGoalChange = (goal) => {
    setSelectedGoal(goal);
    setDailyGoal(goal);
  };

  // Get today's XP progress
  const todayXP = xpData.todayXP || 0;

  // Get today's date info for calendar
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const longestStreak = streakData.longestStreak || 0;

  // Build calendar grid for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const activeSet = new Set(
      (streakCalendar || [])
        .filter((d) => d.active)
        .map((d) => d.day)
    );

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        active: activeSet.has(i),
        isToday: i === currentDay,
      });
    }

    return days;
  }, [currentMonth, currentYear, currentDay, streakCalendar]);

  // Calculate XP for last 7 days
  const last7DaysXP = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const xp = xpHistory.find((entry) => new Date(entry.date).toDateString() === dateStr)?.xp || 0;
      data.push({
        day: (language === 'en' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'])[date.getDay()],
        xp,
        isToday: i === 0,
      });
    }
    return data;
  }, [xpHistory]);

  const maxXPInWeek = useMemo(() => Math.max(...last7DaysXP.map((d) => d.xp), 100), [last7DaysXP]);

  // Get total words studied
  const totalWordsStudied = useMemo(() => {
    return (progressStats?.wordsCorrect || 0) + (progressStats?.wordsIncorrect || 0);
  }, [progressStats]);

  // Get correct answers percentage
  const correctAnswersPercentage = useMemo(() => {
    if (!quizStats || quizStats.totalAnswered === 0) return 0;
    return Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100);
  }, [quizStats]);

  // Get quizzes completed
  const quizzesCompleted = useMemo(() => {
    if (!quizStats || quizStats.totalAnswered === 0) return 0;
    return Math.floor(quizStats.totalAnswered / 10);
  }, [quizStats]);

  // Get saved words count
  const savedWordsCount = useMemo(() => difficultWords?.length || 0, [difficultWords]);

  // Get goal streak
  const goalStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = xpHistory.find((e) => e.date === dateStr);
      if (entry && entry.xp >= selectedGoal) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [xpHistory, selectedGoal]);

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* DONATION BANNER */}
        <div className="profile-donation-banner">
          <div className="profile-donation-content">
            <span className="profile-donation-emoji">❤️</span>
            <div>
              <div className="profile-donation-text-title">
                {t('profile.donation')}
              </div>
              <div className="profile-donation-text-subtitle">
                {t('profile.supportUs')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('dona')}
            className="profile-donation-btn"
          >
            {t('profile.donateNow')}
          </button>
        </div>
        {/* HEADER SECTION */}
        <div className="profile-header">
          <h1 className="profile-title">
            {t('profile.title')}
          </h1>

          {/* Account Section */}
          <div className="profile-account-section">
            {isAuthenticated ? (
              <>
                <div className="profile-user-info">
                  <div className="profile-avatar">
                    {(user?.displayName || user?.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="profile-user-name">{user?.displayName || 'Utente'}</div>
                    <div className="profile-user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="profile-account-actions">
                  {ADMIN_EMAILS.includes(user?.email) && (
                    <button onClick={() => onNavigate('admin')} className="profile-admin-btn">
                      ⚙️ Admin
                    </button>
                  )}
                  <button onClick={async () => { await logout(); onNavigate('home'); }} className="profile-logout-btn">
                    {t('profile.signOut')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="profile-signed-in-message">
                  {firebaseEnabled ? t('profile.signedIn') : t('profile.offline')}
                </div>
                {firebaseEnabled && (
                  <button onClick={() => onNavigate('login')} className="profile-signin-btn">
                    {t('profile.signInButton')}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Notification Settings Section */}
          <div className="profile-notifications-section">
            <div className="profile-notifications-header">
              <div className="profile-notifications-content">
                <span className="profile-notifications-emoji">🔔</span>
                <div>
                  <div className="profile-notifications-title">{t('profile.notifications.title')}</div>
                  <div className="profile-notifications-subtitle">
                    {t('profile.notifications.subtitle')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle(!notificationsEnabled)}
                className={`profile-notifications-toggle ${!notificationsEnabled ? 'profile-notifications-toggle--disabled' : ''}`}
              >
                {notificationsEnabled ? t('profile.notifications.enabled') : t('profile.notifications.disabled')}
              </button>
            </div>

            {notificationsEnabled && (
              <div className="profile-notifications-settings">
                <div>
                  <label className="profile-reminder-label">
                    {t('profile.notifications.reminderTime')}
                  </label>
                  <div className="profile-reminder-controls">
                    <select
                      value={reminderHour}
                      onChange={(e) => handleReminderTimeChange(parseInt(e.target.value))}
                      className="profile-reminder-select"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                    <div className="profile-reminder-hint">
                      {t('profile.notifications.reminderHint')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showNotificationPrompt && (
              <div className="profile-notification-prompt">
                <span>{t('profile.notifications.blocked')}</span>
                <button
                  onClick={() => setShowNotificationPrompt(false)}
                  aria-label="Dismiss notification prompt"
                  className="profile-prompt-close"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="profile-stats-header">
            {/* XP Display */}
            <div className="profile-xp-display">
              <div className="profile-xp-label">
                {t('profile.stats.xp')}
              </div>
              <div className="profile-xp-value">
                {(xpData.totalXP || 0).toLocaleString()}
              </div>
            </div>

            {/* Level Badge */}
            <div className="profile-level-badge">
              <div className="profile-level-number">{level}</div>
              <div className="profile-level-name">
                {levelName}
              </div>
            </div>
          </div>
        </div>

        {/* STREAK SECTION */}
        <div className="profile-streak-section">
          <div className="profile-streak-header">
            <span className="profile-streak-emoji">🔥</span>
            <div className="profile-streak-content">
              <div className="profile-streak-number">
                {streakData.currentStreak || 0}
              </div>
              <div className="profile-streak-text">
                {t('profile.stats.streak')} {longestStreak} {t('days')}
              </div>
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="profile-calendar-container">
            <h3 className="profile-calendar-title">
              {new Date(currentYear, currentMonth).toLocaleString(language === 'en' ? 'en-US' : 'it-IT', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>

            <div className="profile-calendar-grid">
              {(language === 'en' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']).map((dayName) => (
                <div
                  key={dayName}
                  className="profile-calendar-day-name"
                >
                  {dayName}
                </div>
              ))}

              {calendarDays.map((dayObj, idx) =>
                dayObj === null ? (
                  <div key={`empty-${idx}`} />
                ) : (
                  <div
                    key={dayObj.day}
                    className={`profile-calendar-day ${dayObj.active ? 'profile-calendar-day--active' : ''} ${dayObj.isToday ? 'profile-calendar-day--today' : ''}`}
                  >
                    {dayObj.day}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* DAILY GOAL SECTION */}
        <div className="profile-goal-section">
          <h2 className="profile-goal-title">
            {t('profile.dailyGoal.title')}
          </h2>

          <div className="profile-goal-container">
            {/* Circular Progress */}
            <div className="profile-goal-progress">
              <svg
                width="140"
                height="140"
                style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
              >
                {/* Background circle */}
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="var(--bg)"
                  strokeWidth="8"
                />

                {/* Progress circle */}
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 60 * (1 - Math.min(todayXP, selectedGoal) / selectedGoal)
                  }`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s' }}
                />
              </svg>

              <div className="profile-goal-progress-text">
                <div className="profile-goal-progress-value">
                  {todayXP} / {selectedGoal}
                </div>
                <div className="profile-goal-progress-label">
                  XP
                </div>
              </div>
            </div>

            {/* Goal Selector */}
            <div className="profile-goal-selector">
              <div className="profile-goal-label">
                {t('profile.dailyGoal.choose')}
              </div>

              <div className="profile-goal-buttons">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleGoalChange(goal)}
                    className={`profile-goal-btn ${selectedGoal === goal ? 'profile-goal-btn--active' : ''}`}
                  >
                    {goal} XP
                  </button>
                ))}
              </div>

              <div className="profile-goal-streak">
                {t('profile.dailyGoal.streak')} <span className="profile-goal-streak-value">{goalStreak}</span>{' '}
                {t('days')}
              </div>
            </div>
          </div>
        </div>

        {/* PLACEMENT TEST SECTION */}
        {placementTestData && (
          <div className="profile-placement-section">
            <div className="profile-placement-header">
              <h2 className="profile-placement-title">
                {t('profile.placementTest.title')}
              </h2>
              <button
                onClick={() => onNavigate('placement-test')}
                className="profile-placement-retry-btn"
              >
                {t('profile.placementTest.retry')}
              </button>
            </div>

            <div className="profile-placement-content">
              <div>
                <div className="profile-placement-level-label">
                  {t('profile.placementTest.detectedLevel')}
                </div>
                <div className="profile-placement-level-badge">
                  {placementTestData.level}
                </div>
              </div>

              <div className="profile-placement-results">
                <div className="profile-placement-results-title">
                  {t('profile.placementTest.results')}
                </div>
                <div className="profile-placement-results-grid">
                  <div className="profile-placement-result-card">
                    <div className="profile-placement-result-label">{t('profile.placementTest.correctAnswers')}</div>
                    <div className="profile-placement-result-value">
                      {placementTestData.correctAnswers}/{placementTestData.totalQuestions}
                    </div>
                  </div>
                  <div className="profile-placement-result-card profile-placement-result-card--info">
                    <div className="profile-placement-result-label">{t('profile.placementTest.testDate')}</div>
                    <div className="profile-placement-result-value profile-placement-result-value--info">
                      {new Date(placementTestData.completedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'it-IT')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATISTICS SECTION */}
        <div className="profile-stats-grid">
          {[
            { label: t('profile.stats.wordsStudied'), value: totalWordsStudied },
            { label: t('profile.stats.correctAnswers'), value: `${correctAnswersPercentage}%` },
            { label: t('profile.stats.quizzesCompleted'), value: quizzesCompleted },
            { label: t('profile.stats.savedWords'), value: savedWordsCount },
            { label: t('profile.stats.totalXP'), value: (xpData.totalXP || 0).toLocaleString() },
            { label: t('profile.stats.level'), value: level },
          ].map((stat, idx) => (
            <div key={idx} className="profile-stat-card">
              <div className="profile-stat-label">
                {stat.label}
              </div>
              <div className="profile-stat-value">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* XP WEEKLY CHART */}
        <div className="profile-xp-chart-section">
          <h2 className="profile-xp-chart-title">
            {t('profile.xpChart.title')}
          </h2>

          <div className="profile-xp-chart">
            {last7DaysXP.map((dayData, idx) => {
              const heightPercentage = maxXPInWeek > 0 ? (dayData.xp / maxXPInWeek) * 100 : 0;

              return (
                <div
                  key={idx}
                  className="profile-xp-bar-container"
                >
                  <div
                    className={`profile-xp-bar ${dayData.isToday ? 'profile-xp-bar--active' : ''}`}
                    style={{ height: `${heightPercentage}%` }}
                    title={`${dayData.xp} XP`}
                  />
                  <div
                    className={`profile-xp-bar-label ${dayData.isToday ? 'profile-xp-bar-label--active' : ''}`}
                  >
                    {dayData.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BADGES SECTION */}
        <div className="profile-badges-section">
          <div className="profile-badges-header">
            <h2 className="profile-badges-title">
              {t('profile.badges.title')}
            </h2>
            <span className="profile-badges-count">
              {badges.filter((b) => b.unlocked).length} / {badges.length} {t('profile.badges.unlocked')}
            </span>
          </div>

          <div className="profile-badges-grid">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className={`profile-badge ${!badge.unlocked ? 'profile-badge--locked' : ''}`}
              >
                {!badge.unlocked && (
                  <div className="profile-badge-lock">
                    🔒
                  </div>
                )}

                <div className={`profile-badge-icon ${!badge.unlocked ? 'profile-badge-icon--locked' : ''}`}>
                  {badge.icon}
                </div>

                <div className="profile-badge-name">
                  {badge.nameKey ? t(badge.nameKey) : badge.name}
                </div>

                <div className="profile-badge-description">
                  {badge.descKey ? t(badge.descKey) : badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
