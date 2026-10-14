// Разные типы кристаллов для Match-3 (по описанию — сердца, капли, звёзды)
export const CRYSTALS = [
  { id: 'heart',  emoji: '❤️',  color: '#FF6B6B' },
  { id: 'drop',   emoji: '💧',  color: '#4FC3F7' },
  { id: 'star',   emoji: '⭐',  color: '#FFE082' },
  { id: 'leaf',   emoji: '🍃',  color: '#76FF03' },
  { id: 'moon',   emoji: '🌙',  color: '#E1BEE7' },
  { id: 'crystal',emoji: '💎',  color: '#9C4DCC' },
];

export const BOARD_SIZE = 8;

// Генерация стартовой доски без готовых "три в ряд"
export const generateBoard = () => {
  const board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      let crystal;
      do {
        crystal = CRYSTALS[Math.floor(Math.random() * CRYSTALS.length)];
      } while (
        (c >= 2 && row[c - 1]?.id === crystal.id && row[c - 2]?.id === crystal.id) ||
        (r >= 2 && board[r - 1][c]?.id === crystal.id && board[r - 2][c]?.id === crystal.id)
      );
      row.push(crystal);
    }
    board.push(row);
  }
  return board;
};

// Проверка: есть ли где-то 3+ в ряд (для автоудаления)
export const findMatches = (board) => {
  const matches = new Set();

  // Горизонтальные
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE - 2; c++) {
      const a = board[r][c];
      const b = board[r][c + 1];
      const d = board[r][c + 2];
      if (a && b && d && a.id === b.id && b.id === d.id) {
        matches.add(`${r},${c}`);
        matches.add(`${r},${c + 1}`);
        matches.add(`${r},${c + 2}`);
      }
    }
  }

  // Вертикальные
  for (let c = 0; c < BOARD_SIZE; c++) {
    for (let r = 0; r < BOARD_SIZE - 2; r++) {
      const a = board[r][c];
      const b = board[r + 1][c];
      const d = board[r + 2][c];
      if (a && b && d && a.id === b.id && b.id === d.id) {
        matches.add(`${r},${c}`);
        matches.add(`${r + 1},${c}`);
        matches.add(`${r + 2},${c}`);
      }
    }
  }

  return matches;
};