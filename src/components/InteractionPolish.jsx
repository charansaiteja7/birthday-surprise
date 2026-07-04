import { useEffect } from 'react';
import { CONTENT } from '../config/content';
import { playCorrect, playSoftClick, playTinyBounce, playWrong } from '../utils/sounds';

export default function InteractionPolish() {
  useEffect(() => {
    const activeBursts = new Set();
    const activeTrail = new Set();
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastBounceAt = 0;
    let lastTrailAt = 0;

    function handlePointerDown(event) {
      if (!(event.target instanceof Element)) return;
      const interactive = event.target.closest('button, .upload-label, [role="button"]');
      if (!interactive || interactive.matches(':disabled, [aria-disabled="true"]')) return;

      const isPasswordSubmit = interactive.matches('.lock-card .primary-btn');
      const isNoButton = Boolean(interactive.closest('.no-zone'));
      if (!isPasswordSubmit && !isNoButton) playSoftClick();
      const burst = document.createElement('span');
      burst.className = 'interaction-sparkle-burst';
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      document.body.appendChild(burst);
      activeBursts.add(burst);

      window.setTimeout(() => {
        burst.remove();
        activeBursts.delete(burst);
      }, 650);
    }

    function handleSubmit(event) {
      if (!(event.target instanceof HTMLFormElement) || !event.target.matches('.lock-card')) return;
      const password = event.target.querySelector('input')?.value || '';
      if (password === CONTENT.password.value) playCorrect();
      else playWrong();
    }

    function handlePointerOver(event) {
      if (!(event.target instanceof Element)) return;
      const noButton = event.target.closest('.no-zone .secondary-btn');
      if (!noButton || noButton.contains(event.relatedTarget)) return;
      const now = performance.now();
      if (now - lastBounceAt < 180) return;
      lastBounceAt = now;
      playTinyBounce();
    }

    function handlePointerMove(event) {
      if (!finePointer.matches || reduceMotion.matches) return;
      const now = performance.now();
      if (now - lastTrailAt < 48) return;
      lastTrailAt = now;

      const particle = document.createElement('span');
      const colors = ['#ffd6e8', '#e4d1ff', '#fff0a8', '#cde8ff'];
      particle.className = 'cursor-trail-particle';
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.setProperty('--trail-size', `${3 + Math.random() * 3}px`);
      particle.style.setProperty('--trail-color', colors[Math.floor(Math.random() * colors.length)]);
      document.body.appendChild(particle);
      activeTrail.add(particle);

      window.setTimeout(() => {
        particle.remove();
        activeTrail.delete(particle);
      }, 760);
    }

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('submit', handleSubmit, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('submit', handleSubmit, true);
      activeBursts.forEach((burst) => burst.remove());
      activeTrail.forEach((particle) => particle.remove());
    };
  }, []);

  return null;
}
