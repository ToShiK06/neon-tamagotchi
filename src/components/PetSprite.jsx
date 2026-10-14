import React from 'react';
import './PetSprite.css';

/**
 * SVG-питомец с поддержкой скинов.
 * skin: 'default' | 'gold' | 'shadow' | 'rainbow' | 'neon' | 'cosmic'
 * skin меняет основную палитру питомца.
 */
function PetSprite({ speciesId = 'kuro', size = 80, skin = 'default', mood = 'idle', style = {} }) {
  // ==== ПАЛИТРЫ СКИНОВ (перебивают цвета вида) ====
  const skinPalettes = {
    default:  null, // null = используем цвета вида
    gold: {
      body:    '#FFE082',
      belly:   '#FFF8E0',
      ear:     '#FFB300',
      aura:    'rgba(255,224,130,0.65)',
      eyes:    '#FFFFFF',
      extra:   'sparkle-gold',
    },
    shadow: {
      body:    '#4A148C',
      belly:   '#7B4BAE',
      ear:     '#2A0A50',
      aura:    'rgba(74,20,140,0.75)',
      eyes:    '#FF6B6B',
      extra:   'sparkle-shadow',
    },
    rainbow: {
      // Радужный — используем градиент для тела
      body:    'url(#rainbow-grad)',
      belly:   'rgba(255,255,255,0.7)',
      ear:     '#FF80AB',
      aura:    'rgba(255,128,171,0.7)',
      eyes:    '#FFFFFF',
      extra:   'sparkle-rainbow',
    },
    neon: {
      body:    '#76FF03',
      belly:   '#D4FFA0',
      ear:     '#4CB800',
      aura:    'rgba(118,255,3,0.8)',
      eyes:    '#000000',
      extra:   'sparkle-neon',
    },
    cosmic: {
      body:    '#B39DDB',
      belly:   '#E0D0F0',
      ear:     '#7E57C2',
      aura:    'rgba(179,157,219,0.85)',
      eyes:    '#FFFFFF',
      extra:   'sparkle-cosmic',
    },
  };

  // ==== ПАЛИТРЫ ВИДОВ (базовые) ====
  const speciesColors = {
    kuro:    { body: '#3A3A4C', belly: '#C9B8E0', ear: '#2A2A3C' },
    mint:    { body: '#7EE0B0', belly: '#C8F5DD', ear: '#5EBF8F' },
    pinku:   { body: '#FFB6D5', belly: '#FFE0F0', ear: '#FF80AB' },
    puppy:   { body: '#D4A76A', belly: '#F5DFC0', ear: '#A87A44' },
    chick:   { body: '#FFE082', belly: '#FFF5C0', ear: '#FFB300' },
    wolf:    { body: '#8A8A9E', belly: '#C0C0D0', ear: '#5A5A6E' },
    fox:     { body: '#FF8A3D', belly: '#FFE0C0', ear: '#D96B20' },
    owl:     { body: '#8B6F47', belly: '#E8D5B0', ear: '#5C4728' },
    panda:   { body: '#E0E0E0', belly: '#FFFFFF', ear: '#2A2A2A' },
    flame:   { body: '#FF6B6B', belly: '#FFD3D3', ear: '#C83C3C' },
    spark:   { body: '#4FC3F7', belly: '#C5ECFF', ear: '#2A8CC0' },
    tiger:   { body: '#FFA726', belly: '#FFE0A0', ear: '#D17D00' },
    uni:     { body: '#E1BEE7', belly: '#F8E8FA', ear: '#B87EC8' },
    ghost:   { body: '#C4B0E0', belly: '#F0E5FF', ear: '#9C4DCC' },
    phoen:   { body: '#FFAB40', belly: '#FFE0A0', ear: '#C87A1C' },
    kitsune: { body: '#FF80AB', belly: '#FFD0E0', ear: '#D6508A' },
    moon:    { body: '#E1BEE7', belly: '#F8E8FA', ear: '#B87EC8' },
    draco:   { body: '#76FF03', belly: '#D4FFA0', ear: '#4CB800' },
  };

  const sp = skinPalettes[skin];
  const sc = speciesColors[speciesId] || speciesColors.kuro;

  // ==== Итоговые цвета: скин перебивает вид, если задан ====
  const bodyColor  = sp?.body  || sc.body;
  const bellyColor = sp?.belly || sc.belly;
  const earColor   = sp?.ear   || sc.ear;
  const eyeColor   = sp?.eyes  || '#FFFFFF';
  const aura       = sp?.aura;

  const isRainbow = skin === 'rainbow';
  const isNeon    = skin === 'neon';
  const isCosmic  = skin === 'cosmic';
  const isShadow  = skin === 'shadow';
  const isGold    = skin === 'gold';

  return (
    <div
      className={`pet-sprite-wrap mood-${mood} skin-${skin}`}
      style={{ width: size, height: size, ...style }}
    >
      {/* Аура скина */}
      {aura && (
        <div
          className="pet-sprite-aura"
          style={{ background: `radial-gradient(circle, ${aura} 0%, transparent 70%)` }}
        />
      )}

      <svg
  viewBox="-5 -5 110 110"
  width={size}
  height={size}
  className="pet-sprite-svg"
  style={{ overflow: 'visible' }}
>
        {/* ==== Градиенты для специальных скинов ==== */}
        <defs>
          <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FF6B6B" />
            <stop offset="25%"  stopColor="#FFE082" />
            <stop offset="50%"  stopColor="#76FF03" />
            <stop offset="75%"  stopColor="#4FC3F7" />
            <stop offset="100%" stopColor="#9C4DCC" />
          </linearGradient>

          <radialGradient id="cosmic-grad" cx="30%" cy="30%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="40%"  stopColor="#B39DDB" />
            <stop offset="100%" stopColor="#4A148C" />
          </radialGradient>
        </defs>

        {/* Уши */}
        <ellipse cx="30" cy="25" rx="10" ry="14" fill={earColor} transform="rotate(-15 30 25)" />
        <ellipse cx="70" cy="25" rx="10" ry="14" fill={earColor} transform="rotate(15 70 25)" />

        {/* Тело */}
        <ellipse
          cx="50"
          cy="60"
          rx="32"
          ry="28"
          fill={isCosmic ? 'url(#cosmic-grad)' : bodyColor}
          stroke={isNeon ? '#B9FF66' : 'none'}
          strokeWidth={isNeon ? '1.5' : '0'}
        />
        {/* Живот */}
        <ellipse cx="50" cy="66" rx="20" ry="18" fill={bellyColor} opacity="0.85" />

        {/* Глаза */}
        <ellipse cx="40" cy="52" rx="5" ry="6" fill={eyeColor} />
        <ellipse cx="60" cy="52" rx="5" ry="6" fill={eyeColor} />
        <circle cx="41" cy="53" r="2.5" fill="#1A0B2E" />
        <circle cx="61" cy="53" r="2.5" fill="#1A0B2E" />
        <circle cx="42" cy="51" r="1" fill="#FFF" opacity="0.9" />
        <circle cx="62" cy="51" r="1" fill="#FFF" opacity="0.9" />

        {/* Нос */}
        <ellipse cx="50" cy="62" rx="3" ry="2" fill="#1A0B2E" opacity="0.7" />
        <path d="M 46 66 Q 50 70 54 66" stroke="#1A0B2E" strokeWidth="1.2" fill="none" opacity="0.7" strokeLinecap="round" />

        {/* Щёчки */}
        <ellipse cx="30" cy="60" rx="5" ry="3" fill="#FF80AB" opacity={isShadow ? '0.2' : '0.4'} />
        <ellipse cx="70" cy="60" rx="5" ry="3" fill="#FF80AB" opacity={isShadow ? '0.2' : '0.4'} />

        {/* Лапки */}
        <ellipse cx="32" cy="85" rx="9" ry="6" fill={isCosmic ? '#7E57C2' : bodyColor} />
        <ellipse cx="68" cy="85" rx="9" ry="6" fill={isCosmic ? '#7E57C2' : bodyColor} />

        {/* ==== Специфика видов ==== */}
        {speciesId === 'flame'   && <path d="M 50 5 Q 55 15 50 25 Q 45 15 50 5" fill="#FFB84D" opacity="0.9" />}
        {speciesId === 'spark'   && <path d="M 50 8 L 53 18 L 63 20 L 53 22 L 50 32 L 47 22 L 37 20 L 47 18 Z" fill="#FFE082" />}
        {speciesId === 'ghost'   && <path d="M 25 75 Q 30 65 35 75 Q 40 65 45 75 Q 50 65 55 75 Q 60 65 65 75 Q 70 65 75 75 L 75 80 L 25 80 Z" fill={bodyColor} opacity="0.6" />}
        {speciesId === 'moon'    && <circle cx="70" cy="30" r="8" fill="#FFF" opacity="0.4" />}
        {speciesId === 'draco'   && <path d="M 30 30 L 20 20 L 25 35 Z M 70 30 L 80 20 L 75 35 Z" fill="#4CB800" />}
        {speciesId === 'chick'   && <path d="M 50 18 L 48 24 L 52 24 Z" fill="#FF8A3D" />}
        {speciesId === 'uni'     && <path d="M 50 8 L 46 24 L 54 24 Z" fill="#FFE082" stroke="#FFB300" strokeWidth="1" />}
        {speciesId === 'phoen'   && <path d="M 50 5 Q 60 15 50 30 Q 40 15 50 5" fill="#FF6B6B" opacity="0.8" />}
        {speciesId === 'puppy'   && <ellipse cx="50" cy="62" rx="4" ry="3" fill="#1A0B2E" opacity="0.9" />}
        {speciesId === 'panda'   && (
          <>
            <circle cx="30" cy="25" r="8" fill="#2A2A2A" />
            <circle cx="70" cy="25" r="8" fill="#2A2A2A" />
            <circle cx="40" cy="52" r="6" fill="#2A2A2A" />
            <circle cx="60" cy="52" r="6" fill="#2A2A2A" />
            <circle cx="40" cy="52" r="2" fill="#FFF" />
            <circle cx="60" cy="52" r="2" fill="#FFF" />
          </>
        )}
        {speciesId === 'tiger'   && (
          <>
            <path d="M 40 40 L 45 48" stroke="#2A2A2A" strokeWidth="2" />
            <path d="M 60 40 L 55 48" stroke="#2A2A2A" strokeWidth="2" />
            <path d="M 50 42 L 50 50" stroke="#2A2A2A" strokeWidth="2" />
          </>
        )}
        {speciesId === 'kitsune' && (
          <>
            <ellipse cx="50" cy="85" rx="20" ry="6" fill={bodyColor} opacity="0.7" />
            <circle cx="70" cy="30" r="5" fill="#FFE082" opacity="0.5" />
          </>
        )}
        {speciesId === 'owl' && (
          <>
            <circle cx="40" cy="52" r="8" fill={bellyColor} opacity="0.7" />
            <circle cx="60" cy="52" r="8" fill={bellyColor} opacity="0.7" />
          </>
        )}

        {/* ==== Спецэффекты скинов ==== */}
        {isGold && (
          <>
            <path d="M 20 20 L 22 25 L 27 25 L 23 28 L 25 33 L 20 30 L 15 33 L 17 28 L 13 25 L 18 25 Z" fill="#FFF8E0" opacity="0.9" />
            <path d="M 82 18 L 84 22 L 88 22 L 85 25 L 86 29 L 82 27 L 78 29 L 79 25 L 76 22 L 80 22 Z" fill="#FFF8E0" opacity="0.8" />
          </>
        )}
        {isShadow && (
          <>
            <ellipse cx="50" cy="60" rx="36" ry="32" fill="none" stroke="#9C4DCC" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />
          </>
        )}
        {isRainbow && (
          <>
            <circle cx="22" cy="22" r="2" fill="#FF6B6B" opacity="0.8" />
            <circle cx="80" cy="25" r="2" fill="#FFE082" opacity="0.8" />
            <circle cx="20" cy="80" r="2" fill="#76FF03" opacity="0.8" />
            <circle cx="82" cy="78" r="2" fill="#4FC3F7" opacity="0.8" />
          </>
        )}
        {isNeon && (
          <>
            <circle cx="50" cy="60" r="30" fill="none" stroke="#76FF03" strokeWidth="0.8" opacity="0.6" />
            <circle cx="50" cy="60" r="36" fill="none" stroke="#76FF03" strokeWidth="0.5" opacity="0.4" />
          </>
        )}
        {isCosmic && (
          <>
            <circle cx="25" cy="30" r="1.5" fill="#FFF" opacity="0.9" />
            <circle cx="75" cy="40" r="1" fill="#FFF" opacity="0.8" />
            <circle cx="30" cy="80" r="1.2" fill="#FFF" opacity="0.7" />
            <circle cx="78" cy="75" r="1.5" fill="#FFF" opacity="0.9" />
          </>
        )}
      </svg>
    </div>
  );
}

export default PetSprite;