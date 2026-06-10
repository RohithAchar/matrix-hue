import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'CYAN', 'PINK', 'TEAL', 'BROWN'];

const INK_MAP = {
  RED: 'hsl(0, 100%, 50%)',
  BLUE: 'hsl(240, 100%, 50%)',
  GREEN: 'hsl(120, 100%, 50%)',
  YELLOW: 'hsl(60, 100%, 50%)',
  PURPLE: 'hsl(300, 100%, 50%)',
  ORANGE: 'hsl(30, 100%, 50%)',
  CYAN: 'hsl(180, 100%, 50%)',
  PINK: 'hsl(330, 100%, 70%)',
  TEAL: 'hsl(170, 100%, 40%)',
  BROWN: 'hsl(20, 60%, 40%)',
};

function randomInk() {
  return COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
}

function randomPosition(used) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const x = 10 + Math.random() * 160;
    const y = 10 + Math.random() * 160;
    const tooClose = used.some((p) => Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50);
    if (!tooClose) return { x, y };
  }
  return { x: 10 + Math.random() * 160, y: 10 + Math.random() * 160 };
}

function PopupItem({ text, inkColor, x, y, fontSize, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: onDone });
    tl.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      .to(ref.current, { opacity: 0, duration: 0.2 }, '+=0.8');
  }, [onDone]);

  return (
    <span
      ref={ref}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        color: inkColor,
        fontSize,
        fontWeight: 800,
        opacity: 0,
        textShadow: '0 1px 4px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}
    >
      {text}
    </span>
  );
}

export default function DistractionOverlay({ difficulty }) {
  const [popups, setPopups] = useState([]);
  const schedRef = useRef(null);

  const remove = useCallback((id) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => {
    if (difficulty === 'easy') return;

    setPopups([]);
    const interval = difficulty === 'hard' ? 500 : 1500;
    const maxPopups = difficulty === 'hard' ? 4 : 3;
    let count = 0;
    const used = [];

    schedRef.current = setInterval(() => {
      if (count >= maxPopups) {
        clearInterval(schedRef.current);
        return;
      }
      count++;

      const text = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
      const inkName = randomInk();
      const pos = randomPosition(used);
      used.push(pos);

      const id = Date.now() + Math.random();
      setPopups((prev) => [
        ...prev,
        { id, text, inkColor: INK_MAP[inkName], x: pos.x, y: pos.y, fontSize: 24 + Math.random() * 12 },
      ]);
    }, interval);

    return () => {
      clearInterval(schedRef.current);
    };
  }, [difficulty]);

  if (difficulty === 'easy') return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {popups.map((p) => (
        <PopupItem key={p.id} {...p} onDone={() => remove(p.id)} />
      ))}
    </div>
  );
}
