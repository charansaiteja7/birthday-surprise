import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';

const noCaptions = ['No 🙈', 'Catch me first 😜', 'Not so easy 🐾', 'Try again 😆', 'Too slow 😋'];
const noReactions = ['🥺 Why?', "😭 Please don't", '😳 Really?', '🙈 No, no!', '🥹 Please choose YES'];

function pickRandom(items, previous) {
  let next = items[Math.floor(Math.random() * items.length)];
  if (items.length > 1) {
    while (next === previous) next = items[Math.floor(Math.random() * items.length)];
  }
  return next;
}

export default function OpeningScreen({ onContinue }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [noCaption, setNoCaption] = useState(noCaptions[0]);
  const [reaction, setReaction] = useState('');
  const { activate } = useAudio();

  function escapeNo() {
    setPosition({
      x: Math.round((Math.random() - 0.5) * 180),
      y: Math.round((Math.random() - 0.5) * 140),
    });
    setNoCaption((current) => pickRandom(noCaptions, current));
    setReaction((current) => pickRandom(noReactions, current));
  }

  function sayYes() {
    activate('stage2');
    onContinue();
  }

  return (
    <section className="screen ready-screen">
      <div className="floating-cloud cloud-one" />
      <div className="floating-cloud cloud-two" />
      <motion.div className="center-stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="eyebrow">I made something special... will you come with me?</p>
        <h1>Can I Steal Just a Few Minutes of Your Birthday? 🥹</h1>
        <div className="ready-actions">
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className="primary-btn" onClick={sayYes}>
            Yes 💖
          </motion.button>
          <motion.div animate={position} className="no-zone">
            <button
              className="secondary-btn"
              onMouseEnter={escapeNo}
              onFocus={escapeNo}
              onPointerDown={escapeNo}
              onClick={escapeNo}
              type="button"
            >
              {noCaption}
            </button>
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          {reaction && (
            <motion.div
              key={reaction}
              className="no-reaction-card"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <span>{reaction.split(' ')[0]}</span>
              <p>{reaction.split(' ').slice(1).join(' ')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
