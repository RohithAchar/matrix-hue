import { useState, useRef, useEffect, useCallback } from 'react';

export function useTimer(duration, onComplete) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const durationRef = useRef(duration);
  onCompleteRef.current = onComplete;
  durationRef.current = duration;

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setRemaining(durationRef.current);
    setIsRunning(true);
  }, [clear]);

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const resume = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 0) return prev;
      setIsRunning(true);
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    clear();
    setRemaining(durationRef.current);
    setIsRunning(false);
  }, [clear]);

  useEffect(() => {
    if (!isRunning) {
      clear();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clear;
  }, [isRunning, clear]);

  return { remaining, isRunning, start, pause, resume, reset };
}
