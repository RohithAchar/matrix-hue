import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ColorSwatch from './ColorSwatch';

const ROASTS = [
  { max: 2, lines: [
    "Did you even look at the color? Wow.",
    "My grandmother could do better. And she's colorblind.",
    "That's… impressively bad. Really.",
    "Were you guessing with your eyes closed?",
    "A drunk bee could pick better colors.",
    "You just close your eyes and pray, huh?",
    "I've seen better color matching in a broken TV.",
    "That's not even close. Like, not even in the same ZIP code.",
  ]},
  { max: 4, lines: [
    "Not great, not terrible. Actually no, it's pretty terrible.",
    "The color is right there. It's literally right there.",
    "You tried. That's what matters. (It doesn't matter.)",
    "I've seen better guesses from a broken monitor.",
    "You're the reason they put instructions on shampoo bottles.",
    "I'd say 'close' but I don't want to lie today.",
    "That color is your spirit animal. Lost.",
    "Is your monitor turned off? Just checking.",
  ]},
  { max: 6, lines: [
    "Mid. Just… mid.",
    "That was certainly a guess.",
    "Room for improvement. Lots of it.",
    "You might want to reconsider your life choices.",
    "Not bad if you're guessing blindfolded. Which you aren't. So…",
    "The bar was on the floor and you still tripped.",
    "This is why we can't have nice things.",
    "Mediocrity has a new champion.",
  ]},
  { max: 8, lines: [
    "Okay, not bad. I guess.",
    "Getting warmer… literally.",
    "Solid. I'd clap but I'm busy roasting you.",
    "Almost there! (You're still not there.)",
    "Fine. You win this round. Barely.",
    "Look at you, almost knowing what you're doing.",
    "I'd say 'good job' but let's not get carried away.",
    "Slightly above average. Don't let it go to your head.",
  ]},
  { max: 10, lines: [
    "Wow, a broken clock is right twice a day.",
    "Lucky guess.",
    "OK, calm down, da Vinci.",
    "I'd be impressed if I wasn't so cynical.",
    "The algorithm must be broken. There's no way.",
    "Who are you and what did you do with the real player?",
    "Fine. You're good. Happy now?",
    "I hate to admit it, but that was spot on.",
  ]},
];

function getRoast(score) {
  const bucket = ROASTS.find((b) => score <= b.max) || ROASTS[ROASTS.length - 1];
  return bucket.lines[Math.floor(Math.random() * bucket.lines.length)];
}

export default function ScoreReveal({ target, guess, score, delta, onNext, round, totalRounds }) {
  const scoreRef = useRef(null);
  const revealRef = useRef(null);
  const roastRef = useRef(null);
  const roast = getRoast(score);

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

  useEffect(() => {
    if (roastRef.current) {
      gsap.fromTo(roastRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, delay: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

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

      <p className="roast-text" ref={roastRef}>{roast}</p>

      <button className="game-btn" onClick={onNext}>
        {isLast ? 'See Results' : 'Next Round'}
      </button>
    </div>
  );
}
