import React, { useState, useMemo } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS } from '../utils/constants';
import { useData } from '../DataContext';
import { getQuizStats, getDifficultWords } from '../utils/storage';
import { getStreak, getXP, checkDailyGoal, recordActivity, getReviewStats, checkBadges } from '../utils/gamification';
import { saveAndSync } from '../utils/cloudSync';

function QuickActionCard({ icon, title, color, onClick, noLevel, badge }) {
  const [selectedLvl, setSelectedLvl] = useState(() => {
    try { return localStorage.getItem('dm_last_level') || 'A1'; } catch { return 'A1'; }
  });
  const handleLevelClick = (e, lvl) => {
    e.stopPropagation();
    setSelectedLvl(lvl);
    try { saveAndSync('dm_last_level', lvl); } catch {}
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
  const { VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA } = useData();

  // Record activity on homepage visit & check badges
  useMemo(() => { recordActivity(); checkBadges(); }, []);

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

  const levelNames = ['', 'Principiante', 'Principiante', 'Principiante', 'Principiante', 'Principiante',
    'Studente', 'Studente', 'Studente', 'Studente', 'Studente',
    'Intermedio', 'Intermedio', 'Intermedio', 'Intermedio', 'Intermedio',
    'Intermedio', 'Intermedio', 'Intermedio', 'Intermedio', 'Intermedio'];
  const getLevelName = (lvl) => {
    if (lvl <= 5) return 'Principiante';
    if (lvl <= 10) return 'Studente';
    if (lvl <= 20) return 'Intermedio';
    if (lvl <= 35) return 'Avanzato';
    if (lvl <= 50) return 'Esperto';
    return 'Maestro';
  };

  return (
    <div className="home-page">
      {/* Streak + XP + Daily Goal Bar */}
      <section className="home-gamification-bar">
        <div className="gamification-card streak-card" onClick={() => onNavigate('profile')}>
          <span style={{fontSize:'28px'}}>🔥</span>
          <div>
            <div style={{fontSize:'22px',fontWeight:800,lineHeight:1}}>{streak.currentStreak}</div>
            <div style={{fontSize:'11px',color:'var(--text-secondary)'}}>giorni</div>
          </div>
        </div>
        <div className="gamification-card xp-card" onClick={() => onNavigate('profile')}>
          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <span style={{fontSize:'22px',fontWeight:800,color:'var(--accent)'}}>{xp.totalXP}</span>
            <span style={{fontSize:'12px',color:'var(--text-secondary)',fontWeight:600}}>XP</span>
          </div>
          <div style={{fontSize:'11px',color:'var(--text-secondary)'}}>Lv. {xp.level} {getLevelName(xp.level)}</div>
          <div style={{width:'100%',height:'4px',background:'var(--border)',borderRadius:'2px',marginTop:'4px'}}>
            <div style={{height:'100%',background:'var(--accent)',borderRadius:'2px',width:`${Math.min(100,(xp.xpInCurrentLevel/xp.xpForNextLevel)*100)}%`,transition:'width 0.3s'}}/>
          </div>
        </div>
        <div className="gamification-card goal-card" onClick={() => onNavigate('profile')}>
          <div style={{position:'relative',width:'44px',height:'44px'}}>
            <svg width="44" height="44" viewBox="0 0 44 44" style={{transform:'rotate(-90deg)'}}>
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" strokeWidth="4"/>
              <circle cx="22" cy="22" r="18" fill="none" stroke={dailyGoal.completed ? 'var(--success)' : 'var(--accent)'} strokeWidth="4"
                strokeDasharray={`${2*Math.PI*18}`} strokeDashoffset={`${2*Math.PI*18*(1-dailyGoal.percentage/100)}`} strokeLinecap="round"/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700}}>
              {dailyGoal.completed ? '✓' : `${Math.round(dailyGoal.percentage)}%`}
            </div>
          </div>
          <div>
            <div style={{fontSize:'12px',fontWeight:600}}>{dailyGoal.progress}/{dailyGoal.target} XP</div>
            <div style={{fontSize:'10px',color:'var(--text-secondary)'}}>Obiettivo</div>
          </div>
        </div>
      </section>

      <section className="home-compact">
        <h1 className="home-greeting">Impara il <span className="highlight">Tedesco</span></h1>
        <p className="home-subtitle">Goethe-Zertifikat A1 &rarr; C2</p>
        <div className="home-stats-bar">
          <div className="home-stat"><span className="home-stat-num">{stats.words.toLocaleString()}</span><span className="home-stat-label">Parole</span></div>
          <div className="home-stat"><span className="home-stat-num">{stats.grammarTopics}</span><span className="home-stat-label">Grammatica</span></div>
          <div className="home-stat"><span className="home-stat-num">{stats.verbs}</span><span className="home-stat-label">Verbi</span></div>
          <div className="home-stat"><span className="home-stat-num">{stats.exercises}</span><span className="home-stat-label">Esercizi</span></div>
        </div>
      </section>

      {/* Review reminder */}
      {reviewStats.dueToday > 0 && (
        <section className="review-reminder" onClick={() => onNavigate('flashcards')}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'var(--radius)',cursor:'pointer'}}>
            <span style={{fontSize:'24px'}}>📋</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:'14px'}}>Ripasso programmato</div>
              <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>{reviewStats.dueToday} parole da ripassare oggi</div>
            </div>
            <Icons.ChevronRight />
          </div>
        </section>
      )}

      {quizStats.totalAnswered > 0 && (
        <section className="continue-section">
          <h3 className="continue-title">I tuoi progressi</h3>
          <div className="continue-cards">
            <div className="continue-card" onClick={() => onNavigate('quiz')}>
              <div className="card-badge" style={{backgroundColor: 'var(--accent)'}}>{quizStats.totalAnswered}</div>
              <div className="card-text"><h4>Domande fatte</h4><p>{Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100)}% corrette</p></div>
            </div>
            {savedCount > 0 && (
              <div className="continue-card" onClick={() => onNavigate('favorites')}>
                <div className="card-badge" style={{backgroundColor: '#f59e0b'}}>{savedCount}</div>
                <div className="card-text"><h4>Parole salvate</h4><p>Da ripassare</p></div>
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h3 className="continue-title">Cosa vuoi studiare?</h3>
        <div className="quick-actions-grid">
          <QuickActionCard icon={<Icons.Target />} title="Percorsi" color="#6c5ce7" onClick={() => onNavigate('paths')} noLevel />
          <QuickActionCard icon={<Icons.Lessons />} title="Lezioni" color="#3b82f6" onClick={() => onNavigate('lessons')} noLevel />
          <QuickActionCard icon={<Icons.Grammar />} title="Grammatica" color="#8b5cf6" onClick={(lvl) => onNavigate('grammar', { level: lvl })} />
          <QuickActionCard icon={<Icons.Book />} title="Vocabolario" color="#10b981" onClick={(lvl) => onNavigate('vocabulary', { level: lvl })} />
          <QuickActionCard icon={<Icons.Book />} title="Parole Essenziali" color="#14b8a6" onClick={(lvl) => onNavigate('essential-words', { level: lvl })} />
          <QuickActionCard icon={<Icons.Reading />} title="Lettura" color="#06b6d4" onClick={(lvl) => onNavigate('reading', { level: lvl })} />
          <QuickActionCard icon={<Icons.Quiz />} title="Quiz" color="#ef4444" onClick={(lvl) => onNavigate('quiz', { level: lvl })} />
          <QuickActionCard icon={<Icons.Verb />} title="Verbi" color="#f59e0b" onClick={() => onNavigate('verbs')} noLevel />
          <QuickActionCard icon={<Icons.Verb />} title="Il Verbo Werden" color="#e17055" onClick={() => onNavigate('werden')} noLevel />
        </div>
      </section>

      <section>
        <h3 className="continue-title">Esercitati</h3>
        <div className="quick-actions-grid">
          <QuickActionCard icon={<Icons.Flashcard />} title="Flashcards" color="#8b5cf6" onClick={() => onNavigate('flashcards')} noLevel badge={reviewStats.dueToday > 0 ? `${reviewStats.dueToday} da fare` : null} />
          <QuickActionCard icon={<Icons.Writing />} title="Scrittura" color="#10b981" onClick={() => onNavigate('writing')} noLevel />
          <QuickActionCard icon={<Icons.Listening />} title="Ascolto" color="#06b6d4" onClick={() => onNavigate('listening')} noLevel />
          <QuickActionCard icon={<Icons.Practice />} title="Pratica Rapida" color="#f59e0b" onClick={() => onNavigate('practice')} noLevel />
          <QuickActionCard icon={<Icons.Verb />} title="Prefissi Verbali" color="#f97316" onClick={() => onNavigate('verb-prefixes')} noLevel />
          <QuickActionCard icon={<Icons.Star />} title="Salvate" color="#ec4899" onClick={() => onNavigate('favorites')} noLevel />
        </div>
      </section>
    </div>
  );
}
