import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>{'\u{1F1E9}\u{1F1EA}'} {t('footer.title')}</p>
        <p className="footer-stats">14.315 {t('footer.words')} &bull; 177 {t('footer.topics')} &bull; 414 {t('footer.verbs')}</p>
      </div>
    </footer>
  );
}
