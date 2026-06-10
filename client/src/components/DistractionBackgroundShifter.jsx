import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function DistractionBackgroundShifter({ difficulty, containerRef }) {
  const flashed = useRef(false);

  useEffect(() => {
    if (difficulty !== 'hard' || !containerRef?.current) return;
    if (flashed.current) return;
    flashed.current = true;

    const el = containerRef.current;
    const timers = [];
    const flashCount = 1 + Math.floor(Math.random() * 2);

    const origBg = el.style.backgroundColor || 'transparent';

    for (let i = 0; i < flashCount; i++) {
      const delay = 300 + Math.random() * 1000;
      const hue = Math.round(Math.random() * 360);
      const sat = 40 + Math.round(Math.random() * 20);
      const lit = 40 + Math.round(Math.random() * 20);
      const flashColor = `hsl(${hue}, ${sat}%, ${lit}%)`;

      const timer = setTimeout(() => {
        const tl = gsap.timeline();
        tl.to(el, { backgroundColor: flashColor, duration: 0.1 })
          .to(el, { backgroundColor: flashColor, duration: 0.1 })
          .to(el, { backgroundColor: origBg, duration: 0.1 });
      }, delay);

      timers.push(timer);
    }

    return () => timers.forEach(clearTimeout);
  }, [difficulty, containerRef]);

  return null;
}
