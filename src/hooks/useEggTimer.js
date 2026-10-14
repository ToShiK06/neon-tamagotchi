import { useEffect, useState, useRef } from 'react';

/**
 * Возвращает оставшееся время до готовности яйца.
 * Тикает каждую секунду.
 * Обрабатывает готовность БЕЗ зависимости от родительского состояния —
 * через "снимок" яиц в ref.
 */
export function useEggTimer(eggs, onHatch) {
  const [, setTick] = useState(0);
  const hatchedRef = useRef(new Set());
  const eggsRef = useRef(eggs);
  const onHatchRef = useRef(onHatch);

  // Обновляем ссылки без перезапуска таймера
  useEffect(() => {
    eggsRef.current = eggs;
  }, [eggs]);

  useEffect(() => {
    onHatchRef.current = onHatch;
  }, [onHatch]);

  // Один раз запускаем интервал
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);

      const now = Date.now();
      const currentEggs = eggsRef.current || [];

      currentEggs.forEach((egg) => {
        if (!egg.hatched && egg.readyAt <= now && !hatchedRef.current.has(egg.id)) {
          hatchedRef.current.add(egg.id);
          if (onHatchRef.current) {
            onHatchRef.current(egg.id);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []); // ← ПУСТОЙ массив! Интервал создаётся один раз

  const getRemaining = (egg) => {
    const remain = Math.max(0, egg.readyAt - Date.now());
    const h = Math.floor(remain / 3600000);
    const m = Math.floor((remain % 3600000) / 60000);
    const s = Math.floor((remain % 60000) / 1000);
    return { h, m, s, total: remain };
  };

  return { getRemaining };
}