import React, { useEffect, useRef } from 'react';
import './InteractiveBackground.css';

function InteractiveBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const ripplesRef = useRef([]);
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

      // Дистанция движения
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Спавним частицы каждые N пикселей
      if (dist > 5 && lastX > -1000) {
        const count = Math.min(3, Math.floor(dist / 15) + 1);
        for (let i = 0; i < count; i++) {
          particlesRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 20,
            y: e.clientY + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 1.5 - 0.5,
            size: 1 + Math.random() * 3,
            life: 1,
            decay: 0.015 + Math.random() * 0.01,
            hue: 260 + Math.random() * 60, // фиолетовый-розовый
          });
        }
      }

      // Рябь при быстром движении
      if (dist > 30 && Math.random() < 0.3) {
        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 0,
          maxRadius: 60 + Math.random() * 40,
          life: 1,
          decay: 0.025,
        });
      }
    };

    // ==== Клик — большая волна ====
    const onClick = (e) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 150,
        life: 1,
        decay: 0.02,
      });
      // Всплеск частиц
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * (1 + Math.random() * 2),
          vy: Math.sin(angle) * (1 + Math.random() * 2),
          size: 2 + Math.random() * 3,
          life: 1,
          decay: 0.02,
          hue: 260 + Math.random() * 100,
        });
      }
    };

    // ==== Touch ====
    const onTouchMove = (e) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      onMouseMove({ clientX: t.clientX, clientY: t.clientY });
    };
    const onTouchStart = (e) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      onClick({ clientX: t.clientX, clientY: t.clientY });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    // ==== Анимация ====
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ==== Частицы ====
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // лёгкая гравитация
        p.vx *= 0.98;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Отрисовка
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        const alpha = p.life * 0.8;
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // ==== Рябь ====
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.08;
        r.life -= r.decay;

        if (r.life <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(179, 157, 219, ${r.life * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Второе кольцо
        if (r.radius > 20) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 128, 171, ${r.life * 0.4})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // ==== Прицел (мягкое свечение вокруг курсора) ====
      if (mouseRef.current.x > 0) {
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 120
        );
        gradient.addColorStop(0, 'rgba(179, 157, 219, 0.15)');
        gradient.addColorStop(1, 'rgba(179, 157, 219, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-bg-canvas" />;
}

export default InteractiveBackground;