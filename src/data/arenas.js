// 4 локации для PvP
export const ARENAS = [
  {
    id: 'forest',
    name: 'Затмённый лес',
    icon: '🌲',
    desc: 'Древний лес, окутанный туманом',
    // CSS-класс для стилизации
    className: 'arena-forest',
    // Награда ×1 (обычная)
    rewardMultiplier: 1.0,
  },
  {
    id: 'volcano',
    name: 'Пылающий вулкан',
    icon: '🌋',
    desc: 'Лава бурлит под ногами',
    className: 'arena-volcano',
    rewardMultiplier: 1.4,
  },
  {
    id: 'ice',
    name: 'Ледяные пики',
    icon: '❄️',
    desc: 'Вечная мерзлота, трещины во льду',
    className: 'arena-ice',
    rewardMultiplier: 1.4,
  },
  {
    id: 'fortress',
    name: 'Крепость теней',
    icon: '🏰',
    desc: 'Древняя крепость павших воинов',
    className: 'arena-fortress',
    rewardMultiplier: 2.0,
  },
];

export const getRandomArena = () => ARENAS[Math.floor(Math.random() * ARENAS.length)];