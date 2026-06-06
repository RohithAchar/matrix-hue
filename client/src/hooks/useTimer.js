/*
 * useTimer.js — Countdown timer hook
 *
 * TODO:
 * - Accept duration in seconds
 * - Count down every second, expose remaining seconds
 * - Call onComplete when timer hits 0
 * - Support pause/resume
 * - Return { remaining, isRunning, start, pause, resume, reset }
 * - Sound: tick in last 3 seconds
 */

export function useTimer(duration, onComplete) {
  // TODO: implement timer logic

  return {
    remaining: duration,
    isRunning: false,
    start: () => {},
    pause: () => {},
    resume: () => {},
    reset: () => {},
  };
}
