import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CONTENT } from '../config/content';
import { playEnvelopeOpen } from '../utils/sounds';

const highlightedWords = [
  'precious parts',
  'proud',
  'always stand beside you',
  'protect you',
  'love you endlessly',
  'little sister',
];

const letterDecorations = ['✦', '♡', '✧', '♡', '✦', '♡', '✧', '♡'];

function renderHighlightedText(text) {
  const pattern = new RegExp(`(${highlightedWords.join('|')})`, 'gi');
  return text.split(pattern).map((part, index) => (
    highlightedWords.some((word) => word.toLowerCase() === part.toLowerCase())
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : part
  ));
}

function TypedParagraph({ text, onComplete, onProgress, speed = 14 }) {
  const [length, setLength] = useState(0);
  const completeRef = useRef(onComplete);
  const progressRef = useRef(onProgress);

  useEffect(() => {
    completeRef.current = onComplete;
    progressRef.current = onProgress;
  }, [onComplete, onProgress]);

  useEffect(() => {
    let cursor = 0;
    const timer = window.setInterval(() => {
      cursor += 1;
      setLength(cursor);
      if (cursor % 12 === 0) progressRef.current?.();
      if (cursor >= text.length) {
        window.clearInterval(timer);
        completeRef.current?.();
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [speed, text]);

  const displayed = text.slice(0, length);

  return (
    <motion.p
      className="letter-paragraph letter-paragraph-typing"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {renderHighlightedText(displayed)}
      {length < text.length && <span className="letter-cursor" aria-hidden="true">|</span>}
    </motion.p>
  );
}

export default function Stage4SecretMessages({ onContinue }) {
  const [opened, setOpened] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [sealVisible, setSealVisible] = useState(false);
  const [continueVisible, setContinueVisible] = useState(false);
  const timers = useRef([]);
  const paperRef = useRef(null);

  const sections = CONTENT.letter.message.trim().split(/\n\s*\n/);
  const signature = sections.at(-1);
  const paragraphs = sections.slice(0, -1);
  const letterComplete = activeParagraph >= paragraphs.length;

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  useEffect(() => {
    if (!letterComplete) return undefined;
    const sealTimer = window.setTimeout(() => setSealVisible(true), 850);
    const continueTimer = window.setTimeout(() => setContinueVisible(true), 1550);
    return () => {
      window.clearTimeout(sealTimer);
      window.clearTimeout(continueTimer);
    };
  }, [letterComplete]);

  useEffect(() => {
    if (activeParagraph < 0) return undefined;
    const timer = window.setTimeout(() => {
      paperRef.current?.scrollTo({ top: paperRef.current.scrollHeight, behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [activeParagraph]);

  function openLetter() {
    if (opened) return;
    playEnvelopeOpen();
    setOpened(true);
    timers.current.push(window.setTimeout(() => setTitleVisible(true), 850));
    timers.current.push(window.setTimeout(() => setActiveParagraph(0), 1450));
  }

  function completeParagraph(index) {
    if (index !== activeParagraph) return;
    timers.current.push(window.setTimeout(() => setActiveParagraph(index + 1), 260));
  }

  return (
    <section className={`screen letter-screen ${opened ? 'letter-is-open' : ''}`}>
      <div className="desk-grain" aria-hidden="true" />
      <div className="letter-light-orbs" aria-hidden="true"><i /><i /><i /></div>
      <div className="letter-sparkles" aria-hidden="true">
        {letterDecorations.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
      </div>

      <motion.div
        className="envelope-wrap"
        initial={{ y: 34, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div key="closed-letter" className="closed-letter-stage" exit={{ opacity: 0 }}>
              <motion.button
                type="button"
                className="envelope"
                onClick={openLetter}
                initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ y: 34, opacity: 0, scale: 0.94, rotateX: 16 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -7, rotate: -1 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Open your special letter"
              >
                <span className="envelope-paper-edge" />
                <span className="envelope-flap" />
                <span className="envelope-body">
                  <span className="envelope-note">A Special<br />message for<br />My Gaajubomma💗💌</span>
                  <span className="wax-seal wax-seal-closed">♥</span>
                </span>
              </motion.button>
              <motion.p
                className="letter-open-hint"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Tap to open 💌 <span>↝</span>
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="opened-letter"
              className="opened-letter"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="letter-scroll"
                initial={{ scaleY: 0.08, opacity: 0, y: 34 }}
                animate={{ scaleY: 1, opacity: 1, y: 0 }}
                transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="scroll-roll scroll-roll-top" aria-hidden="true" />
                <article ref={paperRef} className="letter-paper" aria-live="polite">
                  <AnimatePresence>
                    {titleVisible && (
                      <motion.header
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                      >
                        <h1>{CONTENT.letter.title}</h1>
                        <span className="letter-title-flourish">— ♥ —</span>
                      </motion.header>
                    )}
                  </AnimatePresence>

                  <div className="letter-message">
                    {paragraphs.slice(0, Math.max(0, activeParagraph)).map((paragraph, index) => (
                      <motion.p
                        className="letter-paragraph"
                        key={`${paragraph}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {renderHighlightedText(paragraph)}
                      </motion.p>
                    ))}
                    {activeParagraph >= 0 && activeParagraph < paragraphs.length && (
                      <TypedParagraph
                        key={activeParagraph}
                        text={paragraphs[activeParagraph]}
                        onComplete={() => completeParagraph(activeParagraph)}
                        onProgress={() => paperRef.current?.scrollTo({ top: paperRef.current.scrollHeight, behavior: 'smooth' })}
                      />
                    )}
                  </div>

                  <AnimatePresence>
                    {letterComplete && (
                      <motion.div
                        className="letter-signature"
                        initial={{ opacity: 0, x: -14, clipPath: 'inset(0 100% 0 0)' }}
                        animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
                        transition={{ duration: 1.1, ease: 'easeOut' }}
                      >
                        {signature.split('\n').map((line) => <span key={line}>{line}</span>)}
                        <strong>♥</strong>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <span className="letter-doodle letter-doodle-left" aria-hidden="true">♡</span>
                  <span className="letter-doodle letter-doodle-right" aria-hidden="true">♡⌁</span>
                </article>
                <div className="scroll-roll scroll-roll-bottom" aria-hidden="true" />

                <AnimatePresence>
                  {sealVisible && (
                    <motion.div
                      className="wax-seal wax-seal-complete"
                      initial={{ x: '-50%', y: -90, opacity: 0, scale: 1.35, rotate: -14 }}
                      animate={{ x: '-50%', y: 0, opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 310, damping: 15 }}
                      aria-label="Letter sealed with love"
                    >
                      <span>♥</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <AnimatePresence>
                {continueVisible && (
                  <motion.button
                    type="button"
                    className="primary-btn letter-continue-btn"
                    onClick={onContinue}
                    initial={{ opacity: 0, y: 16, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ y: -3, scale: 1.035 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    Continue our story ✨
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
