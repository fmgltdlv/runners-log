import { useCallback, useEffect, useRef, useState } from 'react';

export function useWakeLock(enabled) {
  const [active, setActive] = useState(false);
  const sentinelRef = useRef(null);

  const release = useCallback(async () => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // already released
      }
      sentinelRef.current = null;
      setActive(false);
    }
  }, []);

  const acquire = useCallback(async () => {
    if (!enabled || !('wakeLock' in navigator)) return;

    try {
      await release();
      sentinelRef.current = await navigator.wakeLock.request('screen');
      setActive(true);

      sentinelRef.current.addEventListener('release', () => {
        setActive(false);
        sentinelRef.current = null;
      });
    } catch {
      setActive(false);
    }
  }, [enabled, release]);

  useEffect(() => {
    if (enabled) {
      acquire();
    } else {
      release();
    }
    return () => {
      release();
    };
  }, [enabled, acquire, release]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && enabled) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, acquire]);

  return { active, supported: 'wakeLock' in navigator };
}
