const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function checkApiHealth() {
  try {
    await request('/api/health');
    return true;
  } catch {
    return false;
  }
}

export function getRuns() {
  return request('/api/runs');
}

export function saveRun(run) {
  return request('/api/runs', {
    method: 'POST',
    body: JSON.stringify(run),
  });
}

export function deleteRun(id) {
  return request(`/api/runs/${id}`, { method: 'DELETE' });
}

export function getPlans() {
  return request('/api/plans');
}

export function getPlan(planId, day) {
  const query = day ? `?day=${day}` : '';
  return request(`/api/plans/${planId}${query}`);
}

export function getStrengthSessions() {
  return request('/api/strength-sessions');
}

export function saveStrengthSession(session) {
  return request('/api/strength-sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  });
}

export function deleteStrengthSession(id) {
  return request(`/api/strength-sessions/${id}`, { method: 'DELETE' });
}
