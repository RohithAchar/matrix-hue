import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../hooks/useSound';

export default function Rooms() {
  const navigate = useNavigate();
  const { playClick } = useSound();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentChallenges') || '[]');
      setRooms(stored);
    } catch {}
  }, []);

  return (
    <div className="home" style={{ backgroundColor: '#000' }}>
      <div className="home-content">
        <div className="home-header">
          <h1 className="home-title">Your Rooms</h1>
        </div>
        {rooms.length > 0 ? (
          <>
            <p className="join-subtitle">Click a room to view its leaderboard:</p>
            <div className="recent-rooms">
              {rooms.map((r) => (
                <button
                  key={r.shareCode}
                  className="room-btn"
                  onClick={() => { playClick(); navigate(`/leaderboard/friends/${r.shareCode}`); }}
                >
                  <span className="room-code">{r.shareCode}</span>
                  <span className="room-diff">{r.difficulty}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="join-subtitle">No rooms played yet. Start a friends challenge to see it here.</p>
        )}
        <button className="game-btn" onClick={() => { playClick(); navigate('/'); }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
