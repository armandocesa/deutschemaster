import React, { useState, useMemo } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS } from '../utils/constants';
import { useData } from '../DataContext';
import { getQuizStats, getDifficultWords } from '../utils/storage';

function QuickActionCard({ icon, title, color, onClick, noLevel }) {
  const [selectedLvl, setSelectedLvl] = useState(() => {
    try { return localStorage.getItem('dm_last_level') || 'A1'; } catch { return 'A1'; }
  });
  const handleLevelClick = (e, lvl) => {
    e.stopPropagation();
    setSelectedLvl(lvl);
    try { localStorage.setItem('dm_last_level', lvl); } catch {}
    onClick(lvl);
  };
  return (
    <div className="quick-action-card" onClick={() => noLevel ? onClick() : onClick(selectedLvl)}>
      <div className="quick-action-header">
        <div className="quick-action-icon" style={{backgroundColor: color}}>{icon}</div>
        <span className="quick-action-title">{title}</span>
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

  const stats = useMemo(() => ({
    words: VOCABULARY_DATA.statistics?.totalWords || 14315,
    grammarTopics: GRAMMAR_DATA.statistics?.totalTopics || 177,
    verbs: VERBS_DATA.statistics?.totalVerbs || 414,
    exercises: GRAMMAR_DATA.statistics?.totalExercises || 261,
  }), [VOCABULARY_DATA, GRAMMAR_DATA, VERBS_DATA]);

  const quizStats = getQuizStats();
  const savedCount = getDifficultWords().length;

  return (
    <div className="home-page">
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
          <QuickActionCard icon={<Icons.Grammar />} title="Grammatica" color="#8b5cf6" onClick={(lvl) => onNavigate('grammar', { level: lvl })} />
          <QuickActionCard icon={<Icons.Book />} title="Vocabolario" color="#10b981" onClick={(lvl) => onNavigate('vocabulary', { level: lvl })} />
          <QuickActionCard icon={<Icons.Reading />} title="Lettura" color="#06b6d4" onClick={(lvl) => onNavigate('reading', { level: lvl })} />
          <QuickActionCard icon={<Icons.Quiz />} title="Quiz" color="#ef4444" onClick={(lvl) => onNavigate('quiz', { level: lvl })} />
          <QuickActionCard icon={<Icons.Verb />} title="Verbi" color="#f59e0b" onClick={() => onNavigate('verbs')} noLevel />
          <QuickActionCard icon={<Icons.Star />} title="Salvate" color="#ec4899" onClick={() => onNavigate('favorites')} noLevel />
          <QuickActionCard icon={<Icons.Lessons />} title="Lezioni" color="#3b82f6" onClick={() => onNavigate('lessons')} noLevel />
        </div>
      </section>
    </div>
  );
}
