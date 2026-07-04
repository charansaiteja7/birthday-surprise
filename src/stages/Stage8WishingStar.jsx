import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { playChime } from '../utils/sounds';

const TITLE_LINES = [
  '✨ Close your eyes...',
  'Take a deep breath...',
  'Make your birthday wish...',
  "When you're ready,",
  'Touch the brightest star.',
  'The universe is listening. 💖',
];

const PHASES = {
  idle: 'idle',
  charging: 'charging',
  burst: 'burst',
  flash: 'flash',
  travel: 'travel',
  sparkle: 'sparkle',
  complete: 'complete',
};

export default function Stage8WishingStar({ onContinue }) {
  const [phase, setPhase] = useState(PHASES.idle);
  const timers = useRef([]);
  const continued = useRef(false);

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
  }, []);

  function schedule(callback, delay) {
    timers.current.push(window.setTimeout(callback, delay));
  }

  function continueOnce() {
    if (continued.current) return;
    continued.current = true;
    onContinue();
  }

  function makeWish() {
    if (phase !== PHASES.idle) return;

    playChime();
    setPhase(PHASES.charging);

    schedule(() => {
      setPhase(PHASES.burst);
      confetti({
        particleCount: 72,
        spread: 96,
        startVelocity: 24,
        gravity: 0.38,
        scalar: 0.72,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#fff3a3', '#ffc8dd', '#cdb4db', '#fffaf0'],
      });
    }, 420);

    schedule(() => setPhase(PHASES.flash), 920);
    schedule(() => setPhase(PHASES.travel), 1320);
    schedule(() => {
      setPhase(PHASES.sparkle);
      confetti({
        particleCount: 90,
        spread: 150,
        startVelocity: 18,
        gravity: 0.28,
        scalar: 0.62,
        origin: { x: 0.5, y: 0.2 },
        colors: ['#fff9cf', '#ffd6e7', '#e5d7ff', '#ffffff'],
      });
    }, 2050);
    schedule(() => setPhase(PHASES.complete), 3150);
    schedule(continueOnce, 5850);
  }

  const wishStarted = phase !== PHASES.idle;
  const wishComplete = phase === PHASES.complete;

  return (
    <section className={`screen star-screen wish-phase-${phase}`}>
      <div className="wish-sky-decor" aria-hidden="true">
        {Array.from({ length: 52 }).map((_, index) => (
          <i
            className="pastel-sky-star"
            key={`star-${index}`}
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 53) % 88}%`,
              '--star-delay': `${index * -0.17}s`,
              '--star-size': `${2 + (index % 3)}px`,
            }}
          />
        ))}
        {Array.from({ length: 22 }).map((_, index) => (
          <b
            className="wish-dust"
            key={`dust-${index}`}
            style={{
              left: `${(index * 29 + 7) % 96}%`,
              top: `${(index * 41 + 12) % 88}%`,
              '--dust-delay': `${index * -0.43}s`,
            }}
          />
        ))}
        <span className="wish-heart wish-heart-one">♡</span>
        <span className="wish-heart wish-heart-two">♡</span>
        <span className="wish-heart wish-heart-three">♡</span>
        <span className="wish-heart wish-heart-four">♡</span>
        <span className="wish-shooting-star" />
      </div>

      <div className="sleepy-moon" aria-hidden="true">
        <span className="moon-face"><i /><i /><b /></span>
        <span className="moon-cloud moon-cloud-one" />
        <span className="moon-cloud moon-cloud-two" />
      </div>

      <div className="wish-clouds" aria-hidden="true">
        <i className="wish-cloud wish-cloud-one" />
        <i className="wish-cloud wish-cloud-two" />
        <i className="wish-cloud wish-cloud-three" />
      </div>

      <div className="star-copy" aria-label={TITLE_LINES.join(' ')}>
        {TITLE_LINES.map((line, index) => (
          <motion.p
            className={index === 0 || index === 4 ? 'wish-line-emphasis' : ''}
            key={line}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.34, duration: 0.7, ease: 'easeOut' }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      <div className="wish-star-stage">
        <div className="wish-star-aura" aria-hidden="true" />
        <div className="wish-star-particles" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, index) => (
            <i key={index} style={{ '--particle': index }} />
          ))}
        </div>

        <button
          className="bright-star"
          type="button"
          onClick={makeWish}
          disabled={wishStarted}
          aria-label="Touch the brightest star to make your birthday wish"
        >
          ★
        </button>

        {!wishStarted && <span className="touch-star-note">Touch the star 💖</span>}

        <AnimatePresence>
          {wishStarted && (
            <motion.div
              className="wish-star-burst"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 1.35] }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <i key={index} style={{ '--burst': index }}>✦</i>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(phase === PHASES.travel || phase === PHASES.sparkle) && (
            <motion.span
              className="wish-rising-light"
              aria-hidden="true"
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: -360, scale: [0.5, 1.2, 0.7] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.15, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {[PHASES.travel, PHASES.sparkle, PHASES.complete].includes(phase) && (
            <motion.img
              className="wish-light-gift"
              src="/images/gift-box-3d.png"
              alt=""
              aria-hidden="true"
              draggable="false"
              initial={{ opacity: 0, y: -155, scale: 0.18, rotate: -8 }}
              animate={{ opacity: 1, y: 92, scale: 0.42, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ duration: 1.35, type: 'spring', stiffness: 72, damping: 13 }}
            />
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="wish-message-card"
        initial={{ opacity: 0, x: '-50%', y: 24 }}
        animate={{ opacity: 1, x: '-50%', y: 0 }}
        transition={{ delay: 2.05, duration: 0.8 }}
      >
        <span className="wish-card-sparkles" aria-hidden="true">✦ ♡ ✧</span>
        <p>⭐ One Wish. One Moment. One Beautiful Birthday.</p>
        <p>Every star carries a dream. Tonight,</p>
        <p>one of them carries yours.</p>

        <AnimatePresence>
          {wishComplete && (
            <motion.div
              className="wish-complete"
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <strong>✨ Your wish has been sent to the universe.</strong>
              <button className="wish-continue-btn" type="button" onClick={continueOnce}>Continue</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {phase === PHASES.flash && (
          <motion.div
            className="wish-soft-flash"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.82, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
