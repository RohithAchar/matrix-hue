import { useState } from 'react';

export default function ServiceUnavailable({ onRetry }) {
  const [retrying, setRetrying] = useState(false);

  async function handleRetry() {
    setRetrying(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        onRetry();
      }
    } catch {}
    setRetrying(false);
  }

  return (
    <div className="home" style={{ backgroundColor: '#000' }}>
      <div className="home-content">
        <h1 className="service-unavailable-title">Service Unavailable</h1>
        <p className="service-unavailable-message">
          We're having trouble connecting to the server. Please try again.
        </p>
        <button className="game-btn" disabled={retrying} onClick={handleRetry}>
          {retrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    </div>
  );
}
