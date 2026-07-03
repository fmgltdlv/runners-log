const DB_NAME = 'runners-log';
const DB_VERSION = 1;
const STORE = 'runs';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('startedAt', 'startedAt', { unique: false });
      }
    };
  });
}

export async function saveRun(run) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve(run);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(run);
  });
}

export async function getRuns() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).index('startedAt').getAll();
    request.onsuccess = () => {
      const runs = request.result.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
      resolve(runs);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRun(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(id);
  });
}

export function createRunId() {
  return crypto.randomUUID();
}
