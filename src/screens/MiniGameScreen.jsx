import React, { useState, useCallback, useEffect, useRef } from 'react';
import './MiniGameScreen.css';
import NeonButton from '../components/NeonButton';
import { BOARD_SIZE, CRYSTALS, generateBoard, findMatches } from '../data/minigame';

function MiniGameScreen({ pet, onBack, onReward }) {
  const [board, setBoard] = useState(() => generateBoard());
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [animating, setAnimating] = useState(false);
  const [combo, setCombo] = useState(0);
  const [flashCells, setFlashCells] = useState(new Set());
  const cascadeRef = useRef(null);

  // ==== Падение и каскад ====
  const resolveCascades = useCallback((currentBoard, addedScore = 0, comboCount = 0) => {
    const matches = findMatches(currentBoard);

    if (matches.size === 0) {
      // Конец каскада
      setBoard(currentBoard);
      setAnimating(false);
      if (comboCount >= 2) setCombo(comboCount);
      return;
    }

    // Показываем вспышку
    setFlashCells(matches);

    setTimeout(() => {
      setFlashCells(new Set());

      // Убираем
      const cleared = currentBoard.map((row) => row.slice());
      matches.forEach((key) => {
        const [mr, mc] = key.split(',').map(Number);
        cleared[mr][mc] = null;
      });

      // Падение
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

      // Продолжаем каскад
      cascadeRef.current = setTimeout(() => {
        resolveCascades(cleared, newScore, comboCount + 1);
      }, 400);
    }, 350);
  }, []);

  // ==== Клик по ячейке ====
  const handleClick = useCallback((r, c) => {
    if (moves <= 0 || animating) return;

    if (!selected) {
      setSelected({ r, c });
      return;
    }

    if (selected.r === r && selected.c === c) {
      setSelected(null);
      return;
    }

    const dist = Math.abs(selected.r - r) + Math.abs(selected.c - c);
    if (dist !== 1) {
      setSelected({ r, c });
      return;
    }

    // Свап
    const swapped = board.map((row) => row.slice());
    [swapped[selected.r][selected.c], swapped[r][c]] = [swapped[r][c], swapped[selected.r][selected.c]];

    // Проверка, есть ли совпадения
    const matches = findMatches(swapped);

    if (matches.size === 0) {
      // Свап неудачен — откат
      setSelected(null);
      return;
    }

    // Свап удачен — применяем
    setSelected(null);
    setAnimating(true);
    setBoard(swapped);
    setMoves((m) => m - 1);
    setCombo(0);

    // Запускаем каскад
    resolveCascades(swapped, 0, 0);
  }, [board, selected, moves, animating, resolveCascades]);

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
        {combo >= 2 && <span className="combo-badge">🔥 Комбо ×{combo}</span>}
        <span>Питомец: <strong>{pet.name}</strong></span>
      </div>

      <div className="board-wrap">
        <div className={`board ${animating ? 'board-animating' : ''}`}>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selected?.r === r && selected?.c === c;
              const isFlashing = flashCells.has(`${r},${c}`);
              return (
                <button
                  key={`${r}-${c}`}
                  className={`cell ${isSelected ? 'selected' : ''} ${isFlashing ? 'flashing' : ''}`}
                  onClick={() => handleClick(r, c)}
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