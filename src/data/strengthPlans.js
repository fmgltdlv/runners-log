// Offline fallback — mirrors D1 seed data for plans/exercises
export const FALLBACK_PLANS = [
  {
    id: 'machine-full-body',
    name: 'Machine Full Body',
    description:
      'Beginner-friendly full-body routine using gym machines. Great for learning movement patterns safely.',
    level: 'beginner',
    daysPerWeek: 3,
    days: {
      1: [
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'leg-press', name: 'Leg Press', equipment: 'machine', muscleGroup: 'legs' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'chest-press', name: 'Chest Press Machine', equipment: 'machine', muscleGroup: 'chest' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'lat-pulldown', name: 'Lat Pulldown', equipment: 'machine', muscleGroup: 'back' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'shoulder-press-machine', name: 'Shoulder Press Machine', equipment: 'machine', muscleGroup: 'shoulders' } },
        { sets: 3, reps: '12-15', restSeconds: 60, exercise: { id: 'leg-curl', name: 'Seated Leg Curl', equipment: 'machine', muscleGroup: 'hamstrings' } },
        { sets: 2, reps: '12-15', restSeconds: 60, exercise: { id: 'bicep-curl-machine', name: 'Bicep Curl Machine', equipment: 'machine', muscleGroup: 'biceps' } },
        { sets: 2, reps: '12-15', restSeconds: 60, exercise: { id: 'tricep-pushdown', name: 'Tricep Pushdown', equipment: 'cable', muscleGroup: 'triceps' } },
      ],
      2: [
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'hack-squat', name: 'Hack Squat', equipment: 'machine', muscleGroup: 'legs' } },
        { sets: 3, reps: '12-15', restSeconds: 75, exercise: { id: 'cable-fly', name: 'Cable Fly', equipment: 'cable', muscleGroup: 'chest' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'seated-row', name: 'Seated Cable Row', equipment: 'machine', muscleGroup: 'back' } },
        { sets: 3, reps: '15-20', restSeconds: 60, exercise: { id: 'cable-face-pull', name: 'Cable Face Pull', equipment: 'cable', muscleGroup: 'shoulders' } },
        { sets: 3, reps: '12-15', restSeconds: 60, exercise: { id: 'leg-extension', name: 'Leg Extension', equipment: 'machine', muscleGroup: 'quads' } },
        { sets: 2, reps: '12-15', restSeconds: 60, exercise: { id: 'bicep-curl-machine', name: 'Bicep Curl Machine', equipment: 'machine', muscleGroup: 'biceps' } },
        { sets: 2, reps: '12-15', restSeconds: 60, exercise: { id: 'tricep-pushdown', name: 'Tricep Pushdown', equipment: 'cable', muscleGroup: 'triceps' } },
      ],
      3: [
        { sets: 3, reps: '8-10', restSeconds: 120, exercise: { id: 'smith-squat', name: 'Smith Machine Squat', equipment: 'machine', muscleGroup: 'legs' } },
        { sets: 4, reps: '8-10', restSeconds: 90, exercise: { id: 'chest-press', name: 'Chest Press Machine', equipment: 'machine', muscleGroup: 'chest' } },
        { sets: 4, reps: '8-10', restSeconds: 90, exercise: { id: 'lat-pulldown', name: 'Lat Pulldown', equipment: 'machine', muscleGroup: 'back' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'shoulder-press-machine', name: 'Shoulder Press Machine', equipment: 'machine', muscleGroup: 'shoulders' } },
        { sets: 3, reps: '12-15', restSeconds: 60, exercise: { id: 'leg-curl', name: 'Seated Leg Curl', equipment: 'machine', muscleGroup: 'hamstrings' } },
      ],
    },
  },
  {
    id: 'machine-upper-lower',
    name: 'Machine Upper / Lower',
    description:
      'Four-day split alternating upper and lower body machine work for balanced strength.',
    level: 'beginner',
    daysPerWeek: 4,
    days: {
      1: [
        { sets: 4, reps: '8-12', restSeconds: 90, exercise: { id: 'chest-press', name: 'Chest Press Machine', equipment: 'machine', muscleGroup: 'chest' } },
        { sets: 4, reps: '8-12', restSeconds: 90, exercise: { id: 'lat-pulldown', name: 'Lat Pulldown', equipment: 'machine', muscleGroup: 'back' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'shoulder-press-machine', name: 'Shoulder Press Machine', equipment: 'machine', muscleGroup: 'shoulders' } },
        { sets: 3, reps: '12-15', restSeconds: 75, exercise: { id: 'cable-fly', name: 'Cable Fly', equipment: 'cable', muscleGroup: 'chest' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'seated-row', name: 'Seated Cable Row', equipment: 'machine', muscleGroup: 'back' } },
        { sets: 3, reps: '12-15', restSeconds: 60, exercise: { id: 'tricep-pushdown', name: 'Tricep Pushdown', equipment: 'cable', muscleGroup: 'triceps' } },
        { sets: 3, reps: '12-15', restSeconds: 60, exercise: { id: 'bicep-curl-machine', name: 'Bicep Curl Machine', equipment: 'machine', muscleGroup: 'biceps' } },
      ],
      2: [
        { sets: 4, reps: '10-12', restSeconds: 120, exercise: { id: 'leg-press', name: 'Leg Press', equipment: 'machine', muscleGroup: 'legs' } },
        { sets: 3, reps: '10-12', restSeconds: 120, exercise: { id: 'hack-squat', name: 'Hack Squat', equipment: 'machine', muscleGroup: 'legs' } },
        { sets: 3, reps: '12-15', restSeconds: 75, exercise: { id: 'leg-extension', name: 'Leg Extension', equipment: 'machine', muscleGroup: 'quads' } },
        { sets: 3, reps: '12-15', restSeconds: 75, exercise: { id: 'leg-curl', name: 'Seated Leg Curl', equipment: 'machine', muscleGroup: 'hamstrings' } },
        { sets: 3, reps: '10-12', restSeconds: 120, exercise: { id: 'smith-squat', name: 'Smith Machine Squat', equipment: 'machine', muscleGroup: 'legs' } },
      ],
      3: [
        { sets: 4, reps: '10-12', restSeconds: 75, exercise: { id: 'cable-fly', name: 'Cable Fly', equipment: 'cable', muscleGroup: 'chest' } },
        { sets: 4, reps: '8-12', restSeconds: 90, exercise: { id: 'seated-row', name: 'Seated Cable Row', equipment: 'machine', muscleGroup: 'back' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'lat-pulldown', name: 'Lat Pulldown', equipment: 'machine', muscleGroup: 'back' } },
        { sets: 3, reps: '15-20', restSeconds: 60, exercise: { id: 'cable-face-pull', name: 'Cable Face Pull', equipment: 'cable', muscleGroup: 'shoulders' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'shoulder-press-machine', name: 'Shoulder Press Machine', equipment: 'machine', muscleGroup: 'shoulders' } },
        { sets: 3, reps: '12-15', restSeconds: 60, exercise: { id: 'bicep-curl-machine', name: 'Bicep Curl Machine', equipment: 'machine', muscleGroup: 'biceps' } },
        { sets: 3, reps: '12-15', restSeconds: 60, exercise: { id: 'tricep-pushdown', name: 'Tricep Pushdown', equipment: 'cable', muscleGroup: 'triceps' } },
      ],
      4: [
        { sets: 4, reps: '8-10', restSeconds: 120, exercise: { id: 'hack-squat', name: 'Hack Squat', equipment: 'machine', muscleGroup: 'legs' } },
        { sets: 3, reps: '10-12', restSeconds: 120, exercise: { id: 'leg-press', name: 'Leg Press', equipment: 'machine', muscleGroup: 'legs' } },
        { sets: 4, reps: '10-12', restSeconds: 75, exercise: { id: 'leg-curl', name: 'Seated Leg Curl', equipment: 'machine', muscleGroup: 'hamstrings' } },
        { sets: 3, reps: '12-15', restSeconds: 75, exercise: { id: 'leg-extension', name: 'Leg Extension', equipment: 'machine', muscleGroup: 'quads' } },
        { sets: 3, reps: '8-10', restSeconds: 120, exercise: { id: 'smith-squat', name: 'Smith Machine Squat', equipment: 'machine', muscleGroup: 'legs' } },
      ],
    },
  },
  {
    id: 'free-weight-foundation',
    name: 'Free Weight Foundation',
    description: 'Barbell and dumbbell basics for building strength with compound lifts.',
    level: 'intermediate',
    daysPerWeek: 3,
    days: {
      1: [
        { sets: 4, reps: '6-8', restSeconds: 120, exercise: { id: 'barbell-bench', name: 'Barbell Bench Press', equipment: 'barbell', muscleGroup: 'chest' } },
        { sets: 3, reps: '8-10', restSeconds: 90, exercise: { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', equipment: 'dumbbell', muscleGroup: 'shoulders' } },
        { sets: 3, reps: '12-15', restSeconds: 75, exercise: { id: 'cable-fly', name: 'Cable Fly', equipment: 'cable', muscleGroup: 'chest' } },
        { sets: 3, reps: '10-12', restSeconds: 60, exercise: { id: 'tricep-pushdown', name: 'Tricep Pushdown', equipment: 'cable', muscleGroup: 'triceps' } },
      ],
      2: [
        { sets: 4, reps: '6-8', restSeconds: 150, exercise: { id: 'barbell-squat', name: 'Barbell Back Squat', equipment: 'barbell', muscleGroup: 'legs' } },
        { sets: 4, reps: '8-10', restSeconds: 120, exercise: { id: 'barbell-row', name: 'Barbell Row', equipment: 'barbell', muscleGroup: 'back' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'dumbbell-row', name: 'Dumbbell Row', equipment: 'dumbbell', muscleGroup: 'back' } },
        { sets: 3, reps: '10 each', restSeconds: 90, exercise: { id: 'dumbbell-lunge', name: 'Dumbbell Walking Lunge', equipment: 'dumbbell', muscleGroup: 'legs' } },
        { sets: 3, reps: '10-12', restSeconds: 60, exercise: { id: 'dumbbell-curl', name: 'Dumbbell Bicep Curl', equipment: 'dumbbell', muscleGroup: 'biceps' } },
      ],
      3: [
        { sets: 3, reps: '8-10', restSeconds: 120, exercise: { id: 'barbell-bench', name: 'Barbell Bench Press', equipment: 'barbell', muscleGroup: 'chest' } },
        { sets: 3, reps: '8-10', restSeconds: 150, exercise: { id: 'barbell-squat', name: 'Barbell Back Squat', equipment: 'barbell', muscleGroup: 'legs' } },
        { sets: 3, reps: '8-10', restSeconds: 120, exercise: { id: 'barbell-row', name: 'Barbell Row', equipment: 'barbell', muscleGroup: 'back' } },
        { sets: 3, reps: '10-12', restSeconds: 90, exercise: { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', equipment: 'dumbbell', muscleGroup: 'shoulders' } },
        { sets: 2, reps: '12-15', restSeconds: 60, exercise: { id: 'dumbbell-curl', name: 'Dumbbell Bicep Curl', equipment: 'dumbbell', muscleGroup: 'biceps' } },
        { sets: 2, reps: '12-15', restSeconds: 60, exercise: { id: 'tricep-pushdown', name: 'Tricep Pushdown', equipment: 'cable', muscleGroup: 'triceps' } },
      ],
    },
  },
];

export function equipmentLabel(equipment) {
  const labels = {
    machine: 'Machine',
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    cable: 'Cable',
    bodyweight: 'Bodyweight',
  };
  return labels[equipment] ?? equipment;
}
