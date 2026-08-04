import { useEffect, useState } from 'react';
import { getPlan, getPlans } from '../utils/api';
import { FALLBACK_PLANS } from '../data/strengthPlans';

export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPlans();
        if (!cancelled) {
          setPlans(data);
          setOffline(false);
        }
      } catch {
        if (!cancelled) {
          setPlans(FALLBACK_PLANS);
          setOffline(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { plans, loading, error, offline };
}

export function usePlanDay(planId, day) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!planId || !day) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getPlan(planId, day);
        if (!cancelled) {
          setPlan(data);
          setOffline(false);
        }
      } catch {
        if (!cancelled) {
          const fallback = FALLBACK_PLANS.find((p) => p.id === planId);
          if (fallback?.days?.[day]) {
            setPlan({
              ...fallback,
              days: { [day]: fallback.days[day] },
            });
          }
          setOffline(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [planId, day]);

  return { plan, loading, offline };
}
