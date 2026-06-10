import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useSession } from '../hooks/useSession';
import { useSound } from '../hooks/useSound';

const TROPHIES = ['🥇', '🥈', '🥉'];

function SkeletonRow() {
  return (
    <div className="lb-row lb-skeleton">
      <div className="lb-cell lb-rank-skel skeleton-pulse" />
      <div className="lb-cell lb-name-skel skeleton-pulse" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="lb-cell lb-round-skel skeleton-pulse" />
      ))}
      <div className="lb-cell lb-total-skel skeleton-pulse" />
      <div className="lb-cell lb-time-skel skeleton-pulse" />
    </div>
  );
}

export default function Leaderboard() {
  const { shareCode, difficulty: routeDifficulty, date: routeDate } = useParams();
  const navigate = useNavigate();
  const { sessionToken } = useSession();
  const { playClick } = useSound();
  const rowsRef = useRef([]);
  const currentRowRef = useRef(null);

  const isGlobal = !!routeDifficulty && !!routeDate;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  async function fetchLeaderboard() {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isGlobal) {
        const params = new URLSearchParams({ difficulty: routeDifficulty });
        if (sessionToken) params.set('sessionToken', sessionToken);
        res = await fetch(`/api/global/leaderboard?${params}`);
      } else {
        res = await fetch(`/api/challenges/${shareCode}/leaderboard`);
        if (res.status === 404) throw new Error('Challenge not found');
      }
      if (!res.ok) throw new Error('Failed to load leaderboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, [shareCode, routeDifficulty, routeDate]);

  useEffect(() => {
    if (!loading && data) {
      const allRows = [...rowsRef.current];
      if (currentRowRef.current) allRows.push(currentRowRef.current);
      if (allRows.length > 0) {
          gsap.fromTo(
            allRows,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
          );
      }
    }
  }, [loading, data]);

  function handleCopy() {
    playClick();
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const entries = data?.entries || [];
  const currentPlayerEntry = data?.currentPlayerEntry;

  return (
    <div className="home" style={{ backgroundColor: '#000' }}>
      <div className="home-content lb-container">
        <div className="lb-header">
          {isGlobal ? (
            <>
              <h1 className="lb-title">Today's Global Leaderboard</h1>
              <p className="lb-subtitle">{routeDifficulty} — {routeDate}</p>
            </>
          ) : (
            <>
              <h1 className="lb-title">Leaderboard</h1>
              <div className="share-code-box">
                <span className="share-code">{shareCode}</span>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {data && <p className="challenge-subtitle">{data.difficulty} challenge</p>}
            </>
          )}
        </div>

        {loading && (
          <div className="lb-table">
            <div className="lb-row lb-header-row">
              <span className="lb-cell lb-rank">#</span>
              <span className="lb-cell lb-name">Player</span>
              <span className="lb-cell lb-round">R1</span>
              <span className="lb-cell lb-round">R2</span>
              <span className="lb-cell lb-round">R3</span>
              <span className="lb-cell lb-round">R4</span>
              <span className="lb-cell lb-round">R5</span>
              <span className="lb-cell lb-total">Total</span>
              <span className="lb-cell lb-time">Finished</span>
            </div>
            {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {error && (
          <div className="lb-message">
            <p>
              Could not load leaderboard.
              {!isGlobal && error === 'Challenge not found' ? ' The code may be wrong.' : ' Try again.'}
            </p>
            <button className="game-btn" onClick={() => { playClick(); fetchLeaderboard(); }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && entries.length === 0 && (
          <div className="lb-message">
            {isGlobal ? (
              <>
                <p>No one has played {routeDifficulty} mode today. Be the first!</p>
                <button className="game-btn" onClick={() => { playClick(); navigate('/play/global'); }}>
                  Play Global {routeDifficulty}
                </button>
              </>
            ) : (
              <>
                <p>No players have finished yet. Share the code and wait for friends!</p>
                <button className="game-btn" onClick={() => navigate('/')}>
                  Back to Home
                </button>
              </>
            )}
          </div>
        )}

        {!loading && !error && data && entries.length > 0 && (
          <div className="lb-table">
            <div className="lb-row lb-header-row">
              <span className="lb-cell lb-rank">#</span>
              <span className="lb-cell lb-name">Player</span>
              <span className="lb-cell lb-round">R1</span>
              <span className="lb-cell lb-round">R2</span>
              <span className="lb-cell lb-round">R3</span>
              <span className="lb-cell lb-round">R4</span>
              <span className="lb-cell lb-round">R5</span>
              <span className="lb-cell lb-total">Total</span>
              <span className="lb-cell lb-time">Finished</span>
            </div>
            {entries.map((entry, i) => {
              const isMe = entry.sessionToken === sessionToken;
              return (
                <div
                  key={i}
                  className={`lb-row ${i % 2 === 0 ? 'lb-row-even' : 'lb-row-odd'} ${isMe ? 'lb-row-me' : ''}`}
                  ref={(el) => { rowsRef.current[i] = el; }}
                >
                  <span className="lb-cell lb-rank">
                    {entry.rank <= 3 ? TROPHIES[entry.rank - 1] : entry.rank}
                  </span>
                  <span className="lb-cell lb-name">{entry.displayName}</span>
                  {entry.roundScores.map((s, ri) => (
                    <span key={ri} className="lb-cell lb-round">{s.toFixed(1)}</span>
                  ))}
                  <span className="lb-cell lb-total lb-total-value">{entry.totalScore.toFixed(1)}</span>
                  <span className="lb-cell lb-time">{formatDate(entry.finishedAt)}</span>
                </div>
              );
            })}
            {currentPlayerEntry && (
              <div
                className="lb-row lb-row-me"
                ref={currentRowRef}
              >
                <span className="lb-cell lb-rank">{currentPlayerEntry.rank}</span>
                <span className="lb-cell lb-name">{currentPlayerEntry.displayName}</span>
                {currentPlayerEntry.roundScores.map((s, ri) => (
                  <span key={ri} className="lb-cell lb-round">{s.toFixed(1)}</span>
                ))}
                <span className="lb-cell lb-total lb-total-value">{currentPlayerEntry.totalScore.toFixed(1)}</span>
                <span className="lb-cell lb-time">{formatDate(currentPlayerEntry.finishedAt)}</span>
              </div>
            )}
          </div>
        )}

        <button className="game-btn" style={{ marginTop: 16 }} onClick={() => { playClick(); navigate('/'); }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
