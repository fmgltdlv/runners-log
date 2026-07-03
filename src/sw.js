/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const INTERVAL_TAG = 'c25k-interval';
const ACTIVE_TAG = 'workout-active';
const SCHEDULE_KEY = 'active';
const DB_NAME = 'runners-log-sw';
const DB_VERSION = 1;
const STORE = 'notification-schedule';

/** @type {WorkoutSession | null} */
let workoutSession = null;

function openScheduleDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

async function saveSchedule(data) {
  const db = await openScheduleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(data, SCHEDULE_KEY);
  });
}

async function loadSchedule() {
  const db = await openScheduleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(SCHEDULE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function clearSchedule() {
  const db = await openScheduleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(SCHEDULE_KEY);
  });
}

async function closeAllWorkoutNotifications() {
  const notifications = await self.registration.getNotifications();
  notifications
    .filter(
      (notification) =>
        notification.tag === ACTIVE_TAG ||
        notification.tag === INTERVAL_TAG ||
        notification.tag?.startsWith(`${INTERVAL_TAG}-`),
    )
    .forEach((notification) => notification.close());
}

async function showIntervalNotification(item) {
  await self.registration.showNotification(item.title, {
    body: item.body,
    tag: INTERVAL_TAG,
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200],
    data: { id: item.id, type: 'interval' },
  });
}

async function showWorkoutActiveNotification() {
  await self.registration.showNotification('Workout in progress', {
    body: 'Tap to return. Interval alerts are active.',
    tag: ACTIVE_TAG,
    silent: true,
    requireInteraction: true,
    data: { type: 'workout-active' },
  });
}

class WorkoutSession {
  constructor(notifications, resolve) {
    this.notifications = [...notifications]
      .filter((item) => item.fireAt > Date.now())
      .sort((a, b) => a.fireAt - b.fireAt);
    this.fired = new Set();
    this.resolve = resolve;
    this.timeoutId = null;
  }

  arm() {
    const pending = this.notifications.filter(
      (item) => !this.fired.has(item.id) && item.fireAt > Date.now(),
    );

    if (!pending.length) {
      this.finish();
      return;
    }

    const next = pending[0];
    const delay = Math.max(0, next.fireAt - Date.now());
    this.timeoutId = setTimeout(() => {
      this.fire(next);
    }, delay);
  }

  async fire(item) {
    this.fired.add(item.id);
    await this.markFired(item.id);
    await showIntervalNotification(item);
    this.arm();
  }

  async markFired(id) {
    const schedule = await loadSchedule();
    if (!schedule) return;

    const fired = new Set(schedule.fired ?? []);
    fired.add(id);
    await saveSchedule({ ...schedule, fired: [...fired] });
  }

  finish() {
    clearTimeout(this.timeoutId);
    this.resolve?.();
    if (workoutSession === this) {
      workoutSession = null;
    }
  }

  cancel() {
    clearTimeout(this.timeoutId);
    this.resolve?.();
    if (workoutSession === this) {
      workoutSession = null;
    }
  }
}

async function registerBackgroundSync() {
  if (!('sync' in self.registration)) return;
  try {
    await self.registration.sync.register('workout-intervals');
  } catch {
    // Background Sync may be unavailable
  }
}

async function processScheduleBackup() {
  const schedule = await loadSchedule();
  if (!schedule?.notifications?.length) return;

  const fired = new Set(schedule.fired ?? []);
  const now = Date.now();
  let changed = false;

  for (const item of schedule.notifications) {
    if (item.fireAt <= now && !fired.has(item.id)) {
      await showIntervalNotification(item);
      fired.add(item.id);
      changed = true;
    }
  }

  if (changed) {
    await saveSchedule({ ...schedule, fired: [...fired] });
  }

  const hasPending = schedule.notifications.some(
    (item) => item.fireAt > now && !fired.has(item.id),
  );

  if (hasPending && !workoutSession) {
    await startWorkoutSession(schedule.notifications);
  }
}

function startWorkoutSession(notifications) {
  if (workoutSession) {
    workoutSession.cancel();
  }

  return new Promise((resolve) => {
    workoutSession = new WorkoutSession(notifications, resolve);
    workoutSession.arm();
  });
}

async function handleScheduleWorkout(notifications) {
  const schedule = {
    notifications,
    fired: [],
    updatedAt: Date.now(),
  };

  await saveSchedule(schedule);
  await registerBackgroundSync();
  await closeAllWorkoutNotifications();
  await showWorkoutActiveNotification();

  return startWorkoutSession(notifications);
}

async function handleCancelWorkout() {
  workoutSession?.cancel();
  await clearSchedule();
  await closeAllWorkoutNotifications();
}

self.addEventListener('message', (event) => {
  const { type, payload } = event.data ?? {};

  if (type === 'SCHEDULE_WORKOUT') {
    event.waitUntil(handleScheduleWorkout(payload.notifications));
    return;
  }

  if (type === 'CANCEL_WORKOUT') {
    event.waitUntil(handleCancelWorkout());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'workout-intervals') {
    event.waitUntil(processScheduleBackup());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow('/');
    }),
  );
});
