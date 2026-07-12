import { useCallback, useEffect, useRef, useState } from 'react';
import { flattenWorkout } from '../data/c25k';

function buildTimeline(segments) {
  let offset = 0;
  return segments.map((segment, index) => {
    const entry = { ...segment, index, startAt: offset, endAt: offset + segment.duration };
    offset += segment.duration;
    return entry;
  });
}

function getStateAtElapsed(timeline, elapsedSeconds) {
  if (elapsedSeconds >= timeline[timeline.length - 1].endAt) {
    const last = timeline[timeline.length - 1];
    return {
      segment: last,
      segmentIndex: timeline.length - 1,
      remainingInSegment: 0,
      isComplete: true,
    };
  }

  const segmentIndex = timeline.findIndex((s) => elapsedSeconds < s.endAt);
  const segment = timeline[segmentIndex];
  const remainingInSegment = segment.endAt - elapsedSeconds;

  return {
    segment,
    segmentIndex,
    remainingInSegment,
    isComplete: false,
  };
}

export function useWorkoutTimer(workoutDef, { onIntervalChange, onComplete } = {}) {
  const segments = workoutDef ? flattenWorkout(workoutDef) : [];
  const timeline = buildTimeline(segments);
  const totalDuration = timeline.at(-1)?.endAt ?? 0;

  const [status, setStatus] = useState('idle'); // idle | running | paused | complete
  const [elapsed, setElapsed] = useState(0);

  const startTimeRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const rafRef = useRef(null);
  const lastSegmentIndexRef = useRef(-1);

  const tick = useCallback(() => {
    if (startTimeRef.current == null) return;

    const now = Date.now();
    const nextElapsed = pausedElapsedRef.current + (now - startTimeRef.current) / 1000;
    const state = getStateAtElapsed(timeline, nextElapsed);

    setElapsed(nextElapsed);

    if (state.segmentIndex !== lastSegmentIndexRef.current && lastSegmentIndexRef.current >= 0) {
      onIntervalChange?.(state.segment, state.segmentIndex);
    }
    lastSegmentIndexRef.current = state.segmentIndex;

    if (state.isComplete) {
      setStatus('complete');
      onComplete?.();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [timeline, onIntervalChange, onComplete]);

  const seekTo = useCallback(
    (targetElapsed, { completeIfAtEnd = true } = {}) => {
      if (!workoutDef || !timeline.length) return;

      const clamped = Math.max(0, Math.min(targetElapsed, timeline.at(-1).endAt));
      const state = getStateAtElapsed(timeline, clamped);
      const wasRunning = status === 'running';

      cancelAnimationFrame(rafRef.current);
      pausedElapsedRef.current = clamped;
      setElapsed(clamped);

      if (state.segmentIndex !== lastSegmentIndexRef.current) {
        const prevIndex = lastSegmentIndexRef.current;
        lastSegmentIndexRef.current = state.segmentIndex;
        if (prevIndex >= 0 || clamped > 0) {
          onIntervalChange?.(state.segment, state.segmentIndex);
        }
      } else {
        lastSegmentIndexRef.current = state.segmentIndex;
      }

      if (state.isComplete && completeIfAtEnd) {
        startTimeRef.current = null;
        setStatus('complete');
        onComplete?.();
        return;
      }

      if (wasRunning) {
        startTimeRef.current = Date.now();
        setStatus('running');
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [workoutDef, timeline, status, tick, onIntervalChange, onComplete],
  );

  const start = useCallback(
    (initialElapsed = 0) => {
      if (!workoutDef) return;
      startTimeRef.current = Date.now();
      pausedElapsedRef.current = initialElapsed;
      lastSegmentIndexRef.current = -1;
      setElapsed(initialElapsed);
      setStatus('running');
      rafRef.current = requestAnimationFrame(tick);
    },
    [workoutDef, tick],
  );

  const skipWarmup = useCallback(() => {
    const warmup = timeline.find((s) => s.phase === 'warmup');
    if (!warmup) return;
    seekTo(warmup.endAt);
  }, [timeline, seekTo]);

  const skipCooldown = useCallback(() => {
    if (!timeline.length) return;
    seekTo(timeline.at(-1).endAt);
  }, [timeline, seekTo]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    cancelAnimationFrame(rafRef.current);
    pausedElapsedRef.current = elapsed;
    startTimeRef.current = null;
    setStatus('paused');
  }, [status, elapsed]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    startTimeRef.current = Date.now();
    setStatus('running');
    rafRef.current = requestAnimationFrame(tick);
  }, [status, tick]);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    pausedElapsedRef.current = 0;
    lastSegmentIndexRef.current = -1;
    setElapsed(0);
    setStatus('idle');
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (status === 'running') {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, tick]);

  const current = getStateAtElapsed(timeline, elapsed);
  const progress = totalDuration > 0 ? Math.min(1, elapsed / totalDuration) : 0;

  const canSkipWarmup = current.segment?.phase === 'warmup' && !current.isComplete;
  const canSkipCooldown = current.segment?.phase === 'cooldown' && !current.isComplete;

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
    canSkipWarmup,
    canSkipCooldown,
    start,
    pause,
    resume,
    reset,
    skipWarmup,
    skipCooldown,
  };
}
