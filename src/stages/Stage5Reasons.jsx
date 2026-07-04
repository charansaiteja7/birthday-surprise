import { motion } from 'framer-motion';
import { CONTENT } from '../config/content';

const CARD_SHAPES = ['heart', 'shield', 'cloud', 'pillow', 'star', 'royal'];

export default function Stage5Reasons() {
  return (
    <section className="screen qualities-screen">
      <div className="qualities-atmosphere" aria-hidden="true">
        <i className="quality-cloud quality-cloud-one" />
        <i className="quality-cloud quality-cloud-two" />
        <span>♡</span>
        <span>✦</span>
        <span>♡</span>
        <span>✧</span>
        <span>♡</span>
        <span>✦</span>
      </div>

      <motion.div
        className="section-heading"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <p className="eyebrow">A few reasons you are loved</p>
        <h1>The magic inside you</h1>
      </motion.div>

      <div className="qualities-grid">
        {CONTENT.qualities.map((quality, index) => (
          <motion.article
            className={`quality-card quality-card--${CARD_SHAPES[index]}`}
            key={quality.title}
            initial={{ opacity: 0, y: 42, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.16 + index * 0.11, duration: 0.62, ease: 'easeOut' }}
            whileHover={{ y: -10, scale: 1.025 }}
            whileTap={{ scale: 1.02 }}
          >
            <div className="quality-card-shell" style={{ '--float-delay': `${index * -0.65}s` }}>
              <span className="quality-sparkles" aria-hidden="true">✦ ♡ ✧</span>
              <span className="quality-icon-badge" aria-hidden="true">{quality.icon}</span>
              <h2>{quality.title}</h2>
              <span className="quality-title-charm" aria-hidden="true">♡ ✦</span>
              <p>{quality.text}</p>
              <span className="quality-floral" aria-hidden="true">❀ ୨୧ ❀</span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
