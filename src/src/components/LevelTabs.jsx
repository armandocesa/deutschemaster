import React from 'react';
import { LEVEL_COLORS } from '../utils/constants';

export default function LevelTabs({ currentLevel, onLevelChange }) {
  return (
    <div className="level-tabs">
      {Object.entries(LEVEL_COLORS).map(([lvl, colors]) => (
        <button key={lvl} className={`level-tab ${lvl === currentLevel ? 'active' : ''}`}
          style={lvl === currentLevel ? {backgroundColor: colors.bg, borderColor: colors.bg} : {}}
          onClick={() => onLevelChange(lvl)}>{lvl}</button>
      ))}
    </div>
  );
}
