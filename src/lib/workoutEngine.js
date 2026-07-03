// Shared workout timeline helpers

export function buildTimeline(segments) {
  let offset = 0;
  return segments.map((segment, index) => {
    const entry = { ...segment, index, startAt: offset, endAt: offset + segment.duration };
    offset += segment.duration;
    return entry;
  });
}

export function getStateAtElapsed(timeline, elapsedSeconds) {
  if (!timeline.length) {
    return { segment: null, segmentIndex: 0, remainingInSegment: 0, isComplete: true };
  }

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

export function segmentLabel(segment) {
  if (!segment) return '';
  if (segment.phase === 'warmup') return 'Warm up';
  if (segment.phase === 'cooldown') return 'Cool down';
  return segment.type === 'run' ? 'Run' : 'Walk';
}
