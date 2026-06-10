import { Routes, Route } from 'react-router-dom';
import { SessionProvider } from './hooks/useSession';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Game from './pages/Game';

export default function App() {
  return (
    <SessionProvider>
      <GameProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play/single" element={<Game />} />
          </Routes>
        </div>
      </GameProvider>
    </SessionProvider>
  );
}
