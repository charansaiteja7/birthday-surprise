import { motion } from 'framer-motion';

export default function StageNavigation({ onBack, onNext, canBack = true, canNext = true }) {
  return (
    <nav className="stage-nav" aria-label="Stage navigation">
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="nav-pill nav-pill-secondary"
        onClick={onBack}
        disabled={!canBack}
      >
        ← Back
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="nav-pill"
        onClick={onNext}
        disabled={!canNext}
      >
        Next →
      </motion.button>
    </nav>
  );
}
