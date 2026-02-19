import React, { useState, useMemo, useEffect } from 'react';
import Icons from '../components/Icons';
import Onboarding from '../components/Onboarding';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../DataContext';
import { getQuizStats, getDifficultWords } from '../utils/storage';
import { getStreak, getXP, checkDailyGoal, recordActivity, getReviewStats, checkBadges } from '../utils/gamification';
import { saveAndSync } from '../utils/cloudSync';
import { LEVEL_COLORS } from '../utils/constants';

/* ── Level Selector (inline, shared) ────────────────────────── */
function LevelPills({ selected, onChange }) {
  return (
    <div className="hp-level-pills">
      {Object.entries(LEVEL_COLORS).map(([lvl, c]) => (
        <button
          key={lvl}
          className={`hp-level-pill${lvl === selected ? ' active' : ''}`}
          style={lvl === selected ? { backgroundColor: c.bg, borderColor: c.bg } : {}}
          onClick={(e) => { e.stopPropagation(); onChange(lvl); }}
        >
          {lvl}
        </button>
      ))}
    </div>
  );
}

/* ── Big Path Card ──────────────────────────────────────────── */
function PathCard({ icon, emoji, title, desc, color, onClick }) {
  return (
    <div className="hp-path-card" onClick={onClick} tabIndex="0" role="button"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
      <div className="hp-path-icon" style={{ backgroundColor: color }}>
        {emoji ? <span style={{ fontSize: '24px' }}>{emoji}</span> : icon}
      </div>
      <div className="hp-path-text">
        <div className="hp-path-title">{title}</div>
        <div className="hp-path-desc">{desc}</div>
      </div>
      <Icons.ChevronRight />
    </div>
  );
}

