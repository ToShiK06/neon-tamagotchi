import React, { useState } from 'react';
import './CreatePetScreen.css';
import NeonButton from '../components/NeonButton';
import { rollRandomSpecies, createPetStats } from '../data/pets';

function CreatePetScreen({ onCreate, onBack }) {
  const [name, setName] = useState('');
  const [hatching, setHatching] = useState(false);

  const handleCreate = () => {
    if (!name.trim() || hatching) return;

    setHatching(true);

    // Анимация "вылупления" — 1.5 сек
    setTimeout(() => {
      const species = rollRandomSpecies();
      const stats = createPetStats();
      const newPet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim().slice(0, 16),
        speciesId: species.id,
        speciesName: species.name,
        emoji: species.emoji,
        color: species.color,
        rarity: species.rarity,
        description: species.description,
        ...stats,
        coins: 50, // стартовые монетки
        createdAt: Date.now(),
      };
      onCreate(newPet);
    }, 1500);
  };

  return (
    <div className="screen create-screen">
      <div className="create-header">
        {onBack && (
          <button className="icon-btn" onClick={onBack}>←</button>
        )}
        <h1 className="title-glow">YOUR NEW<br />TAMAGOTCHI EGG</h1>
        <div style={{ width: 40 }} />
      </div>

      <p className="create-subtitle">Give your egg a name...</p>

      {/* ==== Яйцо ==== */}
      <div className={`egg-scene ${hatching ? 'hatching' : ''}`}>
        <div className="egg-aura"></div>
        <div className="egg-3d">
          <div className="egg-spots"></div>
          <div className="egg-shine"></div>
        </div>

        {/* Летающие частицы вокруг яйца */}
        <div className="egg-particle p1"></div>
        <div className="egg-particle p2"></div>
        <div className="egg-particle p3"></div>
        <div className="egg-particle p4"></div>
        <div className="egg-particle p5"></div>
        <div className="egg-star s1">✦</div>
        <div className="egg-star s2">✧</div>
        <div className="egg-star s3">✦</div>
      </div>

      {/* ==== Поле имени ==== */}
      <div className="create-form">
        <label className="input-label">Pet name</label>
        <input
          type="text"
          className="pet-name-input"
          placeholder="Type a name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          disabled={hatching}
        />

        <NeonButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleCreate}
          disabled={!name.trim() || hatching}
          icon={hatching ? '✨' : '🥚'}
        >
          {hatching ? 'Hatching...' : 'Create New Pet'}
        </NeonButton>
      </div>
    </div>
  );
}

export default CreatePetScreen;