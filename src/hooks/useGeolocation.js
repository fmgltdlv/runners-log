import { useCallback, useEffect, useRef, useState } from 'react';

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useGeolocation(enabled) {
  const [position, setPosition] = useState(null);
  const [track, setTrack] = useState([]);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef(null);
  const lastPointRef = useRef(null);

  const reset = useCallback(() => {
    setPosition(null);
    setTrack([]);
    setDistance(0);
    setError(null);
    lastPointRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled || !('geolocation' in navigator)) {
      if (enabled) setError('Geolocation not supported');
      return;
    }

    setTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };

        setPosition(point);
        setTrack((prev) => {
          const next = [...prev, point];
          if (lastPointRef.current) {
            const delta = haversineMeters(lastPointRef.current, point);
            if (delta > 1 && delta < 100) {
              setDistance((d) => d + delta);
            }
          }
          lastPointRef.current = point;
          return next;
        });
      },
      (err) => {
        setError(err.message);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setTracking(false);
    };
  }, [enabled]);

  return { position, track, distance, error, tracking, reset };
}
