import React from 'react';
import './PetCard.css';
import PetSprite from './PetSprite';
import { STAGE_NAMES_RU, getStage } from '../data/pets';

function PetCard({ pet, onClick, activeSkin }) {
  const stage = getStage(pet.level);

  return (
    <button className={`pet-card rarity-${pet.rarity}`} onClick={onClick}>
      <div className="pet-card-bg-glow" style={{ background: pet.color }}></div>

      <div className="pet-card-body">
        <PetSprite speciesId={pet.speciesId} size={80} skin={activeSkin} />
        <div className="pet-card-name">{pet.name}</div>
        <div className="pet-card-stage">{STAGE_NAMES_RU[stage]}</div>

        <div className="pet-card-stats">
          <span className="pet-card-level">Lv. {pet.level}</span>
          <span className="pet-card-rarity">{'★'.repeat(pet.rarity || 1)}</span>
        </div>
      </div>
    </button>
  );
}

export default PetCard;