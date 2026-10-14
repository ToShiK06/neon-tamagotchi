export const LEAGUE_TIERS = [
  { id: 'bronze',   name: 'Bronze League',   minPoints: 0,     color: '#CD7F32', icon: '🥉' },
  { id: 'silver',   name: 'Silver League',   minPoints: 500,   color: '#C0C0C0', icon: '🥈' },
  { id: 'gold',     name: 'Gold League',     minPoints: 1500,  color: '#FFD700', icon: '🥇' },
  { id: 'platinum', name: 'Platinum League', minPoints: 3000,  color: '#E5E4E2', icon: '💎' },
  { id: 'diamond',  name: 'Diamond League',  minPoints: 6000,  color: '#4FC3F7', icon: '💠' },
  { id: 'master',   name: 'Master League',   minPoints: 10000, color: '#FF80AB', icon: '👑' },
];

export const getLeagueTier = (points) => {
  let tier = LEAGUE_TIERS[0];
  for (const t of LEAGUE_TIERS) {
    if (points >= t.minPoints) tier = t;
  }
  return tier;
};

// ==== Фиктивные противники ====
export const AI_LEADERBOARD = [
  { name: 'NeonKing',   emoji: '👑', points: 15420, ai: true },
  { name: 'VoidWalker', emoji: '🌌', points: 12300, ai: true },
  { name: 'StarGazer',  emoji: '⭐', points: 9870,  ai: true },
  { name: 'ShadowPaw',  emoji: '🐾', points: 6540,  ai: true },
  { name: 'AquaFlare',  emoji: '💧', points: 5120,  ai: true },
  { name: 'FrostBite',  emoji: '❄️', points: 3800,  ai: true },
  { name: 'EmberWolf',  emoji: '🔥', points: 2100,  ai: true },
  { name: 'MysticOwl',  emoji: '🦉', points: 1200,  ai: true },
  { name: 'LunarFox',   emoji: '🌙', points: 700,   ai: true },
  { name: 'PixelCat',   emoji: '🐱', points: 350,   ai: true },
];

// ==== Сборка лидерборда — только игрок + AI по LP ====
export const buildLeaderboard = (playerName, playerEmoji, playerPoints) => {
  const player = {
    name: playerName || 'Ты',
    emoji: playerEmoji || '🐾',
    points: playerPoints || 0,
    isPlayer: true,
  };

  const all = [...AI_LEADERBOARD, player].sort((a, b) => b.points - a.points);

  return all.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
};

// ==== Награда за ранг ====
export const getRewardForRank = (rank) => {
  if (rank === 1)  return 500;
  if (rank === 2)  return 300;
  if (rank === 3)  return 200;
  if (rank <= 5)   return 150;
  if (rank <= 10)  return 100;
  return 50;
};