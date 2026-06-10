import { useEffect, useRef } from 'react';

export default function Timer({ duration, remaining }) {
  const circleRef = useRef(null);
  const textRef = useRef(null);
  const startRef = useRef(null);
  const frameRef = useRef(null);
  const prevRemaining = useRef(remaining);

  const R = 40;
  const circ = 2 * Math.PI * R;

  useEffect(() => {
    if (remaining === duration) {
      startRef.current = performance.now();
    }
    prevRemaining.current = remaining;
  }, [remaining, duration]);

  useEffect(() => {
    function tick() {
      if (startRef.current == null) return;
      const elapsed = (performance.now() - startRef.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const offset = circ * progress;

      if (circleRef.current) {
        circleRef.current.setAttribute('stroke-dashoffset', offset);
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    if (remaining > 0) {
      frameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [remaining, duration, circ]);

  return (
    <div className="timer">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke="#333"
          strokeWidth="4"
        />
        <circle
          ref={circleRef}
          cx="50" cy="50" r={R}
          fill="none"
          stroke="#eee"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={0}
          transform="rotate(-90 50 50)"
        />
        <text
          ref={textRef}
          x="50" y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#eee"
          fontSize="28"
          fontWeight="bold"
          className="timer-text"
        >
          {remaining}
        </text>
      </svg>
    </div>
  );
}
