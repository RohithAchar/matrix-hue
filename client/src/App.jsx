import { Routes, Route } from 'react-router-dom';
import { SessionProvider } from './hooks/useSession';
import { GameProvider } from './context/GameContext';
import { ServiceUnavailableProvider, useServiceUnavailable } from './context/ServiceUnavailableContext';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import GameErrorBoundary from './components/GameErrorBoundary';
import ServiceUnavailable from './components/ServiceUnavailable';
import NavBar from './components/NavBar';

function AppContent() {
  const { isUnavailable, setUnavailable } = useServiceUnavailable();

  if (isUnavailable) {
    return <ServiceUnavailable onRetry={() => setUnavailable(false)} />;
  }

  return (
    <div className="app">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/play/single" element={<Game />} />
        <Route path="/play/friends" element={<Game />} />
        <Route path="/play/friends/:code" element={<Game />} />
        <Route path="/join/:code" element={<Game />} />
        <Route path="/play/global" element={<Game />} />
        <Route path="/leaderboard/friends/:shareCode" element={<Leaderboard />} />
        <Route path="/leaderboard/global/:difficulty/:date" element={<Leaderboard />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <GameProvider>
        <ServiceUnavailableProvider>
          <GameErrorBoundary>
            <AppContent />
          </GameErrorBoundary>
        </ServiceUnavailableProvider>
      </GameProvider>
    </SessionProvider>
  );
}
