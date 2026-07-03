export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatPace(distanceMeters, durationSeconds) {
  if (!distanceMeters || distanceMeters < 10 || !durationSeconds) return '—';
  const km = distanceMeters / 1000;
  const paceSecondsPerKm = durationSeconds / km;
  return `${formatDuration(paceSecondsPerKm)} /km`;
}

export function formatDistance(meters) {
  if (!meters || meters < 1) return '0 m';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
