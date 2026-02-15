import React, { useState, useMemo, useEffect } from 'react';
import Icons from '../components/Icons';
import Onboarding from '../components/Onboarding';
import { useLanguage } from '../contexts/LanguageContext';
import { LEVEL_COLORS } from '../utils/constants';
import { useData } from '../DataContext';
import { getQuizStats, getDifficultWords } from '../utils/storage';
import { getStreak, getXP, checkDailyGoal, recordActivity, getReviewStats, checkBadges } from '../utils/gamification';
import { saveAndSync } from '../utils/cloudSync';

function QuickActionCard({ icon, title, color, onClick, noLevel, badge }) {
  const [selectedLvl, setSelectedLvl] = useState(() => {
    try { const v = localStorage.getItem('dm_last_level'); return v ? JSON.parse(v) : 'A1'; } catch { return 'A1'; }
  });
  const handleLevelClick = (e, lvl) => {
    e.stopPropagation();
    setSelectedLvl(lvl);
    try { saveAndSync('dm_last_level', JSON.stringify(lvl)); } catch {}
    onClick(lvl);
  };
  return (
    <div className="quick-action-card" onClick={() => noLevel ? onClick() : onClick(selectedLvl)}>
      <div className="quick-action-header">
        <div className="quick-action-icon" style={{backgroundColor: color}}>{icon}</div>
        <span className="quick-action-title">{title}</span>
        {badge && <span style={{background:'var(--accent)',color:'white',borderRadius:'10px',padding:'2px 8px',fontSize:'11px',fontWeight:700,marginLeft:'auto'}}>{badge}</span>}
      </div>
      {!noLevel && (
        <div className="quick-action-levels">
          {Object.entries(LEVEL_COLORS).map(([lvl, c]) => (
            <button key={lvl} className={`quick-action-level ${lvl === selectedLvl ? 'selected' : ''}`}
              style={lvl === selectedLvl ? {backgroundColor: c.bg, borderColor: c.bg} : {}}
              onClick={(e) => handleLevelClick(e, lvl)}>{lvl}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage({ onNavigate }) {
  const { t } = useLanguage();
  const { VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA } = useData();
  const [placementTestTaken, setPlacementTestTaken] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('dm_onboarding_done'); } catch { return false; }
  });

  // Record activity on homepage visit & check badges
  useEffect(() => { recordActivity(); checkBadges(); }, []);

  // Check if placement test has been taken
  useEffect(() => {
    try {
      const testData = localStorage.getItem('dm_placement_level');
      setPlacementTestTaken(!!testData);
    } catch {
      setPlacementTestTaken(false);
    }
  }, []);

  const stats = useMemo(() => ({
    words: VOCABULARY_DATA.statistics?.totalWords || 14315,
    grammarTopics: GRAMMAR_DATA.statistics?.totalTopics || 177,
    verbs: VERBS_DATA.statistics?.totalVerbs || 414,
    exercises: GRAMMAR_DATA.statistics?.totalExercises || 261,
  }), [VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA]);

  const userProgress = useMemo(() => ({
    quizStats: getQuizStats(),
    savedCount: getDifficultWords().length,
    streak: getStreak(),
    xp: getXP(),
    dailyGoal: checkDailyGoal(),
    reviewStats: getReviewStats(),
  }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const { quizStats, savedCount, streak, xp, dailyGoal, reviewStats } = userProgress;

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
      {/* Streak + XP + Daily Goal Bar */}
      <section className="home-gamification-bar">
        <div className="home-gamification-card home-streak-card" onClick={() => onNavigate('profile')}>
          <span style={{fontSize:'28px'}}>🔥</span>
          <div>
            <div style={{fontSize:'22px',fontWeight:800,lineHeight:1}}>{streak.currentStreak}</div>
            <div style={{fontSize:'11px',color:'var(--text-secondary)'}}>{t('days')}</div>
          </div>
        </div>
        <div className="home-gamification-card home-xp-card" onClick={() => onNavigate('profile')}>
          <div className="home-xp-value">
            <span className="home-xp-number">{xp.totalXP}</span>
            <span className="home-xp-label">XP</span>
          </div>
          <div className="home-xp-level">Lv. {xp.level} {getLevelName(xp.level)}</div>
          <div className="home-xp-bar-container">
            <div className="home-xp-bar-fill" style={{width:`${Math.min(100,(xp.xpInCurrentLevel/xp.xpForNextLevel)*100)}%`}}/>
          </div>
        </div>
        <div className="home-gamification-card home-goal-card" onClick={() => onNavigate('profile')}>
          <div className="home-goal-circle">
            <svg width="44" height="44" viewBox="0 0 44 44" className="home-goal-svg">
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" strokeWidth="4"/>
              <circle cx="22" cy="22" r="18" fill="none" stroke={dailyGoal.completed ? 'var(--success)' : 'var(--accent)'} strokeWidth="4"
                strokeDasharray={`${2*Math.PI*18}`} strokeDashoffset={`${2*Math.PI*18*(1-dailyGoal.percentage/100)}`} strokeLinecap="round"/>
            </svg>
            <div className="home-goal-text">
              {dailyGoal.completed ? '✓' : `${Math.round(dailyGoal.percentage)}%`}
            </div>
          </div>
          <div>
            <div className="home-goal-progress">{dailyGoal.progress}/{dailyGoal.target} XP</div>
            <div className="home-goal-label">{t('profile.dailyGoal.title')}</div>
          </div>
        </div>
      </section>

      <section className="home-compact">
        <h1 className="home-greeting">{t('home.welcome')} <span className="home-greeting-highlight">{t('home.language')}</span></h1>
        <p className="home-subtitle">{t('home.subtitle')}</p>
        <div className="home-stats-bar">
          <div className="home-stat"><span className="home-stat-num">{stats.words.toLocaleString()}</span><span className="home-stat-label">{t('home.stats.words')}</span></div>
          <div className="home-stat"><span className="home-stat-num">{stats.grammarTopics}</span><span className="home-stat-label">{t('home.stats.grammar')}</span></div>
          <div className="home-stat"><span className="home-stat-num">{stats.verbs}</span><span className="home-stat-label">{t('home.stats.verbs')}</span></div>
          <div className="home-stat"><span className="home-stat-num">{stats.exercises}</span><span className="home-stat-label">{t('home.stats.exercises')}</span></div>
        </div>
      </section>

      {!placementTestTaken && (
        <section className="home-placement-section">
          <div className="home-placement-icon">📍</div>
          <div className="home-placement-content">
            <div className="home-placement-title">{t('home.placement.title')}</div>
            <div className="home-placement-subtitle">{t('home.placement.subtitle')}</div>
          </div>
          <button onClick={() => onNavigate('placement-test')} className="home-placement-btn">{t('home.placement.button')}</button>
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

      {quizStats.totalAnswered > 0 && (
        <section className="home-continue-section">
          <h2 className="home-continue-title">{t('home.progress.title')}</h2>
          <div className="home-continue-cards">
            <div className="home-continue-card" onClick={() => onNavigate('quiz')}>
              <div className="home-card-badge" style={{backgroundColor: 'var(--accent)'}}>{quizStats.totalAnswered}</div>
              <div className="home-card-text"><h4>{t('home.progress.questionsAsked')}</h4><p>{quizStats.totalAnswered > 0 ? Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100) : 0}% {t('home.progress.correct')}</p></div>
            </div>
            {savedCount > 0 && (
              <div className="home-continue-card" onClick={() => onNavigate('favorites')}>
                <div className="home-card-badge" style={{backgroundColor: 'var(--warning)'}}>{savedCount}</div>
                <div className="home-card-text"><h4>{t('home.progress.savedWords')}</h4><p>{t('home.progress.toReview')}</p></div>
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="home-continue-title">{t('home.study')}</h2>
        <div className="home-quick-actions-grid">
          {!placementTestTaken && (
            <QuickActionCard icon={<span style={{fontSize:'20px'}}>📍</span>} title={t('home.testPositioning')} color="#6c5ce7" onClick={() => onNavigate('placement-test')} noLevel badge={t('home.new')} />
          )}
          <QuickActionCard icon={<Icons.Target />} title={t('home.pathsTitle')} color="#6c5ce7" onClick={() => onNavigate('paths')} noLevel />
          <QuickActionCard icon={<Icons.Lessons />} title={t('home.lessonsTitle')} color="#3b82f6" onClick={() => onNavigate('lessons')} noLevel />
          <QuickActionCard icon={<Icons.Grammar />} title={t('home.grammarTitle')} color="#8b5cf6" onClick={(lvl) => onNavigate('grammar', { level: lvl })} />
          <QuickActionCard icon={<Icons.Book />} title={t('home.vocabularyTitle')} color="#10b981" onClick={(lvl) => onNavigate('vocabulary', { level: lvl })} />
          <QuickActionCard icon={<Icons.Book />} title={t('home.essentialWordsTitle')} color="#14b8a6" onClick={(lvl) => onNavigate('essential-words', { level: lvl })} />
          <QuickActionCard icon={<Icons.Reading />} title={t('home.readingTitle')} color="#06b6d4" onClick={(lvl) => onNavigate('reading', { level: lvl })} />
          <QuickActionCard icon={<span style={{fontSize:'20px'}}>📖</span>} title={t('home.storiesTitle')} color="#a78bfa" onClick={(lvl) => onNavigate('stories', { level: lvl })} />
          <QuickActionCard icon={<Icons.Quiz />} title={t('home.quizTitle')} color="#ef4444" onClick={(lvl) => onNavigate('quiz', { level: lvl })} />
          <QuickActionCard icon={<Icons.Verb />} title={t('home.verbsTitle')} color="#f59e0b" onClick={() => onNavigate('verbs')} noLevel />
          <QuickActionCard icon={<Icons.Verb />} title={t('home.werdenTitle')} color="#e17055" onClick={() => onNavigate('werden')} noLevel />
        </div>
      </section>

      <section>
        <h2 className="home-continue-title">{t('home.practice')}</h2>
        <div className="home-quick-actions-grid">
          <QuickActionCard icon={<Icons.Flashcard />} title={t('home.flashcardsTitle')} color="#8b5cf6" onClick={() => onNavigate('flashcards')} noLevel badge={reviewStats.dueToday > 0 ? `${reviewStats.dueToday} ${t('home.toDo')}` : null} />
          <QuickActionCard icon={<Icons.Writing />} title={t('home.writingTitle')} color="#10b981" onClick={() => onNavigate('writing')} noLevel />
          <QuickActionCard icon={<Icons.Listening />} title={t('home.listeningTitle')} color="#06b6d4" onClick={() => onNavigate('listening')} noLevel />
          <QuickActionCard icon={<Icons.Practice />} title={t('home.quickPractice')} color="#f59e0b" onClick={() => onNavigate('practice')} noLevel />
          <QuickActionCard icon={<Icons.Verb />} title={t('home.verbPrefixes')} color="#f97316" onClick={() => onNavigate('verb-prefixes')} noLevel />
          <QuickActionCard icon={<Icons.Star />} title={t('nav.saved')} color="#ec4899" onClick={() => onNavigate('favorites')} noLevel />
        </div>
      </section>
    </div>
  );
}
