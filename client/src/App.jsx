import { Routes, Route } from 'react-router-dom';
import { SessionProvider } from './hooks/useSession';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';

export default function App() {
  return (
    <SessionProvider>
      <GameProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </GameProvider>
    </SessionProvider>
  );
}
