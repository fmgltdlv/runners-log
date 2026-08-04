import { useEffect, useState } from 'react';
import { deleteRun, deleteStrengthSession, getRuns, getStrengthSessions } from '../utils/db';
import { formatDate, formatDistance, formatDuration } from '../utils/format';

export default function HistoryScreen({ onContinueWorkout }) {
  const [runs, setRuns] = useState([]);
  const [strengthSessions, setStrengthSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const [runData, strengthData] = await Promise.all([getRuns(), getStrengthSessions()]);
    setRuns(runData);
    setStrengthSessions(strengthData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeleteRun = async (id) => {
    await deleteRun(id);
    load();
  };

  const handleDeleteStrength = async (id) => {
    await deleteStrengthSession(id);
    load();
  };

  const showRuns = filter === 'all' || filter === 'runs';
  const showStrength = filter === 'all' || filter === 'strength';
  const isEmpty = !loading && runs.length === 0 && strengthSessions.length === 0;

  return (
    <div className="screen history-screen">
      <header className="screen-header">
        <h1>History</h1>
        <p className="subtitle">Runs and strength workouts</p>
      </header>

      <div className="history-filters">
        {[
          { id: 'all', label: 'All' },
          { id: 'runs', label: 'Runs' },
          { id: 'strength', label: 'Strength' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-btn ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="hint">Loading…</p>}

      {isEmpty && (
        <section className="card empty-card">
          <p>No workouts yet. Complete a run or strength session to see it here.</p>
        </section>
      )}

      {showStrength && strengthSessions.length > 0 && (
        <section className="history-section">
          {filter === 'all' && <h2 className="history-section-title">Strength</h2>}
          <ul className="run-list">
            {strengthSessions.map((session) => {
              const completedSets = session.sets?.filter((s) => s.completed).length ?? 0;
              const totalSets = session.sets?.length ?? 0;
              return (
                <li key={session.id} className="card run-card">
                  <div className="run-card-header">
                    <div>
                      <h3>
                        {session.planName} · Day {session.planDay}
                      </h3>
                      <p className="run-date">{formatDate(session.startedAt)}</p>
                    </div>
                    <span className={`badge ${session.completed ? 'badge-success' : 'badge-muted'}`}>
                      {session.completed ? 'Complete' : 'Partial'}
                    </span>
                  </div>
                  <div className="run-stats">
                    <span>
                      {completedSets}/{totalSets} sets
                    </span>
                  </div>
                  <div className="run-card-actions">
                    <button
                      className="btn btn-ghost btn-small"
                      onClick={() => handleDeleteStrength(session.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {showRuns && runs.length > 0 && (
        <section className="history-section">
          {filter === 'all' && <h2 className="history-section-title">Runs</h2>}
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
                  <button className="btn btn-ghost btn-small" onClick={() => handleDeleteRun(run.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
