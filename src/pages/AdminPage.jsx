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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>{t('admin.accessRequired')}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('admin.authRequired')}
          </p>
          <button
            onClick={() => onNavigate('login')}
            style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(108,92,231,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>{t('admin.accessDenied')}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('admin.noPermission')}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Email: {user?.email}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid rgba(108,92,231,0.3)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>{t('admin.loading')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
              {t('admin.title')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {t('admin.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {t('admin.refreshEvery')}
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                style={{
                  marginLeft: '8px',
                  padding: '6px 12px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <option value={15}>15 {t('admin.seconds')}</option>
                <option value={30}>30 {t('admin.seconds')}</option>
                <option value={60}>1 {t('admin.minute')}</option>
                <option value={300}>5 {t('admin.minutes')}</option>
              </select>
            </label>

            <button
              onClick={() => onNavigate('profile')}
              style={{
                padding: '8px 16px',
                background: 'rgba(108,92,231,0.2)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {t('admin.backToProfile')}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              marginBottom: '24px',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}

        {/* KEY METRICS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {/* Most Visited Pages */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📄</span> {t('admin.mostVisited')}
            </h2>

            {mostVisited.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mostVisited.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--bg)',
                      borderRadius: 'var(--radius)',
                      borderLeft: `3px solid var(--accent)`,
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {formatPageName(item.page, language)}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '150px',
                          height: '8px',
                          background: 'rgba(108,92,231,0.2)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(item.count / (mostVisited[0]?.count || 1)) * 100}%`,
                            background: 'var(--accent)',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--accent)',
                          minWidth: '40px',
                          textAlign: 'right',
                        }}
                      >
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px 0' }}>
                {t('admin.noData')}
              </p>
            )}
          </div>

          {/* Exercise Completion Rates */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>✅</span> {t('admin.exercisesCompleted')}
            </h2>

            {Object.keys(completionRates).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(completionRates).map(([event, count]) => (
                  <div
                    key={event}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'var(--bg)',
                      borderRadius: 'var(--radius)',
                      borderLeft: `3px solid #10b981`,
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {formatEventName(event, language)}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#10b981',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px 0' }}>
                {t('admin.noData')}
              </p>
            )}
          </div>
        </div>

        {/* TODAY'S BREAKDOWN */}
        {summary?.today?.pageViews && Object.keys(summary.today.pageViews).length > 0 && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🔍</span> {t('admin.pageDetailsToday')}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {Object.entries(summary.today.pageViews)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <div
                    key={page}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {formatPageName(page, language)}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent)' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      {t('admin.views')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* WEEKLY STATS */}
        {summary?.week?.pageViews && Object.keys(summary.week.pageViews).length > 0 && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📊</span> {t('admin.pagesThisWeek')}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {Object.entries(summary.week.pageViews)
                .sort(([, a], [, b]) => b - a)
                .map(([page, count]) => (
                  <div
                    key={page}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {formatPageName(page, language)}
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      {t('admin.views')}
                    </div>
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
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
      }}
    >
      <div style={{ fontSize: '32px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent)', marginBottom: '4px' }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {subtext}
          </div>
        )}
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
