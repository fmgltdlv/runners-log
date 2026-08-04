import { useEffect, useState } from 'react';

const STORAGE_KEY = 'runners-log-settings';

const defaults = {
  week: 1,
  day: 1,
  strengthPlanId: 'machine-full-body',
  strengthDay: 1,
  keepScreenOn: true,
  enableGps: false,
  soundCues: true,
  notifications: true,
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  return { settings, update };
}
