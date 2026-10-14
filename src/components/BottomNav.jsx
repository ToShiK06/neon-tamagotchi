import React from 'react';
import './BottomNav.css';

const NAV_ITEMS = [
  { id: 'shop',     icon: '🛒', label: 'Магазин' },
  { id: 'leagues',  icon: '🏆', label: 'Лиги'    },
  { id: 'play',     icon: '🎮', label: 'Играть'  },
  { id: 'events',   icon: '🎉', label: 'События' },
  { id: 'pets',     icon: '🐾', label: 'Питомцы' },
  { id: 'settings', icon: '⚙️', label: 'Опции'   },
];

function BottomNav({ active = 'pets', onChange }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onChange && onChange(item.id)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;