import React from 'react';
import Icons from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getStreak, getXP } from '../utils/gamification';

export default function Header({ currentPage, onNavigate, onBack, showBack, breadcrumbs }) {
  const streak = getStreak();
  const xp = getXP();
  const { language, setLanguage } = useLanguage();

  return (
    <header className="header">
      <div className="header-content">
        {showBack ? (
          <button className="back-btn" onClick={onBack}><Icons.Back /></button>
        ) : (
          <div className="logo" onClick={() => onNavigate('home')}>
            <span className="logo-icon">{'\u{1F1E9}\u{1F1EA}'}</span>
            <span className="logo-text">DeutschMaster</span>
          </div>
        )}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="breadcrumb-sep">&rsaquo;</span>}
                <button className="breadcrumb-item" onClick={b.onClick}>{b.label}</button>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="header-stats">
          {streak.currentStreak > 0 && (
            <button className="header-stat-btn" onClick={() => onNavigate('profile')} title="Streak">
              <span style={{fontSize:'16px'}}>🔥</span>
              <span className="header-stat-value">{streak.currentStreak}</span>
            </button>
          )}
          <button className="header-stat-btn xp-btn" onClick={() => onNavigate('profile')} title="XP">
            <span style={{fontSize:'14px', fontWeight:800, color:'var(--accent)'}}>XP</span>
            <span className="header-stat-value">{xp.totalXP}</span>
          </button>
          <div className="language-selector" style={{display:'flex', gap:'6px'}}>
            <button
              className={`lang-btn ${language === 'it' ? 'active' : ''}`}
              onClick={() => setLanguage('it')}
              title="Italiano"
              style={{
                padding:'6px 10px',
                background: language === 'it' ? 'var(--accent)' : 'transparent',
                color: language === 'it' ? 'white' : 'var(--text-secondary)',
                border: language === 'it' ? 'none' : '1px solid var(--border)',
                borderRadius:'6px',
                cursor:'pointer',
                fontSize:'13px',
                fontWeight:600,
                transition:'all 0.2s'
              }}
            >
              🇮🇹
            </button>
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              title="English"
              style={{
                padding:'6px 10px',
                background: language === 'en' ? 'var(--accent)' : 'transparent',
                color: language === 'en' ? 'white' : 'var(--text-secondary)',
                border: language === 'en' ? 'none' : '1px solid var(--border)',
                borderRadius:'6px',
                cursor:'pointer',
                fontSize:'13px',
                fontWeight:600,
                transition:'all 0.2s'
              }}
            >
              🇬🇧
            </button>
          </div>
          <button className="header-stat-btn profile-btn" onClick={() => onNavigate('profile')} title="Profile">
            <Icons.Profile />
          </button>
        </div>
        <nav className="nav desktop-nav">
          <button className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}><Icons.Home /><span>{t('nav.home')}</span></button>
          <button className={`nav-btn ${currentPage === 'paths' ? 'active' : ''}`} onClick={() => onNavigate('paths')}><Icons.Target /><span>{t('nav.paths')}</span></button>
          <button className={`nav-btn ${currentPage === 'stories' ? 'active' : ''}`} onClick={() => onNavigate('stories')}><span style={{fontSize:'16px'}}>📖</span><span>{t('nav.stories')}</span></button>
          <button className={`nav-btn ${currentPage === 'verbs' || currentPage === 'special-verbs' ? 'active' : ''}`} onClick={() => onNavigate('verbs')}><Icons.Verb /><span>{t('nav.verbs')}</span></button>
          <button className={`nav-btn ${currentPage === 'practice' || currentPage === 'flashcards' ? 'active' : ''}`} onClick={() => onNavigate('practice')}><Icons.Practice /><span>{t('nav.practice')}</span></button>
          <button className={`nav-btn ${currentPage === 'favorites' ? 'active' : ''}`} onClick={() => onNavigate('favorites')}><Icons.Star /><span>{t('nav.saved')}</span></button>
          <button className={`nav-btn ${currentPage === 'dona' ? 'active' : ''}`} onClick={() => onNavigate('dona')} title="Support Deutsche Master" style={{fontSize: '16px'}}>❤️</button>
          <button className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')}><Icons.Profile /><span>{t('nav.profile')}</span></button>
        </nav>
      </div>
    </header>
  );
}
