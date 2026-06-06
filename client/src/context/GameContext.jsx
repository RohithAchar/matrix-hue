/*
 * GameContext.jsx — Global game state
 *
 * TODO:
 * - Provide state for:
 *   difficulty: "easy" | "medium" | "hard" | null
 *   mode: "single" | "friends" | "global" | null
 *   round: number (0-4)
 *   phase: "memorize" | "fade" | "recreate" | "reveal" | "finished"
 *   rounds: array of { target, guess, delta, score }
 *   totalScore: number
 *   shareCode: string (for friends mode)
 *   challengeTargets: array (for friends/global)
 * - Provide action functions:
 *   selectDifficulty(d), selectMode(m), startGame(), submitGuess(),
 *   nextRound(), resetGame()
 * - Export GameProvider + useGame context
 */

import { createContext, useContext } from "react";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  // TODO: implement game state management
  return (
    <GameContext.Provider value={{}}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
