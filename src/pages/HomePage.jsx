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

  const xpPct = Math.min(100, (xp.xpInCurrentLevel / xp.xpForNextLevel) * 100);
  const goalPct = Math.min(100, dailyGoal.percentage);

  return (
    <div className="hp">
      {showOnboarding && <Onboarding onNavigate={onNavigate} onComplete={() => setShowOnboarding(false)} />}

      {/* ── Status strip ── */}
      <div className="hp-status" onClick={() => onNavigate('profile')}>
        <div className="hp-status-pill hp-streak">
          <span className="hp-streak-fire">🔥</span>
          <span className="hp-streak-num">{streak.currentStreak}</span>
        </div>
        <div className="hp-status-pill hp-xp">
          <span className="hp-xp-num">{xp.totalXP}</span>
          <span className="hp-xp-lbl">XP</span>
          <div className="hp-xp-track"><div className="hp-xp-fill" style={{ width: `${xpPct}%` }} /></div>
          <span className="hp-xp-lvl">Lv.{xp.level}</span>
        </div>
        <div className="hp-status-pill hp-goal">
          <svg className="hp-goal-ring" width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="11" fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <circle cx="14" cy="14" r="11" fill="none"
              stroke={dailyGoal.completed ? 'var(--success)' : 'var(--accent)'}
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 11}`}
              strokeDashoffset={`${2 * Math.PI * 11 * (1 - goalPct / 100)}`}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
          </svg>
          <span className="hp-goal-text">{dailyGoal.completed ? '✓' : `${Math.round(goalPct)}%`}</span>
        </div>
      </div>

      {/* ── Welcome ── */}
      <div className="hp-welcome">
        <h1 className="hp-title">{t('home.welcome')} <span className="hp-accent">{t('home.language')}</span></h1>
      </div>

      {/* ── Alerts (compact) ── */}
      {(!placementTestTaken || reviewStats.dueToday > 0) && (
        <div className="hp-alerts">
          {!placementTestTaken && (
            <button className="hp-alert hp-alert--placement" onClick={() => onNavigate('placement-test')}>
              <span>📍</span> {t('home.placement.title')}
              <span className="hp-alert-action">{t('home.placement.button')}</span>
            </button>
          )}
          {reviewStats.dueToday > 0 && (
            <button className="hp-alert hp-alert--review" onClick={() => onNavigate('flashcards')}>
              <span>📋</span> {reviewStats.dueToday} {t('home.review.subtitle')}
              <Icons.ChevronRight />
            </button>
          )}
        </div>
      )}

      {/* ── HERO: 4 main destinations ── */}
      <div className="hp-hero">
        <div className="hp-hero-card hp-hero--grammar" onClick={() => onNavigate('grammar')}>
          <div className="hp-hero-badge"><Icons.Grammar /></div>
          <div className="hp-hero-body">
            <div className="hp-hero-name">{t('home.grammarTitle')}</div>
            <div className="hp-hero-meta">{stats.grammarTopics} {t('home.stats.grammar')} · {stats.exercises} {t('home.stats.exercises')}</div>
          </div>
          <Icons.ChevronRight />
        </div>
        <div className="hp-hero-card hp-hero--vocab" onClick={() => onNavigate('vocabulary')}>
          <div className="hp-hero-badge"><Icons.Book /></div>
          <div className="hp-hero-body">
            <div className="hp-hero-name">{t('home.vocabularyTitle')}</div>
            <div className="hp-hero-meta">{stats.words.toLocaleString()} {t('home.stats.words')}</div>
          </div>
          <Icons.ChevronRight />
        </div>
        <div className="hp-hero-card hp-hero--reading" onClick={() => onNavigate('reading')}>
          <div className="hp-hero-badge"><Icons.Reading /></div>
          <div className="hp-hero-body">
            <div className="hp-hero-name">{t('home.readingTitle')}</div>
            <div className="hp-hero-meta">A1 – C2</div>
          </div>
          <Icons.ChevronRight />
        </div>
        <div className="hp-hero-card hp-hero--stories" onClick={() => onNavigate('stories')}>
          <div className="hp-hero-badge"><span>📖</span></div>
          <div className="hp-hero-body">
            <div className="hp-hero-name">{t('home.storiesTitle')}</div>
            <div className="hp-hero-meta">A1 – C2</div>
          </div>
          <Icons.ChevronRight />
        </div>
      </div>

      {/* ── Progress snapshot (conditional) ── */}
      {(quizStats.totalAnswered > 0 || savedCount > 0) && (
        <div className="hp-progress">
          {quizStats.totalAnswered > 0 && (
            <div className="hp-progress-item" onClick={() => onNavigate('quiz')}>
              <span className="hp-progress-val">{Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100)}%</span>
              <span className="hp-progress-lbl">{quizStats.totalAnswered} quiz</span>
            </div>
          )}
          {savedCount > 0 && (
            <div className="hp-progress-item" onClick={() => onNavigate('favorites')}>
              <span className="hp-progress-val">{savedCount}</span>
              <span className="hp-progress-lbl">{t('home.progress.savedWords')}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Explore ── */}
      <section className="hp-section">
        <h2 className="hp-section-title">{t('home.study')}</h2>
        <div className="hp-row">
          {[
            { id: 'paths', icon: <Icons.Target />, bg: '#6c5ce7', label: t('home.pathsTitle') },
            { id: 'lessons', icon: <Icons.Lessons />, bg: '#3b82f6', label: t('home.lessonsTitle') },
            { id: 'essential-words', icon: <Icons.Book />, bg: '#14b8a6', label: t('home.essentialWordsTitle') },
            { id: 'quiz', icon: <Icons.Quiz />, bg: '#ef4444', label: t('home.quizTitle') },
          ].map(item => (
            <button key={item.id} className="hp-tile" onClick={() => onNavigate(item.id)}>
              <span className="hp-tile-icon" style={{ background: item.bg }}>{item.icon}</span>
              <span className="hp-tile-label">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Verbs ── */}
      <section className="hp-section">
        <h2 className="hp-section-title">{t('home.verbsTitle')}</h2>
        <div className="hp-row">
          {[
            { id: 'verbs', icon: <Icons.Verb />, bg: '#f59e0b', label: t('home.verbsTitle') },
            { id: 'werden', icon: <Icons.Verb />, bg: '#e17055', label: t('home.werdenTitle') },
            { id: 'verb-prefixes', icon: <Icons.Verb />, bg: '#f97316', label: t('home.verbPrefixes') },
            { id: 'verbs-prepositions', icon: <Icons.Verb />, bg: '#e11d48', label: t('home.verbsPrepositions') },
          ].map(item => (
            <button key={item.id} className="hp-tile" onClick={() => onNavigate(item.id)}>
              <span className="hp-tile-icon" style={{ background: item.bg }}>{item.icon}</span>
              <span className="hp-tile-label">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Practice ── */}
      <section className="hp-section">
        <h2 className="hp-section-title">{t('home.practice')}</h2>
        <div className="hp-row">
          {[
            { id: 'flashcards', icon: <Icons.Flashcard />, bg: '#8b5cf6', label: t('home.flashcardsTitle'), badge: reviewStats.dueToday || null },
            { id: 'writing', icon: <Icons.Writing />, bg: '#10b981', label: t('home.writingTitle') },
            { id: 'listening', icon: <Icons.Listening />, bg: '#06b6d4', label: t('home.listeningTitle') },
            { id: 'practice', icon: <Icons.Practice />, bg: '#f59e0b', label: t('home.quickPractice') },
            { id: 'favorites', icon: <Icons.Star />, bg: '#ec4899', label: t('nav.saved'), badge: savedCount || null },
          ].map(item => (
            <button key={item.id} className="hp-tile" onClick={() => onNavigate(item.id)}>
              <span className="hp-tile-icon" style={{ background: item.bg }}>{item.icon}</span>
              <span className="hp-tile-label">{item.label}</span>
              {item.badge && <span className="hp-tile-badge">{item.badge}</span>}
            </button>
          ))}
        </div>
      </section>

      {/* ── Footer stats ── */}
      <footer className="hp-footer">
        <span>{stats.words.toLocaleString()} {t('home.stats.words')}</span>
        <span>{stats.grammarTopics} {t('home.stats.grammar')}</span>
        <span>{stats.verbs} {t('home.stats.verbs')}</span>
      </footer>
    </div>
  );
}
