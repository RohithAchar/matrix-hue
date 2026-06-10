import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [difficulty, setDifficulty] = useState(null);
  const [mode, setMode] = useState(null);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('memorize');
  const [rounds, setRounds] = useState([]);

  const totalScore = useMemo(
    () => rounds.reduce((sum, r) => sum + r.score, 0),
    [rounds]
  );

  const selectDifficulty = useCallback((d) => setDifficulty(d), []);
  const selectMode = useCallback((m) => setMode(m), []);

  const resetSelection = useCallback(() => {
    setDifficulty(null);
    setMode(null);
  }, []);

  const startGame = useCallback(() => {
    setRound(0);
    setPhase('memorize');
    setRounds([]);
  }, []);

  const addRound = useCallback(
    (result) => setRounds((prev) => [...prev, result]),
    []
  );

  const nextRound = useCallback(() => {
    setRound((prev) => prev + 1);
    setPhase('memorize');
  }, []);

  const finishGame = useCallback(() => {
    setPhase('finished');
  }, []);

  const value = useMemo(
    () => ({
      difficulty, mode, round, phase, rounds, totalScore,
      selectDifficulty, selectMode, resetSelection,
      startGame, setPhase, addRound, nextRound, finishGame,
    }),
    [
      difficulty, mode, round, phase, rounds, totalScore,
      selectDifficulty, selectMode, resetSelection,
      startGame, setPhase, addRound, nextRound, finishGame,
    ]
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
