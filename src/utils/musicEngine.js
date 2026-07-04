import { AUDIO_CONFIG } from '../config/audio';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

const SFX_PATTERNS = {
  unlock: [[523, 0.18, 0], [659, 0.2, 0.08], [784, 0.28, 0.17]],
  wrong: [[330, 0.09, 0], [245, 0.12, 0.07]],
  bounce: [[520, 0.055, 0], [680, 0.055, 0.035]],
  sparkle: [[820, 0.08, 0], [1060, 0.09, 0.05], [1320, 0.1, 0.1]],
  whoosh: [[190, 0.28, 0, 'sine'], [620, 0.18, 0.08, 'sine']],
  blow: [[220, 0.3, 0, 'sine'], [390, 0.22, 0.08, 'sine']],
  firework: [[260, 0.18, 0, 'sine'], [440, 0.16, 0.06, 'sine']],
  paper: [[330, 0.14, 0, 'triangle'], [470, 0.2, 0.1, 'triangle']],
  twinkle: [[784, 0.12, 0], [1047, 0.18, 0.08], [1319, 0.2, 0.16]],
  giftPop: [[560, 0.08, 0], [880, 0.12, 0.045]],
  finale: [[523, 0.28, 0], [659, 0.32, 0.16], [784, 0.42, 0.32]],
  click: [[720, 0.045, 0], [940, 0.035, 0.022]],
  pulse: [[220, 0.12, 0]],
  flip: [[480, 0.09, 0], [620, 0.1, 0.055]],
  collect: [[700, 0.1, 0], [920, 0.13, 0.07]],
};

