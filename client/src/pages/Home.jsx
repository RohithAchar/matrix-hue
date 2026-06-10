import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import DifficultySelector from '../components/DifficultySelector';
import NameModal from '../components/NameModal';
import JoinChallenge from '../components/JoinChallenge';
import { useSession } from '../hooks/useSession';
import { useGame } from '../context/GameContext';
import { useSound } from '../hooks/useSound';

const BG_COLORS = { easy: '#000000', medium: '#1a0a0a', hard: '#2a0505' };
const MODE_CARDS = [
  { key: 'single', icon: '🎯', title: 'Single Player', desc: 'Practice alone. No limits.' },
  { key: 'friends', icon: '👥', title: 'Play with Friends', desc: 'Challenge friends with a code.' },
  { key: 'global', icon: '🌍', title: 'Global', desc: 'Compete worldwide, daily.' },
];

export default function Home() {
  const { isLoggedIn, loading: sessionLoading } = useSession();
  const { difficulty, mode, selectDifficulty, selectMode } = useGame();
  const { playClick } = useSound();
  const navigate = useNavigate();
  const bgRef = useRef(null);
  const headerRef = useRef(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [retryCode, setRetryCode] = useState(null);
  const [retryError, setRetryError] = useState(null);
  const [friendsAction, setFriendsAction] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pendingChallenge');
      if (raw) setPendingChallenge(JSON.parse(raw));
    } catch {}
  }, []);

  async function handleRetryChallenge() {
    if (!pendingChallenge) return;
    setRetrying(true);
    setRetryError(null);
    setRetryCode(null);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: localStorage.getItem('sessionToken'),
          difficulty: pendingChallenge.difficulty,
          targets: pendingChallenge.targets,
          hostScore: {
            roundScores: pendingChallenge.roundScores,
            totalScore: pendingChallenge.totalScore,
            displayName: pendingChallenge.displayName,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setRetryCode(data.shareCode);
      localStorage.removeItem('pendingChallenge');
      setPendingChallenge(null);
    } catch (err) {
      setRetryError(err.message);
    } finally {
      setRetrying(false);
    }
  }

  useEffect(() => {
    gsap.to(bgRef.current, {
      backgroundColor: BG_COLORS[difficulty || 'easy'],
      duration: 0.6,
      ease: 'power2.inOut',
    });
  }, [difficulty]);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  function handleDifficultySelect(d) {
    playClick();
    selectDifficulty(d);
  }

  function handleModeClick(m) {
    playClick();
    selectMode(m);

    if (difficulty === null) {
      selectDifficulty('easy');
    }

    if (!isLoggedIn) {
      setPendingMode(m);
      setShowNameModal(true);
      return;
    }

    navigateToGame(m);
  }

  function navigateToGame(m) {
    const diff = difficulty || 'easy';
    selectDifficulty(diff);

    if (m === 'single') {
      navigate('/play/single');
    } else if (m === 'friends') {
      setFriendsAction('create');
    } else if (m === 'global') {
      navigate('/play/global');
    }
  }

  function handleFriendsCreate() {
    playClick();
    navigate('/play/friends');
  }

  function handleFriendsJoin() {
    playClick();
    setFriendsAction('join');
  }

  function handleFriendsBack() {
    playClick();
    setFriendsAction(null);
  }

  function handleNameSuccess() {
    setShowNameModal(false);
    if (pendingMode) {
      navigateToGame(pendingMode);
      setPendingMode(null);
    }
  }

  if (sessionLoading) return null;

  return (
    <div className="home" ref={bgRef}>
      {pendingChallenge && !retryCode && (
        <div className="pending-banner">
          <span>You have an unsaved challenge</span>
          <button disabled={retrying} onClick={handleRetryChallenge}>
            {retrying ? 'Saving...' : 'Complete it?'}
          </button>
          {retryError && <span className="pending-error">{retryError}</span>}
        </div>
      )}
      {retryCode && (
        <div className="pending-banner success">
          <span>Challenge saved! Code: <strong>{retryCode}</strong></span>
          <button onClick={() => { setRetryCode(null); }}>Dismiss</button>
        </div>
      )}
      <div className="home-content">
        <div className="home-header" ref={headerRef}>
          <h1 className="home-title">MatrixHue</h1>
          <p className="home-subtitle">Can you trust your eye? Watch a color, then rebuild it hue by hue.</p>
        </div>
        <DifficultySelector selected={difficulty} onSelect={handleDifficultySelect} />

        <div className="mode-cards">
          {MODE_CARDS.map((card) => (
            <button
              key={card.key}
              className={`mode-card ${mode === card.key ? 'selected' : ''}`}
              onClick={() => handleModeClick(card.key)}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2, ease: 'back.out(1.7)' })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'power2.out' })}
              onMouseDown={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.15, ease: 'power2.out' })}
              onMouseUp={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3, ease: 'elastic.out(1, 0.5)' })}
            >
              <span className="mode-icon">{card.icon}</span>
              <span className="mode-title">{card.title}</span>
              <span className="mode-desc">{card.desc}</span>
            </button>
          ))}
        </div>

        {friendsAction === 'create' && (
          <div className="friends-actions">
            <h2>Play with Friends</h2>
            <div className="friends-buttons">
              <button className="game-btn" onClick={handleFriendsCreate}>Create Challenge</button>
              <button className="game-btn" onClick={handleFriendsJoin}>Join Challenge</button>
            </div>
            <button className="game-btn join-back" onClick={handleFriendsBack}>Back</button>
          </div>
        )}
        {friendsAction === 'join' && (
          <JoinChallenge onBack={handleFriendsBack} />
        )}
      </div>

      {showNameModal && <NameModal onSuccess={handleNameSuccess} />}
    </div>
  );
}
