import { audioManager } from './musicEngine';

export function resumeAudio() {
  return audioManager.resumeContext();
}

export function playPop() {
  audioManager.playSfx('giftPop');
}

export function playSparkle() {
  audioManager.playSfx('sparkle');
}

export function playChime() {
  audioManager.playSfx('twinkle');
}

export function playWhoosh() {
  audioManager.playSfx('whoosh');
}

export function playEnvelopeOpen() {
  audioManager.playSfx('paper');
}

export function playFlip() {
  audioManager.playSfx('flip');
}

export function playCollect() {
  audioManager.playSfx('collect');
}

export function playWrong() {
  audioManager.playSfx('wrong');
}

export function playCorrect() {
  audioManager.playSfx('unlock');
}

export function playTinyBounce() {
  audioManager.playSfx('bounce');
}

export function playBlow() {
  audioManager.playSfx('blow');
}

export function playFirework() {
  audioManager.playSfx('firework');
}

export function playSoftClick() {
  audioManager.playSfx('click');
}

export function playSoftPulse() {
  audioManager.playSfx('pulse');
}
