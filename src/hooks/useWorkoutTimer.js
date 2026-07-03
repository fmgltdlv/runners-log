import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flattenWorkout } from '../data/c25k';
import { buildTimeline, getStateAtElapsed } from '../lib/workoutEngine';

export function useWorkoutTimer(workoutDef, { onIntervalChange, onComplete } = {}) {
  const timeline = useMemo(() => {
    if (!workoutDef) return [];
    return buildTimeline(flattenWorkout(workoutDef));
  }, [workoutDef]);
  const totalDuration = timeline.at(-1)?.endAt ?? 0;

  const [status, setStatus] = useState('idle'); // idle | running | paused | complete
  const [elapsed, setElapsed] = useState(0);

  const startTimeRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const intervalRef = useRef(null);
  const lastSegmentIndexRef = useRef(-1);
  const onIntervalChangeRef = useRef(onIntervalChange);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onIntervalChangeRef.current = onIntervalChange;
    onCompleteRef.current = onComplete;
  }, [onIntervalChange, onComplete]);

  const syncElapsed = useCallback(() => {
    if (startTimeRef.current == null) return;

    const nextElapsed = pausedElapsedRef.current + (Date.now() - startTimeRef.current) / 1000;
    const state = getStateAtElapsed(timeline, nextElapsed);

    setElapsed(nextElapsed);

    if (state.segmentIndex !== lastSegmentIndexRef.current && lastSegmentIndexRef.current >= 0) {
      onIntervalChangeRef.current?.(state.segment, state.segmentIndex);
    }
    lastSegmentIndexRef.current = state.segmentIndex;

    if (state.isComplete) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus('complete');
      onCompleteRef.current?.();
    }
  }, [timeline]);

  const start = useCallback(() => {
    if (!workoutDef) return;
    startTimeRef.current = Date.now();
    pausedElapsedRef.current = 0;
    lastSegmentIndexRef.current = -1;
    setElapsed(0);
    setStatus('running');
  }, [workoutDef]);

  const pause = useCallback(() => {
    if (startTimeRef.current == null) return pausedElapsedRef.current;

    const nextElapsed = pausedElapsedRef.current + (Date.now() - startTimeRef.current) / 1000;
    pausedElapsedRef.current = nextElapsed;
    startTimeRef.current = null;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setElapsed(nextElapsed);
    setStatus('paused');
    return nextElapsed;
  }, []);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    startTimeRef.current = Date.now();
    setStatus('running');
  }, [status]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
    lastSegmentIndexRef.current = -1;
    setElapsed(0);
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (status !== 'running') {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return undefined;
    }

    syncElapsed();
    intervalRef.current = setInterval(syncElapsed, 250);

    return () => clearInterval(intervalRef.current);
  }, [status, syncElapsed]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && status === 'running') {
        syncElapsed();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [status, syncElapsed]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const current = getStateAtElapsed(timeline, elapsed);
  const progress = totalDuration > 0 ? Math.min(1, elapsed / totalDuration) : 0;

  return {
    status,
    elapsed,
    totalDuration,
    progress,
    currentSegment: current.segment,
    segmentIndex: current.segmentIndex,
    remainingInSegment: current.remainingInSegment,
    segmentCount: timeline.length,
    isComplete: current.isComplete,
    start,
    pause,
    resume,
    reset,
  };
}
