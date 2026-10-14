import React, { useEffect, useRef } from 'react';
import './InteractiveBackground.css';

function InteractiveBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, lastX: -1000, lastY: -1000 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ==== Движение мыши ====
    const onMouseMove = (e) => {
      const { x: lastX, y: lastY } = mouseRef.current;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Спавним частицы только при движении
      if (dist > 15 && lastX > -1000) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 0.8 - 0.3,
          size: 1 + Math.random() * 2,
          life: 1,
          decay: 0.02,
          hue: 260 + Math.random() * 60,
        });

        // Ограничиваем массив — макс 40 частиц
        if (particlesRef.current.length > 40) {
          particlesRef.current = particlesRef.current.slice(-40);
        }
      }
    };

    // ==== Touch ====
    const onTouchMove = (e) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      onMouseMove({ clientX: t.clientX, clientY: t.clientY });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // ==== Анимация ====
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        p.vx *= 0.98;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        const alpha = p.life * 0.6;
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-bg-canvas" />;
}

export default InteractiveBackground;