import { useEffect, useRef, useState } from 'react';

export function useMusic() {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolumeState] = useState(0.3);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const timersRef = useRef([]);
  const startedRef = useRef(false);

  const start = async () => {
    if (ctxRef.current) return;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    await ctx.resume();
    ctxRef.current = ctx;

    // ==== Мастер-громкость ====
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    masterRef.current = master;

    // ==== 1. Бас-дрон (низкий гул) ====
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.15;
    droneGain.connect(master);

    const drone1 = ctx.createOscillator();
    drone1.type = 'sine';
    drone1.frequency.value = 60;
    const drone2 = ctx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 60 * 1.005;

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 200;

    drone1.connect(droneFilter);
    drone2.connect(droneFilter);
    droneFilter.connect(droneGain);
    drone1.start();
    drone2.start();

    // ==== 2. Шелест / ветер ====
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 500;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.03;

    // LFO для "дыхания"
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(noiseGain.gain);
    lfo.start();

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();

    // ==== 3. Мягкие аккорды (пентатоника) ====
    // Ноты: C4, D4, E4, G4, A4, C5
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

    const playSoftNote = () => {
      if (!ctxRef.current) return;
      const c = ctxRef.current;
      const freq = notes[Math.floor(Math.random() * notes.length)];

      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Мягкая атака и длинный релиз
      const env = c.createGain();
      env.gain.setValueAtTime(0, c.currentTime);
      env.gain.linearRampToValueAtTime(0.08, c.currentTime + 1.2);
      env.gain.linearRampToValueAtTime(0.06, c.currentTime + 2.5);
      env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 5);

      // Лёгкий реверб через задержку
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;

      osc.connect(filter);
      filter.connect(env);
      env.connect(masterRef.current);

      osc.start();
      osc.stop(c.currentTime + 5.2);
    };

    const scheduleChord = () => {
      const delay = 4000 + Math.random() * 5000; // 4–9 сек между нотами
      const t = setTimeout(() => {
        playSoftNote();
        // Иногда две ноты подряд (аккорд)
        if (Math.random() < 0.3) {
          setTimeout(playSoftNote, 200);
        }
        scheduleChord();
      }, delay);
      timersRef.current.push(t);
    };
    scheduleChord();

    // ==== 4. Капли (редкие высокие звуки) ====
    const playDrop = () => {
      if (!ctxRef.current) return;
      const c = ctxRef.current;
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500 + Math.random() * 1000, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.4);

      const env = c.createGain();
      env.gain.setValueAtTime(0, c.currentTime);
      env.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);

      osc.connect(env);
      env.connect(masterRef.current);
      osc.start();
      osc.stop(c.currentTime + 0.6);
    };

    const scheduleDrop = () => {
      const delay = 8000 + Math.random() * 12000;
      const t = setTimeout(() => {
        playDrop();
        scheduleDrop();
      }, delay);
      timersRef.current.push(t);
    };
    scheduleDrop();

    startedRef.current = true;
  };

  const stop = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    masterRef.current = null;
    startedRef.current = false;
  };

  const toggle = () => {
    if (enabled) {
      stop();
      setEnabled(false);
    } else {
      start();
      setEnabled(true);
    }
  };

  const setVolume = (v) => {
    setVolumeState(v);
    if (masterRef.current) {
      masterRef.current.gain.value = v;
    }
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return { enabled, start, stop, toggle, volume, setVolume };
}