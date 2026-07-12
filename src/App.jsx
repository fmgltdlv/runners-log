import { useState } from 'react';
import HistoryScreen from './components/HistoryScreen';
import HomeScreen from './components/HomeScreen';
import Nav from './components/Nav';
import SettingsScreen from './components/SettingsScreen';
import WorkoutScreen from './components/WorkoutScreen';
import { useSettings } from './hooks/useSettings';
import './App.css';

export default function App() {
  const { settings, update } = useSettings();
  const [activeTab, setActiveTab] = useState('home');
  const [activeWorkout, setActiveWorkout] = useState(null);

  const startWorkout = () => {
    setActiveWorkout({ week: settings.week, day: settings.day });
  };

  const continueWorkout = (run) => {
    setActiveWorkout({
      week: run.week,
      day: run.day,
      resumeState: {
        runId: run.id,
        elapsed: run.durationSeconds,
        startedAt: run.startedAt,
        track: run.track ?? [],
        distanceMeters: run.distanceMeters ?? 0,
      },
    });
  };

  const finishWorkout = () => {
    setActiveWorkout(null);
    setActiveTab('history');
  };

  if (activeWorkout) {
    return (
      <WorkoutScreen
        settings={settings}
        week={activeWorkout.week}
        day={activeWorkout.day}
        resumeState={activeWorkout.resumeState ?? null}
        onFinish={finishWorkout}
      />
    );
  }

  return (
    <div className="app">
      <main className="app-main">
        {activeTab === 'home' && (
          <HomeScreen settings={settings} onUpdateSettings={update} onStartWorkout={startWorkout} />
        )}
        {activeTab === 'history' && <HistoryScreen onContinueWorkout={continueWorkout} />}
        {activeTab === 'settings' && (
          <SettingsScreen settings={settings} onUpdateSettings={update} />
        )}
      </main>
      <Nav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
