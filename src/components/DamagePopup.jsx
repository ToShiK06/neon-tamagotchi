import React from 'react';
import './DamagePopup.css';

function DamagePopup({ damage, x, y, isCrit = false, isEnemy = false }) {
  const sign = isEnemy ? '-' : '';
  return (
    <div
      className={`dmg-popup ${isCrit ? 'crit' : ''} ${isEnemy ? 'enemy' : 'ally'}`}
      style={{ left: x, top: y }}
    >
      {sign}{Math.round(damage)}
    </div>
  );
}

export default DamagePopup;