/* ── Small Grid Card ────────────────────────────────────────── */
function GridCard({ icon, emoji, title, color, onClick, badge }) {
  return (
    <div className="hp-grid-card" onClick={onClick} tabIndex="0" role="button"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
      <div className="hp-grid-icon" style={{ backgroundColor: color }}>
        {emoji ? <span style={{ fontSize: '18px' }}>{emoji}</span> : icon}
      </div>
      <span className="hp-grid-title">{title}</span>
      {badge && <span className="hp-grid-badge">{badge}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function HomePage({ onNavigate }) {
  const { t } = useLanguage();
  const { VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA } = useData();

  const [selectedLevel, setSelectedLevel] = useState(() => {
    try { const v = localStorage.getItem('dm_last_level'); return v ? JSON.parse(v) : 'A1'; } catch { return 'A1'; }
  });
  const [placementTestTaken, setPlacementTestTaken] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('dm_onboarding_done'); } catch { return false; }
  });

  useEffect(() => { recordActivity(); checkBadges(); }, []);

  useEffect(() => {
    try { setPlacementTestTaken(!!localStorage.getItem('dm_placement_level')); } catch { setPlacementTestTaken(false); }
  }, []);

  const handleLevelChange = (lvl) => {
    setSelectedLevel(lvl);
    try { saveAndSync('dm_last_level', JSON.stringify(lvl)); } catch {}
  };

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

  const xpPercent = Math.min(100, (xp.xpInCurrentLevel / xp.xpForNextLevel) * 100);

  return (
    <div className="home-page">
      {showOnboarding && <Onboarding onNavigate={onNavigate} onComplete={() => setShowOnboarding(false)} />}

      {/* ── Hero: titolo + stats compatti ── */}
      <section className="hp-hero">
        <h1 className="hp-title">{t('home.welcome')} <span className="home-greeting-highlight">{t('home.language')}</span></h1>
        <p className="hp-subtitle">{t('home.subtitle')}</p>
      </section>

      {/* ── Gamification bar compatta ── */}
      <section className="hp-gamification">
        <div className="hp-gam-item" onClick={() => onNavigate('profile')} title="Streak">
          <span className="hp-gam-emoji">🔥</span>
          <strong>{streak.currentStreak}</strong>
          <span className="hp-gam-label">{t('days')}</span>
        </div>
        <div className="hp-gam-divider" />
        <div className="hp-gam-item" onClick={() => onNavigate('profile')} title="XP">
          <strong className="hp-gam-xp">{xp.totalXP} XP</strong>
          <span className="hp-gam-label">Lv.{xp.level} {getLevelName(xp.level)}</span>
          <div className="hp-gam-bar"><div className="hp-gam-bar-fill" style={{ width: `${xpPercent}%` }} /></div>
        </div>
        <div className="hp-gam-divider" />
        <div className="hp-gam-item" onClick={() => onNavigate('profile')} title={t('profile.dailyGoal.title')}>
          <div className="hp-gam-goal">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none"
                stroke={dailyGoal.completed ? 'var(--success)' : 'var(--accent)'}
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 15}`}
                strokeDashoffset={`${2 * Math.PI * 15 * (1 - dailyGoal.percentage / 100)}`}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <span className="hp-gam-goal-txt">{dailyGoal.completed ? '✓' : `${Math.round(dailyGoal.percentage)}%`}</span>
          </div>
          <span className="hp-gam-label">{dailyGoal.progress}/{dailyGoal.target} XP</span>
        </div>
      </section>

      {/* ── Level Selector globale ── */}
      <section className="hp-level-section">
        <span className="hp-level-label">{t('home.yourLevel') || 'Il tuo livello'}:</span>
        <LevelPills selected={selectedLevel} onChange={handleLevelChange} />
      </section>

      {/* ── Placement test CTA (se non fatto) ── */}
      {!placementTestTaken && (
        <section className="home-placement-section" onClick={() => onNavigate('placement-test')} style={{ cursor: 'pointer' }}>
          <div className="home-placement-icon">📍</div>
          <div className="home-placement-content">
            <div className="home-placement-title">{t('home.placement.title')}</div>
            <div className="home-placement-subtitle">{t('home.placement.subtitle')}</div>
          </div>
          <button className="home-placement-btn">{t('home.placement.button')}</button>
        </section>
      )}

      {/* ── Review reminder ── */}
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

      {/* ══════════════════════════════════════════════════════
         SEZIONE 1: IMPARA — percorsi principali
         ══════════════════════════════════════════════════════ */}
      <section className="hp-section">
        <h2 className="hp-section-title">
          <span className="hp-section-emoji">📚</span>
          {t('home.learnSection') || 'Impara'}
        </h2>
        <p className="hp-section-desc">{t('home.learnDesc') || 'Segui il percorso e impara passo dopo passo'}</p>

        <div className="hp-paths">
          <PathCard
            icon={<Icons.Target />} title={t('home.pathsTitle')} color="#6c5ce7"
            desc={t('home.pathsDesc') || 'Percorso guidato dal principiante all\'esperto'}
            onClick={() => onNavigate('paths')}
          />
          <PathCard
            icon={<Icons.Lessons />} title={t('home.lessonsTitle')} color="#3b82f6"
            desc={t('home.lessonsDesc') || 'Lezioni strutturate con spiegazioni ed esercizi'}
            onClick={() => onNavigate('lessons')}
          />
          <PathCard
            icon={<Icons.Grammar />} title={t('home.grammarTitle')} color="#8b5cf6"
            desc={`${stats.grammarTopics} ${t('home.topicsAvailable') || 'argomenti'} · ${selectedLevel}`}
            onClick={() => onNavigate('grammar', { level: selectedLevel })}
          />
          <PathCard
            icon={<Icons.Book />} title={t('home.vocabularyTitle')} color="#10b981"
            desc={`${stats.words.toLocaleString()} ${t('home.stats.words').toLowerCase()} · ${selectedLevel}`}
            onClick={() => onNavigate('vocabulary', { level: selectedLevel })}
          />
          <PathCard
            icon={<Icons.Book />} title={t('home.essentialWordsTitle')} color="#14b8a6"
            desc={t('home.essentialDesc') || 'Le parole più importanti per ogni livello'}
            onClick={() => onNavigate('essential-words', { level: selectedLevel })}
          />
          <PathCard
            icon={<Icons.Reading />} title={t('home.readingTitle')} color="#06b6d4"
            desc={t('home.readingDesc') || 'Testi adatti al tuo livello per migliorare la comprensione'}
            onClick={() => onNavigate('reading', { level: selectedLevel })}
          />
          <PathCard
            emoji="📖" title={t('home.storiesTitle')} color="#a78bfa"
            desc={t('home.storiesDesc') || 'Storie interattive per imparare in contesto'}
            onClick={() => onNavigate('stories', { level: selectedLevel })}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         SEZIONE 2: VERBI
         ══════════════════════════════════════════════════════ */}
      <section className="hp-section">
        <h2 className="hp-section-title">
          <span className="hp-section-emoji">🔤</span>
          {t('home.verbsSection') || 'Verbi'}
        </h2>
        <p className="hp-section-desc">{t('home.verbsSectionDesc') || `${stats.verbs} verbi con coniugazioni, prefissi e frasi`}</p>

        <div className="hp-grid">
          <GridCard icon={<Icons.Verb />} title={t('home.verbsTitle')} color="#f59e0b"
            onClick={() => onNavigate('verbs')} />
          <GridCard icon={<Icons.Verb />} title={t('home.werdenTitle')} color="#e17055"
            onClick={() => onNavigate('werden')} />
          <GridCard icon={<Icons.Verb />} title={t('home.verbPrefixes')} color="#f97316"
            onClick={() => onNavigate('verb-prefixes')} />
          <GridCard emoji="🔗" title={t('home.verbsPrepositions') || 'Verbi + Preposizioni'} color="#d63031"
            onClick={() => onNavigate('verbs-prepositions')} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
         SEZIONE 3: PRATICA
         ══════════════════════════════════════════════════════ */}
      <section className="hp-section">
        <h2 className="hp-section-title">
          <span className="hp-section-emoji">💪</span>
          {t('home.practice')}
        </h2>
        <p className="hp-section-desc">{t('home.practiceDesc') || 'Metti alla prova quello che hai imparato'}</p>

        <div className="hp-grid">
          <GridCard icon={<Icons.Quiz />} title={t('home.quizTitle')} color="#ef4444"
            onClick={() => onNavigate('quiz', { level: selectedLevel })}
            badge={quizStats.totalAnswered > 0 ? `${Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100)}%` : null} />
          <GridCard icon={<Icons.Flashcard />} title={t('home.flashcardsTitle')} color="#8b5cf6"
            onClick={() => onNavigate('flashcards')}
            badge={reviewStats.dueToday > 0 ? `${reviewStats.dueToday} ${t('home.toDo')}` : null} />
          <GridCard icon={<Icons.Writing />} title={t('home.writingTitle')} color="#10b981"
            onClick={() => onNavigate('writing')} />
          <GridCard icon={<Icons.Listening />} title={t('home.listeningTitle')} color="#06b6d4"
            onClick={() => onNavigate('listening')} />
          <GridCard icon={<Icons.Practice />} title={t('home.quickPractice')} color="#f59e0b"
            onClick={() => onNavigate('practice')} />
          <GridCard icon={<Icons.Star />} title={t('nav.saved')} color="#ec4899"
            onClick={() => onNavigate('favorites')}
            badge={savedCount > 0 ? savedCount : null} />
        </div>
      </section>

      {/* ── Stats footer ── */}
      <section className="hp-stats-footer">
        <div className="hp-stat-item"><strong>{stats.words.toLocaleString()}</strong> {t('home.stats.words')}</div>
        <div className="hp-stat-item"><strong>{stats.grammarTopics}</strong> {t('home.stats.grammar')}</div>
        <div className="hp-stat-item"><strong>{stats.verbs}</strong> {t('home.stats.verbs')}</div>
        <div className="hp-stat-item"><strong>{stats.exercises}</strong> {t('home.stats.exercises')}</div>
      </section>
    </div>
  );
}
