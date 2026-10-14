import React, { useState } from 'react';
import './ShopScreen.css';
import { EGG_TIERS } from '../data/pets';
import { FOODS } from '../data/foods';
import { SHOP_CATEGORIES, BOOSTS, SKINS } from '../data/shopItems';

function ShopScreen({
  coins,
  eggs,
  inventory = {},
  ownedSkins = [],
  activeSkin = 'default',
  onBuyEgg,
  onBuyFood,
  onBuyBoost,
  onBuySkin,
  onEquipSkin,
  onBack,
}) {
  const [tab, setTab] = useState('eggs');

  return (
    <div className="screen shop-screen">
      <div className="shop-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">SHOP</h1>
        <div className="profile-coins">
          <span>🪙</span>
          <span>{coins || 0}</span>
        </div>
      </div>

      <div className="shop-tabs">
        {SHOP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`shop-tab ${tab === cat.id ? 'active' : ''}`}
            onClick={() => setTab(cat.id)}
          >
            <span className="shop-tab-icon">{cat.icon}</span>
            <span className="shop-tab-label">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* ==== ЯЙЦА ==== */}
      {tab === 'eggs' && (
        <div className="shop-items">
          {Object.values(EGG_TIERS).map((tier) => {
            const canAfford = (coins || 0) >= tier.price;
            return (
              <div key={tier.tier} className="shop-item">
                <div className="shop-egg-visual" style={{ filter: `drop-shadow(0 0 20px ${tier.color})` }}>
                  {tier.emoji}
                </div>
                <div className="shop-item-info">
                  <div className="shop-item-name">{tier.name}</div>
                  <div className="shop-item-stars" style={{ color: tier.color }}>{tier.stars}</div>
                  <div className="shop-item-desc">Вылупление: {Math.round(tier.hatchTime / 60000)} мин</div>
                </div>
                <button
                  className={`shop-buy-btn ${canAfford ? '' : 'disabled'}`}
                  onClick={() => onBuyEgg(tier.tier)}
                  disabled={!canAfford}
                >
                  🪙 {tier.price}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ==== ЕДА ==== */}
      {tab === 'food' && (
        <div className="shop-items">
          {FOODS.map((food) => {
            const canAfford = (coins || 0) >= food.cost;
            const owned = inventory?.[food.id] || 0;
            return (
              <div key={food.id} className="shop-item">
                <div className="shop-item-icon">{food.emoji}</div>
                <div className="shop-item-info">
                  <div className="shop-item-name">{food.name}</div>
                  <div className="shop-item-desc">
                    +{food.hunger} 🍖 · +{food.happiness} 😊
                  </div>
                  <div className="shop-item-desc" style={{ color: '#FFE082', fontWeight: 700 }}>
                    В инвентаре: {owned}
                  </div>
                </div>
                <button
                  className={`shop-buy-btn ${canAfford ? '' : 'disabled'}`}
                  onClick={() => onBuyFood(food.id)}
                  disabled={!canAfford}
                >
                  🪙 {food.cost}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ==== УСКОРИТЕЛИ ==== */}
      {tab === 'boosts' && (
        <div className="shop-items">
          {BOOSTS.map((b) => {
            const canAfford = (coins || 0) >= b.price;
            return (
              <div key={b.id} className="shop-item">
                <div className="shop-item-icon">{b.emoji}</div>
                <div className="shop-item-info">
                  <div className="shop-item-name">{b.name}</div>
                  <div className="shop-item-desc">{b.description}</div>
                </div>
                <button
                  className={`shop-buy-btn ${canAfford ? '' : 'disabled'}`}
                  onClick={() => onBuyBoost(b.id)}
                  disabled={!canAfford}
                >
                  🪙 {b.price}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ==== СКИНЫ ==== */}
      {tab === 'skins' && (
        <div className="shop-items">
          {SKINS.map((skin) => {
            const owned = ownedSkins?.includes(skin.id);
            const equipped = activeSkin === skin.id;
            const canAfford = (coins || 0) >= skin.price;

            return (
              <div key={skin.id} className="shop-item">
                <div
                  className="shop-skin-preview"
                  style={{ background: skin.preview, boxShadow: `0 0 15px ${skin.color}` }}
                />
                <div className="shop-item-info">
                  <div className="shop-item-name">{skin.name}</div>
                  <div className="shop-item-desc">{skin.description}</div>
                </div>
                {equipped ? (
                  <button className="shop-buy-btn equipped" disabled>✓ НАДЕТ</button>
                ) : owned ? (
                  <button className="shop-buy-btn" onClick={() => onEquipSkin(skin.id)}>
                    НАДЕТЬ
                  </button>
                ) : (
                  <button
                    className={`shop-buy-btn ${canAfford ? '' : 'disabled'}`}
                    onClick={() => onBuySkin(skin.id)}
                    disabled={!canAfford}
                  >
                    🪙 {skin.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ShopScreen;