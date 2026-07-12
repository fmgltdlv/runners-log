import { useCallback, useEffect, useRef } from 'react';
import { getWorkout } from '../data/c25k';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWakeLock } from '../hooks/useWakeLock';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { createRunId, saveRun } from '../utils/db';
import { formatDistance, formatDuration, formatPace } from '../utils/format';
import { notifyIntervalChange, playCueSound } from '../utils/notifications';

function segmentLabel(segment) {
  if (!segment) return '';
  if (segment.phase === 'warmup') return 'Warm up';
  if (segment.phase === 'cooldown') return 'Cool down';
  return segment.type === 'run' ? 'Run' : 'Walk';
}

export default function WorkoutScreen({ settings, week, day, onFinish, resumeState = null }) {
  const workout = getWorkout(week, day);
  const startedAtRef = useRef(resumeState?.startedAt ?? new Date().toISOString());
  const savedRef = useRef(false);
  const runIdRef = useRef(resumeState?.runId ?? null);

  const handleIntervalChange = useCallback(
    (segment) => {
      const label = segmentLabel(segment);
      const type = segment.type;

      if (settings.soundCues) {
        playCueSound(type);
      }

      if (settings.notifications) {
        notifyIntervalChange(`${label}!`, `Switch to ${segment.type === 'run' ? 'running' : 'walking'}.`);
      }
    },
    [settings.soundCues, settings.notifications],
  );

  const timer = useWorkoutTimer(workout, {
    onIntervalChange: handleIntervalChange,
    onComplete: () => {
      if (settings.soundCues) playCueSound('run');
      if (settings.notifications) {
        notifyIntervalChange('Workout complete!', 'Great job — you finished this session.');
      }
    },
  });

  const geo = useGeolocation(settings.enableGps && timer.status === 'running', {
    initialTrack: resumeState?.track ?? [],
    initialDistance: resumeState?.distanceMeters ?? 0,
  });
  const wakeLock = useWakeLock(settings.keepScreenOn && timer.status === 'running');

  const saveCompletedRun = useCallback(async () => {
    if (savedRef.current) return;
    savedRef.current = true;

    await saveRun({
      id: runIdRef.current ?? createRunId(),
      program: 'C25K',
      week,
      day,
      label: workout?.label ?? `Week ${week} Day ${day}`,
      startedAt: startedAtRef.current,
      endedAt: new Date().toISOString(),
      durationSeconds: Math.round(timer.elapsed),
      distanceMeters: Math.round(geo.distance),
      track: geo.track,
      completed: timer.isComplete,
    });
  }, [week, day, workout, timer.elapsed, timer.isComplete, geo.distance, geo.track]);

  useEffect(() => {
    if (timer.status === 'idle') {
      timer.start(resumeState?.elapsed ?? 0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (timer.isComplete) {
      saveCompletedRun();
    }
  }, [timer.isComplete, saveCompletedRun]);

  const handleEnd = async () => {
    if (timer.elapsed > 30) {
      await saveCompletedRun();
    }
    onFinish();
  };

  if (!workout) {
    return (
      <div className="screen">
        <p>Workout not found.</p>
        <button className="btn" onClick={onFinish}>
          Back
        </button>
      </div>
    );
  }

  const segment = timer.currentSegment;
  const isRun = segment?.type === 'run';

  return (
    <div className={`screen workout-screen ${isRun ? 'phase-run' : 'phase-walk'}`}>
      <div className="workout-top">
        <p className="eyebrow">
          Week {week} · {workout.label}
        </p>
        <h2 className="phase-title">{segmentLabel(segment)}</h2>
        <p className="timer-display">{formatDuration(timer.remainingInSegment)}</p>
        <p className="timer-sub">
          Segment {timer.segmentIndex + 1} of {timer.segmentCount}
        </p>
      </div>

      <div className="progress-ring-wrap">
        <svg className="progress-ring" viewBox="0 0 120 120">
          <circle className="progress-ring-bg" cx="60" cy="60" r="52" />
          <circle
            className="progress-ring-fill"
            cx="60"
            cy="60"
            r="52"
            style={{
              strokeDasharray: `${2 * Math.PI * 52}`,
              strokeDashoffset: `${2 * Math.PI * 52 * (1 - timer.progress)}`,
            }}
          />
        </svg>
        <div className="progress-ring-label">
          <span>{formatDuration(timer.elapsed)}</span>
          <small>elapsed</small>
        </div>
      </div>

      <div className="workout-stats">
        <div>
          <span className="stat-label">Total left</span>
          <span className="stat-value">
            {formatDuration(Math.max(0, timer.totalDuration - timer.elapsed))}
          </span>
        </div>
        {settings.enableGps && (
          <>
            <div>
              <span className="stat-label">Distance</span>
              <span className="stat-value">{formatDistance(geo.distance)}</span>
            </div>
            <div>
              <span className="stat-label">Pace</span>
              <span className="stat-value">{formatPace(geo.distance, timer.elapsed)}</span>
            </div>
          </>
        )}
      </div>

      {settings.enableGps && geo.error && (
        <p className="hint warning">GPS: {geo.error}</p>
      )}
      {settings.keepScreenOn && wakeLock.supported && (
        <p className="hint">{wakeLock.active ? 'Screen kept awake' : 'Wake lock unavailable'}</p>
      )}

      <div className="workout-actions">
        {(timer.canSkipWarmup || timer.canSkipCooldown) && !timer.isComplete && (
          <div className="workout-skip-actions">
            {timer.canSkipWarmup && (
              <button className="btn btn-secondary" onClick={timer.skipWarmup}>
                Skip warmup
              </button>
            )}
            {timer.canSkipCooldown && (
              <button className="btn btn-secondary" onClick={timer.skipCooldown}>
                Skip cooldown
              </button>
            )}
          </div>
        )}
        {timer.status === 'running' && (
          <button className="btn btn-secondary" onClick={timer.pause}>
            Pause
          </button>
        )}
        {timer.status === 'paused' && (
          <button className="btn btn-primary" onClick={timer.resume}>
            Resume
          </button>
        )}
        {timer.isComplete ? (
          <button className="btn btn-primary btn-large" onClick={handleEnd}>
            Done
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={handleEnd}>
            End early
          </button>
        )}
      </div>
    </div>
  );
}
