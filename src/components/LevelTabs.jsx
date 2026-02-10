import React, { useState } from 'react';
import { LEVEL_COLORS } from '../utils/constants';
import { useLevelAccess } from '../hooks/useLevelAccess';
import { useLanguage } from '../contexts/LanguageContext';
import LevelAccessModal from './LevelAccessModal';

export default function LevelTabs({ currentLevel, onLevelChange, onNavigate }) {
  const { canAccessLevel, requiresAuth } = useLevelAccess();
  const { t } = useLanguage();
  const [lockedLevel, setLockedLevel] = useState(null);

  const handleLevelClick = (lvl) => {
    if (!canAccessLevel(lvl)) {
      setLockedLevel(lvl);
      return;
    }
    onLevelChange(lvl);
  };

  const handleLoginClick = () => {
    setLockedLevel(null);
    if (onNavigate) {
      onNavigate('login');
    }
  };

  return (
    <>
      <div className="level-tabs">
        {Object.entries(LEVEL_COLORS).map(([lvl, colors]) => {
          const isLocked = requiresAuth(lvl) && !canAccessLevel(lvl);
          return (
            <button
              key={lvl}
              className={`level-tab ${lvl === currentLevel ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              style={lvl === currentLevel && !isLocked ? {backgroundColor: colors.bg, borderColor: colors.bg} : {}}
              onClick={() => handleLevelClick(lvl)}
              title={isLocked ? t('levelAccess.signUpFree') : ''}
            >
              {lvl}
              {isLocked && <span className="lock-icon" style={{marginLeft: '4px'}}>🔒</span>}
            </button>
          );
        })}
      </div>

      <LevelAccessModal
        isOpen={lockedLevel !== null}
        level={lockedLevel}
        onClose={() => setLockedLevel(null)}
        onLoginClick={handleLoginClick}
      />

      <style>{`
        .level-tab.locked {
          opacity: 0.5;
          cursor: not-allowed !important;
          background-color: var(--bg-secondary) !important;
          color: var(--text-secondary) !important;
        }

        .level-tab.locked:hover {
          opacity: 0.6;
        }

        .lock-icon {
          font-size: 12px;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
