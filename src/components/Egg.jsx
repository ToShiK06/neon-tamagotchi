import React from 'react';
import './Egg.css';

/**
 * 3D-яйцо с частицами, звёздами и аурой.
 * Используется в CreatePetScreen и, при желании, в других экранах.
 *
 * @param {boolean} hatching — проигрывать анимацию вылупления
 * @param {string}  size     — 'sm' | 'md' | 'lg' (по умолчанию 'md')
 * @param {string}  hue      — базовый цвет яйца ('purple' | 'pink' | 'cyan')
 */
function Egg({ hatching = false, size = 'md', hue = 'purple' }) {
  return (
    <div className={`egg-scene egg-${size} egg-hue-${hue} ${hatching ? 'hatching' : ''}`}>
      <div className="egg-aura"></div>

      <div className="egg-3d">
        <div className="egg-spots"></div>
        <div className="egg-shine"></div>
      </div>

      {/* Летающие частицы */}
      <div className="egg-particle p1"></div>
      <div className="egg-particle p2"></div>
      <div className="egg-particle p3"></div>
      <div className="egg-particle p4"></div>
      <div className="egg-particle p5"></div>

      {/* Мерцающие звёзды */}
      <div className="egg-star s1">✦</div>
      <div className="egg-star s2">✧</div>
      <div className="egg-star s3">✦</div>
    </div>
  );
}

export default Egg;