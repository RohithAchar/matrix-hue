import { useState } from 'react';
import { useSound } from '../hooks/useSound';

export default function ChallengeHost({ shareCode, totalScore, onHome }) {
  const { playClick } = useSound();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    playClick();
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="challenge-host">
      <h1>Challenge Created!</h1>
      <p className="challenge-subtitle">Share this code with a friend:</p>
      <div className="share-code-box">
        <span className="share-code">{shareCode}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="challenge-score">Your score: {Math.round(totalScore * 10) / 10} / 50</p>
      <button className="game-btn" onClick={() => { playClick(); onHome(); }}>
        Back to Home
      </button>
    </div>
  );
}