class GlobalAudioManager {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicElement = null;
    this.musicSource = null;
    this.currentMusicPath = null;
    this.currentMusicKey = null;
    this.fallbackInterval = null;
    this.fallbackTimeouts = new Set();
    this.fallbackIndex = 0;
    this.activeSfx = new Set();
    this.listeners = new Set();
    this.assetAvailability = new Map();
    this.missingLogged = new Set();
    this.transitionToken = 0;
    this.musicVolume = AUDIO_CONFIG.musicVolume;
    this.snapshot = {
      muted: true,
      unlocked: false,
      currentSection: 'password',
    };
  }

  get volume() {
    return this.musicVolume;
  }

  getSnapshot = () => this.snapshot;

  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  updateSnapshot(patch) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  init() {
    if (this.ctx || typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain.gain.value = 0;
    this.sfxGain.gain.value = 0;
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);

    this.musicElement = new Audio();
    this.musicElement.loop = true;
    this.musicElement.preload = 'auto';
    this.musicSource = this.ctx.createMediaElementSource(this.musicElement);
    this.musicSource.connect(this.musicGain);
  }

  async resumeContext() {
    this.init();
    if (this.ctx?.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (error) {
        console.warn('[audio] Could not resume audio context.', error);
      }
    }
  }

  ramp(gainNode, value, duration = AUDIO_CONFIG.fadeInDuration) {
    if (!this.ctx || !gainNode) return;
    const now = this.ctx.currentTime;
    const target = Math.max(0.0001, value);
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(Math.max(0.0001, gainNode.gain.value), now);
    gainNode.gain.linearRampToValueAtTime(target, now + duration / 1000);
  }

  async checkAsset(path) {
    if (!path) return false;
    if (this.assetAvailability.has(path)) return this.assetAvailability.get(path);

    try {
      const response = await fetch(path, { method: 'HEAD', cache: 'force-cache' });
      const contentType = response.headers.get('content-type') || '';
      const available = response.ok && !contentType.includes('text/html');
      this.assetAvailability.set(path, available);
      if (!available) this.logMissing(path);
      return available;
    } catch {
      this.assetAvailability.set(path, false);
      this.logMissing(path);
      return false;
    }
  }

  logMissing(path) {
    if (this.missingLogged.has(path)) return;
    this.missingLogged.add(path);
    console.warn(`Missing audio file: ${path}`);
  }

  async unmute() {
    await this.resumeContext();
    this.updateSnapshot({ muted: false, unlocked: true });
    this.ramp(this.sfxGain, AUDIO_CONFIG.sfxVolume, 260);
    await this.switchMusic(this.snapshot.currentSection);
  }

  mute() {
    this.updateSnapshot({ muted: true });
    const token = ++this.transitionToken;
    this.ramp(this.musicGain, 0.0001, 900);
    this.ramp(this.sfxGain, 0.0001, 260);
    window.setTimeout(() => {
      if (!this.snapshot.muted || token !== this.transitionToken) return;
      this.musicElement?.pause();
      this.stopFallbackMusic();
      this.stopActiveSfx();
    }, 930);
  }

  toggleMute() {
    return this.snapshot.muted ? this.unmute() : this.mute();
  }

  setMuted(value) {
    return value ? this.mute() : this.unmute();
  }

  setSection(section) {
    const previous = this.snapshot.currentSection;
    this.updateSnapshot({ currentSection: section });
    if (!this.snapshot.muted && this.snapshot.unlocked) this.switchMusic(section);
    if (section === 'stage10' && previous !== 'stage10' && !this.snapshot.muted) {
      window.setTimeout(() => {
        if (this.snapshot.currentSection === 'stage10' && !this.snapshot.muted) this.playSfx('finale');
      }, 420);
    }
  }

  setStage(section) {
    this.setSection(section);
  }

  startBirthdayTune() {
    this.setSection('stage2_birthday');
  }

  async switchMusic(section) {
    if (this.snapshot.muted || !this.snapshot.unlocked) return;
    await this.resumeContext();
    const token = ++this.transitionToken;
    const musicKey = AUDIO_CONFIG.sectionMusic[section];
    const path = AUDIO_CONFIG.music[musicKey];

    if (!path) {
      this.musicElement?.pause();
      this.currentMusicPath = null;
      this.currentMusicKey = null;
      this.stopFallbackMusic();
      this.ramp(this.musicGain, 0.0001, AUDIO_CONFIG.fadeOutDuration);
      return;
    }

    if (this.currentMusicKey === musicKey && this.fallbackInterval) {
      this.ramp(this.musicGain, this.musicVolume, AUDIO_CONFIG.fadeInDuration);
      return;
    }

    if (this.currentMusicKey === musicKey && this.currentMusicPath === path && this.musicElement) {
      if (this.musicElement.paused) {
        try {
          await this.musicElement.play();
        } catch (error) {
          console.warn(`[audio] Could not play: ${path}`, error);
          return;
        }
      }
      this.ramp(this.musicGain, this.musicVolume, AUDIO_CONFIG.fadeInDuration);
      return;
    }

    const hadCurrentMusic = Boolean(
      this.fallbackInterval
      || (this.currentMusicPath && this.musicElement && !this.musicElement.paused),
    );
    if (hadCurrentMusic) {
      this.ramp(this.musicGain, 0.0001, AUDIO_CONFIG.fadeOutDuration);
      await wait(AUDIO_CONFIG.fadeOutDuration);
      if (token !== this.transitionToken || this.snapshot.muted) return;
    }

    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.removeAttribute('src');
      this.musicElement.load();
    }
    this.stopFallbackMusic();
    this.currentMusicPath = null;
    this.currentMusicKey = null;

    const available = await this.checkAsset(path);
    if (token !== this.transitionToken || this.snapshot.muted) return;
    if (!available || !this.musicElement) {
      this.startFallbackMusic(musicKey);
      this.currentMusicKey = musicKey;
      this.ramp(this.musicGain, this.musicVolume, AUDIO_CONFIG.fadeInDuration);
      return;
    }

    this.musicElement.src = path;
    this.musicElement.currentTime = 0;
    try {
      await this.musicElement.play();
      if (token !== this.transitionToken || this.snapshot.muted) {
        this.musicElement.pause();
        return;
      }
      this.currentMusicPath = path;
      this.currentMusicKey = musicKey;
      this.ramp(this.musicGain, this.musicVolume, AUDIO_CONFIG.fadeInDuration);
    } catch (error) {
      this.currentMusicPath = null;
      this.currentMusicKey = musicKey;
      console.warn(`[audio] Could not play: ${path}`, error);
      this.startFallbackMusic(musicKey);
      this.ramp(this.musicGain, this.musicVolume, AUDIO_CONFIG.fadeInDuration);
    }
  }

  setVolume(value) {
    const minimum = this.snapshot.currentSection === 'stage10' ? 0 : AUDIO_CONFIG.minMusicVolume;
    this.musicVolume = clamp(value, minimum, AUDIO_CONFIG.maxMusicVolume);
    if (!this.snapshot.muted) this.ramp(this.musicGain, this.musicVolume, 90);
  }

  playTone(frequency, duration, startDelay = 0, wave = 'sine', destination = this.sfxGain, level = 0.12) {
    if (!this.ctx || !destination || this.snapshot.muted) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const start = this.ctx.currentTime + startDelay;
    oscillator.type = wave;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(level, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  startFallbackMusic(musicKey) {
    const mood = AUDIO_CONFIG.fallbackMusic[musicKey];
    if (!mood) return;
    this.stopFallbackMusic();
    this.fallbackIndex = 0;

    const tick = () => {
      if (this.snapshot.muted || this.currentMusicKey !== musicKey) return;
      const beat = 60 / mood.tempo;
      const frequency = mood.scale[this.fallbackIndex % mood.scale.length];
      this.playTone(frequency, beat * 1.4, 0, mood.wave, this.musicGain, 0.13);

      if (this.fallbackIndex % 3 === 1) {
        const harmony = mood.scale[(this.fallbackIndex + 2) % mood.scale.length];
        const harmonyTimer = window.setTimeout(() => {
          this.fallbackTimeouts.delete(harmonyTimer);
          if (!this.snapshot.muted && this.currentMusicKey === musicKey) {
            this.playTone(harmony, beat, 0, mood.wave, this.musicGain, 0.05);
          }
        }, beat * 430);
        this.fallbackTimeouts.add(harmonyTimer);
      }

      this.fallbackIndex += 1;
    };

    this.currentMusicKey = musicKey;
    tick();
    this.fallbackInterval = window.setInterval(tick, (60 / mood.tempo) * 1450);
  }

  stopFallbackMusic() {
    if (this.fallbackInterval) window.clearInterval(this.fallbackInterval);
    this.fallbackInterval = null;
    this.fallbackTimeouts.forEach(window.clearTimeout);
    this.fallbackTimeouts.clear();
  }

  async playSfx(name) {
    if (this.snapshot.muted || !this.snapshot.unlocked) return;
    await this.resumeContext();
    const path = AUDIO_CONFIG.sfx[name];
    const available = await this.checkAsset(path);
    if (this.snapshot.muted) return;

    if (available && path) {
      const element = new Audio(path);
      element.preload = 'auto';
      const source = this.ctx.createMediaElementSource(element);
      source.connect(this.sfxGain);
      const entry = { element, source };
      this.activeSfx.add(entry);
      let cleaned = false;
      let fallbackPlayed = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        this.activeSfx.delete(entry);
        source.disconnect();
      };
      const fallback = () => {
        if (fallbackPlayed) return;
        fallbackPlayed = true;
        this.playSynthSfx(name);
      };
      element.addEventListener('ended', cleanup, { once: true });
      element.addEventListener('error', () => {
        this.logMissing(path);
        cleanup();
        fallback();
      }, { once: true });
      try {
        await element.play();
        return;
      } catch (error) {
        console.warn(`[audio] Could not play: ${path}`, error);
        cleanup();
        fallback();
        return;
      }
    }

    this.playSynthSfx(name);
  }

  playSynthSfx(name) {
    const pattern = SFX_PATTERNS[name] || SFX_PATTERNS.click;
    pattern.forEach(([frequency, duration, delay, wave = 'sine']) => {
      this.playTone(frequency, duration, delay, wave, this.sfxGain, 0.1);
    });
  }

  stopActiveSfx() {
    this.activeSfx.forEach(({ element, source }) => {
      element.pause();
      source.disconnect();
    });
    this.activeSfx.clear();
  }

  stop() {
    this.musicElement?.pause();
    this.stopFallbackMusic();
  }

  pause() {
    this.mute();
  }

  resume() {
    return this.unmute();
  }
}

export const audioManager = new GlobalAudioManager();
export const musicEngine = audioManager;
