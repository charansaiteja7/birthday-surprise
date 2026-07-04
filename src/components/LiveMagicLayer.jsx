import { useEffect, useRef } from 'react';

const palettes = {
  opening: ['#ff8fab', '#fff3a3', '#bde0fe'],
  stage2: ['#ffffff', '#ff8fab', '#ffd166'],
  stage4: ['#f8d8aa', '#fff6df', '#a7714f'],
  stage5: ['#caffbf', '#ffc8dd', '#bde0fe'],
  stage6: ['#fff3a3', '#ff8fab', '#8fb8ff'],
  stage7: ['#ffffff', '#ffc8dd', '#bde0fe'],
  stage8: ['#fff3a3', '#ffffff', '#bde0fe'],
  stage9: ['#ff8fab', '#fff3a3', '#ffffff'],
  stage10: ['#ff8fab', '#ffd166', '#caffbf', '#bde0fe'],
};

export default function LiveMagicLayer({ mood }) {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const colors = palettes[mood] || palettes.opening;
    let raf = 0;
    let width = 0;
    let height = 0;
    let particles = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.min(48, Math.max(18, Math.floor(width / 26))) }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.5,
        vx: -0.11 + Math.random() * 0.22,
        vy: -0.14 - Math.random() * 0.3,
        pulse: Math.random() * Math.PI * 2,
        color: colors[index % colors.length],
      }));
    }

    function move(event) {
      pointer.current = { x: event.clientX, y: event.clientY };
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach((particle) => {
        const dx = pointer.current.x - particle.x;
        const dy = pointer.current.y - particle.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 150) {
          particle.vx -= dx * 0.00001;
          particle.vy -= dy * 0.00001;
        }
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.035;

        if (particle.y < -20) particle.y = height + 20;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;

        const glow = particle.r + Math.sin(particle.pulse) * 0.8;
        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.15 + Math.sin(particle.pulse) * 0.07;
        ctx.arc(particle.x, particle.y, Math.max(0.6, glow), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
    };
  }, [mood]);

  return <canvas ref={canvasRef} className="live-magic-layer" aria-hidden="true" />;
}
