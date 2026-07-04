import { useEffect } from 'react';
import { CONTENT } from '../config/content';
import { playCorrect, playSoftClick, playTinyBounce, playWrong } from '../utils/sounds';

export default function InteractionPolish() {
  useEffect(() => {
    const activeBursts = new Set();
    let lastBounceAt = 0;

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

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('submit', handleSubmit, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('submit', handleSubmit, true);
      activeBursts.forEach((burst) => burst.remove());
    };
  }, []);

  return null;
}
