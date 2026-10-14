import { useEffect } from 'react';

/**
 * Раз в минуту уменьшает статы у всех питомцев:
 * - голод (-2)
 * - счастье (-1)
 * - энергия (-1)
 * - чистота (-1)
 * Если питомец "живой" (в списке есть) — он потихоньку грустит.
 */
export function usePetDecay(pets, setPets) {
  useEffect(() => {
    const interval = setInterval(() => {
      setPets((prev) =>
        prev.map((p) => ({
          ...p,
          hunger: Math.max(0, (p.hunger ?? 100) - 2),
          happiness: Math.max(0, (p.happiness ?? 100) - 1),
          energy: Math.max(0, (p.energy ?? 100) - 1),
          cleanliness: Math.max(0, (p.cleanliness ?? 100) - 1),
        }))
      );
    }, 60000); // раз в минуту

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}