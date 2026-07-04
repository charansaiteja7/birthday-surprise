import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AudioProvider, useAudio } from './context/AudioContext';
import { PhotoProvider } from './context/PhotoContext';
import AudioControls from './components/AudioControls';
import InteractionPolish from './components/InteractionPolish';
import LiveMagicLayer from './components/LiveMagicLayer';
import LoadingExperience from './components/LoadingExperience';
import StageNavigation from './components/StageNavigation';
import PasswordGate from './stages/PasswordGate';
import OpeningScreen from './stages/OpeningScreen';
import Stage2Celebration from './stages/Stage2Celebration';
import Stage4SecretMessages from './stages/Stage4SecretMessages';
import Stage3MemoryLane from './stages/Stage3MemoryLane';
import Stage5Reasons from './stages/Stage5Reasons';
import Stage8WishingStar from './stages/Stage8WishingStar';
import Stage9GiftBox from './stages/Stage9GiftBox';
import Stage10Finale from './stages/Stage10Finale';

const stages = [
  { id: 'password', label: 'Locked', mood: 'password', component: PasswordGate },
  { id: 'ready', label: 'Ready', mood: 'opening', component: OpeningScreen },
  { id: 'panda', label: 'Panda', mood: 'stage2', component: Stage2Celebration },
  { id: 'letter', label: 'Letter', mood: 'stage4', component: Stage4SecretMessages },
  { id: 'gallery', label: 'Memories', mood: 'stage7', component: Stage3MemoryLane },
  { id: 'qualities', label: 'Qualities', mood: 'stage5', component: Stage5Reasons },
  { id: 'star', label: 'Wish', mood: 'stage8', component: Stage8WishingStar },
  { id: 'gift', label: 'Gift', mood: 'stage9', component: Stage9GiftBox },
  { id: 'finale', label: 'Finale', mood: 'stage10', component: Stage10Finale },
];

function Journey() {
  const [index, setIndex] = useState(0);
  const { setStage } = useAudio();
  const current = stages[index];
  const Stage = current.component;

  useEffect(() => {
    setStage(current.mood);
  }, [current.mood, setStage]);

  const actions = useMemo(() => ({
    unlock: () => {
      setIndex(1);
    },
    next: () => setIndex((value) => Math.min(value + 1, stages.length - 1)),
    back: () => setIndex((value) => Math.max(value - 1, 1)),
    restart: () => {
      setIndex(0);
    },
  }), []);

  const isLocked = current.id === 'password';
  const isFinale = current.id === 'finale';

  return (
    <div className="app">
      <LiveMagicLayer mood={current.mood} />
      <AudioControls />
      {!isLocked && (
        <div className="experience-hud">
          <span>{current.label}</span>
          <div className="hud-track"><i style={{ width: `${(index / (stages.length - 1)) * 100}%` }} /></div>
          <small>{index}/{stages.length - 1}</small>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.main
          key={current.id}
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Stage
            onUnlock={actions.unlock}
            onContinue={actions.next}
            onRestart={actions.restart}
          />
        </motion.main>
      </AnimatePresence>
      {!isLocked && !isFinale && (
        <StageNavigation
          onBack={actions.back}
          onNext={actions.next}
          canBack={index > 1}
          canNext={index < stages.length - 1}
        />
      )}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startedAt = performance.now();
    let finishTimer;

    const finishLoading = () => {
      const minimumRemaining = Math.max(0, 850 - (performance.now() - startedAt));
      finishTimer = window.setTimeout(() => setLoading(false), minimumRemaining);
    };

    if (document.readyState === 'complete') finishLoading();
    else window.addEventListener('load', finishLoading, { once: true });

    const fallbackTimer = window.setTimeout(() => setLoading(false), 2600);
    return () => {
      window.removeEventListener('load', finishLoading);
      window.clearTimeout(finishTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <LoadingExperience key="surprise-loader" />
      ) : (
        <motion.div
          className="app-shell"
          key="birthday-experience"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <PhotoProvider>
            <AudioProvider>
              <InteractionPolish />
              <Journey />
            </AudioProvider>
          </PhotoProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
