import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Icons from './Icons';

const STEPS = [
  {
    icon: '👋',
    titleKey: 'onboarding.welcome',
    descKey: 'onboarding.welcomeDesc',
    fallbackTitle: 'Welcome to DeutschMaster!',
    fallbackDesc: 'Learn German from A1 to C2 with vocabulary, grammar, verbs, stories, and quizzes — completely free.',
  },
  {
    icon: '🎯',
    titleKey: 'onboarding.level',
    descKey: 'onboarding.levelDesc',
    fallbackTitle: 'Find your level',
    fallbackDesc: 'Take a quick placement test to discover your current German level — or start from A1.',
    action: 'placement-test',
  },
  {
    icon: '📚',
    titleKey: 'onboarding.explore',
    descKey: 'onboarding.exploreDesc',
    fallbackTitle: 'Explore & learn',
    fallbackDesc: 'Practice vocabulary, study grammar, conjugate verbs, read stories, and test yourself with quizzes.',
  },
  {
    icon: '🔥',
    titleKey: 'onboarding.track',
    descKey: 'onboarding.trackDesc',
    fallbackTitle: 'Track your progress',
    fallbackDesc: 'Earn XP, maintain your streak, unlock badges, and sync your progress across devices by signing in.',
    action: 'start',
  },
];

export default function Onboarding({ onNavigate, onComplete }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (current.action === 'placement-test') {
      localStorage.setItem('dm_onboarding_done', 'true');
      onComplete();
      onNavigate('placement-test');
      return;
    }
    if (isLast) {
      localStorage.setItem('dm_onboarding_done', 'true');
      onComplete();
      return;
    }
    setStep(s => s + 1);
  };

  const handleSkip = () => {
    localStorage.setItem('dm_onboarding_done', 'true');
    onComplete();
  };

  const title = t(current.titleKey) !== current.titleKey ? t(current.titleKey) : current.fallbackTitle;
  const desc = t(current.descKey) !== current.descKey ? t(current.descKey) : current.fallbackDesc;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-icon">{current.icon}</div>
        <h2 className="onboarding-title">{title}</h2>
        <p className="onboarding-desc">{desc}</p>

        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-actions">
          {current.action === 'placement-test' ? (
            <>
              <button className="onboarding-btn primary" onClick={handleNext}>
                {t('onboarding.takeTest') !== 'onboarding.takeTest' ? t('onboarding.takeTest') : 'Take placement test'}
              </button>
              <button className="onboarding-btn secondary" onClick={() => setStep(s => s + 1)}>
                {t('onboarding.skipTest') !== 'onboarding.skipTest' ? t('onboarding.skipTest') : 'Start from A1'}
              </button>
            </>
          ) : isLast ? (
            <button className="onboarding-btn primary" onClick={handleNext}>
              {t('onboarding.start') !== 'onboarding.start' ? t('onboarding.start') : "Let's go!"}
            </button>
          ) : (
            <>
              <button className="onboarding-btn primary" onClick={handleNext}>
                {t('onboarding.next') !== 'onboarding.next' ? t('onboarding.next') : 'Next'}
              </button>
              <button className="onboarding-btn skip" onClick={handleSkip}>
                {t('onboarding.skip') !== 'onboarding.skip' ? t('onboarding.skip') : 'Skip'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
