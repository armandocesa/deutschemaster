import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getAnalyticsSummary,
  getMostVisitedPages,
  getExerciseCompletionRates,
  getActiveSessionsCount,
} from '../utils/analytics';

const ADMIN_EMAILS = ['armandocesa@gmail.com'];

const AdminPage = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [mostVisited, setMostVisited] = useState([]);
  const [completionRates, setCompletionRates] = useState({});
  const [activeSessions, setActiveSessions] = useState(0);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Check if user is admin
  const isAdmin = useMemo(
    () => isAuthenticated && ADMIN_EMAILS.includes(user?.email),
    [isAuthenticated, user?.email]
  );

  // Fetch analytics data
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [summaryData, visitedPages, rates, sessions] = await Promise.all([
          getAnalyticsSummary(30),
          getMostVisitedPages(7),
          getExerciseCompletionRates(),
          getActiveSessionsCount(),
        ]);

        setSummary(summaryData);
        setMostVisited(visitedPages);
        setCompletionRates(rates);
        setActiveSessions(sessions);
      } catch (e) {
        if (import.meta.env.DEV) console.error('Failed to fetch analytics:', e);
        setError(t('admin.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up interval for refresh
    const interval = setInterval(fetchData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [isAdmin, refreshInterval]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-auth-error-container">
        <div className="admin-auth-error-content">
          <h1 className="admin-auth-error-title">{t('admin.accessRequired')}</h1>
          <p className="admin-auth-error-text">{t('admin.authRequired')}</p>
          <button
            onClick={() => onNavigate('login')}
            className="admin-auth-btn"
          >
            {t('login.signin')}
          </button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="admin-auth-error-container">
        <div className="admin-auth-error-content">
          <h1 className="admin-auth-error-title">{t('admin.accessDenied')}</h1>
          <p className="admin-auth-error-text">{t('admin.noPermission')}</p>
          <p className="admin-auth-error-email">Email: {user?.email}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="admin-spinner" />
          <p className="admin-loading-text">{t('admin.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* HEADER */}
        <div className="admin-header">
          <div>
            <h1 className="admin-header-title">{t('admin.title')}</h1>
            <p className="admin-header-subtitle">{t('admin.subtitle')}</p>
          </div>

          <div className="admin-header-controls">
            <label className="admin-refresh-label">
              {t('admin.refreshEvery')}
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="admin-refresh-select"
              >
                <option value={15}>15 {t('admin.seconds')}</option>
                <option value={30}>30 {t('admin.seconds')}</option>
                <option value={60}>1 {t('admin.minute')}</option>
                <option value={300}>5 {t('admin.minutes')}</option>
              </select>
            </label>

            <button
              onClick={() => onNavigate('profile')}
              className="admin-back-btn"
            >
              {t('admin.backToProfile')}
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-error-banner">{error}</div>
        )}

        {/* KEY METRICS */}
        <div className="admin-metrics-grid">
          {/* Today's Stats */}
          <MetricCard
            label={t('admin.sessionsToday')}
            value={summary?.today?.sessions || 0}
            icon="📊"
            subtext={`${summary?.today?.uniqueUsers || 0} ${t('admin.uniqueUsers')}`}
          />

          <MetricCard
            label={t('admin.sessionsWeek')}
            value={summary?.week?.sessions || 0}
            icon="📈"
            subtext={`${summary?.week?.uniqueUsers || 0} ${t('admin.uniqueUsers')}`}
          />

          <MetricCard
            label={t('admin.sessionsMonth')}
            value={summary?.month?.sessions || 0}
            icon="📅"
            subtext={`${summary?.month?.newRegistrations || 0} ${t('admin.newRegistrations')}`}
          />

          <MetricCard
            label={t('admin.avgDuration')}
            value={formatDuration(summary?.today?.avgSessionDuration || 0)}
            icon="⏱️"
            subtext={t('admin.today')}
          />
        </div>

        {/* ACTIVE SESSIONS & TOP PAGES */}
        <div className="admin-content-grid">
          {/* Most Visited Pages */}
          <div className="admin-panel">
            <h2 className="admin-panel-title">
              <span className="admin-panel-icon">📄</span> {t('admin.mostVisited')}
            </h2>

            {mostVisited.length > 0 ? (
              <div className="admin-list">
                {mostVisited.map((item, idx) => (
                  <div key={idx} className="admin-list-item">
                    <span className="admin-list-item-label">
                      {formatPageName(item.page, language)}
                    </span>
                    <div className="admin-list-item-content">
                      <div className="admin-progress-bar">
                        <div
                          className="admin-progress-fill"
                          style={{
                            width: `${(item.count / (mostVisited[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="admin-list-item-value">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty-message">{t('admin.noData')}</p>
            )}
          </div>

          {/* Exercise Completion Rates */}
          <div className="admin-panel">
            <h2 className="admin-panel-title">
              <span className="admin-panel-icon">✅</span> {t('admin.exercisesCompleted')}
            </h2>

            {Object.keys(completionRates).length > 0 ? (
              <div className="admin-list">
                {Object.entries(completionRates).map(([event, count]) => (
                  <div key={event} className="admin-list-item admin-list-item-success">
                    <span className="admin-list-item-label">
                      {formatEventName(event, language)}
                    </span>
                    <span className="admin-list-item-value">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty-message">{t('admin.noData')}</p>
            )}
          </div>
        </div>

        {/* TODAY'S BREAKDOWN */}
        {summary?.today?.pageViews && Object.keys(summary.today.pageViews).length > 0 && (
          <div className="admin-panel admin-panel--spaced">
            <h2 className="admin-panel-title">
              <span className="admin-panel-icon">🔍</span> {t('admin.pageDetailsToday')}
            </h2>

            <div className="admin-stats-grid">
              {Object.entries(summary.today.pageViews)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <div key={page} className="admin-stat">
                    <div className="admin-stat-label">{formatPageName(page, language)}</div>
                    <div className="admin-stat-value admin-stat-value-accent">{count}</div>
                    <div className="admin-stat-footer">{t('admin.views')}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* WEEKLY STATS */}
        {summary?.week?.pageViews && Object.keys(summary.week.pageViews).length > 0 && (
          <div className="admin-panel">
            <h2 className="admin-panel-title">
              <span className="admin-panel-icon">📊</span> {t('admin.pagesThisWeek')}
            </h2>

            <div className="admin-stats-grid">
              {Object.entries(summary.week.pageViews)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <div key={page} className="admin-stat">
                    <div className="admin-stat-label">{formatPageName(page, language)}</div>
                    <div className="admin-stat-value admin-stat-value-info">{count}</div>
                    <div className="admin-stat-footer">{t('admin.views')}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Metric Card Component
 */
function MetricCard({ label, value, icon, subtext }) {
  return (
    <div className="admin-card">
      <div className="admin-card-icon">{icon}</div>
      <div className="admin-card-content">
        <div className="admin-card-label">{label}</div>
        <div className="admin-card-value">{value}</div>
        {subtext && <div className="admin-card-subtext">{subtext}</div>}
      </div>
    </div>
  );
}

/**
 * Helper function to format page names
 */
function formatPageName(page, language = 'it') {
  const namesIt = {
    home: 'Home',
    vocabulary: 'Vocabolario',
    grammar: 'Grammatica',
    reading: 'Lettura',
    stories: 'Storie',
    quiz: 'Quiz',
    verbs: 'Verbi',
    'special-verbs': 'Verbi Speciali',
    practice: 'Pratica',
    favorites: 'Salvate',
    lessons: 'Lezioni',
    profile: 'Profilo',
    flashcards: 'Flashcards',
    writing: 'Scrittura',
    listening: 'Ascolto',
    paths: 'Percorsi',
    'essential-words': 'Parole Essenziali',
    'verb-prefixes': 'Prefissi Verbali',
    werden: 'Il Verbo Werden',
    'placement-test': 'Test di Posizionamento',
  };
  const namesEn = {
    home: 'Home',
    vocabulary: 'Vocabulary',
    grammar: 'Grammar',
    reading: 'Reading',
    stories: 'Stories',
    quiz: 'Quiz',
    verbs: 'Verbs',
    'special-verbs': 'Special Verbs',
    practice: 'Practice',
    favorites: 'Saved',
    lessons: 'Lessons',
    profile: 'Profile',
    flashcards: 'Flashcards',
    writing: 'Writing',
    listening: 'Listening',
    paths: 'Paths',
    'essential-words': 'Essential Words',
    'verb-prefixes': 'Verb Prefixes',
    werden: 'The Werden Verb',
    'placement-test': 'Placement Test',
  };
  const names = language === 'en' ? namesEn : namesIt;
  return names[page] || page;
}

/**
 * Helper function to format event names
 */
function formatEventName(event, language = 'it') {
  const namesIt = {
    quiz_completed: 'Quiz Completati',
    exercise_completed: 'Esercizi Completati',
    story_completed: 'Storie Completate',
  };
  const namesEn = {
    quiz_completed: 'Quizzes Completed',
    exercise_completed: 'Exercises Completed',
    story_completed: 'Stories Completed',
  };
  const names = language === 'en' ? namesEn : namesIt;
  return names[event] || event;
}

/**
 * Helper function to format duration in milliseconds
 */
function formatDuration(ms) {
  if (ms < 1000) return '< 1s';
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 3600000)}h`;
}

export default AdminPage;
