const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function error(message, status = 400) {
  return json({ error: message }, status);
}

function mapRun(row) {
  return {
    id: row.id,
    program: row.program,
    week: row.week,
    day: row.day,
    label: row.label,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationSeconds: row.duration_seconds,
    distanceMeters: row.distance_meters,
    track: row.track_json ? JSON.parse(row.track_json) : [],
    completed: Boolean(row.completed),
  };
}

function mapStrengthSession(row, sets = []) {
  return {
    id: row.id,
    planId: row.plan_id,
    planName: row.plan_name,
    planDay: row.plan_day,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    completed: Boolean(row.completed),
    notes: row.notes,
    sets: sets.map((s) => ({
      id: s.id,
      exerciseId: s.exercise_id,
      exerciseName: s.exercise_name,
      setNumber: s.set_number,
      reps: s.reps,
      weightKg: s.weight_kg,
      completed: Boolean(s.completed),
    })),
  };
}

async function handleRuns(request, env, url) {
  const { DB } = env;

  if (request.method === 'GET') {
    const { results } = await DB.prepare(
      'SELECT * FROM runs ORDER BY started_at DESC',
    ).all();
    return json(results.map(mapRun));
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const {
      id,
      program = 'C25K',
      week,
      day,
      label,
      startedAt,
      endedAt = null,
      durationSeconds = 0,
      distanceMeters = 0,
      track = [],
      completed = false,
    } = body;

    if (!id || week == null || day == null || !label || !startedAt) {
      return error('Missing required run fields');
    }

    await DB.prepare(
      `INSERT INTO runs (id, program, week, day, label, started_at, ended_at, duration_seconds, distance_meters, track_json, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         ended_at = excluded.ended_at,
         duration_seconds = excluded.duration_seconds,
         distance_meters = excluded.distance_meters,
         track_json = excluded.track_json,
         completed = excluded.completed`,
    )
      .bind(
        id,
        program,
        week,
        day,
        label,
        startedAt,
        endedAt,
        durationSeconds,
        distanceMeters,
        JSON.stringify(track),
        completed ? 1 : 0,
      )
      .run();

    return json({ ok: true, id }, 201);
  }

  if (request.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    if (!id) return error('Run id required');
    await DB.prepare('DELETE FROM runs WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }

  return error('Method not allowed', 405);
}

async function handlePlans(request, env, url) {
  const { DB } = env;

  if (request.method !== 'GET') {
    return error('Method not allowed', 405);
  }

  const parts = url.pathname.split('/').filter(Boolean);
  const planId = parts[2];
  const day = url.searchParams.get('day');

  if (!planId) {
    const { results } = await DB.prepare(
      'SELECT * FROM workout_plans ORDER BY name',
    ).all();
    return json(
      results.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        level: p.level,
        daysPerWeek: p.days_per_week,
      })),
    );
  }

  let query = `
    SELECT
      pe.id,
      pe.day_number,
      pe.order_index,
      pe.sets,
      pe.reps,
      pe.rest_seconds,
      pe.notes AS plan_notes,
      e.id AS exercise_id,
      e.name AS exercise_name,
      e.equipment,
      e.muscle_group,
      e.notes AS exercise_notes
    FROM plan_exercises pe
    JOIN exercises e ON e.id = pe.exercise_id
    WHERE pe.plan_id = ?
  `;
  const bindings = [planId];

  if (day) {
    query += ' AND pe.day_number = ?';
    bindings.push(Number(day));
  }

  query += ' ORDER BY pe.day_number, pe.order_index';

  const { results } = await DB.prepare(query).bind(...bindings).all();

  const plan = await DB.prepare('SELECT * FROM workout_plans WHERE id = ?')
    .bind(planId)
    .first();

  if (!plan) {
    return error('Plan not found', 404);
  }

  const days = {};
  for (const row of results) {
    const dayNum = row.day_number;
    if (!days[dayNum]) days[dayNum] = [];
    days[dayNum].push({
      id: row.id,
      orderIndex: row.order_index,
      sets: row.sets,
      reps: row.reps,
      restSeconds: row.rest_seconds,
      notes: row.plan_notes,
      exercise: {
        id: row.exercise_id,
        name: row.exercise_name,
        equipment: row.equipment,
        muscleGroup: row.muscle_group,
        notes: row.exercise_notes,
      },
    });
  }

  return json({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    level: plan.level,
    daysPerWeek: plan.days_per_week,
    days,
  });
}

async function handleStrengthSessions(request, env, url) {
  const { DB } = env;

  if (request.method === 'GET') {
    const { results: sessions } = await DB.prepare(
      'SELECT * FROM strength_sessions ORDER BY started_at DESC',
    ).all();

    const mapped = [];
    for (const session of sessions) {
      const { results: sets } = await DB.prepare(
        'SELECT * FROM strength_set_logs WHERE session_id = ? ORDER BY set_number',
      )
        .bind(session.id)
        .all();
      mapped.push(mapStrengthSession(session, sets));
    }

    return json(mapped);
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const {
      id,
      planId,
      planName,
      planDay,
      startedAt,
      endedAt = null,
      completed = false,
      notes = null,
      sets = [],
    } = body;

    if (!id || !planId || !planName || planDay == null || !startedAt) {
      return error('Missing required session fields');
    }

    await DB.prepare(
      `INSERT INTO strength_sessions (id, plan_id, plan_name, plan_day, started_at, ended_at, completed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         ended_at = excluded.ended_at,
         completed = excluded.completed,
         notes = excluded.notes`,
    )
      .bind(id, planId, planName, planDay, startedAt, endedAt, completed ? 1 : 0, notes)
      .run();

    await DB.prepare('DELETE FROM strength_set_logs WHERE session_id = ?')
      .bind(id)
      .run();

    for (const set of sets) {
      await DB.prepare(
        `INSERT INTO strength_set_logs (id, session_id, exercise_id, exercise_name, set_number, reps, weight_kg, completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          set.id,
          id,
          set.exerciseId,
          set.exerciseName,
          set.setNumber,
          set.reps ?? null,
          set.weightKg ?? null,
          set.completed ? 1 : 0,
        )
        .run();
    }

    return json({ ok: true, id }, 201);
  }

  if (request.method === 'DELETE') {
    const id = url.pathname.split('/').pop();
    if (!id) return error('Session id required');
    await DB.prepare('DELETE FROM strength_set_logs WHERE session_id = ?').bind(id).run();
    await DB.prepare('DELETE FROM strength_sessions WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }

  return error('Method not allowed', 405);
}

async function handleApi(request, env, url) {
  const path = url.pathname;

  if (path === '/api/health') {
    return json({ ok: true, service: 'runners-log-api' });
  }

  if (path.startsWith('/api/runs')) {
    return handleRuns(request, env, url);
  }

  if (path.startsWith('/api/plans')) {
    return handlePlans(request, env, url);
  }

  if (path.startsWith('/api/strength-sessions')) {
    return handleStrengthSessions(request, env, url);
  }

  return error('Not found', 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        console.error(err);
        return error(err.message || 'Internal server error', 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
