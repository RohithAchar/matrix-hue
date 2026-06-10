import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGame } from '../context/GameContext';
import { generateTargets, randomHsl } from '../utils/colorGen';
import { cieDe2000 } from '../utils/cieDe2000';
import { scoreFromDelta } from '../utils/scoring';
import { useTimer } from '../hooks/useTimer';
import { useSound } from '../hooks/useSound';
import { useSession } from '../hooks/useSession';
import ColorSwatch from '../components/ColorSwatch';
import ChallengeHost from '../components/ChallengeHost';
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
    startGame, setPhase, addRound, nextRound, finishGame, totalScore, selectDifficulty,
  } = useGame();
  const navigate = useNavigate();
  const { code: guestCode } = useParams();
  const location = useLocation();
  const routeTargets = location.state?.targets;
  const routeDifficulty = location.state?.difficulty;
  const isGuest = !!guestCode;
  const { playRoundStart, playTick, playFade, playScore, playClick } = useSound();

  const [targets, setTargets] = useState(routeTargets || []);
  const [target, setTarget] = useState(null);
  const [guess, setGuess] = useState(randomHsl());
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState(null);
  const [distractLabel, setDistractLabel] = useState(null);
  const [shareCode, setShareCode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [guestError, setGuestError] = useState(null);
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { displayName, sessionToken } = useSession();

  const fadeRef = useRef(null);
  const recreateRef = useRef(null);
  const labelRef = useRef(null);
  const prevRemaining = useRef(0);
  const initRef = useRef(false);

  const duration = DIFFICULTY_TIMES[difficulty] || 6;

  const { remaining, start: startTimer, reset: resetTimer, pause: pauseTimer } = useTimer(duration, () => {
    setPhase('fade');
  });

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (isGuest) {
      if (targets.length > 0) {
        if (routeDifficulty) selectDifficulty(routeDifficulty);
        startGame();
      } else if (guestCode) {
        fetch(`/api/challenges/${guestCode}`)
          .then((res) => {
            if (!res.ok) throw new Error('Challenge not found');
            return res.json();
          })
          .then((data) => {
            selectDifficulty(data.difficulty);
            setTargets(data.targets);
            startGame();
          })
          .catch(() => navigate('/'));
      }
    } else {
      if (!difficulty) selectDifficulty('easy');
      const ts = generateTargets(difficulty || 'easy', 5);
      setTargets(ts);
      startGame();
    }
  }, []);

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
    if (phase === 'memorize') playRoundStart();
  }, [phase, playRoundStart]);

  useEffect(() => {
    if (phase === 'memorize' && remaining > 0 && remaining <= 3 && remaining < prevRemaining.current) {
      playTick();
    }
    prevRemaining.current = remaining;
  }, [remaining, phase, playTick]);

  useEffect(() => {
    if (phase === 'fade') {
      playFade();
      if (fadeRef.current) {
        gsap.fromTo(
          fadeRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
      }
      const timer = setTimeout(() => setPhase('recreate'), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase, playFade]);

  useEffect(() => {
    if (phase === 'reveal' && result) playScore(result.score);
  }, [phase, result, playScore]);

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

  async function handleSubmit() {
    playClick();
    pauseTimer();

    if (isGuest) {
      setGuestSubmitting(true);
      setGuestError(null);
      try {
        const res = await fetch(`/api/challenges/${guestCode}/round`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken,
            roundIndex: round,
            guessHsl: guess,
          }),
        });
        if (res.status === 409) {
          setCompleted(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to submit guess');
        const data = await res.json();
        const delta = cieDe2000(data.targetColor.h, data.targetColor.s, data.targetColor.l, guess.h, guess.s, guess.l);
        const roundResult = { target: data.targetColor, guess: { ...guess }, score: data.score, delta };
        setResult(roundResult);
        addRound(roundResult);
        setPhase('reveal');
      } catch (err) {
        setGuestError(err.message);
        setGuestSubmitting(false);
        return;
      } finally {
        setGuestSubmitting(false);
      }
      return;
    }

    const delta = cieDe2000(target.h, target.s, target.l, guess.h, guess.s, guess.l);
    const score = scoreFromDelta(delta);
    const res = { target, guess: { ...guess }, delta, score };
    setResult(res);
    addRound(res);
    setPhase('reveal');
  }

  function handleNextRound() {
    playClick();
    if (round >= 4) {
      finishGame();
    } else {
      nextRound();
    }
  }

  function handlePlayAgain() {
    navigate('/');
  }

  async function handleSaveChallenge() {
    setSaving(true);
    setSaveError(null);
    const roundScores = rounds.map((r) => r.score);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          difficulty,
          targets,
          hostScore: { roundScores, totalScore, displayName },
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Server error (${res.status})`);
      }
      const data = await res.json();
      setShareCode(data.shareCode);
    } catch (err) {
      setSaveError(err.message);
      try {
        localStorage.setItem('pendingChallenge', JSON.stringify({
          difficulty, targets, roundScores, totalScore, displayName,
        }));
      } catch {}
    } finally {
      setSaving(false);
    }
  }

  if (completed) {
    return (
      <div className="game" style={{ backgroundColor: '#000' }}>
        <div className="game-content">
          <h1>Already Completed</h1>
          <p>You have already completed this challenge.</p>
          <button className="game-btn" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
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
              disabled={!touched || guestSubmitting}
              onClick={handleSubmit}
            >
              {guestSubmitting ? 'Submitting...' : 'Submit Guess'}
            </button>
            {guestError && (
              <div className="challenge-error">
                <p>Failed to submit. Try again.</p>
                <button className="game-btn" onClick={handleSubmit}>Retry</button>
              </div>
            )}
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

        {phase === 'finished' && !shareCode && (
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
            {mode === 'friends' && !isGuest ? (
              <div className="challenge-save-area">
                <button className="game-btn" disabled={saving} onClick={handleSaveChallenge}>
                  {saving ? 'Saving...' : 'Save Challenge'}
                </button>
                {saveError && (
                  <div className="challenge-error">
                    <p>Failed to save. Your progress was saved locally.</p>
                    <button className="game-btn" onClick={handleSaveChallenge}>Retry</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="game-btn" onClick={() => { playClick(); handlePlayAgain(); }}>Play Again</button>
            )}
          </div>
        )}
        {phase === 'finished' && shareCode && (
          <ChallengeHost shareCode={shareCode} totalScore={totalScore} onHome={handlePlayAgain} />
        )}
      </div>
    </div>
  );
}
