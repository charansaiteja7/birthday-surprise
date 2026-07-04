import { motion } from 'framer-motion';

export default function LoadingExperience() {
  return (
    <motion.div
      className="surprise-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(5px)', scale: 1.02 }}
      transition={{ duration: 0.48, ease: 'easeInOut' }}
      role="status"
      aria-live="polite"
    >
      <div className="loader-magic" aria-hidden="true">
        <span>♡</span><span>✦</span><span>♡</span><span>✧</span>
      </div>
      <motion.img
        src="/pandas/panda-entering.png"
        alt=""
        initial={{ opacity: 0, y: 10, scale: 0.94 }}
        animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
        transition={{ opacity: { duration: 0.35 }, scale: { duration: 0.5 }, y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <p>Loading your surprise...</p>
      <span className="loader-dots" aria-hidden="true"><i /><i /><i /></span>
    </motion.div>
  );
}
