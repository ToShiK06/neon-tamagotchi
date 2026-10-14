import React, { useState, useEffect } from 'react';
import './HatchScreen.css';
import NeonButton from '../components/NeonButton';
import PetSprite from '../components/PetSprite';
import { EGG_TIERS } from '../data/pets';

function HatchScreen({ egg, pet, activeSkin = 'default', onConfirm, onBack }) {
  const [phase, setPhase] = useState('cracking'); // 'cracking' | 'reveal' | 'naming'
  const [name, setName] = useState('');

  const tier = EGG_TIERS[egg?.tier] || EGG_TIERS[1];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 1800);
    const t2 = setTimeout(() => setPhase('naming'), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed.slice(0, 16));
  };

  const speciesName = pet?.speciesName || 'Неизвестный';

  return (
    <div className={`screen hatch-screen phase-${phase}`}>
      <div className="hatch-topbar">
        {phase === 'naming' && (
          <button className="icon-btn" onClick={onBack}>←</button>
        )}
        <h1 className="title-glow">HATCHING</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="hatch-stage">
        {phase === 'cracking' && (
          <div className="hatch-egg-wrap">
            <div className="hatch-egg" style={{ filter: `drop-shadow(0 0 40px ${tier.color})` }}>
              <div className="hatch-crack c1"></div>
              <div className="hatch-crack c2"></div>
              <div className="hatch-crack c3"></div>
            </div>
            <div className="hatch-particles">
              <span className="hp hp1">✨</span>
              <span className="hp hp2">✦</span>
              <span className="hp hp3">✨</span>
              <span className="hp hp4">✦</span>
            </div>
            <div className="hatch-text">🥚 Яйцо трескается...</div>
          </div>
        )}

        {phase !== 'cracking' && (
          <div className="hatch-reveal">
            <div
              className="hatch-reveal-glow"
              style={{ background: `radial-gradient(circle, ${tier.color}55 0%, transparent 70%)` }}
            />
            <PetSprite
              speciesId={pet?.speciesId || 'kuro'}
              size={200}
              skin={activeSkin}
              mood="happy"
            />
            <div className="hatch-text-reveal">
              {phase === 'reveal' ? '🎉 Кто-то вылупился!' : `Это ${speciesName}!`}
            </div>
          </div>
        )}
      </div>

      {phase === 'naming' && (
        <div className="hatch-form">
          <label className="hatch-label">ДАЙ ИМЯ ПИТОМЦУ</label>
          <input
            type="text"
            className="hatch-input"
            placeholder="Например, Барсик..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            autoFocus
          />
          <div className="hatch-species">
            <span className="hatch-species-label">Вид:</span>
            <span className="hatch-species-name">{speciesName}</span>
          </div>
          <NeonButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleConfirm}
            disabled={!name.trim()}
            icon="✓"
          >
            Подтвердить имя
          </NeonButton>
        </div>
      )}

      {phase === 'reveal' && (
        <div className="hatch-loading">
          <span className="hatch-loading-text">Приготовься...</span>
        </div>
      )}
    </div>
  );
}

export default HatchScreen;