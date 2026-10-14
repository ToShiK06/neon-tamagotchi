import React, { useState, useEffect } from 'react';
import './MyPetsScreen.css';
import PetCard from '../components/PetCard';
import NeonButton from '../components/NeonButton';
import BottomNav from '../components/BottomNav';
import { EGG_TIERS } from '../data/pets';

function MyPetsScreen({ pets, eggs = [], activeSkin = 'default', onSelectPet, onAddNew, onOpenShop, onNavChange }) {
  // Локальный тик — заставляет перерисовываться каждую секунду
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!eggs || eggs.length === 0) return;
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [eggs]);

  const formatTimeLeft = (readyAt) => {
    const remain = Math.max(0, readyAt - Date.now());
    const h = Math.floor(remain / 3600000);
    const m = Math.floor((remain % 3600000) / 60000);
    const s = Math.floor((remain % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="screen my-pets-screen">
      <div className="my-pets-header">
        <h1 className="title-glow">MY PETS</h1>
        <div className="my-pets-count">
          {pets.length} питомцев · {eggs.length} яиц
        </div>
      </div>

      {eggs.length > 0 && (
        <div className="eggs-section">
          <div className="section-title">🥚 ЯЙЦА В ПРОЦЕССЕ</div>
          <div className="eggs-row">
            {eggs.map((egg) => {
              const tier = EGG_TIERS[egg.tier];
              const isReady = egg.readyAt <= Date.now();
              return (
                <div key={egg.id} className="egg-timer-card" style={{ borderColor: tier.color }}>
                  <div className="egg-timer-emoji" style={{ filter: `drop-shadow(0 0 10px ${tier.color})` }}>
                    {tier.emoji}
                  </div>
                  <div className="egg-timer-stars" style={{ color: tier.color }}>{tier.stars}</div>
                  {isReady ? (
                    <div className="egg-timer-ready">✨ Готово!</div>
                  ) : (
                    <div className="egg-timer-time">{formatTimeLeft(egg.readyAt)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pets.length === 0 && eggs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🥚</div>
          <p>У тебя пока нет питомцев</p>
          <NeonButton variant="primary" size="lg" onClick={onAddNew} icon="✨">
            Создать первого
          </NeonButton>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              activeSkin={activeSkin}
              onClick={() => onSelectPet(pet.id)}
            />
          ))}

          <button className="add-pet-card" onClick={onOpenShop}>
            <span className="add-pet-icon">🛒</span>
            <span className="add-pet-label">Магазин</span>
          </button>
        </div>
      )}

      <BottomNav active="pets" onChange={onNavChange} />
    </div>
  );
}

export default MyPetsScreen;