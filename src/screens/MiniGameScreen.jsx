import React, { useState, useCallback, useRef, useEffect } from 'react';
import './MiniGameScreen.css';
import NeonButton from '../components/NeonButton';
import { BOARD_SIZE, CRYSTALS, generateBoard, findMatches } from '../data/minigame';

const SWIPE_THRESHOLD = 20; // минимальное расстояние свайпа в пикселях

function MiniGameScreen({ pet, activeSkin = 'default', onBack, onReward }) {
  const [board, setBoard] = useState(() => generateBoard());
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [animating, setAnimating] = useState(false);
  const [combo, setCombo] = useState(0);
  const [flashCells, setFlashCells] = useState(new Set());

  const boardRef = useRef(null);
  const touchStartRef = useRef(null);
  const cascadeRef = useRef(null);

  // ==== Каскад ====
  const resolveCascades = useCallback((currentBoard, addedScore = 0, comboCount = 0) => {
    const matches = findMatches(currentBoard);

    if (matches.size === 0) {
      setBoard(currentBoard);
      setAnimating(false);
      if (comboCount >= 2) setCombo(comboCount);
      return;
    }

    setFlashCells(matches);

    setTimeout(() => {
      setFlashCells(new Set());

      const cleared = currentBoard.map((row) => row.slice());
      matches.forEach((key) => {
        const [mr, mc] = key.split(',').map(Number);
        cleared[mr][mc] = null;
      });

      for (let col = 0; col < BOARD_SIZE; col++) {
        const values = [];
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
          if (cleared[row][col]) values.push(cleared[row][col]);
        }
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
          cleared[row][col] =
            values[BOARD_SIZE - 1 - row] ||
            CRYSTALS[Math.floor(Math.random() * CRYSTALS.length)];
        }
      }

      const comboBonus = matches.size >= 5 ? 2 : 1;
      const newScore = addedScore + matches.size * 10 * comboBonus;

      setBoard(cleared);
      setScore((s) => s + matches.size * 10 * comboBonus);

      cascadeRef.current = setTimeout(() => {
        resolveCascades(cleared, newScore, comboCount + 1);
      }, 400);
    }, 350);
  }, []);

  // ==== Логика свапа ====
  const trySwap = useCallback((from, to) => {
    if (moves <= 0 || animating) return;

    const dist = Math.abs(from.r - to.r) + Math.abs(from.c - to.c);
    if (dist !== 1) return;

    const swapped = board.map((row) => row.slice());
    [swapped[from.r][from.c], swapped[to.r][to.c]] = [swapped[to.r][to.c], swapped[from.r][from.c]];

    const matches = findMatches(swapped);
    if (matches.size === 0) {
      setSelected(null);
      return;
    }

    setSelected(null);
    setAnimating(true);
    setBoard(swapped);
    setMoves((m) => m - 1);
    setCombo(0);

    resolveCascades(swapped, 0, 0);
  }, [board, moves, animating, resolveCascades]);

  // ==== Тап (десктоп / первый тап на телефоне) ====
  const handleCellClick = useCallback((r, c) => {
    if (moves <= 0 || animating) return;

    if (!selected) {
      setSelected({ r, c });
      return;
    }

    if (selected.r === r && selected.c === c) {
      setSelected(null);
      return;
    }

    trySwap(selected, { r, c });
  }, [selected, moves, animating, trySwap]);

  // ==== Touch — свайп-управление ====
  const handleTouchStart = useCallback((e, r, c) => {
    if (moves <= 0 || animating) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      r,
      c,
    };

    // Также выделяем клетку для визуальной обратной связи
    setSelected({ r, c });
  }, [moves, animating]);

  const handleTouchMove = useCallback((e) => {
  if (!touchStartRef.current || moves <= 0 || animating) return;

  // НЕ вызываем preventDefault — он падает в passive listener.
  // Скролл блокируется через CSS touch-action: none.

  const touch = e.touches[0];
  const dx = touch.clientX - touchStartRef.current.x;
  const dy = touch.clientY - touchStartRef.current.y;

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

  const { r, c } = touchStartRef.current;

  let targetR = r;
  let targetC = c;

  if (Math.abs(dx) > Math.abs(dy)) {
    targetC = dx > 0 ? c + 1 : c - 1;
  } else {
    targetR = dy > 0 ? r + 1 : r - 1;
  }

  if (targetR < 0 || targetR >= BOARD_SIZE || targetC < 0 || targetC >= BOARD_SIZE) {
    touchStartRef.current = null;
    return;
  }

  trySwap({ r, c }, { r: targetR, c: targetC });
  touchStartRef.current = null;
}, [moves, animating, trySwap]);

  const handleTouchEnd = useCallback(() => {
    // Если свайпа не было, а был простой тап — оставляем selected для второго тапа
    // (это работает для десктопного сценария)
    // Через 500мс сбрасываем если не было второго тапа
    if (touchStartRef.current) {
      setTimeout(() => {
        if (touchStartRef.current) {
          touchStartRef.current = null;
          // Не сбрасываем selected — даём игроку сделать второй тап
        }
      }, 500);
    }
  }, []);

  // Очистка таймеров
  useEffect(() => {
    return () => {
      if (cascadeRef.current) clearTimeout(cascadeRef.current);
    };
  }, []);

  const finish = () => {
    const earnedCoins = Math.floor(score / 5);
    const earnedXp = Math.floor(score / 10);
    onReward(earnedXp, earnedCoins, score);
  };

  return (
    <div className="screen minigame-screen">
      <div className="minigame-topbar">
        <button className="icon-btn" onClick={onBack}>←</button>
        <h1 className="title-glow">MATCH-3</h1>
        <div className="score-pill">
          <span>⭐</span>
          <span>{score}</span>
        </div>
      </div>

      <div className="minigame-info">
        <span>Ходы: <strong>{moves}</strong></span>
        {combo >= 2 && <span className="combo-badge">🔥 ×{combo}</span>}
        <span className="hint-swipe">👆 Свайп или тап</span>
      </div>

      <div
        ref={boardRef}
        className={`board-wrap ${animating ? 'board-animating' : ''}`}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="board">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selected?.r === r && selected?.c === c;
              const isFlashing = flashCells.has(`${r},${c}`);
              return (
                <button
                  key={`${r}-${c}`}
                  className={`cell ${isSelected ? 'selected' : ''} ${isFlashing ? 'flashing' : ''}`}
                  onClick={() => handleCellClick(r, c)}
                  onTouchStart={(e) => handleTouchStart(e, r, c)}
                  disabled={moves <= 0 || animating}
                >
                  <span className="cell-emoji">{cell?.emoji || '·'}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {moves <= 0 && (
        <div className="minigame-result">
          <h2>Игра окончена!</h2>
          <p>Очки: <strong>{score}</strong></p>
          <p>Монеты: <strong>🪙 {Math.floor(score / 5)}</strong></p>
          <NeonButton variant="primary" size="lg" fullWidth onClick={finish} icon="🎁">
            Забрать награду
          </NeonButton>
        </div>
      )}
    </div>
  );
}

export default MiniGameScreen;