/*
 * useSound.js — Sound effects hook (Howler.js)
 *
 * TODO:
 * - Import Howler and pre-load 6 sound files from assets/sounds/
 * - Provide play functions:
 *   playClick(), playRoundStart(), playTick(),
 *   playFade(), playScore(score), playLeaderboard()
 * - playScore varies playback rate by score quality
 * - Mute toggle: muted state + toggleMute(), persisted in localStorage
 * - Volume ~0.3-0.5
 * - Graceful degradation if audio files missing
 */

export function useSound() {
  // TODO: implement Howler.js sound system

  return {
    playClick: () => {},
    playRoundStart: () => {},
    playTick: () => {},
    playFade: () => {},
    playScore: (score) => {},
    playLeaderboard: () => {},
    muted: false,
    toggleMute: () => {},
  };
}
