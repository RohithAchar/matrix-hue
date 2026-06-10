import { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessionToken, setSessionToken] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    const name = localStorage.getItem('displayName');
    if (token && name) {
      setSessionToken(token);
      setDisplayName(name);
    }
    setLoading(false);
  }, []);

  function createSession(name) {
    return fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: name }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Something went wrong — try again' }));
        throw new Error(err.error || 'Something went wrong — try again');
      }
      const data = await res.json();
      localStorage.setItem('sessionToken', data.sessionToken);
      localStorage.setItem('displayName', data.displayName);
      setSessionToken(data.sessionToken);
      setDisplayName(data.displayName);
      return data;
    });
  }

  function clearSession() {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('displayName');
    setSessionToken(null);
    setDisplayName(null);
  }

  return (
    <SessionContext.Provider
      value={{
        sessionToken,
        displayName,
        isLoggedIn: !!sessionToken,
        loading,
        createSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
