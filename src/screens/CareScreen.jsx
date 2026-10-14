import React, { useState, useEffect, useRef } from 'react';
import './CareScreen.css';
import NeonButton from '../components/NeonButton';
import ProgressBar from '../components/ProgressBar';
import PetSprite from '../components/PetSprite';

function CareScreen({ pet, activeSkin = 'default', initialMode = 'sleep', onBack, onUpdate, pushToast }) {
  const [mode, setMode] = useState(initialMode); // 'sleep' | 'wash'
  const [progress, setProgress] = useState(0);   // 0–100
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  // ==== Настройки действий ====
  const actions = {
    sleep: {
      id: 'sleep',
      title: 'Сон',
      emoji: '🛏',
      icon: '😴',
      stat: 'energy',
      statLabel: 'Энергия',
      statColor: 'cyan',
      duration: 5, // секунд (для теста)
      restore: 50, // сколько восстанавливает
      mood: 'sleepy',
      description: 'Питомец восстанавливает силы во сне',
    },
    wash: {
      id: 'wash',
      title: 'Умывание',
      emoji: '🚿',
      icon: '✨',
      stat: 'cleanliness',
      statLabel: 'Чистота',
      statColor: 'green',
      duration: 5,
      restore: 50,
      mood: 'happy',
      description: 'Питомец становится чистым и свежим',
    },
  };

  const action = actions[mode];
  const currentValue = pet[action.stat] || 0;

  // ==== Запуск процесса ====
  const startAction = () => {
    if (running || done) return;
    setRunning(true);
    setProgress(0);

    const startTime = Date.now();
    const durationMs = action.duration * 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(p);

      if (p >= 100) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
        setDone(true);

        // Применяем эффект
        onUpdate((prev) => ({
          ...prev,
          [action.stat]: Math.min(100, (prev[action.stat] || 0) + action.restore),
          happiness: Math.min(100, (prev.happiness || 0) + 5), // +5 счастья бонусом
        }));

        pushToast({
          icon: action.emoji,
          title: `${action.title} завершено!`,
          desc: `${action.statLabel} +${action.restore} · Счастье +5`,
          type: 'success',
        });
      }
    }, 50);
  };

  // ==== Сброс при смене режима ====
  useEffect(() => {
    setProgress(0);
    setRunning(false);
    setDone(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [mode]);

  // ==== Очистка ====
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="screen care-screen">
      <div className="care-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">CARE</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Табы */}
      <div className="care-tabs">
        <button
          className={`care-tab ${mode === 'sleep' ? 'active' : ''}`}
          onClick={() => setMode('sleep')}
          disabled={running}
        >
          <span className="care-tab-icon">🛏</span>
          <span className="care-tab-label">Сон</span>
        </button>
        <button
          className={`care-tab ${mode === 'wash' ? 'active' : ''}`}
          onClick={() => setMode('wash')}
          disabled={running}
        >
          <span className="care-tab-icon">🚿</span>
          <span className="care-tab-label">Умывание</span>
        </button>
      </div>

      {/* Сцена */}
      <div className={`care-stage mode-${mode} ${running ? 'running' : ''} ${done ? 'done' : ''}`}>
        {/* Фоновые пузырьки для умывания */}
        {mode === 'wash' && running && (
          <>
            <div className="bubble b1">💧</div>
            <div className="bubble b2">💧</div>
            <div className="bubble b3">💧</div>
            <div className="bubble b4">✨</div>
            <div className="bubble b5">✨</div>
            <div className="bubble b6">💧</div>
          </>
        )}

        {/* ZZZ для сна */}
        {mode === 'sleep' && running && (
          <div className="zzz-wrap">
            <span className="z z1">💤</span>
            <span className="z z2">💤</span>
            <span className="z z3">💤</span>
          </div>
        )}

        {/* Питомец */}
        <div className="care-pet">
          <PetSprite
            speciesId={pet.speciesId}
            size={160}
            skin={activeSkin}
            mood={running ? action.mood : 'idle'}
          />
        </div>

        {/* Подушка / ванна */}
        {mode === 'sleep' && <div className="care-prop care-pillow">🛏</div>}
        {mode === 'wash' && <div className="care-prop care-bath">🛁</div>}
      </div>

      {/* Информация и прогресс */}
      <div className="care-info">
        <div className="care-stat-row">
          <span className="care-stat-label">
            {action.icon} {action.statLabel}
          </span>
          <span className="care-stat-value">{Math.round(currentValue)} / 100</span>
        </div>
        <ProgressBar
          value={currentValue}
          color={action.statColor}
          showText={false}
        />

        <p className="care-desc">{action.description}</p>

        {running && (
          <div className="care-progress-wrap">
            <ProgressBar value={progress} color="orange" showText={false} />
            <span className="care-progress-text">{Math.round(progress)}%</span>
          </div>
        )}

        {done && (
          <div className="care-done">
            ✅ +{action.restore} {action.statLabel} · +5 😊
          </div>
        )}
      </div>

      {/* Кнопка */}
      <div className="care-actions">
        {!running && !done && (
          <NeonButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={startAction}
            icon={action.icon}
            disabled={currentValue >= 100}
          >
            {currentValue >= 100
              ? `${action.statLabel} полная`
              : mode === 'sleep' ? 'Уложить спать' : 'Начать умывание'}
          </NeonButton>
        )}

        {running && (
          <div className="care-running">
            {mode === 'sleep' ? '😴 Спокойной ночи...' : '🚿 Моем лапки...'}
          </div>
        )}

        {done && (
          <NeonButton
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onBack}
            icon="✓"
          >
            Готово
          </NeonButton>
        )}
      </div>
    </div>
  );
}

export default CareScreen;