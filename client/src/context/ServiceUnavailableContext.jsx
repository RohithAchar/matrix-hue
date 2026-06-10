import { createContext, useContext, useState, useCallback } from 'react';

const ServiceUnavailableContext = createContext();

export function ServiceUnavailableProvider({ children }) {
  const [isUnavailable, setIsUnavailable] = useState(false);

  const setUnavailable = useCallback((val) => {
    setIsUnavailable(val);
  }, []);

  return (
    <ServiceUnavailableContext.Provider value={{ isUnavailable, setUnavailable }}>
      {children}
    </ServiceUnavailableContext.Provider>
  );
}

export function useServiceUnavailable() {
  return useContext(ServiceUnavailableContext);
}
