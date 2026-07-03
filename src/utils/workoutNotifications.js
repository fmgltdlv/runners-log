import { flattenWorkout } from '../data/c25k';
import { buildTimeline, segmentLabel } from '../lib/workoutEngine';

async function waitForServiceWorkerControl() {
  if (!('serviceWorker' in navigator)) return null;

  const registration = await navigator.serviceWorker.ready;
  if (navigator.serviceWorker.controller) {
    return registration;
  }

  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 3000);
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });

  return registration;
}

async function postToServiceWorker(message) {
  const registration = await waitForServiceWorkerControl();
  const worker = navigator.serviceWorker.controller ?? registration?.active;
  if (!worker) return false;

  worker.postMessage(message);
  return true;
}

export function buildNotificationSchedule(workoutDef, elapsedSeconds = 0, baseTimeMs = Date.now()) {
  const timeline = buildTimeline(flattenWorkout(workoutDef));
  const notifications = [];

  for (let i = 1; i < timeline.length; i += 1) {
    const segment = timeline[i];
    if (segment.startAt <= elapsedSeconds) continue;

    const fireAt = baseTimeMs + (segment.startAt - elapsedSeconds) * 1000;
    notifications.push({
      id: `segment-${i}`,
      fireAt,
      title: `${segmentLabel(segment)}!`,
      body: `Switch to ${segment.type === 'run' ? 'running' : 'walking'}.`,
    });
  }

  const totalEnd = timeline.at(-1)?.endAt ?? 0;
  if (totalEnd > elapsedSeconds) {
    notifications.push({
      id: 'workout-complete',
      fireAt: baseTimeMs + (totalEnd - elapsedSeconds) * 1000,
      title: 'Workout complete!',
      body: 'Great job — you finished this session.',
    });
  }

  return notifications;
}

export async function scheduleWorkoutNotifications(workoutDef, elapsedSeconds = 0) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const notifications = buildNotificationSchedule(workoutDef, elapsedSeconds);
  if (!notifications.length) return false;

  return postToServiceWorker({
    type: 'SCHEDULE_WORKOUT',
    payload: { notifications },
  });
}

export async function cancelWorkoutNotifications() {
  return postToServiceWorker({ type: 'CANCEL_WORKOUT' });
}
