import React from 'react';
import './PetFighter.css';

/**
 * Анимированный боец для PvP и профиля.
 * state: idle | attack | hit | victory | defeated
 */
function PetFighter({ emoji, color, state = 'idle', side = 'left' }) {
  return (
    <div className={`fighter-wrap side-${side}`}>
      <div className={`fighter fighter-${state}`} style={{ filter: `drop-shadow(0 0 25px ${color})` }}>
        <span className="fighter-emoji">{emoji}</span>
        {state === 'attack' && <div className="fighter-impact"></div>}
        {state === 'hit'    && <div className="fighter-flash"></div>}
      </div>
    </div>
  );
}

export default PetFighter;