import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CONTENT } from '../config/content';
import { useAudio } from '../context/AudioContext';
import { musicEngine } from '../utils/musicEngine';
import { playFirework, playSoftPulse } from '../utils/sounds';

const confettiPieces = Array.from({ length: 28 }, (_, index) => ({
  left: `${6 + ((index * 41) % 89)}%`,
  delay: `${(index % 9) * -0.72}s`,
  duration: `${5.8 + (index % 5) * 0.56}s`,
  color: ['#ff70a6', '#c77dff', '#ffd166', '#72ddf7', '#ff8c69', '#ffffff'][index % 6],
}));

const floatingHearts = [
  { x: '11%', delay: '-0.5s' },
  { x: '29%', delay: '-4.2s' },
  { x: '72%', delay: '-2.1s' },
  { x: '89%', delay: '-6.4s' },
];

const fireworkColors = ['#ffd166', '#ff70a6', '#c77dff', '#72ddf7', '#ff6b6b', '#ff9f43', '#ffffff'];

function FinaleFireworksCanvas({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastLaunch = 0;
    let launchIndex = 0;
    const rockets = [];
    const particles = [];
    const rings = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const colorAt = (offset = 0) => fireworkColors[(launchIndex + offset) % fireworkColors.length];

    const addBurst = (x, y, size = 1, type = 'burst') => {
      const count = Math.round((type === 'sparkle' ? 26 : type === 'ring' ? 38 : 46) * size);
      const color = colorAt();
      const secondary = colorAt(2);

      if (type === 'ring') {
        rings.push({ x, y, radius: 4, speed: 3.2 * size, alpha: 1, color, width: 2.2 });
      }

      for (let index = 0; index < count; index += 1) {
        const angle = type === 'sparkle'
          ? Math.random() * Math.PI * 2
          : (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.08;
        const velocity = (type === 'sparkle' ? 1.4 + Math.random() * 3.2 : 2.6 + Math.random() * 4.7) * size;
        particles.push({
          x,
          y,
          previousX: x,
          previousY: y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          gravity: type === 'ring' ? 0.018 : 0.035 + Math.random() * 0.025,
          friction: 0.982,
          alpha: 1,
          decay: 0.006 + Math.random() * 0.006,
          color: index % 4 === 0 ? secondary : color,
          size: 1.2 + Math.random() * 1.9,
          shimmer: Math.random() > 0.72,
        });
      }
    };

    const launch = (immediate = false) => {
      const types = ['burst', 'ring', 'sparkle', 'burst', 'ring'];
      const type = types[launchIndex % types.length];
      const targetX = width * (0.06 + Math.random() * 0.88);
      const targetY = height * (0.08 + Math.random() * 0.5);
      const size = width < 640 ? 0.72 + Math.random() * 0.32 : 0.9 + Math.random() * 0.55;

      if (immediate || launchIndex % 4 === 2) {
        addBurst(targetX, targetY, size, type);
      } else {
        const fromSide = launchIndex % 5 === 3;
        rockets.push({
          x: fromSide ? (launchIndex % 2 ? -8 : width + 8) : width * (0.12 + Math.random() * 0.76),
          y: fromSide ? height * (0.48 + Math.random() * 0.36) : height + 12,
          targetX,
          targetY,
          vx: 0,
          vy: 0,
          color: colorAt(),
          type,
          size,
          trail: [],
        });
      }
      launchIndex += 1;
    };

    const drawGlow = (x, y, radius, color, alpha) => {
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
      glow.addColorStop(1, `${color}00`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const render = (time) => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      const interval = reduceMotion ? 1500 : width < 640 ? 450 : 290;
      if (time - lastLaunch > interval) {
        launch();
        lastLaunch = time;
      }

      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index];
        rocket.trail.push({ x: rocket.x, y: rocket.y });
        if (rocket.trail.length > 10) rocket.trail.shift();
        rocket.vx += (rocket.targetX - rocket.x) * 0.012;
        rocket.vy += (rocket.targetY - rocket.y) * 0.012;
        rocket.vx *= 0.91;
        rocket.vy *= 0.91;
        rocket.x += rocket.vx;
        rocket.y += rocket.vy;

        context.beginPath();
        context.moveTo(rocket.trail[0]?.x ?? rocket.x, rocket.trail[0]?.y ?? rocket.y);
        rocket.trail.forEach((point) => context.lineTo(point.x, point.y));
        context.strokeStyle = rocket.color;
        context.lineWidth = 2.2;
        context.shadowBlur = 14;
        context.shadowColor = rocket.color;
        context.stroke();
        drawGlow(rocket.x, rocket.y, 14, rocket.color, 0.48);

        if (Math.hypot(rocket.targetX - rocket.x, rocket.targetY - rocket.y) < 12) {
          addBurst(rocket.targetX, rocket.targetY, rocket.size, rocket.type);
          rockets.splice(index, 1);
        }
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.previousX = particle.x;
        particle.previousY = particle.y;
        particle.vx *= particle.friction;
        particle.vy = particle.vy * particle.friction + particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= particle.decay;

        context.beginPath();
        context.moveTo(particle.previousX, particle.previousY);
        context.lineTo(particle.x - particle.vx * 1.8, particle.y - particle.vy * 1.8);
        context.strokeStyle = particle.color;
        context.globalAlpha = particle.shimmer && Math.random() > 0.5 ? particle.alpha * 0.3 : particle.alpha;
        context.lineWidth = particle.size;
        context.shadowBlur = 11;
        context.shadowColor = particle.color;
        context.stroke();

        if (particle.alpha <= 0) particles.splice(index, 1);
      }

      for (let index = rings.length - 1; index >= 0; index -= 1) {
        const ring = rings[index];
        ring.radius += ring.speed;
        ring.alpha -= 0.022;
        context.globalAlpha = Math.max(0, ring.alpha);
        context.strokeStyle = ring.color;
        context.lineWidth = ring.width;
        context.shadowBlur = 18;
        context.shadowColor = ring.color;
        context.beginPath();
        context.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        context.stroke();
        if (ring.alpha <= 0) rings.splice(index, 1);
      }

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      context.globalCompositeOperation = 'source-over';
      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    for (let index = 0; index < (reduceMotion ? 2 : 7); index += 1) launch(true);
    window.addEventListener('resize', resize);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className={`finale-fireworks-canvas${active ? ' is-active' : ''}`}
      aria-hidden="true"
    />
  );
}

export default function Stage10Finale({ onRestart }) {
  const { muted } = useAudio();
  const [showFireworks, setShowFireworks] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const restartButtonRef = useRef(null);

  useEffect(() => {
    const colors = ['#ff9fbe', '#ffd1e1', '#cdb4db', '#ffd8bd', '#fff2a8', '#9fc5ff'];
    const launchConfetti = () => confetti({
      particleCount: 16,
      spread: 62,
      startVelocity: 11,
      gravity: 0.38,
      scalar: 0.68,
      ticks: 170,
      origin: { x: 0.1 + Math.random() * 0.8, y: -0.04 },
      colors,
      zIndex: 3,
    });

    launchConfetti();
    const confettiTimer = window.setInterval(launchConfetti, 680);
    const confettiStop = window.setTimeout(() => window.clearInterval(confettiTimer), 2550);
    const fireworksStart = window.setTimeout(() => setShowFireworks(true), 650);
    const fireworksStop = window.setTimeout(() => setShowFireworks(false), 14000);
    const signatureTimer = window.setTimeout(() => setShowSignature(true), 4000);

    return () => {
      window.clearInterval(confettiTimer);
      window.clearTimeout(confettiStop);
      window.clearTimeout(fireworksStart);
      window.clearTimeout(fireworksStop);
      window.clearTimeout(signatureTimer);
    };
  }, []);

  useEffect(() => {
    if (muted) return undefined;
    const pulseTimer = window.setTimeout(playSoftPulse, 1400);
    return () => window.clearTimeout(pulseTimer);
  }, [muted]);

  useEffect(() => {
    if (!showFireworks || muted) return undefined;
    playFirework();
    const fireworkTimer = window.setInterval(playFirework, 2400);
    return () => window.clearInterval(fireworkTimer);
  }, [muted, showFireworks]);

  useEffect(() => {
    let animationFrame;
    let fadeStartTimer;

    const beginFade = () => {
      const startVolume = musicEngine.volume;
      const endVolume = Math.max(0.12, startVolume * 0.32);
      const fadeDuration = 10000;
      const startTime = performance.now();

      const fadeMusic = (now) => {
        const progress = Math.min((now - startTime) / fadeDuration, 1);
        const eased = 1 - ((1 - progress) ** 2);
        musicEngine.setVolume(startVolume + ((endVolume - startVolume) * eased));
        if (progress < 1) animationFrame = window.requestAnimationFrame(fadeMusic);
      };

      animationFrame = window.requestAnimationFrame(fadeMusic);
    };

    fadeStartTimer = window.setTimeout(beginFade, 3200);
    return () => {
      window.clearTimeout(fadeStartTimer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  function restartExperience() {
    if (restarting) return;
    setRestarting(true);
    const rect = restartButtonRef.current?.getBoundingClientRect();
    confetti({
      particleCount: 22,
      spread: 54,
      startVelocity: 22,
      gravity: 0.55,
      scalar: 0.7,
      ticks: 95,
      origin: rect
        ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
        : { x: 0.5, y: 0.7 },
      colors: ['#ff8fab', '#cdb4db', '#ffd166', '#8fb8ff', '#ffffff'],
      zIndex: 8,
    });
    window.setTimeout(onRestart, 320);
  }

  const finalLine = 'Happy Birthday, my precious lovely Sister💝';
  const message = CONTENT.finale.ending.replace(finalLine, '').trim();

  return (
    <section className="screen finale-screen">
      <div className="finale-atmosphere" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => (
          <i
            className="finale-particle"
            key={index}
            style={{
              left: `${(index * 37 + 5) % 96}%`,
              top: `${(index * 53 + 8) % 88}%`,
              '--finale-delay': `${index * -0.54}s`,
              '--finale-size': `${3 + (index % 3) * 2}px`,
            }}
          />
        ))}
        <div className="finale-bokeh">
          {Array.from({ length: 9 }).map((_, index) => <i key={index} />)}
        </div>
        <div className="finale-light-beams">
          {Array.from({ length: 4 }).map((_, index) => <i key={index} />)}
        </div>
      </div>

      <div className="finale-confetti" aria-hidden="true">
        {confettiPieces.map((piece, index) => (
          <i
            key={index}
            style={{
              '--confetti-left': piece.left,
              '--confetti-delay': piece.delay,
              '--confetti-duration': piece.duration,
              '--confetti-color': piece.color,
            }}
          />
        ))}
      </div>

      <FinaleFireworksCanvas active={showFireworks} />

      <div className="floating-love" aria-hidden="true">
        {floatingHearts.map((heart, index) => (
          <span key={index} style={{ '--heart-x': heart.x, '--heart-delay': heart.delay }}>♡</span>
        ))}
      </div>

      <motion.div
        className="finale-copy"
        initial={{ scale: 0.96, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="finale-card-sparkles" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => <i key={index}>✦</i>)}
        </div>

        <p className="eyebrow">I know this website isn't a huge gift, but every page was made with love. I hope it made you smile today, even if just for a few minutes. You deserve a year filled with happiness, laughter, and dreams coming true.</p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.68, ease: 'easeOut' }}
        >
          Happy Birthday, Maa💖💞!
        </motion.h1>

        <motion.p
          className="finale-message"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82, duration: 0.7, ease: 'easeOut' }}
          >
            {message}
          </motion.span>
          <motion.strong
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.18, duration: 0.7, ease: 'easeOut' }}
          >
            {finalLine}
          </motion.strong>
        </motion.p>

        <motion.span
          className="finale-heart"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.35 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.35, duration: 0.62, type: 'spring', stiffness: 145 }}
        >
          ♥
        </motion.span>

        <motion.button
          ref={restartButtonRef}
          className="finale-restart-btn"
          type="button"
          onClick={restartExperience}
          disabled={restarting}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.9, duration: 0.62, ease: 'easeOut' }}
          whileHover={{ y: -4, scale: 1.035 }}
          whileTap={{ scale: 0.97 }}
        >
          💖 Experience It Again
        </motion.button>

        <AnimatePresence>
          {showSignature && (
            <motion.p
              className="finale-signature"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span>With endless love to my cute little chubby Panda🐼,</span>
              <strong>Your Lovely Annayya 🥰❤️</strong>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
