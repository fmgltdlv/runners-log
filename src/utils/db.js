import * as api from './api';

const DB_NAME = 'runners-log';
const DB_VERSION = 2;
const RUNS_STORE = 'runs';
const STRENGTH_STORE = 'strengthSessions';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(RUNS_STORE)) {
        const store = db.createObjectStore(RUNS_STORE, { keyPath: 'id' });
        store.createIndex('startedAt', 'startedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STRENGTH_STORE)) {
        const store = db.createObjectStore(STRENGTH_STORE, { keyPath: 'id' });
        store.createIndex('startedAt', 'startedAt', { unique: false });
      }
    };
  });
}

export function createId() {
  return crypto.randomUUID();
}

// --- Runs ---

async function saveRunLocal(run) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RUNS_STORE, 'readwrite');
    tx.oncomplete = () => resolve(run);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(RUNS_STORE).put(run);
  });
}

async function getRunsLocal() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RUNS_STORE, 'readonly');
    const request = tx.objectStore(RUNS_STORE).index('startedAt').getAll();
    request.onsuccess = () => {
      const runs = request.result.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
      resolve(runs);
    };
    request.onerror = () => reject(request.error);
  });
}

async function deleteRunLocal(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RUNS_STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(RUNS_STORE).delete(id);
  });
}

export async function saveRun(run) {
  await saveRunLocal(run);
  try {
    await api.saveRun(run);
  } catch {
    // Offline — local copy is source of truth until sync
  }
  return run;
}

export async function getRuns() {
  try {
    const remote = await api.getRuns();
    const db = await openDb();
    const tx = db.transaction(RUNS_STORE, 'readwrite');
    const store = tx.objectStore(RUNS_STORE);
    for (const run of remote) {
      store.put(run);
    }
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    return remote;
  } catch {
    return getRunsLocal();
  }
}

export async function deleteRun(id) {
  await deleteRunLocal(id);
  try {
    await api.deleteRun(id);
  } catch {
    // Offline
  }
}

export function createRunId() {
  return createId();
}

// --- Strength sessions ---

async function saveStrengthSessionLocal(session) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STRENGTH_STORE, 'readwrite');
    tx.oncomplete = () => resolve(session);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STRENGTH_STORE).put(session);
  });
}

async function getStrengthSessionsLocal() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STRENGTH_STORE, 'readonly');
    const request = tx.objectStore(STRENGTH_STORE).index('startedAt').getAll();
    request.onsuccess = () => {
      const sessions = request.result.sort(
        (a, b) => new Date(b.startedAt) - new Date(a.startedAt),
      );
      resolve(sessions);
    };
    request.onerror = () => reject(request.error);
  });
}

async function deleteStrengthSessionLocal(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STRENGTH_STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STRENGTH_STORE).delete(id);
  });
}

export async function saveStrengthSession(session) {
  await saveStrengthSessionLocal(session);
  try {
    await api.saveStrengthSession(session);
  } catch {
    // Offline
  }
  return session;
}

export async function getStrengthSessions() {
  try {
    const remote = await api.getStrengthSessions();
    const db = await openDb();
    const tx = db.transaction(STRENGTH_STORE, 'readwrite');
    const store = tx.objectStore(STRENGTH_STORE);
    for (const session of remote) {
      store.put(session);
    }
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    return remote;
  } catch {
    return getStrengthSessionsLocal();
  }
}

export async function deleteStrengthSession(id) {
  await deleteStrengthSessionLocal(id);
  try {
    await api.deleteStrengthSession(id);
  } catch {
    // Offline
  }
}
