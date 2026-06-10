import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ColorSwatch from './ColorSwatch';

export default function ScoreReveal({ target, guess, score, delta, onNext, round, totalRounds }) {
  const scoreRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(revealRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
  }, []);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: score,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        if (scoreRef.current) scoreRef.current.textContent = obj.val.toFixed(1);
      },
    });
  }, [score]);

  const isLast = round === totalRounds - 1;

  return (
    <div className="score-reveal" ref={revealRef}>
      <div className="swatches">
        <div className="swatch-pair">
          <span className="swatch-label">Target</span>
          <ColorSwatch h={target.h} s={target.s} l={target.l} size={150} />
        </div>
        <div className="swatch-pair">
          <span className="swatch-label">Your guess</span>
          <ColorSwatch h={guess.h} s={guess.s} l={guess.l} size={150} />
        </div>
      </div>

      <div className="score-display">
        <span className="score-number" ref={scoreRef}>0</span>
        <span className="score-out-of"> / 10</span>
      </div>

      <div className="delta-text">Delta: {delta.toFixed(1)}</div>

      <button className="game-btn" onClick={onNext}>
        {isLast ? 'See Results' : 'Next Round'}
      </button>
    </div>
  );
}
