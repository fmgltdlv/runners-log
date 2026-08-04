import { useCallback, useEffect, useRef, useState } from 'react';
import { equipmentLabel } from '../data/strengthPlans';
import { usePlanDay } from '../hooks/usePlans';
import { useRestTimer } from '../hooks/useRestTimer';
import { createId, saveStrengthSession } from '../utils/db';
import { formatDuration } from '../utils/format';
import { playCueSound } from '../utils/notifications';

function buildInitialSets(exercises) {
  const sets = [];
  for (const item of exercises) {
    for (let s = 1; s <= item.sets; s++) {
      sets.push({
        id: createId(),
        exerciseId: item.exercise.id,
        exerciseName: item.exercise.name,
        setNumber: s,
        totalSets: item.sets,
        reps: null,
        weightKg: null,
        completed: false,
        restSeconds: item.restSeconds,
        targetReps: item.reps,
        equipment: item.exercise.equipment,
      });
    }
  }
  return sets;
}

export default function StrengthWorkoutScreen({ planId, day, settings, onFinish }) {
  const { plan, loading } = usePlanDay(planId, day);
  const exercises = plan?.days?.[day] ?? [];
  const [sets, setSets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const startedAtRef = useRef(new Date().toISOString());
  const sessionIdRef = useRef(createId());
  const savedRef = useRef(false);
  const restTimer = useRestTimer();

  useEffect(() => {
    if (exercises.length > 0 && sets.length === 0) {
      setSets(buildInitialSets(exercises));
    }
  }, [exercises, sets.length]);

  const currentSet = sets[currentIndex];
  const completedCount = sets.filter((s) => s.completed).length;
  const allComplete = sets.length > 0 && completedCount === sets.length;

  const saveSession = useCallback(
    async (completed) => {
      if (savedRef.current) return;
      savedRef.current = true;

      await saveStrengthSession({
        id: sessionIdRef.current,
        planId,
        planName: plan?.name ?? planId,
        planDay: day,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        completed,
        sets: sets.map((s) => ({
          id: s.id,
          exerciseId: s.exerciseId,
          exerciseName: s.exerciseName,
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
          completed: s.completed,
        })),
      });
    },
    [planId, plan, day, sets],
  );

  const completeCurrentSet = () => {
    if (!currentSet) return;

    const reps = repsInput ? Number(repsInput) : null;
    const weightKg = weightInput ? Number(weightInput) : null;

    setSets((prev) =>
      prev.map((s, i) =>
        i === currentIndex ? { ...s, reps, weightKg, completed: true } : s,
      ),
    );

    if (settings.soundCues) playCueSound('walk');

    const nextIndex = currentIndex + 1;
    if (nextIndex < sets.length) {
      restTimer.start(currentSet.restSeconds);
      setCurrentIndex(nextIndex);
      setRepsInput('');
    } else {
      if (settings.soundCues) playCueSound('run');
    }
  };

  const handleFinish = async () => {
    if (completedCount > 0) {
      await saveSession(allComplete);
    }
    onFinish();
  };

  if (loading) {
    return (
      <div className="screen">
        <p className="hint">Loading workout…</p>
      </div>
    );
  }

  if (!exercises.length) {
    return (
      <div className="screen">
        <p>Workout not found.</p>
        <button className="btn" onClick={onFinish}>
          Back
        </button>
      </div>
    );
  }

  const isNewExercise =
    currentIndex === 0 ||
    sets[currentIndex - 1]?.exerciseId !== currentSet?.exerciseId;

  return (
    <div className="screen strength-workout-screen">
      <div className="workout-top">
        <p className="eyebrow">
          {plan?.name} · Day {day}
        </p>
        <h2 className="phase-title">
          {allComplete ? 'Workout complete!' : currentSet?.exerciseName}
        </h2>
        {!allComplete && currentSet && (
          <>
            <p className="strength-set-label">
              Set {currentSet.setNumber} of {currentSet.totalSets}
            </p>
            <p className="timer-sub">
              Target: {currentSet.targetReps} reps · {equipmentLabel(currentSet.equipment)}
            </p>
          </>
        )}
      </div>

      {restTimer.isActive && (
        <div className="card rest-card">
          <p className="rest-label">Rest</p>
          <p className="timer-display rest-timer">{formatDuration(restTimer.remaining)}</p>
          <button className="btn btn-secondary" onClick={restTimer.skip}>
            Skip rest
          </button>
        </div>
      )}

      {!allComplete && currentSet && !restTimer.isActive && (
        <section className="card set-log-card">
          {isNewExercise && (
            <p className="exercise-transition">
              Next: {currentSet.exerciseName}
            </p>
          )}
          <div className="set-inputs">
            <label>
              Weight (kg)
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
              />
            </label>
            <label>
              Reps
              <input
                type="number"
                inputMode="numeric"
                placeholder={currentSet.targetReps}
                value={repsInput}
                onChange={(e) => setRepsInput(e.target.value)}
              />
            </label>
          </div>
          <button className="btn btn-primary btn-large" onClick={completeCurrentSet}>
            Complete set
          </button>
        </section>
      )}

      <section className="card progress-card">
        <p className="workout-meta">
          {completedCount} / {sets.length} sets completed
        </p>
        <ul className="set-progress-list">
          {sets.map((s, i) => (
            <li
              key={s.id}
              className={`set-progress-item ${s.completed ? 'done' : ''} ${i === currentIndex && !allComplete ? 'current' : ''}`}
            >
              <span className="set-progress-name">{s.exerciseName}</span>
              <span className="set-progress-detail">
                {s.completed
                  ? `${s.weightKg ?? '—'} kg × ${s.reps ?? '—'}`
                  : `Set ${s.setNumber}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="workout-actions">
        {allComplete ? (
          <button className="btn btn-primary btn-large" onClick={handleFinish}>
            Done
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={handleFinish}>
            End early
          </button>
        )}
      </div>
    </div>
  );
}
