import React from 'react';
import Icons from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getStreak, getXP } from '../utils/gamification';

export default function Header({ currentPage, onNavigate, onBack, showBack, breadcrumbs }) {
  const streak = getStreak();
  const xp = getXP();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-content">
        {showBack ? (
          <button className="back-btn" onClick={onBack} aria-label="Go back"><Icons.Back /></button>
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
            <button className="header-stat-btn" onClick={() => onNavigate('profile')} title="Streak" aria-label="View streak">
              <span className="header-stat-emoji">🔥</span>
              <span className="header-stat-value">{streak.currentStreak}</span>
            </button>
          )}
          <button className="header-stat-btn header-xp-btn" onClick={() => onNavigate('profile')} title="XP" aria-label="View XP">
            <span className="header-xp-text">XP</span>
            <span className="header-stat-value">{xp.totalXP}</span>
          </button>
          <div className="header-language-selector">
            <button
              className={`header-lang-btn ${language === 'it' ? 'active' : ''}`}
              onClick={() => setLanguage('it')}
              title="Italiano"
              aria-label="Switch to Italian"
            >
              🇮🇹
            </button>
            <button
              className={`header-lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              title="English"
              aria-label="Switch to English"
            >
              🇬🇧
            </button>
          </div>
          <button
            className="header-stat-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ fontSize: '16px' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="header-stat-btn profile-btn" onClick={() => onNavigate('profile')} title="Profile" aria-label="View profile">
            <Icons.Profile />
          </button>
        </div>
        <nav className="nav desktop-nav">
          <button className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}><Icons.Home /><span>{t('nav.home')}</span></button>
          <button className={`nav-btn ${currentPage === 'paths' ? 'active' : ''}`} onClick={() => onNavigate('paths')}><Icons.Target /><span>{t('nav.paths')}</span></button>
          <button className={`nav-btn ${currentPage === 'stories' ? 'active' : ''}`} onClick={() => onNavigate('stories')}><span className="nav-stories-icon">📖</span><span>{t('nav.stories')}</span></button>
          <button className={`nav-btn ${currentPage === 'verbs' || currentPage === 'special-verbs' ? 'active' : ''}`} onClick={() => onNavigate('verbs')}><Icons.Verb /><span>{t('nav.verbs')}</span></button>
          <button className={`nav-btn ${currentPage === 'practice' || currentPage === 'flashcards' ? 'active' : ''}`} onClick={() => onNavigate('practice')}><Icons.Practice /><span>{t('nav.practice')}</span></button>
          <button className={`nav-btn ${currentPage === 'favorites' ? 'active' : ''}`} onClick={() => onNavigate('favorites')}><Icons.Star /><span>{t('nav.saved')}</span></button>
          <button className={`nav-btn nav-dona-btn ${currentPage === 'dona' ? 'active' : ''}`} onClick={() => onNavigate('dona')} title="Support Deutsche Master" aria-label="Support Deutsche Master">❤️</button>
          <button className={`nav-btn ${currentPage === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')}><Icons.Profile /><span>{t('nav.profile')}</span></button>
        </nav>
      </div>
    </header>
  );
}
