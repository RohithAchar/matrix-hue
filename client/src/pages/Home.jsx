import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import DifficultySelector from '../components/DifficultySelector';
import NameModal from '../components/NameModal';
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
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  useEffect(() => {
    gsap.to(bgRef.current, {
      backgroundColor: BG_COLORS[difficulty || 'easy'],
      duration: 0.6,
      ease: 'power2.inOut',
    });
  }, [difficulty]);

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
      navigate('/join');
    } else if (m === 'global') {
      navigate('/play/global');
    }
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
      <div className="home-content">
        <DifficultySelector selected={difficulty} onSelect={handleDifficultySelect} />

        <div className="mode-cards">
          {MODE_CARDS.map((card) => (
            <button
              key={card.key}
              className={`mode-card ${mode === card.key ? 'selected' : ''}`}
              onClick={() => handleModeClick(card.key)}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, y: -4, duration: 0.25, ease: 'power2.out' })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, y: 0, duration: 0.25, ease: 'power2.out' })}
            >
              <span className="mode-icon">{card.icon}</span>
              <span className="mode-title">{card.title}</span>
              <span className="mode-desc">{card.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {showNameModal && <NameModal onSuccess={handleNameSuccess} />}
    </div>
  );
}
