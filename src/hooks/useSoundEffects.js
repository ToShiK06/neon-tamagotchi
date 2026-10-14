import { useState, useCallback } from 'react';

export function useSoundEffects() {
  const [enabled, setEnabled] = useState(true);

  const toggle = useCallback(() => {
    setEnabled((v) => !v);
  }, []);

  // Заглушка для звуков — в будущем можно добавить Web Audio эффекты
  const play = useCallback((soundName) => {
    if (!enabled) return;
    // TODO: реальные звуки клика/уведомлений
    // console.log('[sound]', soundName);
  }, [enabled]);

  return { enabled, toggle, play };
}