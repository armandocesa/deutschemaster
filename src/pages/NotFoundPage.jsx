import React from 'react';
import Icons from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotFoundPage({ onNavigate }) {
  const { t } = useLanguage();
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">{t('notFound.title')}</h1>
        <p className="not-found-message">{t('notFound.message')}</p>
        <button className="not-found-btn" onClick={() => onNavigate('home')}>
          <Icons.Home /> {t('notFound.homeButton')}
        </button>
      </div>
    </div>
  );
}
