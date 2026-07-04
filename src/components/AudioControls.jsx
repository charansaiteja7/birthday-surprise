import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';

export default function AudioControls() {
  const { muted, toggleMute } = useAudio();

  return (
    <motion.button
      className="audio-fab"
      whileTap={{ scale: 0.96 }}
      onClick={toggleMute}
      aria-label={muted ? 'Turn music on' : 'Mute music'}
      title={muted ? 'Turn music on' : 'Mute music'}
    >
      {muted ? '🔇' : '🔊'}
    </motion.button>
  );
}
