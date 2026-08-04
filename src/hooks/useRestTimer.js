import { useCallback, useEffect, useRef, useState } from 'react';

export function useRestTimer() {
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const endTimeRef = useRef(null);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;
    const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setRemaining(left);
    if (left > 0) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setIsActive(false);
      endTimeRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      endTimeRef.current = Date.now() + seconds * 1000;
      setIsActive(true);
      setRemaining(seconds);
      rafRef.current = requestAnimationFrame(tick);
    },
    [tick],
  );

  const skip = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    endTimeRef.current = null;
    setIsActive(false);
    setRemaining(0);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { remaining, isActive, start, skip };
}
