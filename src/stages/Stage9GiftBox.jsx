import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { playChime, playPop, playSparkle, playWhoosh } from '../utils/sounds';

const GIFT_PHASES = {
  idle: 'idle',
  glow: 'glow',
  shake: 'shake',
  untie: 'untie',
  lid: 'lid',
  celebration: 'celebration',
  reveal: 'reveal',
};

function GiftBoxIllustration() {
  return (
    <span className="gift-raster-art" aria-hidden="true">
      <img className="gift-raster-body" src="/images/gift-box-3d.png" alt="" draggable="false" />
      <img className="gift-raster-lid" src="/images/gift-box-3d.png" alt="" draggable="false" />
    </span>
  );
}

function GiftHugIllustration() {
  return (
    <motion.img
      className="gift-hug-illustration"
      src="/images/final-hug-3d.png"
      alt="A happy chubby panda warmly hugging a small caramel teddy bear"
      draggable="false"
      initial={{ opacity: 0, scale: 0.78, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.95, type: 'spring', stiffness: 82 }}
    />
  );
}
export default function Stage9GiftBox({ onContinue }) {
  const [phase, setPhase] = useState(GIFT_PHASES.idle);
  const timers = useRef([]);

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
  }, []);

  function schedule(callback, delay) {
    timers.current.push(window.setTimeout(callback, delay));
  }

  function openGift() {
    if (phase !== GIFT_PHASES.idle) return;

    setPhase(GIFT_PHASES.glow);
    playSparkle();

    schedule(() => {
      setPhase(GIFT_PHASES.shake);
      playSparkle();
    }, 600);
    schedule(() => {
      setPhase(GIFT_PHASES.untie);
      playWhoosh();
    }, 1180);
    schedule(() => setPhase(GIFT_PHASES.lid), 1880);
    schedule(() => {
      setPhase(GIFT_PHASES.celebration);
      playPop();
      confetti({
        particleCount: 140,
        spread: 108,
        startVelocity: 28,
        gravity: 0.52,
        scalar: 0.78,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#ff8fab', '#ffc8dd', '#cdb4db', '#fff3a3', '#ffffff'],
      });
      schedule(playChime, 180);
    }, 2380);
    schedule(() => setPhase(GIFT_PHASES.reveal), 3900);
  }

  const opening = phase !== GIFT_PHASES.idle && phase !== GIFT_PHASES.reveal;
  const celebrating = phase === GIFT_PHASES.celebration || phase === GIFT_PHASES.reveal;

  return (
    <section className={`screen gift-screen gift-phase-${phase}`}>
      <div className="gift-ambient" aria-hidden="true">
        {Array.from({ length: 26 }).map((_, index) => (
          <i
            className="gift-bokeh"
            key={`bokeh-${index}`}
            style={{
              left: `${(index * 37 + 5) % 96}%`,
              top: `${(index * 53 + 9) % 88}%`,
              '--gift-delay': `${index * -0.31}s`,
              '--gift-size': `${4 + (index % 5) * 3}px`,
            }}
          />
        ))}
        <span className="gift-ambient-symbol symbol-one">♡</span>
        <span className="gift-ambient-symbol symbol-two">✦</span>
        <span className="gift-ambient-symbol symbol-three">♡</span>
        <span className="gift-ambient-symbol symbol-four">✧</span>
        <span className="gift-light-blob blob-one" />
        <span className="gift-light-blob blob-two" />
      </div>

      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="gift-celebration-field"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            {['♡', '✦', '★', '〰', '♡', '✧', '★', '〰', '♡', '✦', '★', '♡'].map((item, index) => (
              <span key={`${item}-${index}`} style={{ '--celebration-item': index }}>{item}</span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="gift-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence mode="wait">
          {phase !== GIFT_PHASES.reveal ? (
            <motion.div
              className="gift-intro"
              key="gift-box"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -34, scale: 0.84, filter: 'blur(8px)' }}
              transition={{ duration: 0.75, ease: 'easeInOut' }}
            >
              <div className="gift-heading">
                <h1>One Last Surprise... 🎁</h1>
                <p>Because birthdays deserve one more smile.</p>
              </div>

              <button
                className="luxury-gift-box"
                onClick={openGift}
                type="button"
                disabled={opening}
                aria-label="Tap the glowing gift to open it"
              >
                <span className="luxury-gift-aura" />
                <GiftBoxIllustration />
                <span className="gift-box-sparkles" aria-hidden="true">
                  {Array.from({ length: 10 }).map((_, index) => <i key={index} style={{ '--box-spark': index }} />)}
                </span>
              </button>

              <p className="gift-instruction">✨ Tap the glowing gift to reveal your final surprise.</p>
            </motion.div>
          ) : (
            <motion.div
              className="gift-final-reveal"
              key="gift-reveal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
            >
              <motion.div
                className="gift-speech-bubble"
                initial={{ opacity: 0, y: 22, scale: 0.8 }}
                animate={{ opacity: 1, y: [0, -7, 0], scale: 1 }}
                transition={{ opacity: { delay: 0.5 }, scale: { delay: 0.5 }, y: { delay: 0.9, duration: 2.2, repeat: Infinity } }}
              >
                🎉 Happy Birthday, Nana 🫶🎂
              </motion.div>

              <div className="gift-hug-scene">
                <GiftHugIllustration />
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.85 }}
              >
                No matter how old you become, how much distance came<br />
                you&apos;ll always be my second mother.<br />
                <span aria-hidden="true">❤️</span>
              </motion.h1>

              <motion.button
                className="gift-final-btn"
                type="button"
                onClick={onContinue}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.45, duration: 0.6 }}
                whileHover={{ y: -3, scale: 1.035 }}
                whileTap={{ scale: 0.97 }}
              >
                💖 Finish Our Story
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
