import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CatchGameScreen.css';
import NeonButton from '../components/NeonButton';
import PetSprite from '../components/PetSprite';
import { pickFallingItem, GAME_CONFIG } from '../data/catchGame';

function CatchGameScreen({ pet, activeSkin = 'default', onBack, onReward }) {
  const [gameState, setGameState] = useState('ready'); // ready | playing | result
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.duration);
  const [score, setScore] = useState(0);
  const [petX, setPetX] = useState(50);
  const [items, setItems] = useState([]);
  const [catches, setCatches] = useState({ good: 0, bad: 0 });
  const [statChanges, setStatChanges] = useState({ hunger: 0, happiness: 0 });

  const stageRef = useRef(null);
  const keysRef = useRef({ left: false, right: false });
  const rafRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const itemsRef = useRef([]);
  const petXRef = useRef(50);
  const lastUpdateRef = useRef(performance.now());

  // ==== Движение мышью/пальцем ====
  const handlePointerMove = (e) => {
  if (gameState !== 'playing') return;
  const rect = stageRef.current?.getBoundingClientRect();
  if (!rect) return;

  // НЕ вызываем preventDefault — он падает в passive listener.
  // Скролл блокируется через CSS touch-action: none.

  const clientX = e.touches && e.touches.length > 0
    ? e.touches[0].clientX
    : e.clientX;

  const percent = ((clientX - rect.left) / rect.width) * 100;
  setPetX(Math.max(5, Math.min(95, percent)));
};

  // ==== Управление стрелками ====
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Синхронизация petX и items в ref
  useEffect(() => { petXRef.current = petX; }, [petX]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // ==== Старт игры ====
  const startGame = () => {
    setGameState('playing');
    setTimeLeft(GAME_CONFIG.duration);
    setScore(0);
    setItems([]);
    setCatches({ good: 0, bad: 0 });
    setStatChanges({ hunger: 0, happiness: 0 });
    setPetX(50);
    lastUpdateRef.current = performance.now();

    // Таймер
    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current);
          setGameState('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Спавн предметов
    spawnTimerRef.current = setInterval(() => {
      const item = pickFallingItem();
      setItems((prev) => [
        ...prev,
        {
          ...item,
          id: `item_${Date.now()}_${Math.random()}`,
          x: 10 + Math.random() * 80,
          y: -5,
        },
      ]);
    }, GAME_CONFIG.spawnInterval);
  };

  // ==== Остановка ====
  const stopGame = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    spawnTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  // ==== Игровой цикл ====
  useEffect(() => {
    if (gameState !== 'playing') return;

    const tick = (now) => {
      const dt = Math.min((now - lastUpdateRef.current) / 16, 3);
      lastUpdateRef.current = now;

      // Движение питомца стрелками
      if (keysRef.current.left) {
        setPetX((x) => Math.max(5, x - GAME_CONFIG.petSpeed * dt * 0.6));
      }
      if (keysRef.current.right) {
        setPetX((x) => Math.min(95, x + GAME_CONFIG.petSpeed * dt * 0.6));
      }

      // ==== Прогрессивная сложность ====
      const elapsed = GAME_CONFIG.duration - timeLeft;
      const progress = Math.min(1, Math.max(0, elapsed / GAME_CONFIG.duration));
      const currentFallSpeed =
        GAME_CONFIG.fallSpeed +
        (GAME_CONFIG.fallSpeedMax - GAME_CONFIG.fallSpeed) * progress;

      // Падение предметов
      setItems((prevItems) => {
        const next = [];
        let scoreDelta = 0;
        let statHDelta = 0;
        let statPDelta = 0;
        let goodCaught = 0;
        let badCaught = 0;

        for (const item of prevItems) {
          const newY = item.y + currentFallSpeed * dt;
          const horizontal = Math.abs(item.x - petXRef.current);

          // Ловля
          if (newY >= 78 && newY <= 92 && horizontal < 10) {
            scoreDelta += item.points;
            if (item.type === 'good') {
              goodCaught++;
              if (item.stat === 'hunger') statHDelta += item.statBonus;
              if (item.stat === 'happiness') statPDelta += item.statBonus;
            } else {
              badCaught++;
              if (item.stat === 'hunger') statHDelta += item.statBonus;
              if (item.stat === 'happiness') statPDelta += item.statBonus;
            }
            continue;
          }

          if (newY > 105) continue;

          next.push({ ...item, y: newY });
        }

        if (scoreDelta !== 0) setScore((s) => s + scoreDelta);
        if (goodCaught > 0 || badCaught > 0) {
          setCatches((c) => ({ good: c.good + goodCaught, bad: c.bad + badCaught }));
        }
        if (statHDelta !== 0 || statPDelta !== 0) {
          setStatChanges((s) => ({
            hunger: Math.max(-100, Math.min(100, s.hunger + statHDelta)),
            happiness: Math.max(-100, Math.min(100, s.happiness + statPDelta)),
          }));
        }

        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState, timeLeft]); // ← добавили timeLeft, чтобы скорость пересчитывалась

  // ==== Очистка ====
  useEffect(() => {
    return () => {
      stopGame();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stopGame]);

  // ==== Забрать награду ====
  const claimReward = () => {
    const coinReward = Math.max(0, Math.floor(score / 3));
    const xpReward = Math.max(0, Math.floor(score / 5));
   onReward({
  coins: coinReward,
  xp: xpReward,
  hunger: statChanges.hunger,
  happiness: statChanges.happiness,
  score,  // ← добавили
});
  };

  // ==== Текущая скорость падения (для индикатора) ====
  const elapsed = GAME_CONFIG.duration - timeLeft;
  const progress = Math.min(1, Math.max(0, elapsed / GAME_CONFIG.duration));
  const displaySpeed =
    GAME_CONFIG.fallSpeed +
    (GAME_CONFIG.fallSpeedMax - GAME_CONFIG.fallSpeed) * progress;

  const speedIcon =
    timeLeft > 20 ? '🐌' :
    timeLeft > 10 ? '🚶' :
    '⚡';

  return (
    <div className="screen catch-game-screen">
      <div className="catch-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">CATCH THE FOOD</h1>
        <div className="catch-timer-pill">
          <span>⏱</span>
          <span>{timeLeft}s</span>
        </div>
      </div>

      <div className="catch-info">
        <span>Очки: <strong>{score}</strong></span>
        <span className="catch-good">✨ {catches.good}</span>
        <span className="catch-bad">💀 {catches.bad}</span>
        {gameState === 'playing' && (
          <span className="catch-speed">
            {speedIcon} ×{displaySpeed.toFixed(1)}
          </span>
        )}
      </div>

      <div
  ref={stageRef}
  className={`catch-stage ${gameState === 'playing' ? 'active' : ''}`}
  onMouseMove={handlePointerMove}
  onTouchMove={handlePointerMove}
  onTouchStart={handlePointerMove}
>
        <div className="catch-bg-grass"></div>
        <div className="catch-bg-stars"></div>

        {items.map((item) => (
          <div
            key={item.id}
            className={`catch-item ${item.type}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {item.emoji}
          </div>
        ))}

        <div className="catch-pet" style={{ left: `${petX}%` }}>
          <PetSprite
            speciesId={pet.speciesId}
            size={90}
            skin={activeSkin}
            mood={gameState === 'playing' ? 'happy' : 'idle'}
          />
        </div>

        <div className="catch-zone"></div>

        {gameState === 'ready' && (
          <div className="catch-overlay">
            <div className="catch-overlay-card">
              <h2>🎮 CATCH THE FOOD</h2>
              <p>Двигай питомца <strong>мышью</strong>, <strong>пальцем</strong> или <strong>стрелками</strong></p>
              <p>Ловит <strong>вкусняшки</strong> — избегай <strong>поганок</strong> и <strong>бомб</strong></p>
              <div className="catch-legend">
                <span>🍎 +5</span>
                <span>🍔 +10</span>
                <span>🍕 +12</span>
                <span>🍣 +15</span>
                <span>🍰 +20</span>
                <span>⭐ +30</span>
              </div>
              <div className="catch-legend bad">
                <span>🥦 −5</span>
                <span>🍄 −10</span>
                <span>💣 −20</span>
              </div>
              <NeonButton variant="primary" size="lg" fullWidth onClick={startGame} icon="▶">
                Начать игру
              </NeonButton>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="catch-overlay">
            <div className="catch-overlay-card result">
              <h2>🏆 Игра окончена!</h2>
              <p className="big-score">Очки: <strong>{score}</strong></p>
              <div className="catch-result-stats">
                <div>
                  <span className="stat-label">✨ Хороших</span>
                  <span className="stat-value">{catches.good}</span>
                </div>
                <div>
                  <span className="stat-label">💀 Плохих</span>
                  <span className="stat-value">{catches.bad}</span>
                </div>
                <div>
                  <span className="stat-label">🍖 Сытость</span>
                  <span className="stat-value" style={{ color: statChanges.hunger >= 0 ? '#76FF03' : '#FF6B6B' }}>
                    {statChanges.hunger >= 0 ? '+' : ''}{statChanges.hunger}
                  </span>
                </div>
                <div>
                  <span className="stat-label">😊 Счастье</span>
                  <span className="stat-value" style={{ color: statChanges.happiness >= 0 ? '#76FF03' : '#FF6B6B' }}>
                    {statChanges.happiness >= 0 ? '+' : ''}{statChanges.happiness}
                  </span>
                </div>
                <div>
                  <span className="stat-label">🪙 Монеты</span>
                  <span className="stat-value">+{Math.max(0, Math.floor(score / 3))}</span>
                </div>
                <div>
                  <span className="stat-label">📈 XP</span>
                  <span className="stat-value">+{Math.max(0, Math.floor(score / 5))}</span>
                </div>
              </div>
              <div className="catch-result-actions">
                <NeonButton variant="secondary" size="md" onClick={() => { setGameState('ready'); stopGame(); }} icon="🔄">
                  Ещё
                </NeonButton>
                <NeonButton variant="primary" size="md" onClick={claimReward} icon="🎁">
                  Забрать
                </NeonButton>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="catch-hint">
        {gameState === 'playing'
          ? '🎯 Двигай питомца — лови вкусняшки!'
          : 'Нажми «Начать игру»'}
      </div>
    </div>
  );
}

export default CatchGameScreen;