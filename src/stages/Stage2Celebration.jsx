import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { musicEngine } from '../utils/musicEngine';
import { playBlow, playFirework, playPop, playSparkle } from '../utils/sounds';

const floatingItems = ['♡', '✦', '✧', '♡', '★', '✦', '♡', '✧'];

const PHASES = {
  entering: 'entering',
  cakeReveal: 'cakeReveal',
  waitingWish: 'waitingWish',
  blowing: 'blowing',
  candlesOut: 'candlesOut',
  nightTransition: 'nightTransition',
  fireworks: 'fireworks',
  readyToContinue: 'readyToContinue',
};

const PANDA_ASSETS = {
  [PHASES.entering]: '/pandas/panda-entering.png',
  [PHASES.cakeReveal]: '/pandas/panda-cake-surprise.png',
  [PHASES.waitingWish]: '/pandas/panda-waiting-wish.png',
  [PHASES.blowing]: '/pandas/panda-blowing.png',
  [PHASES.candlesOut]: '/pandas/panda-candles-out.png',
  [PHASES.nightTransition]: '/pandas/panda-night-transition.png',
  [PHASES.fireworks]: '/pandas/panda-fireworks.png',
  [PHASES.readyToContinue]: '/pandas/panda-ready.png',
};

const PHASE_LABELS = {
  [PHASES.entering]: 'Wait... I brought someone with me! 🐼',
  [PHASES.cakeReveal]: 'Look what I made just for you! 🎂',
  [PHASES.waitingWish]: 'Close your eyes... and make your biggest birthday wish. ✨',
  [PHASES.blowing]: 'Panda blowing out the candles',
  [PHASES.candlesOut]: 'Yay!! Your wish has already started coming true! 🎆',
  [PHASES.nightTransition]: 'Panda looking toward the night sky',
  [PHASES.fireworks]: 'Excited panda celebrating with fireworks',
  [PHASES.readyToContinue]: 'Panda waving and ready to continue',
};

const PHASE_MOTION = {
  [PHASES.entering]: { x: -34, y: 8, rotate: -1.5 },
  [PHASES.cakeReveal]: { x: 0, y: 26, rotate: 0.8 },
  [PHASES.waitingWish]: { x: 6, y: 10, rotate: -0.5 },
  [PHASES.blowing]: { x: 18, y: 8, rotate: 1.5 },
  [PHASES.candlesOut]: { x: -6, y: 22, rotate: -0.8 },
  [PHASES.nightTransition]: { x: 8, y: 12, rotate: 0.5 },
  [PHASES.fireworks]: { x: -8, y: 24, rotate: -1.2 },
  [PHASES.readyToContinue]: { x: 8, y: 12, rotate: 0.8 },
};

const FIREWORK_HEARTS = [
  { x: 9, delay: -0.4 },
  { x: 24, delay: -2.2 },
  { x: 72, delay: -1.1 },
  { x: 88, delay: -3.2 },
  { x: 61, delay: -2.6 },
];

