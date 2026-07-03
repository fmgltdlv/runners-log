/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const INTERVAL_TAG = 'c25k-interval';
const ACTIVE_TAG = 'workout-active';
const scheduledTimeouts = new Map();

function clearScheduledTimeouts() {
  for (const timeoutId of scheduledTimeouts.values()) {
    clearTimeout(timeoutId);
  }
  scheduledTimeouts.clear();
}

async function closeTaggedNotifications(tag) {
  const notifications = await self.registration.getNotifications({ tag });
  notifications.forEach((notification) => notification.close());
}

async function showIntervalNotification({ title, body, id }) {
  await self.registration.showNotification(title, {
    body,
    tag: INTERVAL_TAG,
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200],
    data: { id, type: 'interval' },
  });
}

function scheduleWithTimeout(item) {
  const delay = Math.max(0, item.fireAt - Date.now());
  if (delay === 0 && item.fireAt < Date.now() - 1000) return;

  const timeoutId = setTimeout(() => {
    scheduledTimeouts.delete(item.id);
    showIntervalNotification(item);
  }, delay);

  scheduledTimeouts.set(item.id, timeoutId);
}

async function scheduleWithTrigger(item) {
  if (typeof TimestampTrigger === 'undefined') return false;

  try {
    await self.registration.showNotification(item.title, {
      body: item.body,
      tag: `${INTERVAL_TAG}-${item.id}`,
      renotify: true,
      silent: false,
      vibrate: [200, 100, 200],
      showTrigger: new TimestampTrigger(item.fireAt),
      data: { id: item.id, type: 'interval', scheduled: true },
    });
    return true;
  } catch {
    return false;
  }
}

async function scheduleNotifications(notifications) {
  clearScheduledTimeouts();
  await closeTaggedNotifications(INTERVAL_TAG);

  for (const item of notifications) {
    if (item.fireAt <= Date.now()) continue;

    const usedTrigger = await scheduleWithTrigger(item);
    if (!usedTrigger) {
      scheduleWithTimeout(item);
    }
  }
}

async function showWorkoutActiveNotification() {
  await self.registration.showNotification('Workout in progress', {
    body: 'Runners Log will alert you at each interval.',
    tag: ACTIVE_TAG,
    silent: true,
    requireInteraction: true,
    data: { type: 'workout-active' },
  });
}

async function cancelWorkout() {
  clearScheduledTimeouts();
  await closeTaggedNotifications(INTERVAL_TAG);
  await closeTaggedNotifications(ACTIVE_TAG);

  const all = await self.registration.getNotifications();
  all
    .filter((n) => n.tag?.startsWith(`${INTERVAL_TAG}-`) || n.tag === INTERVAL_TAG)
    .forEach((n) => n.close());
}

self.addEventListener('message', (event) => {
  const { type, payload } = event.data ?? {};

  switch (type) {
    case 'SCHEDULE_WORKOUT':
      scheduleNotifications(payload.notifications);
      showWorkoutActiveNotification();
      break;
    case 'CANCEL_WORKOUT':
      cancelWorkout();
      break;
    default:
      break;
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
