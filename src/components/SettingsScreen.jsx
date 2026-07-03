import { requestNotificationPermission } from '../utils/notifications';

export default function SettingsScreen({ settings, onUpdateSettings }) {
  const notificationStatus =
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
    onUpdateSettings({ notifications: true });
  };

  return (
    <div className="screen settings-screen">
      <header className="screen-header">
        <h1>Settings</h1>
        <p className="subtitle">Customize your workout experience</p>
      </header>

      <section className="card settings-card">
        <h2>During workout</h2>

        <label className="toggle-row">
          <span>
            <strong>Keep screen on</strong>
            <small>Uses Wake Lock while running</small>
          </span>
          <input
            type="checkbox"
            checked={settings.keepScreenOn}
            onChange={(e) => onUpdateSettings({ keepScreenOn: e.target.checked })}
          />
        </label>

        <label className="toggle-row">
          <span>
            <strong>Sound cues</strong>
            <small>Beeps when intervals change (app open)</small>
          </span>
          <input
            type="checkbox"
            checked={settings.soundCues}
            onChange={(e) => onUpdateSettings({ soundCues: e.target.checked })}
          />
        </label>

        <label className="toggle-row">
          <span>
            <strong>Interval notifications</strong>
            <small>Scheduled via service worker — works best installed on Android</small>
          </span>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => onUpdateSettings({ notifications: e.target.checked })}
          />
        </label>

        {settings.notifications && notificationStatus !== 'granted' && (
          <button className="btn btn-secondary" onClick={handleEnableNotifications}>
            Enable notifications
          </button>
        )}

        {notificationStatus === 'granted' && (
          <p className="hint success">Notifications enabled</p>
        )}
        {notificationStatus === 'denied' && (
          <p className="hint warning">Notifications blocked — enable in browser settings</p>
        )}

        <label className="toggle-row">
          <span>
            <strong>Track GPS (optional)</strong>
            <small>Best effort while app is open</small>
          </span>
          <input
            type="checkbox"
            checked={settings.enableGps}
            onChange={(e) => onUpdateSettings({ enableGps: e.target.checked })}
          />
        </label>
      </section>

      <section className="card">
        <h2>Install</h2>
        <p className="hint">
          Add this app to your home screen from your browser menu for fullscreen, offline access,
          and better notification support.
        </p>
      </section>
    </div>
  );
}
