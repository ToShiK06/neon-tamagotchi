// Хорошая еда — даёт очки и бонусы
export const GOOD_ITEMS = [
  { id: 'apple',  emoji: '🍎', points: 5,  stat: 'hunger',    statBonus: 3,  weight: 30 },
  { id: 'burger', emoji: '🍔', points: 10, stat: 'hunger',    statBonus: 5,  weight: 20 },
  { id: 'pizza',  emoji: '🍕', points: 12, stat: 'hunger',    statBonus: 6,  weight: 15 },
  { id: 'sushi',  emoji: '🍣', points: 15, stat: 'hunger',    statBonus: 8,  weight: 10 },
  { id: 'cake',   emoji: '🍰', points: 20, stat: 'happiness', statBonus: 10, weight: 8  },
  { id: 'star',   emoji: '⭐', points: 30, stat: 'happiness', statBonus: 15, weight: 5  },
];

// Плохая еда — минус очки и статы
export const BAD_ITEMS = [
  { id: 'broccoli', emoji: '🥦', points: -5,  stat: 'happiness', statBonus: -8, weight: 8 },
  { id: 'mushroom', emoji: '🍄', points: -10, stat: 'happiness', statBonus: -12, weight: 5 },
  { id: 'bomb',     emoji: '💣', points: -20, stat: null,        statBonus: 0,   weight: 3 },
];

// Взвешенный выбор
const pickWeighted = (pool) => {
  const total = pool.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of pool) {
    if (r < item.weight) return item;
    r -= item.weight;
  }
  return pool[0];
};

export const pickFallingItem = () => {
  // 75% хорошая еда, 25% плохая
  if (Math.random() < 0.75) return { ...pickWeighted(GOOD_ITEMS), type: 'good' };
  return { ...pickWeighted(BAD_ITEMS), type: 'bad' };
};

// Параметры игры
export const GAME_CONFIG = {
  duration: 30,           // 30 секунд
  petSpeed: 8,            // скорость питомца
  spawnInterval: 900,     // новое падающее — раз в 900мс (было 700)
  fallSpeed: 1.2,         // скорость падения (было 3) — в 2.5 раза медленнее
  fallSpeedMax: 2.2,      // максимальная скорость к концу игры
};