import React, { useState } from 'react';
import './FeedScreen.css';
import ProgressBar from '../components/ProgressBar';
import PetSprite from '../components/PetSprite';
import { FOODS } from '../data/foods';
import { getXpToNext } from '../data/pets';

function FeedScreen({
  pet,
  activeSkin = 'default',
  inventory = {},
  setInventory,
  onBack,
  onUpdate,
  pushToast,
}) {
  const [eating, setEating] = useState(false);

  const handleFeed = (food) => {
    if (eating) return;

    const owned = inventory?.[food.id] || 0;
    if (owned <= 0) {
      pushToast({
        icon: '📦',
        title: 'Нет в инвентаре',
        desc: `Купи ${food.name} в магазине`,
        type: 'info',
      });
      return;
    }

    setEating(true);

    setInventory((inv) => ({
      ...inv,
      [food.id]: Math.max(0, (inv[food.id] || 0) - 1),
    }));

    onUpdate((p) => {
      const newHunger = Math.min(100, p.hunger + food.hunger);
      const newHappiness = Math.min(100, p.happiness + food.happiness);

      let newXp = p.xp + 15;
      let newLevel = p.level;
      let newXpToNext = p.xpToNext;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = getXpToNext(newLevel);
      }

      return {
        ...p,
        hunger: newHunger,
        happiness: newHappiness,
        xp: newXp,
        xpToNext: newXpToNext,
        level: newLevel,
      };
    });

    pushToast({
      icon: food.emoji,
      title: `${pet.name} съел ${food.name}`,
      desc: `+${food.hunger} сытости · +15 XP`,
      type: 'success',
    });

    setTimeout(() => setEating(false), 700);
  };

  return (
    <div className="screen feed-screen">
      <div className="feed-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">FEED & EVOLVE</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="feed-stage">
        <PetSprite
          speciesId={pet.speciesId}
          size={140}
          skin={activeSkin}
          mood={eating ? 'eating' : 'idle'}
        />
      </div>

      <div className="feed-progress">
        <ProgressBar value={pet.hunger}    color="orange" icon="🍖" label="Сытость" showText />
        <ProgressBar value={pet.happiness} color="pink"   icon="😊" label="Счастье" showText />
        <ProgressBar
          value={(pet.xp / pet.xpToNext) * 100}
          color="cyan"
          icon="📈"
          label={`XP до ур. ${pet.level + 1}`}
          showText
        />
      </div>

      <div className="feed-title">ВЫБЕРИ ЕДУ</div>
      <div className="foods-grid">
        {FOODS.map((food) => {
          const owned = inventory?.[food.id] || 0;
          const disabled = owned <= 0 || eating;
          return (
            <button
              key={food.id}
              className={`food-item ${disabled ? 'disabled' : ''}`}
              onClick={() => handleFeed(food)}
              disabled={disabled}
            >
              <div className="food-emoji">{food.emoji}</div>
              <div className="food-name">{food.name}</div>
              <div className="food-cost" style={{ color: owned > 0 ? '#76FF03' : '#FF6B6B' }}>
                📦 {owned}
              </div>
              <div className="food-bonus">+{food.hunger} 🍖</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FeedScreen;