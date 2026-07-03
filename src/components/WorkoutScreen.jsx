import { useCallback, useEffect, useRef } from 'react';
import { getWorkout } from '../data/c25k';
import { segmentLabel } from '../lib/workoutEngine';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWakeLock } from '../hooks/useWakeLock';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { createRunId, saveRun } from '../utils/db';
import { formatDistance, formatDuration, formatPace } from '../utils/format';
import { playCueSound } from '../utils/notifications';
import {
  cancelWorkoutNotifications,
  scheduleWorkoutNotifications,
} from '../utils/workoutNotifications';

export default function WorkoutScreen({ settings, week, day, onFinish }) {
  const workout = getWorkout(week, day);
  const startedAtRef = useRef(new Date().toISOString());
  const savedRef = useRef(false);

  const handleIntervalChange = useCallback(
    (segment) => {
      if (settings.soundCues) {
        playCueSound(segment.type);
      }
    },
    [settings.soundCues],
  );

  const handleComplete = useCallback(() => {
    if (settings.soundCues) playCueSound('run');
  }, [settings.soundCues]);

  const timer = useWorkoutTimer(workout, {
    onIntervalChange: handleIntervalChange,
    onComplete: handleComplete,
  });

  const geo = useGeolocation(settings.enableGps && timer.status === 'running');
  const wakeLock = useWakeLock(settings.keepScreenOn && timer.status === 'running');

  const syncNotificationSchedule = useCallback(
    async (elapsedSeconds = timer.elapsed) => {
      if (!settings.notifications || !workout) return;
      await scheduleWorkoutNotifications(workout, elapsedSeconds);
    },
    [settings.notifications, workout, timer.elapsed],
  );

  const saveCompletedRun = useCallback(async () => {
    if (savedRef.current) return;
    savedRef.current = true;

    await saveRun({
      id: createRunId(),
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
    let cancelled = false;

    const startWorkout = async () => {
      if (timer.status !== 'idle') return;
      timer.start();

      if (settings.notifications && workout && !cancelled) {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.ready;
        }
        await syncNotificationSchedule(0);
      }
    };

    startWorkout();

    return () => {
      cancelled = true;
      cancelWorkoutNotifications();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (timer.isComplete) {
      cancelWorkoutNotifications();
      saveCompletedRun();
    }
  }, [timer.isComplete, saveCompletedRun]);

  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === 'hidden' &&
        timer.status === 'running' &&
        settings.notifications &&
        workout
      ) {
        syncNotificationSchedule(timer.elapsed);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [timer.status, timer.elapsed, settings.notifications, workout, syncNotificationSchedule]);

  const handlePause = async () => {
    const elapsed = timer.pause();
    if (settings.notifications) {
      await cancelWorkoutNotifications();
    }
    return elapsed;
  };

  const handleResume = async () => {
    timer.resume();
    if (settings.notifications) {
      await syncNotificationSchedule(timer.elapsed);
    }
  };

  const handleEnd = async () => {
    await cancelWorkoutNotifications();
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

      {settings.notifications && (
        <p className="hint">Interval alerts are scheduled in the background.</p>
      )}
      {settings.enableGps && geo.error && (
        <p className="hint warning">GPS: {geo.error}</p>
      )}
      {settings.keepScreenOn && wakeLock.supported && (
        <p className="hint">{wakeLock.active ? 'Screen kept awake' : 'Wake lock unavailable'}</p>
      )}

      <div className="workout-actions">
        {timer.status === 'running' && (
          <button className="btn btn-secondary" onClick={handlePause}>
            Pause
          </button>
        )}
        {timer.status === 'paused' && (
          <button className="btn btn-primary" onClick={handleResume}>
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
