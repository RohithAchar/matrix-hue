/*
 * useSession.js — Session identity hook
 *
 * Manages session token + display name in localStorage
 *
 * TODO:
 * - Read sessionToken and displayName from localStorage on mount
 * - Provide createSession(displayName) function:
 *   POST /api/session → store result in localStorage
 * - Provide clearSession() to wipe localStorage
 * - Provide isLoggedIn boolean
 * - Export SessionProvider + useSession context
 */

import { createContext, useContext } from "react";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  // TODO: implement session state
  return (
    <SessionContext.Provider value={{ sessionToken: null, displayName: null }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
