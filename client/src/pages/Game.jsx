import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGame } from '../context/GameContext';
import { generateTargets, randomHsl } from '../utils/colorGen';
import { cieDe2000 } from '../utils/cieDe2000';
import { scoreFromDelta } from '../utils/scoring';
import { useTimer } from '../hooks/useTimer';
import ColorSwatch from '../components/ColorSwatch';
import Timer from '../components/Timer';
import HSLSliderGroup from '../components/HSLSliderGroup';
import ScoreReveal from '../components/ScoreReveal';

const DIFFICULTY_TIMES = { easy: 6, medium: 4, hard: 2 };

const COLOR_NAMES = [
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink',
  'brown', 'cyan', 'magenta', 'lime', 'teal', 'indigo', 'violet',
  'gold', 'silver', 'coral', 'maroon', 'navy', 'olive', 'plum',
  'tan', 'beige', 'mint', 'lavender', 'crimson', 'turquoise',
];

export default function Game() {
  const {
    difficulty, mode, round, phase, rounds,
    startGame, setPhase, addRound, nextRound, finishGame, totalScore,
  } = useGame();
  const navigate = useNavigate();

  const [targets, setTargets] = useState([]);
  const [target, setTarget] = useState(null);
  const [guess, setGuess] = useState(randomHsl());
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState(null);
  const [distractLabel, setDistractLabel] = useState(null);

  const fadeRef = useRef(null);
  const recreateRef = useRef(null);
  const labelRef = useRef(null);

  const duration = DIFFICULTY_TIMES[difficulty] || 6;

  const { remaining, start: startTimer, reset: resetTimer, pause: pauseTimer } = useTimer(duration, () => {
    setPhase('fade');
  });

  useEffect(() => {
    const ts = generateTargets(difficulty || 'easy', 5);
    setTargets(ts);
    startGame();
  }, [difficulty, startGame]);

  useEffect(() => {
    if (targets.length === 0) return;
    setTarget(targets[round]);
    setGuess(randomHsl());
    setTouched(false);
    setResult(null);
    setPhase('memorize');
    resetTimer();
    startTimer();
  }, [round, targets, resetTimer, startTimer, setPhase]);

  useEffect(() => {
    if (phase === 'fade' && fadeRef.current) {
      gsap.fromTo(
        fadeRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
      const timer = setTimeout(() => setPhase('recreate'), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase]);

  useEffect(() => {
    if (phase === 'recreate' && recreateRef.current) {
      gsap.fromTo(
        recreateRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [phase]);

  useEffect(() => {
    const shouldShow = (difficulty === 'medium' || difficulty === 'hard') && phase === 'memorize';
    if (!shouldShow) {
      setDistractLabel(null);
      return;
    }

    labelRef.current = setInterval(() => {
      const text = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
      const hue = Math.round(Math.random() * 360);
      const sat = 60 + Math.round(Math.random() * 40);
      const lit = 50 + Math.round(Math.random() * 50);
      setDistractLabel({ text, color: `hsl(${hue}, ${sat}%, ${lit}%)` });
    }, difficulty === 'hard' ? 400 : 800);

    return () => {
      clearInterval(labelRef.current);
      labelRef.current = null;
    };
  }, [difficulty, phase]);

  function handleSliderChange(hsl) {
    setGuess(hsl);
    if (!touched) setTouched(true);
  }

  function handleSubmit() {
    pauseTimer();
    const delta = cieDe2000(target.h, target.s, target.l, guess.h, guess.s, guess.l);
    const score = scoreFromDelta(delta);
    const res = { target, guess: { ...guess }, delta, score };
    setResult(res);
    addRound(res);
    setPhase('reveal');
  }

  function handleNextRound() {
    if (round >= 4) {
      finishGame();
    } else {
      nextRound();
    }
  }

  function handlePlayAgain() {
    navigate('/');
  }

  if (!target) return null;

  return (
    <div className="game" style={{ backgroundColor: '#000' }}>
      <div className="game-content">
        {phase === 'memorize' && (
          <>
            <div className="round-header">Round {round + 1} of 5</div>
            <div className="memorize-section">
              <div className="swatch-wrapper">
                <ColorSwatch h={target.h} s={target.s} l={target.l} size={200} />
                {distractLabel && (
                  <span className="swatch-label-wrong" style={{ color: distractLabel.color }}>{distractLabel.text}</span>
                )}
              </div>
              <Timer duration={duration} remaining={remaining} onComplete={() => {}} />
            </div>
            <div className="memorize-hint">Memorize this color...</div>
          </>
        )}

        {phase === 'fade' && (
          <div className="fade-section" ref={fadeRef}>
            <h2>Now recreate it!</h2>
          </div>
        )}

        {phase === 'recreate' && (
          <div className="recreate-section" ref={recreateRef}>
            <ColorSwatch h={guess.h} s={guess.s} l={guess.l} size={200} />
            <HSLSliderGroup
              h={guess.h}
              s={guess.s}
              l={guess.l}
              onChange={handleSliderChange}
            />
            <button
              className="game-btn"
              disabled={!touched}
              onClick={handleSubmit}
            >
              Submit Guess
            </button>
          </div>
        )}

        {phase === 'reveal' && result && (
          <ScoreReveal
            target={result.target}
            guess={result.guess}
            score={result.score}
            delta={result.delta}
            onNext={handleNextRound}
            round={round}
            totalRounds={5}
          />
        )}

        {phase === 'finished' && (
          <div className="final-score">
            <h1>Your score</h1>
            <div className="total-score">{Math.round(totalScore * 10) / 10} / 50</div>
            <div className="round-breakdown">
              {rounds.map((r, i) => (
                <div key={i} className="round-result-row">
                  <span className="round-label">Round {i + 1}</span>
                  <div className="round-swatches">
                    <div className="mini-swatch" style={{ backgroundColor: `hsl(${r.target.h}, ${r.target.s}%, ${r.target.l}%)` }} />
                    <span className="round-vs">vs</span>
                    <div className="mini-swatch" style={{ backgroundColor: `hsl(${r.guess.h}, ${r.guess.s}%, ${r.guess.l}%)` }} />
                  </div>
                  <span className="round-score">{r.score.toFixed(1)} / 10</span>
                </div>
              ))}
            </div>
            <button className="game-btn" onClick={handlePlayAgain}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
