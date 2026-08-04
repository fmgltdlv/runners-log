import { useState } from 'react';
import { equipmentLabel } from '../data/strengthPlans';
import { usePlans } from '../hooks/usePlans';

export default function LiftScreen({ settings, onUpdateSettings, onStartWorkout }) {
  const { plans, loading, offline } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState(settings.strengthPlanId ?? 'machine-full-body');
  const [selectedDay, setSelectedDay] = useState(settings.strengthDay ?? 1);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const dayCount = selectedPlan?.daysPerWeek ?? 3;

  const handlePlanChange = (planId) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    const maxDay = plan?.daysPerWeek ?? 3;
    const day = selectedDay > maxDay ? 1 : selectedDay;
    setSelectedDay(day);
    onUpdateSettings({ strengthPlanId: planId, strengthDay: day });
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    onUpdateSettings({ strengthDay: day });
  };

  const handleStart = () => {
    onStartWorkout({ planId: selectedPlanId, day: selectedDay });
  };

  return (
    <div className="screen lift-screen">
      <header className="screen-header">
        <p className="eyebrow">Strength Training</p>
        <h1>Lift</h1>
        <p className="subtitle">Weight lifting and machine workout plans.</p>
        {offline && <p className="hint warning">Offline — using cached plan data</p>}
      </header>

      {loading && <p className="hint">Loading plans…</p>}

      {!loading && (
        <>
          <section className="card picker-card">
            <h2>Choose plan</h2>
            <div className="plan-list">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={`plan-card ${selectedPlanId === plan.id ? 'selected' : ''}`}
                  onClick={() => handlePlanChange(plan.id)}
                >
                  <div className="plan-card-header">
                    <h3>{plan.name}</h3>
                    <span className="badge badge-muted">{plan.level}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                  <p className="plan-meta">{plan.daysPerWeek} days per week</p>
                </button>
              ))}
            </div>
          </section>

          <section className="card picker-card">
            <h2>Workout day</h2>
            <div className="day-picker">
              {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`day-btn ${selectedDay === d ? 'active' : ''}`}
                  onClick={() => handleDayChange(d)}
                >
                  Day {d}
                </button>
              ))}
            </div>

            <button className="btn btn-primary btn-large" onClick={handleStart}>
              Start workout
            </button>
          </section>

          <section className="card tips-card">
            <h2>Tips</h2>
            <ul className="tips-list">
              <li>Log weight in kg (or lbs — stay consistent).</li>
              <li>Rest timer starts automatically after each completed set.</li>
              <li>Workouts sync to the database when online.</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export function PlanExercisePreview({ exercises }) {
  if (!exercises?.length) return null;

  return (
    <ul className="exercise-preview-list">
      {exercises.map((item, i) => (
        <li key={i} className="exercise-preview-item">
          <span className="exercise-name">{item.exercise.name}</span>
          <span className="exercise-meta">
            {item.sets}×{item.reps} · {equipmentLabel(item.exercise.equipment)}
          </span>
        </li>
      ))}
    </ul>
  );
}
