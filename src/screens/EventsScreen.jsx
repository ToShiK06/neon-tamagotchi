import React, { useState, useEffect, useRef } from 'react';
import './EventsScreen.css';

// ==== Конфиг событий: длительность, шаблон, цвет ====
const EVENT_TEMPLATES = [
  {
    id: 'double_xp',
    title: 'Двойной опыт',
    desc: 'Вся игра даёт ×2 XP до конца дня',
    emoji: '⚡',
    color: '#FF9F43',
    durationMs: 12 * 60 * 60 * 1000, // 12 часов
  },
  {
    id: 'rare_egg',
    title: 'Редкие яйца',
    desc: '−30% на редкие яйца в магазине',
    emoji: '🥚',
    color: '#4FC3F7',
    durationMs: 24 * 60 * 60 * 1000, // 24 часа
  },
  {
    id: 'pvp_bonus',
    title: 'PvP Марафон',
    desc: '×2 монеты за победы в PvP',
    emoji: '⚔️',
    color: '#FF6B6B',
    durationMs: 3 * 24 * 60 * 60 * 1000, // 3 дня
  },
  {
    id: 'login_streak',
    title: 'Серия входов',
    desc: 'Заходи 7 дней подряд → легендарное яйцо',
    emoji: '🎁',
    color: '#76FF03',
    durationMs: 5 * 24 * 60 * 60 * 1000, // 5 дней
  },
];

// ==== Инициализация событий с временем окончания ====
const STORAGE_KEY = 'tama_events';

const loadEvents = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Валидация: если событий нет или структура битая — пересоздаём
      if (Array.isArray(saved) && saved.length === EVENT_TEMPLATES.length) {
        return saved;
      }
    }
  } catch (e) {
    console.warn('Events load failed', e);
  }
  // Новые события — у каждого свой endsAt = now + duration
  const now = Date.now();
  return EVENT_TEMPLATES.map((tmpl, i) => ({
    ...tmpl,
    endsAt: now + tmpl.durationMs + i * 1000, // небольшой сдвиг для визуальной разницы
  }));
};

const saveEvents = (events) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Events save failed', e);
  }
};

// ==== Форматирование таймера ====
function formatTimer(ms) {
  if (ms <= 0) return 'Истекло';

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  // Если больше суток — показываем "3д 12:00:45"
  if (days > 0) {
    return `${days}д ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  // Иначе — "08:42:11"
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function EventsScreen({ onBack }) {
  const [events, setEvents] = useState(loadEvents);
  const [, setTick] = useState(0);
  const eventsRef = useRef(events);

  // Обновляем ref при изменении events
  useEffect(() => {
    eventsRef.current = events;
    saveEvents(events);
  }, [events]);

  // Тик каждую секунду
  useEffect(() => {
    const i = setInterval(() => {
      setTick((t) => t + 1);

      // Проверяем, не истекли ли события
      const now = Date.now();
      const current = eventsRef.current;
      let needRestart = false;

      const updated = current.map((ev) => {
        if (ev.endsAt <= now) {
          needRestart = true;
          // Перезапускаем с новой длительностью
          return { ...ev, endsAt: now + ev.durationMs };
        }
        return ev;
      });

      if (needRestart) {
        setEvents(updated);
      }
    }, 1000);

    return () => clearInterval(i);
  }, []);

  return (
    <div className="screen events-screen">
      <div className="events-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">EVENTS</h1>
        <div style={{ width: 40 }} />
      </div>

      <p className="events-sub">Активные события этой недели</p>

      <div className="events-list">
        {events.map((event) => {
          const remain = Math.max(0, event.endsAt - Date.now());
          return (
            <div key={event.id} className="event-card" style={{ borderColor: event.color }}>
              <div
                className="event-emoji"
                style={{ filter: `drop-shadow(0 0 15px ${event.color})` }}
              >
                {event.emoji}
              </div>
              <div className="event-info">
                <div className="event-title">{event.title}</div>
                <div className="event-desc">{event.desc}</div>
                <div className="event-timer">
                  ⏱ до конца: <strong>{formatTimer(remain)}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventsScreen;