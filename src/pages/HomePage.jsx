import React, { useState, useMemo, useEffect } from 'react';
import Icons from '../components/Icons';
import Onboarding from '../components/Onboarding';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../DataContext';
import { getQuizStats, getDifficultWords } from '../utils/storage';
import { getStreak, getXP, checkDailyGoal, recordActivity, getReviewStats, checkBadges } from '../utils/gamification';

export default function HomePage({ onNavigate }) {
  const { t } = useLanguage();
  const { VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA } = useData();
  const [placementTestTaken, setPlacementTestTaken] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('dm_onboarding_done'); } catch { return false; }
  });

  useEffect(() => { recordActivity(); checkBadges(); }, []);

  useEffect(() => {
    try {
      setPlacementTestTaken(!!localStorage.getItem('dm_placement_level'));
    } catch { setPlacementTestTaken(false); }
  }, []);

  const stats = useMemo(() => ({
    words: VOCABULARY_DATA.statistics?.totalWords || 14315,
    grammarTopics: GRAMMAR_DATA.statistics?.totalTopics || 177,
    verbs: VERBS_DATA.statistics?.totalVerbs || 414,
    exercises: GRAMMAR_DATA.statistics?.totalExercises || 261,
  }), [VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA]);

  const quizStats = getQuizStats();
  const savedCount = getDifficultWords().length;
  const streak = getStreak();
  const xp = getXP();
  const dailyGoal = checkDailyGoal();
  const reviewStats = getReviewStats();

  const getLevelName = (lvl) => {
    if (lvl <= 5) return t('home.levels.beginner');
    if (lvl <= 10) return t('home.levels.student');
    if (lvl <= 20) return t('home.levels.intermediate');
    if (lvl <= 35) return t('home.levels.advanced');
    if (lvl <= 50) return t('home.levels.expert');
    return t('home.levels.master');
  };

  return (
    <div className="home-page">
      {showOnboarding && <Onboarding onNavigate={onNavigate} onComplete={() => setShowOnboarding(false)} />}

      {/* Top bar: Streak + XP + Daily Goal */}
      <section className="home-topbar">
        <div className="home-topbar-item" onClick={() => onNavigate('profile')}>
          <span className="home-topbar-emoji">🔥</span>
          <span className="home-topbar-value">{streak.currentStreak}</span>
          <span className="home-topbar-label">{t('days')}</span>
        </div>
        <div className="home-topbar-item home-topbar-xp" onClick={() => onNavigate('profile')}>
          <span className="home-topbar-value">{xp.totalXP}</span>
          <span className="home-topbar-label">XP · Lv.{xp.level} {getLevelName(xp.level)}</span>
          <div className="home-topbar-xp-bar">
            <div className="home-topbar-xp-fill" style={{ width: `${Math.min(100, (xp.xpInCurrentLevel / xp.xpForNextLevel) * 100)}%` }} />
          </div>
        </div>
        <div className="home-topbar-item" onClick={() => onNavigate('profile')}>
          <div className="home-topbar-goal-ring">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke={dailyGoal.completed ? 'var(--success)' : 'var(--accent)'} strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 15}`} strokeDashoffset={`${2 * Math.PI * 15 * (1 - dailyGoal.percentage / 100)}`}
                strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <span className="home-topbar-goal-text">{dailyGoal.completed ? '✓' : `${Math.round(dailyGoal.percentage)}%`}</span>
          </div>
          <span className="home-topbar-label">{dailyGoal.progress}/{dailyGoal.target} XP</span>
        </div>
      </section>

      {/* Welcome */}
      <section className="home-welcome">
        <h1 className="home-greeting">{t('home.welcome')} <span className="home-greeting-highlight">{t('home.language')}</span></h1>
        <p className="home-subtitle">{t('home.subtitle')}</p>
      </section>

      {/* Placement test CTA */}
      {!placementTestTaken && (
        <section className="home-placement-section" onClick={() => onNavigate('placement-test')}>
          <div className="home-placement-icon">📍</div>
          <div className="home-placement-content">
            <div className="home-placement-title">{t('home.placement.title')}</div>
            <div className="home-placement-subtitle">{t('home.placement.subtitle')}</div>
          </div>
          <button className="home-placement-btn">{t('home.placement.button')}</button>
        </section>
      )}

      {/* Review reminder */}
      {reviewStats.dueToday > 0 && (
        <section className="home-review-reminder" onClick={() => onNavigate('flashcards')}>
          <span className="home-review-icon">📋</span>
          <div className="home-review-content">
            <div className="home-review-title">{t('home.review.title')}</div>
            <div className="home-review-subtitle">{reviewStats.dueToday} {t('home.review.subtitle')}</div>
          </div>
          <Icons.ChevronRight />
        </section>
      )}

      {/* Progress cards */}
      {(quizStats.totalAnswered > 0 || savedCount > 0) && (
        <section className="home-progress-row">
          {quizStats.totalAnswered > 0 && (
            <div className="home-progress-chip" onClick={() => onNavigate('quiz')}>
              <span className="home-progress-chip-num">{quizStats.totalAnswered}</span>
              <span className="home-progress-chip-label">{t('home.progress.questionsAsked')}</span>
              <span className="home-progress-chip-sub">{Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100)}% {t('home.progress.correct')}</span>
            </div>
          )}
          {savedCount > 0 && (
            <div className="home-progress-chip" onClick={() => onNavigate('favorites')}>
              <span className="home-progress-chip-num">{savedCount}</span>
              <span className="home-progress-chip-label">{t('home.progress.savedWords')}</span>
              <span className="home-progress-chip-sub">{t('home.progress.toReview')}</span>
            </div>
          )}
        </section>
      )}

      {/* Main navigation - big simple cards */}
      <section>
        <h2 className="home-section-title">{t('home.study')}</h2>
        <div className="home-nav-grid">
          <div className="home-nav-card" onClick={() => onNavigate('paths')}>
            <div className="home-nav-icon" style={{ background: '#6c5ce7' }}><Icons.Target /></div>
            <span className="home-nav-label">{t('home.pathsTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('lessons')}>
            <div className="home-nav-icon" style={{ background: '#3b82f6' }}><Icons.Lessons /></div>
            <span className="home-nav-label">{t('home.lessonsTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('grammar')}>
            <div className="home-nav-icon" style={{ background: '#8b5cf6' }}><Icons.Grammar /></div>
            <span className="home-nav-label">{t('home.grammarTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('vocabulary')}>
            <div className="home-nav-icon" style={{ background: '#10b981' }}><Icons.Book /></div>
            <span className="home-nav-label">{t('home.vocabularyTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('essential-words')}>
            <div className="home-nav-icon" style={{ background: '#14b8a6' }}><Icons.Book /></div>
            <span className="home-nav-label">{t('home.essentialWordsTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('reading')}>
            <div className="home-nav-icon" style={{ background: '#06b6d4' }}><Icons.Reading /></div>
            <span className="home-nav-label">{t('home.readingTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('stories')}>
            <div className="home-nav-icon" style={{ background: '#a78bfa' }}><span style={{ fontSize: '20px' }}>📖</span></div>
            <span className="home-nav-label">{t('home.storiesTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('quiz')}>
            <div className="home-nav-icon" style={{ background: '#ef4444' }}><Icons.Quiz /></div>
            <span className="home-nav-label">{t('home.quizTitle')}</span>
          </div>
        </div>
      </section>

      {/* Verbs section */}
      <section>
        <h2 className="home-section-title">{t('home.verbsTitle')}</h2>
        <div className="home-nav-grid">
          <div className="home-nav-card" onClick={() => onNavigate('verbs')}>
            <div className="home-nav-icon" style={{ background: '#f59e0b' }}><Icons.Verb /></div>
            <span className="home-nav-label">{t('home.verbsTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('werden')}>
            <div className="home-nav-icon" style={{ background: '#e17055' }}><Icons.Verb /></div>
            <span className="home-nav-label">{t('home.werdenTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('verb-prefixes')}>
            <div className="home-nav-icon" style={{ background: '#f97316' }}><Icons.Verb /></div>
            <span className="home-nav-label">{t('home.verbPrefixes')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('verbs-prepositions')}>
            <div className="home-nav-icon" style={{ background: '#e11d48' }}><Icons.Verb /></div>
            <span className="home-nav-label">{t('home.verbsPrepositions')}</span>
          </div>
        </div>
      </section>

      {/* Practice section */}
      <section>
        <h2 className="home-section-title">{t('home.practice')}</h2>
        <div className="home-nav-grid">
          <div className="home-nav-card" onClick={() => onNavigate('flashcards')}>
            <div className="home-nav-icon" style={{ background: '#8b5cf6' }}><Icons.Flashcard /></div>
            <span className="home-nav-label">{t('home.flashcardsTitle')}</span>
            {reviewStats.dueToday > 0 && <span className="home-nav-badge">{reviewStats.dueToday}</span>}
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('writing')}>
            <div className="home-nav-icon" style={{ background: '#10b981' }}><Icons.Writing /></div>
            <span className="home-nav-label">{t('home.writingTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('listening')}>
            <div className="home-nav-icon" style={{ background: '#06b6d4' }}><Icons.Listening /></div>
            <span className="home-nav-label">{t('home.listeningTitle')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('practice')}>
            <div className="home-nav-icon" style={{ background: '#f59e0b' }}><Icons.Practice /></div>
            <span className="home-nav-label">{t('home.quickPractice')}</span>
          </div>
          <div className="home-nav-card" onClick={() => onNavigate('favorites')}>
            <div className="home-nav-icon" style={{ background: '#ec4899' }}><Icons.Star /></div>
            <span className="home-nav-label">{t('nav.saved')}</span>
            {savedCount > 0 && <span className="home-nav-badge">{savedCount}</span>}
          </div>
        </div>
      </section>

      {/* Stats footer */}
      <section className="home-stats-footer">
        <div className="home-stat-item"><span className="home-stat-num">{stats.words.toLocaleString()}</span> {t('home.stats.words')}</div>
        <div className="home-stat-item"><span className="home-stat-num">{stats.grammarTopics}</span> {t('home.stats.grammar')}</div>
        <div className="home-stat-item"><span className="home-stat-num">{stats.verbs}</span> {t('home.stats.verbs')}</div>
        <div className="home-stat-item"><span className="home-stat-num">{stats.exercises}</span> {t('home.stats.exercises')}</div>
      </section>
    </div>
  );
}
