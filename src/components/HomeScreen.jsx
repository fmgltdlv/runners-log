import { C25K_PROGRAM, getWorkout, getWorkoutTotalDuration } from '../data/c25k';
import { formatDuration } from '../utils/format';

export default function HomeScreen({ settings, onUpdateSettings, onStartWorkout }) {
  const workout = getWorkout(settings.week, settings.day);
  const totalDuration = workout ? getWorkoutTotalDuration(workout) : 0;

  return (
    <div className="screen home-screen">
      <header className="screen-header">
        <p className="eyebrow">Couch to 5K</p>
        <h1>Runners Log</h1>
        <p className="subtitle">Interval timer, run history, installable PWA.</p>
      </header>

      <section className="card picker-card">
        <h2>Choose workout</h2>
        <div className="picker-row">
          <label>
            Week
            <select
              value={settings.week}
              onChange={(e) => onUpdateSettings({ week: Number(e.target.value) })}
            >
              {C25K_PROGRAM.weeks.map((w) => (
                <option key={w.week} value={w.week}>
                  Week {w.week}
                </option>
              ))}
            </select>
          </label>
          <label>
            Day
            <select
              value={settings.day}
              onChange={(e) => onUpdateSettings({ day: Number(e.target.value) })}
            >
              {[1, 2, 3].map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        {workout && (
          <div className="workout-summary">
            <p className="workout-label">{workout.label}</p>
            <p className="workout-meta">~{formatDuration(totalDuration)} total</p>
            <p className="workout-meta">
              {workout.intervals.filter((i) => i.type === 'run').length} run intervals
            </p>
          </div>
        )}

        <button className="btn btn-primary btn-large" onClick={onStartWorkout} disabled={!workout}>
          Start workout
        </button>
      </section>

      <section className="card tips-card">
        <h2>Before you go</h2>
        <ul className="tips-list">
          <li>Enable notifications for interval alerts when the screen is off.</li>
          <li>GPS is optional — distance tracking works best with the app open.</li>
          <li>Install this app to your home screen for the best experience.</li>
        </ul>
      </section>
    </div>
  );
}
