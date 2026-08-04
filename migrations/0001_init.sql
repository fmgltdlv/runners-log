-- Running workouts
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  program TEXT NOT NULL DEFAULT 'C25K',
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  label TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  distance_meters INTEGER NOT NULL DEFAULT 0,
  track_json TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at DESC);

-- Exercise catalog
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  equipment TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  notes TEXT
);

-- Workout plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL DEFAULT 'beginner',
  days_per_week INTEGER NOT NULL DEFAULT 3
);

-- Exercises within a plan day
CREATE TABLE IF NOT EXISTS plan_exercises (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES workout_plans(id),
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  day_number INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  rest_seconds INTEGER NOT NULL DEFAULT 90,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan_day ON plan_exercises(plan_id, day_number);

-- Completed strength sessions
CREATE TABLE IF NOT EXISTS strength_sessions (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_day INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_strength_sessions_started_at ON strength_sessions(started_at DESC);

-- Logged sets per session
CREATE TABLE IF NOT EXISTS strength_set_logs (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES strength_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg REAL,
  completed INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_strength_set_logs_session ON strength_set_logs(session_id);

-- Seed exercises
INSERT INTO exercises (id, name, equipment, muscle_group, notes) VALUES
  ('leg-press', 'Leg Press', 'machine', 'legs', 'Feet shoulder-width on platform'),
  ('chest-press', 'Chest Press Machine', 'machine', 'chest', 'Adjust seat so handles align with mid-chest'),
  ('lat-pulldown', 'Lat Pulldown', 'machine', 'back', 'Pull bar to upper chest, squeeze shoulder blades'),
  ('seated-row', 'Seated Cable Row', 'machine', 'back', 'Keep torso upright, pull to lower ribs'),
  ('shoulder-press-machine', 'Shoulder Press Machine', 'machine', 'shoulders', 'Do not lock elbows at top'),
  ('leg-curl', 'Seated Leg Curl', 'machine', 'hamstrings', 'Control the negative'),
  ('leg-extension', 'Leg Extension', 'machine', 'quads', 'Pause at top, avoid hyperextension'),
  ('cable-fly', 'Cable Fly', 'cable', 'chest', 'Slight bend in elbows throughout'),
  ('tricep-pushdown', 'Tricep Pushdown', 'cable', 'triceps', 'Keep elbows pinned to sides'),
  ('bicep-curl-machine', 'Bicep Curl Machine', 'machine', 'biceps', 'Full range of motion'),
  ('smith-squat', 'Smith Machine Squat', 'machine', 'legs', 'Feet slightly forward of bar path'),
  ('hack-squat', 'Hack Squat', 'machine', 'legs', 'Back flat against pad'),
  ('barbell-bench', 'Barbell Bench Press', 'barbell', 'chest', 'Retract shoulder blades, feet flat'),
  ('barbell-row', 'Barbell Row', 'barbell', 'back', 'Hinge at hips, pull to lower chest'),
  ('barbell-squat', 'Barbell Back Squat', 'barbell', 'legs', 'Brace core, depth to parallel'),
  ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'dumbbell', 'shoulders', 'Neutral or pronated grip'),
  ('dumbbell-row', 'Dumbbell Row', 'dumbbell', 'back', 'Support on bench, pull elbow back'),
  ('dumbbell-curl', 'Dumbbell Bicep Curl', 'dumbbell', 'biceps', 'Alternate or simultaneous'),
  ('dumbbell-lunge', 'Dumbbell Walking Lunge', 'dumbbell', 'legs', 'Knee tracks over toes'),
  ('cable-face-pull', 'Cable Face Pull', 'cable', 'shoulders', 'External rotation at end of pull');

-- Seed workout plans
INSERT INTO workout_plans (id, name, description, level, days_per_week) VALUES
  (
    'machine-full-body',
    'Machine Full Body',
    'Beginner-friendly full-body routine using gym machines. Great for learning movement patterns safely.',
    'beginner',
    3
  ),
  (
    'machine-upper-lower',
    'Machine Upper / Lower',
    'Four-day split alternating upper and lower body machine work for balanced strength.',
    'beginner',
    4
  ),
  (
    'free-weight-foundation',
    'Free Weight Foundation',
    'Barbell and dumbbell basics for building strength with compound lifts.',
    'intermediate',
    3
  );

-- Machine Full Body — Day 1
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('mfb-d1-1', 'machine-full-body', 'leg-press', 1, 1, 3, '10-12', 90, NULL),
  ('mfb-d1-2', 'machine-full-body', 'chest-press', 1, 2, 3, '10-12', 90, NULL),
  ('mfb-d1-3', 'machine-full-body', 'lat-pulldown', 1, 3, 3, '10-12', 90, NULL),
  ('mfb-d1-4', 'machine-full-body', 'shoulder-press-machine', 1, 4, 3, '10-12', 90, NULL),
  ('mfb-d1-5', 'machine-full-body', 'leg-curl', 1, 5, 3, '12-15', 60, NULL),
  ('mfb-d1-6', 'machine-full-body', 'bicep-curl-machine', 1, 6, 2, '12-15', 60, NULL),
  ('mfb-d1-7', 'machine-full-body', 'tricep-pushdown', 1, 7, 2, '12-15', 60, NULL);

-- Machine Full Body — Day 2
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('mfb-d2-1', 'machine-full-body', 'hack-squat', 2, 1, 3, '10-12', 90, NULL),
  ('mfb-d2-2', 'machine-full-body', 'cable-fly', 2, 2, 3, '12-15', 75, NULL),
  ('mfb-d2-3', 'machine-full-body', 'seated-row', 2, 3, 3, '10-12', 90, NULL),
  ('mfb-d2-4', 'machine-full-body', 'cable-face-pull', 2, 4, 3, '15-20', 60, NULL),
  ('mfb-d2-5', 'machine-full-body', 'leg-extension', 2, 5, 3, '12-15', 60, NULL),
  ('mfb-d2-6', 'machine-full-body', 'bicep-curl-machine', 2, 6, 2, '12-15', 60, NULL),
  ('mfb-d2-7', 'machine-full-body', 'tricep-pushdown', 2, 7, 2, '12-15', 60, NULL);

-- Machine Full Body — Day 3
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('mfb-d3-1', 'machine-full-body', 'smith-squat', 3, 1, 3, '8-10', 120, 'Heavier day — add weight when all sets feel easy'),
  ('mfb-d3-2', 'machine-full-body', 'chest-press', 3, 2, 4, '8-10', 90, NULL),
  ('mfb-d3-3', 'machine-full-body', 'lat-pulldown', 3, 3, 4, '8-10', 90, NULL),
  ('mfb-d3-4', 'machine-full-body', 'shoulder-press-machine', 3, 4, 3, '10-12', 90, NULL),
  ('mfb-d3-5', 'machine-full-body', 'leg-curl', 3, 5, 3, '12-15', 60, NULL);

-- Machine Upper/Lower — Day 1 (Upper)
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('mul-d1-1', 'machine-upper-lower', 'chest-press', 1, 1, 4, '8-12', 90, NULL),
  ('mul-d1-2', 'machine-upper-lower', 'lat-pulldown', 1, 2, 4, '8-12', 90, NULL),
  ('mul-d1-3', 'machine-upper-lower', 'shoulder-press-machine', 1, 3, 3, '10-12', 90, NULL),
  ('mul-d1-4', 'machine-upper-lower', 'cable-fly', 1, 4, 3, '12-15', 75, NULL),
  ('mul-d1-5', 'machine-upper-lower', 'seated-row', 1, 5, 3, '10-12', 90, NULL),
  ('mul-d1-6', 'machine-upper-lower', 'tricep-pushdown', 1, 6, 3, '12-15', 60, NULL),
  ('mul-d1-7', 'machine-upper-lower', 'bicep-curl-machine', 1, 7, 3, '12-15', 60, NULL);

-- Machine Upper/Lower — Day 2 (Lower)
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('mul-d2-1', 'machine-upper-lower', 'leg-press', 2, 1, 4, '10-12', 120, NULL),
  ('mul-d2-2', 'machine-upper-lower', 'hack-squat', 2, 2, 3, '10-12', 120, NULL),
  ('mul-d2-3', 'machine-upper-lower', 'leg-extension', 2, 3, 3, '12-15', 75, NULL),
  ('mul-d2-4', 'machine-upper-lower', 'leg-curl', 2, 4, 3, '12-15', 75, NULL),
  ('mul-d2-5', 'machine-upper-lower', 'smith-squat', 2, 5, 3, '10-12', 120, NULL);

-- Machine Upper/Lower — Day 3 (Upper)
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('mul-d3-1', 'machine-upper-lower', 'cable-fly', 3, 1, 4, '10-12', 75, NULL),
  ('mul-d3-2', 'machine-upper-lower', 'seated-row', 3, 2, 4, '8-12', 90, NULL),
  ('mul-d3-3', 'machine-upper-lower', 'lat-pulldown', 3, 3, 3, '10-12', 90, NULL),
  ('mul-d3-4', 'machine-upper-lower', 'cable-face-pull', 3, 4, 3, '15-20', 60, NULL),
  ('mul-d3-5', 'machine-upper-lower', 'shoulder-press-machine', 3, 5, 3, '10-12', 90, NULL),
  ('mul-d3-6', 'machine-upper-lower', 'bicep-curl-machine', 3, 6, 3, '12-15', 60, NULL),
  ('mul-d3-7', 'machine-upper-lower', 'tricep-pushdown', 3, 7, 3, '12-15', 60, NULL);

-- Machine Upper/Lower — Day 4 (Lower)
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('mul-d4-1', 'machine-upper-lower', 'hack-squat', 4, 1, 4, '8-10', 120, NULL),
  ('mul-d4-2', 'machine-upper-lower', 'leg-press', 4, 2, 3, '10-12', 120, NULL),
  ('mul-d4-3', 'machine-upper-lower', 'leg-curl', 4, 3, 4, '10-12', 75, NULL),
  ('mul-d4-4', 'machine-upper-lower', 'leg-extension', 4, 4, 3, '12-15', 75, NULL),
  ('mul-d4-5', 'machine-upper-lower', 'smith-squat', 4, 5, 3, '8-10', 120, NULL);

-- Free Weight Foundation — Day 1 (Push)
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('fwf-d1-1', 'free-weight-foundation', 'barbell-bench', 1, 1, 4, '6-8', 120, NULL),
  ('fwf-d1-2', 'free-weight-foundation', 'dumbbell-shoulder-press', 1, 2, 3, '8-10', 90, NULL),
  ('fwf-d1-3', 'free-weight-foundation', 'cable-fly', 1, 3, 3, '12-15', 75, NULL),
  ('fwf-d1-4', 'free-weight-foundation', 'tricep-pushdown', 1, 4, 3, '10-12', 60, NULL);

-- Free Weight Foundation — Day 2 (Pull + Legs)
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('fwf-d2-1', 'free-weight-foundation', 'barbell-squat', 2, 1, 4, '6-8', 150, NULL),
  ('fwf-d2-2', 'free-weight-foundation', 'barbell-row', 2, 2, 4, '8-10', 120, NULL),
  ('fwf-d2-3', 'free-weight-foundation', 'dumbbell-row', 2, 3, 3, '10-12', 90, NULL),
  ('fwf-d2-4', 'free-weight-foundation', 'dumbbell-lunge', 2, 4, 3, '10 each', 90, NULL),
  ('fwf-d2-5', 'free-weight-foundation', 'dumbbell-curl', 2, 5, 3, '10-12', 60, NULL);

-- Free Weight Foundation — Day 3 (Full Body)
INSERT INTO plan_exercises (id, plan_id, exercise_id, day_number, order_index, sets, reps, rest_seconds, notes) VALUES
  ('fwf-d3-1', 'free-weight-foundation', 'barbell-bench', 3, 1, 3, '8-10', 120, NULL),
  ('fwf-d3-2', 'free-weight-foundation', 'barbell-squat', 3, 2, 3, '8-10', 150, NULL),
  ('fwf-d3-3', 'free-weight-foundation', 'barbell-row', 3, 3, 3, '8-10', 120, NULL),
  ('fwf-d3-4', 'free-weight-foundation', 'dumbbell-shoulder-press', 3, 4, 3, '10-12', 90, NULL),
  ('fwf-d3-5', 'free-weight-foundation', 'dumbbell-curl', 3, 5, 2, '12-15', 60, NULL),
  ('fwf-d3-6', 'free-weight-foundation', 'tricep-pushdown', 3, 6, 2, '12-15', 60, NULL);
