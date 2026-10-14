export const SHOP_CATEGORIES = [
  { id: 'eggs',   name: 'Яйца',       icon: '🥚' },
  { id: 'food',   name: 'Еда',        icon: '🍖' },
  { id: 'boosts', name: 'Ускорители', icon: '⚡' },
  { id: 'skins',  name: 'Скины',      icon: '🎨' },
];

export const BOOSTS = [
  { id: 'xp_x2',     name: 'Двойной XP',      emoji: '⚡', price: 200, duration: 30 * 60 * 1000, description: '+100% XP на 30 минут' },
  { id: 'auto_feed', name: 'Авто-кормление', emoji: '🍖', price: 500, duration: 60 * 60 * 1000, description: 'Авто-кормит питомца 1 час' },
  { id: 'luck',      name: 'Удача',           emoji: '🍀', price: 400, duration: 20 * 60 * 1000, description: 'Редкие дропы в мини-играх 20 минут' },
];

export const SKINS = [
  {
    id: 'default',
    name: 'Обычный',
    description: 'Стандартный вид питомца',
    color: '#C9B8E0',
    price: 0,
    preview: 'linear-gradient(135deg, #C9B8E0, #6A1B9A)',
  },
  {
    id: 'gold',
    name: 'Золотой',
    description: 'Питомец в золотой ауре',
    color: '#FFE082',
    price: 500,
    preview: 'linear-gradient(135deg, #FFE082, #FF9F43)',
  },
  {
    id: 'shadow',
    name: 'Теневой',
    description: 'Тёмная версия питомца',
    color: '#4A148C',
    price: 800,
    preview: 'linear-gradient(135deg, #4A148C, #1A0B2E)',
  },
  {
    id: 'rainbow',
    name: 'Радужный',
    description: 'Переливается всеми цветами',
    color: '#FF80AB',
    price: 1500,
    preview: 'linear-gradient(135deg, #FF6B6B, #FFE082, #76FF03, #4FC3F7, #9C4DCC)',
  },
  {
    id: 'neon',
    name: 'Неоновый',
    description: 'Светящийся неон',
    color: '#76FF03',
    price: 2000,
    preview: 'linear-gradient(135deg, #76FF03, #4FC3F7)',
  },
  {
    id: 'cosmic',
    name: 'Космический',
    description: 'Звёздная пыль',
    color: '#B39DDB',
    price: 3000,
    preview: 'radial-gradient(circle at 30% 30%, #FFFFFF, #B39DDB 40%, #4A148C)',
  },
];