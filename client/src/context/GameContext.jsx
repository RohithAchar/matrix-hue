import { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [difficulty, setDifficulty] = useState(null);
  const [mode, setMode] = useState(null);

  function selectDifficulty(d) {
    setDifficulty(d);
  }

  function selectMode(m) {
    setMode(m);
  }

  function resetSelection() {
    setDifficulty(null);
    setMode(null);
  }

  return (
    <GameContext.Provider
      value={{ difficulty, mode, selectDifficulty, selectMode, resetSelection }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
