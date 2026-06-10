import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../hooks/useSound';

export default function JoinChallenge({ onBack }) {
  const { playClick } = useSound();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (code.length !== 6 || loading) return;
    setLoading(true);
    setError(null);
    playClick();

    try {
      const res = await fetch(`/api/challenges/${code}`);
      if (res.status === 404) {
        setError('No challenge found with that code. Check the code and try again.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch challenge');
      const data = await res.json();
      navigate(`/play/friends/${code}`, { state: { targets: data.targets, difficulty: data.difficulty } });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="join-challenge">
      <h2>Join Challenge</h2>
      <p className="join-subtitle">Enter the 6-character share code</p>
      <form onSubmit={handleSubmit}>
        <input
          className="join-input"
          placeholder="A3X9K2"
          value={code}
          onChange={handleChange}
          maxLength={6}
          autoFocus
          disabled={loading}
        />
        <button className="game-btn" type="submit" disabled={code.length !== 6 || loading}>
          {loading ? 'Joining...' : 'Join'}
        </button>
      </form>
      {error && <p className="join-error">{error}</p>}
      <button className="game-btn join-back" onClick={() => { playClick(); onBack(); }}>
        Back
      </button>
    </div>
  );
}
