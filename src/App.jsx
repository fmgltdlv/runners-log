import { useState } from 'react';
import HistoryScreen from './components/HistoryScreen';
import HomeScreen from './components/HomeScreen';
import LiftScreen from './components/LiftScreen';
import Nav from './components/Nav';
import SettingsScreen from './components/SettingsScreen';
import StrengthWorkoutScreen from './components/StrengthWorkoutScreen';
import WorkoutScreen from './components/WorkoutScreen';
import { useSettings } from './hooks/useSettings';
import './App.css';

export default function App() {
  const { settings, update } = useSettings();
  const [activeTab, setActiveTab] = useState('home');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [activeStrengthWorkout, setActiveStrengthWorkout] = useState(null);

  const startWorkout = () => {
    setActiveWorkout({ week: settings.week, day: settings.day });
  };

  const startStrengthWorkout = ({ planId, day }) => {
    setActiveStrengthWorkout({ planId, day });
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

  const finishStrengthWorkout = () => {
    setActiveStrengthWorkout(null);
    setActiveTab('history');
  };

  if (activeStrengthWorkout) {
    return (
      <StrengthWorkoutScreen
        settings={settings}
        planId={activeStrengthWorkout.planId}
        day={activeStrengthWorkout.day}
        onFinish={finishStrengthWorkout}
      />
    );
  }

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
        {activeTab === 'lift' && (
          <LiftScreen
            settings={settings}
            onUpdateSettings={update}
            onStartWorkout={startStrengthWorkout}
          />
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
