import { useState, useRef, useCallback } from 'react';

function getMuted() {
  try { return localStorage.getItem('soundMuted') === 'true'; }
  catch { return false; }
}

export function useSound() {
  const ctxRef = useRef(null);
  const [muted, setMuted] = useState(getMuted);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq, dur, type = 'sine', vol = 0.3) => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur);
    } catch {}
  }, [muted, getCtx]);

  const playClick = useCallback(() => playTone(800, 0.08), [playTone]);

  const playRoundStart = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523, 659, 784].forEach((freq, i) => {
        const t = now + i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {}
  }, [muted, getCtx]);

  const playTick = useCallback(() => playTone(1200, 0.05, 'sine', 0.15), [playTone]);

  const playFade = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }, [muted, getCtx]);

  const playScore = useCallback((score) => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const rate = score >= 9 ? 1.4 : score >= 5 ? 1.0 : 0.8;
      const now = ctx.currentTime;
      [1, 1.25].forEach((mult, i) => {
        const t = now + i * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 * rate * mult, t);
        gain.gain.setValueAtTime(0.4 - i * 0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch {}
  }, [muted, getCtx]);

  const playLeaderboard = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523, 659, 784, 1047].forEach((freq, i) => {
        const t = now + i * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch {}
  }, [muted, getCtx]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try { localStorage.setItem('soundMuted', next); } catch {}
      return next;
    });
  }, []);

  return {
    playClick, playRoundStart, playTick, playFade, playScore, playLeaderboard,
    muted, toggleMute,
  };
}
