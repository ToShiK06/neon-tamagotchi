import React from 'react';
import './PetProfileScreen.css';
import NeonButton from '../components/NeonButton';
import ProgressBar from '../components/ProgressBar';
import BottomNav from '../components/BottomNav';
import PetSprite from '../components/PetSprite';
import { STAGE_NAMES_RU, getStage } from '../data/pets';

function PetProfileScreen({
  pet,
  activeSkin = 'default',
  onBack,
  onFeed,
  onPlay,
  onPvp,
  onCatchGame,
  onSleep,
  onWash,
  onUpdate,
  onDelete,
  onNavChange,
}) {
  const stage = getStage(pet.level);
  const xpPercent = (pet.xp / pet.xpToNext) * 100;

  const rarityStars = '★'.repeat(pet.rarity || 1) + '☆'.repeat(5 - (pet.rarity || 1));
  const rarityLabel =
    pet.rarity === 5 ? '⭐ LEGENDARY' :
    pet.rarity === 4 ? '💜 EPIC' :
    pet.rarity === 3 ? '✦ RARE' :
    pet.rarity === 2 ? '· UNCOMMON' :
    'COMMON';

  return (
    <div className="screen pet-profile-screen">
      <div className="profile-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <div className="profile-coins">
          <span>🪙</span>
          <span>{pet.coins || 0}</span>
        </div>
      </div>

      <div className="pet-room">
        <div className="room-window">
          <div className="room-moon">🌙</div>
          <div className="room-stars"></div>
        </div>

        <div className="room-shelf">
          <div className="book b1"></div>
          <div className="book b2"></div>
          <div className="book b3"></div>
        </div>

        <div className="pet-room-pet">
          <PetSprite
            speciesId={pet.speciesId}
            size={190}
            skin={activeSkin}
            mood={stage === 'legendary' ? 'happy' : 'idle'}
          />
        </div>
      </div>

      <div className="profile-info">
        <div className="profile-name-row">
          <h1 className="profile-name">{pet.name}</h1>
          <span className={`rarity-badge rarity-${pet.rarity}`}>
            {rarityLabel}
          </span>
        </div>

        <div className="profile-stage">
          {STAGE_NAMES_RU[stage]} · Lv. {pet.level} · {rarityStars}
        </div>

        <div className="profile-stats">
          <ProgressBar value={pet.hunger}      color="orange" icon="🍖" label="Сытость"   showText />
          <ProgressBar value={pet.happiness}   color="pink"   icon="😊" label="Счастье"   showText />
          <ProgressBar value={pet.energy}      color="cyan"   icon="⚡" label="Энергия"   showText />
          <ProgressBar value={pet.cleanliness} color="green"  icon="✨" label="Чистота"   showText />
          <ProgressBar value={xpPercent} max={100} color="cyan" icon="📈" label={`XP → ${pet.xpToNext}`} showText />
        </div>

        {/* ==== Основные действия ==== */}
        <div className="profile-actions">
          <NeonButton variant="primary"   size="md" onClick={onFeed} icon="🍖">Кормить</NeonButton>
          <NeonButton variant="secondary" size="md" onClick={onPlay} icon="🎮">Match-3</NeonButton>
          <NeonButton variant="secondary" size="md" onClick={onPvp}  icon="⚔️">PvP</NeonButton>
        </div>

        {/* ==== Сон и умывание ==== */}
        <div className="profile-actions-care">
          <NeonButton variant="secondary" size="md" onClick={onSleep} icon="🛏" fullWidth>
            Спать
          </NeonButton>
          <NeonButton variant="secondary" size="md" onClick={onWash} icon="🚿" fullWidth>
            Умыть
          </NeonButton>
        </div>

        {/* ==== Поймай еду ==== */}
        <div className="profile-actions-secondary">
          <NeonButton variant="secondary" size="md" onClick={onCatchGame} icon="🎯" fullWidth>
            Поймай еду
          </NeonButton>
        </div>

        <button
          className="delete-pet-btn"
          onClick={() => {
            if (window.confirm('Отпустить питомца?')) onDelete();
          }}
        >
          Отпустить питомца
        </button>
      </div>

      <BottomNav active="pets" onChange={onNavChange} />
    </div>
  );
}

export default PetProfileScreen;