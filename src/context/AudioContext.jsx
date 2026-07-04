/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { audioManager } from '../utils/musicEngine';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const snapshot = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.getSnapshot,
    audioManager.getSnapshot,
  );

  // Kept for existing page compatibility. Page actions must never unlock audio;
  // only the global sound button is allowed to do that.
  const activate = useCallback(() => {}, []);
  const setStage = useCallback((stage) => audioManager.setSection(stage), []);
  const toggleMute = useCallback(() => audioManager.toggleMute(), []);

  const value = useMemo(() => ({
    muted: snapshot.muted,
    started: snapshot.unlocked,
    currentStage: snapshot.currentSection,
    activate,
    setStage,
    toggleMute,
  }), [activate, setStage, snapshot, toggleMute]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error('useAudio must be used inside AudioProvider');
  return value;
}
