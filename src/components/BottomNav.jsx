import React from 'react';
import Icons from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

function BottomNav({ currentPage, onNavigate }) {
  const { t } = useLanguage();
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <button className={`bottom-nav-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')} aria-current={currentPage === 'home' ? 'page' : undefined}><Icons.Home /><span>{t('nav.home')}</span></button>
      <button className={`bottom-nav-item ${currentPage === 'paths' ? 'active' : ''}`} onClick={() => onNavigate('paths')} aria-current={currentPage === 'paths' ? 'page' : undefined}><Icons.Target /><span>{t('nav.paths')}</span></button>
      <button className={`bottom-nav-item ${currentPage === 'lessons' ? 'active' : ''}`} onClick={() => onNavigate('lessons')} aria-current={currentPage === 'lessons' ? 'page' : undefined}><Icons.Lessons /><span>{t('nav.lessons')}</span></button>
      <button className={`bottom-nav-item ${currentPage === 'practice' || currentPage === 'flashcards' || currentPage === 'writing' || currentPage === 'listening' ? 'active' : ''}`} onClick={() => onNavigate('practice')} aria-current={currentPage === 'practice' ? 'page' : undefined}><Icons.Practice /><span>{t('nav.practice')}</span></button>
      <button className={`bottom-nav-item ${currentPage === 'favorites' ? 'active' : ''}`} onClick={() => onNavigate('favorites')} aria-current={currentPage === 'favorites' ? 'page' : undefined}><Icons.Star /><span>{t('nav.saved')}</span></button>
    </nav>
  );
}

export default React.memo(BottomNav);
