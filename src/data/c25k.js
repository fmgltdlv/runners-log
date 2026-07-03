// Official Couch to 5K program from https://c25k.com/c25k_plan/
// Each workout: 5 min brisk warmup walk, intervals, 5 min cooldown walk

const WARMUP = 5 * 60;
const COOLDOWN = 5 * 60;

function repeat(intervals, count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(...intervals);
  }
  return result;
}

function workout(intervals, label) {
  return {
    label,
    warmup: WARMUP,
    cooldown: COOLDOWN,
    intervals,
  };
}

export const C25K_PROGRAM = {
  name: 'Couch to 5K',
  weeks: [
    {
      week: 1,
      days: [
        workout(repeat([{ type: 'run', duration: 60 }, { type: 'walk', duration: 90 }], 8), 'Day 1'),
        workout(repeat([{ type: 'run', duration: 60 }, { type: 'walk', duration: 90 }], 8), 'Day 2'),
        workout(repeat([{ type: 'run', duration: 60 }, { type: 'walk', duration: 90 }], 8), 'Day 3'),
      ],
    },
    {
      week: 2,
      days: [
        workout(repeat([{ type: 'run', duration: 90 }, { type: 'walk', duration: 120 }], 6), 'Day 1'),
        workout(repeat([{ type: 'run', duration: 90 }, { type: 'walk', duration: 120 }], 6), 'Day 2'),
        workout(repeat([{ type: 'run', duration: 90 }, { type: 'walk', duration: 120 }], 6), 'Day 3'),
      ],
    },
    {
      week: 3,
      days: [
        workout(
          repeat(
            [
              { type: 'run', duration: 90 },
              { type: 'walk', duration: 90 },
              { type: 'run', duration: 180 },
              { type: 'walk', duration: 180 },
            ],
            2,
          ),
          'Day 1',
        ),
        workout(
          repeat(
            [
              { type: 'run', duration: 90 },
              { type: 'walk', duration: 90 },
              { type: 'run', duration: 180 },
              { type: 'walk', duration: 180 },
            ],
            2,
          ),
          'Day 2',
        ),
        workout(
          repeat(
            [
              { type: 'run', duration: 90 },
              { type: 'walk', duration: 90 },
              { type: 'run', duration: 180 },
              { type: 'walk', duration: 180 },
            ],
            2,
          ),
          'Day 3',
        ),
      ],
    },
    {
      week: 4,
      days: [
        workout(
          [
            { type: 'run', duration: 180 },
            { type: 'walk', duration: 90 },
            { type: 'run', duration: 300 },
            { type: 'walk', duration: 150 },
            { type: 'run', duration: 180 },
            { type: 'walk', duration: 90 },
            { type: 'run', duration: 300 },
          ],
          'Day 1',
        ),
        workout(
          [
            { type: 'run', duration: 180 },
            { type: 'walk', duration: 90 },
            { type: 'run', duration: 300 },
            { type: 'walk', duration: 150 },
            { type: 'run', duration: 180 },
            { type: 'walk', duration: 90 },
            { type: 'run', duration: 300 },
          ],
          'Day 2',
        ),
        workout(
          [
            { type: 'run', duration: 180 },
            { type: 'walk', duration: 90 },
            { type: 'run', duration: 300 },
            { type: 'walk', duration: 150 },
            { type: 'run', duration: 180 },
            { type: 'walk', duration: 90 },
            { type: 'run', duration: 300 },
          ],
          'Day 3',
        ),
      ],
    },
    {
      week: 5,
      days: [
        workout(
          repeat(
            [
              { type: 'run', duration: 300 },
              { type: 'walk', duration: 180 },
            ],
            3,
          ),
          'Day 1',
        ),
        workout(
          [
            { type: 'run', duration: 480 },
            { type: 'walk', duration: 300 },
            { type: 'run', duration: 480 },
          ],
          'Day 2',
        ),
        workout([{ type: 'run', duration: 1200 }], 'Day 3'),
      ],
    },
    {
      week: 6,
      days: [
        workout(
          [
            { type: 'run', duration: 300 },
            { type: 'walk', duration: 180 },
            { type: 'run', duration: 480 },
            { type: 'walk', duration: 180 },
            { type: 'run', duration: 300 },
          ],
          'Day 1',
        ),
        workout(
          [
            { type: 'run', duration: 600 },
            { type: 'walk', duration: 180 },
            { type: 'run', duration: 600 },
          ],
          'Day 2',
        ),
        workout([{ type: 'run', duration: 1500 }], 'Day 3'),
      ],
    },
    {
      week: 7,
      days: [
        workout([{ type: 'run', duration: 1500 }], 'Day 1'),
        workout([{ type: 'run', duration: 1500 }], 'Day 2'),
        workout([{ type: 'run', duration: 1500 }], 'Day 3'),
      ],
    },
    {
      week: 8,
      days: [
        workout([{ type: 'run', duration: 1680 }], 'Day 1'),
        workout([{ type: 'run', duration: 1680 }], 'Day 2'),
        workout([{ type: 'run', duration: 1680 }], 'Day 3'),
      ],
    },
    {
      week: 9,
      days: [
        workout([{ type: 'run', duration: 1800 }], 'Day 1'),
        workout([{ type: 'run', duration: 1800 }], 'Day 2'),
        workout([{ type: 'run', duration: 1800 }], 'Day 3'),
      ],
    },
  ],
};

export function flattenWorkout(workoutDef) {
  const segments = [];

  segments.push({ type: 'walk', duration: workoutDef.warmup, phase: 'warmup' });

  workoutDef.intervals.forEach((interval, index) => {
    segments.push({ ...interval, phase: 'interval', index });
  });

  segments.push({ type: 'walk', duration: workoutDef.cooldown, phase: 'cooldown' });

  return segments;
}

export function getWorkoutTotalDuration(workoutDef) {
  return flattenWorkout(workoutDef).reduce((sum, s) => sum + s.duration, 0);
}

export function getWorkout(week, day) {
  const weekData = C25K_PROGRAM.weeks.find((w) => w.week === week);
  if (!weekData) return null;
  return weekData.days[day - 1] ?? null;
}
