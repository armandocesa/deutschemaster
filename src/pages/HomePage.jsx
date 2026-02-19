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

      {/* Compact top area: stats + welcome + alerts */}
      <div className="home-compact-top">
        <div className="home-mini-bar" onClick={() => onNavigate('profile')}>
          <span className="home-mini-item">🔥 {streak.currentStreak}</span>
          <span className="home-mini-sep">·</span>
          <span className="home-mini-item">{xp.totalXP} XP</span>
          <span className="home-mini-sep">·</span>
          <span className="home-mini-item">Lv.{xp.level}</span>
          <div className="home-mini-xp-bar">
            <div className="home-mini-xp-fill" style={{ width: `${Math.min(100, (xp.xpInCurrentLevel / xp.xpForNextLevel) * 100)}%` }} />
          </div>
          <span className="home-mini-goal">{dailyGoal.completed ? '✓' : `${Math.round(dailyGoal.percentage)}%`}</span>
        </div>

        <h1 className="home-greeting-sm">{t('home.welcome')} <span className="home-greeting-highlight">{t('home.language')}</span></h1>

        {!placementTestTaken && (
          <div className="home-mini-alert" onClick={() => onNavigate('placement-test')}>
            📍 {t('home.placement.title')}
            <span className="home-mini-alert-btn">{t('home.placement.button')}</span>
          </div>
        )}

        {reviewStats.dueToday > 0 && (
          <div className="home-mini-alert home-mini-alert-review" onClick={() => onNavigate('flashcards')}>
            📋 {reviewStats.dueToday} {t('home.review.subtitle')}
          </div>
        )}

        {(quizStats.totalAnswered > 0 || savedCount > 0) && (
          <div className="home-mini-stats">
            {quizStats.totalAnswered > 0 && (
              <span className="home-mini-stat" onClick={() => onNavigate('quiz')}>
                {quizStats.totalAnswered} {t('home.progress.questionsAsked')} · {Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100)}%
              </span>
            )}
            {savedCount > 0 && (
              <span className="home-mini-stat" onClick={() => onNavigate('favorites')}>
                {savedCount} {t('home.progress.savedWords')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* HERO: 4 main cards - Grammatica, Vocabolario, Lettura, Storie */}
      <section className="home-hero-section">
        <div className="home-hero-grid">
          <div className="home-hero-card" onClick={() => onNavigate('grammar')} style={{ '--hero-color': '#8b5cf6' }}>
            <div className="home-hero-icon"><Icons.Grammar /></div>
            <div className="home-hero-text">
              <span className="home-hero-title">{t('home.grammarTitle')}</span>
              <span className="home-hero-desc">{stats.grammarTopics} {t('home.stats.grammar')}</span>
            </div>
          </div>
          <div className="home-hero-card" onClick={() => onNavigate('vocabulary')} style={{ '--hero-color': '#10b981' }}>
            <div className="home-hero-icon"><Icons.Book /></div>
            <div className="home-hero-text">
              <span className="home-hero-title">{t('home.vocabularyTitle')}</span>
              <span className="home-hero-desc">{stats.words.toLocaleString()} {t('home.stats.words')}</span>
            </div>
          </div>
          <div className="home-hero-card" onClick={() => onNavigate('reading')} style={{ '--hero-color': '#06b6d4' }}>
            <div className="home-hero-icon"><Icons.Reading /></div>
            <div className="home-hero-text">
              <span className="home-hero-title">{t('home.readingTitle')}</span>
              <span className="home-hero-desc">A1–C2</span>
            </div>
          </div>
          <div className="home-hero-card" onClick={() => onNavigate('stories')} style={{ '--hero-color': '#a78bfa' }}>
            <div className="home-hero-icon"><span style={{ fontSize: '22px' }}>📖</span></div>
            <div className="home-hero-text">
              <span className="home-hero-title">{t('home.storiesTitle')}</span>
              <span className="home-hero-desc">A1–C2</span>
            </div>
          </div>
        </div>
      </section>

      {/* Other study */}
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
          <div className="home-nav-card" onClick={() => onNavigate('essential-words')}>
            <div className="home-nav-icon" style={{ background: '#14b8a6' }}><Icons.Book /></div>
            <span className="home-nav-label">{t('home.essentialWordsTitle')}</span>
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