function PandaPhaseAsset({ phase, candlesBlown }) {
  const flamePhases = [PHASES.cakeReveal, PHASES.waitingWish];
  const visiblePhase = candlesBlown && flamePhases.includes(phase) ? PHASES.blowing : phase;
  const pose = PHASE_MOTION[visiblePhase];
  const showFlameOverlay = !candlesBlown && [PHASES.cakeReveal, PHASES.waitingWish].includes(visiblePhase);

  return (
    <div className="premium-panda">
      <AnimatePresence initial={false}>
        <motion.img
          key={visiblePhase}
          className={`panda-phase-asset panda-asset-${visiblePhase}`}
          src={PANDA_ASSETS[visiblePhase]}
          alt={PHASE_LABELS[visiblePhase]}
          initial={{
            opacity: 0,
            x: pose.x,
            y: pose.y,
            rotate: pose.rotate,
            scaleX: 0.95,
            scaleY: 1.045,
          }}
          animate={{
            opacity: 1,
            x: [pose.x, pose.x * 0.15, 0],
            y: [pose.y, -6, 0],
            rotate: [pose.rotate, pose.rotate * -0.2, 0],
            scaleX: [0.95, 1.025, 1],
            scaleY: [1.045, 0.98, 1],
          }}
          exit={{
            opacity: 0,
            x: pose.x * -0.18,
            y: -8,
            rotate: pose.rotate * -0.35,
            scaleX: 1.018,
            scaleY: 0.985,
          }}
          transition={{ duration: 0.96, times: [0, 0.58, 1], ease: [0.22, 1, 0.36, 1] }}
          draggable="false"
        />
      </AnimatePresence>

      <AnimatePresence>
        {showFlameOverlay && (
          <motion.div className="panda-flame-overlay" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}>
            {[44, 50, 56].map((left, index) => (
              <motion.i
                key={left}
                style={{ left: `${left}%`, '--flame-offset': index }}
                initial={{ opacity: 0, scale: 0.5, y: 5 }}
                animate={{ opacity: [0.72, 1, 0.82], scale: [0.86, 1.08, 0.92], y: [1, -2, 0] }}
                exit={{
                  opacity: 0,
                  scale: 0.18,
                  x: 7,
                  y: 8,
                  rotate: 24,
                  transition: { duration: 0.38, delay: index * 0.15, ease: 'easeIn' },
                }}
                transition={{ duration: 0.7 + index * 0.11, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhaseCopy({ phase, onBlow, onContinue }) {
  if (phase === PHASES.entering) return <h1>Someone special is coming with a surprise...</h1>;
  if (phase === PHASES.cakeReveal) return <h1>I brought a cake for you! 🎂</h1>;
  if (phase === PHASES.waitingWish) {
    return (
      <>
        <h1>Close your eyes...<br />make a wish. ✨</h1>
        <button className="primary-btn blow-btn" onClick={onBlow}>Blow Candles 🕯️</button>
      </>
    );
  }
  if (phase === PHASES.blowing) return null;
  if (phase === PHASES.candlesOut) return <h1>WOW! That was magical ✨</h1>;
  if (phase === PHASES.nightTransition) return <h1>Now look at the sky... 🌙</h1>;
  if (phase === PHASES.fireworks) return <h1>Happy Birthday Chitti thalli 🥹🎂</h1>;

  return <button className="primary-btn" onClick={onContinue}>Continue... →</button>;
}

export default function Stage2Celebration({ onContinue }) {
  const { muted, started } = useAudio();
  const [phase, setPhase] = useState(PHASES.entering);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showNight, setShowNight] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [fireworkBursts, setFireworkBursts] = useState([]);
  const timers = useRef([]);
  const fireworksStarted = useRef(false);

  function schedule(callback, delay) {
    timers.current.push(window.setTimeout(callback, delay));
  }

  useEffect(() => {
    Object.values(PANDA_ASSETS).forEach((source) => {
      const image = new Image();
      image.src = source;
    });

    const activeTimers = timers.current;
    activeTimers.push(window.setTimeout(() => setPhase(PHASES.cakeReveal), 3000));
    activeTimers.push(window.setTimeout(() => setPhase(PHASES.waitingWish), 4700));
    return () => activeTimers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (!showNight || !showFireworks || fireworksStarted.current) return undefined;
    fireworksStarted.current = true;
    const colors = ['#fff3a3', '#ff8fab', '#8fb8ff', '#cdb4db', '#ffffff', '#ffd166'];
    const launch = () => confetti({
      particleCount: 42 + Math.floor(Math.random() * 32),
      spread: 72 + Math.random() * 28,
      startVelocity: 32 + Math.random() * 18,
      gravity: 0.55 + Math.random() * 0.3,
      drift: -0.3 + Math.random() * 0.6,
      scalar: 0.58 + Math.random() * 0.36,
      ticks: 150 + Math.floor(Math.random() * 42),
      origin: { x: 0.12 + Math.random() * 0.76, y: 0.08 + Math.random() * 0.38 },
      colors,
      zIndex: 5,
    });
    launch();
    const timer = window.setInterval(launch, 420);
    const stop = window.setTimeout(() => window.clearInterval(timer), 5200);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [showFireworks, showNight]);

  useEffect(() => {
    if (muted) return;
    if (phase === PHASES.cakeReveal) playSparkle();
    if (phase === PHASES.candlesOut) playPop();
  }, [muted, phase]);

  useEffect(() => {
    if (!showNight || !showFireworks || muted) return undefined;
    if (started) musicEngine.startBirthdayTune();
    playFirework();
    const boomTimer = window.setInterval(playFirework, 1900);
    const boomStop = window.setTimeout(() => window.clearInterval(boomTimer), 4800);
    return () => {
      window.clearInterval(boomTimer);
      window.clearTimeout(boomStop);
    };
  }, [muted, showFireworks, showNight, started]);

  useEffect(() => {
    if (!showNight || !showFireworks) return undefined;
    let cancelled = false;
    let nextBurstTimer;
    let burstId = 0;
    const removalTimers = [];
    const palette = ['#ff9fbe', '#ffd166', '#cdb4db', '#8fb8ff', '#ffffff'];

    function createBurst() {
      if (cancelled) return;
      const id = burstId++;
      const large = Math.random() > 0.78;
      const burst = {
        id,
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 38,
        color: palette[Math.floor(Math.random() * palette.length)],
        scale: large ? 1.35 + Math.random() * 0.25 : 0.68 + Math.random() * 0.45,
      };
      setFireworkBursts((current) => [...current.slice(-7), burst]);
      removalTimers.push(window.setTimeout(() => {
        setFireworkBursts((current) => current.filter((item) => item.id !== id));
      }, 1750));
      nextBurstTimer = window.setTimeout(createBurst, 520 + Math.random() * 720);
    }

    createBurst();
    return () => {
      cancelled = true;
      window.clearTimeout(nextBurstTimer);
      removalTimers.forEach(window.clearTimeout);
    };
  }, [showFireworks, showNight]);

  function blowCandles() {
    if (phase !== PHASES.waitingWish) return;
    playBlow();
    setCandlesBlown(true);
    setPhase(PHASES.blowing);
    schedule(() => setPhase(PHASES.candlesOut), 1450);
    schedule(() => {
      setShowNight(true);
      setPhase(PHASES.nightTransition);
    }, 3100);
    schedule(() => {
      setShowFireworks(true);
      setPhase(PHASES.fireworks);
    }, 4900);
    schedule(() => setPhase(PHASES.readyToContinue), 7900);
  }

  return (
    <section
      className={`screen panda-screen panda-phase-${phase} ${showNight ? 'panda-night' : ''}`}
      data-candles-blown={candlesBlown}
    >
      <div className="sparkle-field" />
      <div className="birthday-aurora" />
      <AnimatePresence>
        {showNight && (
          <motion.div
            className="panda-moon"
            aria-hidden="true"
            initial={{ opacity: 0, y: 18, scale: 0.82 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 2.4, ease: 'easeInOut' }}
          >
            <i /><i /><span />
          </motion.div>
        )}
      </AnimatePresence>
      {showNight && showFireworks && (
        <div className="panda-fireworks" aria-hidden="true">
          {fireworkBursts.map((firework) => (
            <span
              key={firework.id}
              style={{
                '--firework-x': `${firework.x}%`,
                '--firework-y': `${firework.y}%`,
                '--firework-scale': firework.scale,
                '--firework-color': firework.color,
              }}
            />
          ))}
          <div className="panda-firework-hearts">
            {FIREWORK_HEARTS.map((heart, index) => (
              <i key={index} style={{ '--heart-x': `${heart.x}%`, '--heart-delay': `${heart.delay}s` }}>♥</i>
            ))}
          </div>
        </div>
      )}
      <div className="dream-floaters">
        {floatingItems.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
      </div>
      <div className="floating-cloud cloud-one" />
      <div className="floating-cloud cloud-two" />
      <div className="stage-floor" />

      <PandaPhaseAsset phase={phase} candlesBlown={candlesBlown} />

      <motion.div className="panda-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.38 }}
          >
            <PhaseCopy phase={phase} onBlow={blowCandles} onContinue={onContinue} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
