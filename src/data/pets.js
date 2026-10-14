// ==== Виды питомцев ====
export const PET_SPECIES = [
  // 1★ Common (5)
  { id: 'kuro',   name: 'Kuro',   emoji: '🐱', color: '#3A3A4C', rarity: 1, description: 'Ночной кот' },
  { id: 'mint',   name: 'Minty',  emoji: '🐸', color: '#7EE0B0', rarity: 1, description: 'Мятный лягушонок' },
  { id: 'pinku',  name: 'Pinku',  emoji: '🐰', color: '#FFB6D5', rarity: 1, description: 'Розовый заяц' },
  { id: 'puppy',  name: 'Buddy',  emoji: '🐶', color: '#D4A76A', rarity: 1, description: 'Верный пёсик' },
  { id: 'chick',  name: 'Piu',    emoji: '🐤', color: '#FFE082', rarity: 1, description: 'Жёлтый цыплёнок' },

  // 2★ Uncommon (4)
  { id: 'wolf',   name: 'Fang',   emoji: '🐺', color: '#8A8A9E', rarity: 2, description: 'Серый волк' },
  { id: 'fox',    name: 'Ember',  emoji: '🦊', color: '#FF8A3D', rarity: 2, description: 'Огненный лис' },
  { id: 'owl',    name: 'Hoot',   emoji: '🦉', color: '#8B6F47', rarity: 2, description: 'Ночная сова' },
  { id: 'panda',  name: 'Zoo',    emoji: '🐼', color: '#E0E0E0', rarity: 2, description: 'Бамбуковый мишка' },

  // 3★ Rare (4)
  { id: 'flame',  name: 'Flare',  emoji: '🐲', color: '#FF6B6B', rarity: 3, description: 'Огненный дракончик' },
  { id: 'spark',  name: 'Spark',  emoji: '⭐', color: '#4FC3F7', rarity: 3, description: 'Звёздное существо' },
  { id: 'tiger',  name: 'Rajah',  emoji: '🐯', color: '#FFA726', rarity: 3, description: 'Полосатый тигр' },
  { id: 'uni',    name: 'Misty',  emoji: '🦄', color: '#E1BEE7', rarity: 3, description: 'Единорог-мечтатель' },

  // 4★ Epic (3)
  { id: 'ghost',  name: 'Wisp',   emoji: '👻', color: '#C4B0E0', rarity: 4, description: 'Призрачный дух' },
  { id: 'phoen',  name: 'Pyra',   emoji: '🦅', color: '#FFAB40', rarity: 4, description: 'Мифический феникс' },
  { id: 'kitsune',name: 'Yuki',   emoji: '🦊', color: '#FF80AB', rarity: 4, description: 'Девятихвостая лиса' },

  // 5★ Legendary (2)
  { id: 'moon',   name: 'Luna',   emoji: '🌙', color: '#E1BEE7', rarity: 5, description: 'Лунный дух' },
  { id: 'draco',  name: 'Draco',  emoji: '🐉', color: '#76FF03', rarity: 5, description: 'Небесный дракон' },
];

// ==== Стадии эволюции ====
export const STAGES = {
  egg:       { name: 'Egg',       minLevel: 1  },
  baby:      { name: 'Baby',      minLevel: 2  },
  child:     { name: 'Child',     minLevel: 5  },
  teen:      { name: 'Teen',      minLevel: 10 },
  adult:     { name: 'Adult',     minLevel: 20 },
  legendary: { name: 'Legendary', minLevel: 40 },
};

export const STAGE_NAMES_RU = {
  egg: 'Яйцо',
  baby: 'Малыш',
  child: 'Ребёнок',
  teen: 'Подросток',
  adult: 'Взрослый',
  legendary: 'Легенда',
};

// ==== Тир яиц ====
export const EGG_TIERS = {
  1: {
    tier: 1, name: 'Обычное яйцо', emoji: '🥚', color: '#B0BEC5', stars: '★☆☆☆☆',
    price: 100, hatchTime: 60 * 60 * 1000,
    rarityWeights: { 1: 90, 2: 10, 3: 0, 4: 0, 5: 0 },
  },
  2: {
    tier: 2, name: 'Необычное яйцо', emoji: '🥚', color: '#A5F3D0', stars: '★★☆☆☆',
    price: 300, hatchTime: 75 * 60 * 1000,
    rarityWeights: { 1: 50, 2: 40, 3: 10, 4: 0, 5: 0 },
  },
  3: {
    tier: 3, name: 'Редкое яйцо', emoji: '🥚', color: '#4FC3F7', stars: '★★★☆☆',
    price: 800, hatchTime: 90 * 60 * 1000,
    rarityWeights: { 1: 15, 2: 35, 3: 40, 4: 10, 5: 0 },
  },
  4: {
    tier: 4, name: 'Эпическое яйцо', emoji: '🥚', color: '#B39DDB', stars: '★★★★☆',
    price: 2000, hatchTime: 105 * 60 * 1000,
    rarityWeights: { 1: 5, 2: 15, 3: 40, 4: 35, 5: 5 },
  },
  5: {
    tier: 5, name: 'Легендарное яйцо', emoji: '🥚', color: '#FFE082', stars: '★★★★★',
    price: 5000, hatchTime: 120 * 60 * 1000,
    rarityWeights: { 1: 0, 2: 5, 3: 20, 4: 45, 5: 30 },
  },
};

// ==== Случайный вид с учётом весов яйца ====
export const rollSpeciesByTier = (eggTier) => {
  const weights = EGG_TIERS[eggTier]?.rarityWeights || { 1: 100 };
  const roll = Math.random() * 100;
  let acc = 0;
  let selectedRarity = 1;
  for (const [rarity, weight] of Object.entries(weights)) {
    acc += weight;
    if (roll <= acc) { selectedRarity = Number(rarity); break; }
  }
  const pool = PET_SPECIES.filter((p) => p.rarity === selectedRarity);
  return pool[Math.floor(Math.random() * pool.length)] || PET_SPECIES[0];
};

export const rollRandomSpecies = () => rollSpeciesByTier(1);

// ==== Стадия по уровню ====
export const getStage = (level) => {
  let current = 'egg';
  for (const [key, val] of Object.entries(STAGES)) {
    if (level >= val.minLevel) current = key;
  }
  return current;
};

// ==== Статы нового питомца ====
export const createPetStats = () => ({
  hunger: 100,
  happiness: 100,
  energy: 100,
  cleanliness: 100,
  level: 1,
  xp: 0,
  xpToNext: 100,
});

export const getXpToNext = (level) => Math.floor(100 * Math.pow(1.35, level - 1));