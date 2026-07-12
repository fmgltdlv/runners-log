import { useEffect, useState } from 'react';
import { deleteRun, getRuns } from '../utils/db';
import { formatDate, formatDistance, formatDuration } from '../utils/format';

export default function HistoryScreen({ onContinueWorkout }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getRuns();
    setRuns(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await deleteRun(id);
    load();
  };

  return (
    <div className="screen history-screen">
      <header className="screen-header">
        <h1>History</h1>
        <p className="subtitle">Your saved runs</p>
      </header>

      {loading && <p className="hint">Loading…</p>}

      {!loading && runs.length === 0 && (
        <section className="card empty-card">
          <p>No runs yet. Complete a workout to see it here.</p>
        </section>
      )}

      <ul className="run-list">
        {runs.map((run) => (
          <li key={run.id} className="card run-card">
            <div className="run-card-header">
              <div>
                <h3>
                  Week {run.week} · {run.label}
                </h3>
                <p className="run-date">{formatDate(run.startedAt)}</p>
              </div>
              <span className={`badge ${run.completed ? 'badge-success' : 'badge-muted'}`}>
                {run.completed ? 'Complete' : 'Partial'}
              </span>
            </div>
            <div className="run-stats">
              <span>{formatDuration(run.durationSeconds)}</span>
              {run.distanceMeters > 0 && <span>{formatDistance(run.distanceMeters)}</span>}
            </div>
            <div className="run-card-actions">
              {!run.completed && onContinueWorkout && (
                <button className="btn btn-primary btn-small" onClick={() => onContinueWorkout(run)}>
                  Continue
                </button>
              )}
              <button className="btn btn-ghost btn-small" onClick={() => handleDelete(run.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
