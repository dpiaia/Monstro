import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import WorkoutView from './views/WorkoutView';
import Profile from './views/Profile';
import Settings from './views/Settings';
import Onboarding from './views/Onboarding';
import { Screen, UserProfile, WorkoutDay, Exercise } from './types';
import { INITIAL_PROFILE, MOCK_WORKOUT_SCHEDULE } from './constants';
import { getPostWorkoutFeedback } from './services/geminiService';

const STORAGE_KEY = 'neonflow_data_v1';

const App: React.FC = () => {
  // --- STATE INITIALIZATION ---
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('HOME');

  const [profile, setProfile] = useState<UserProfile>(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
          return JSON.parse(saved).profile;
      }
      return INITIAL_PROFILE; // Keeps mock data only for type safety fallback, but won't be used if isFirstRun is handled correctly
  });

  const [schedule, setSchedule] = useState<WorkoutDay[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
          return JSON.parse(saved).schedule;
      }
      return MOCK_WORKOUT_SCHEDULE;
  });

  // Check for first run on mount
  useEffect(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
          setIsFirstRun(true);
          setActiveScreen('ONBOARDING');
          // Reset internal state to empty to avoid flashes of mock data behind onboarding
          // Although UI covers it, it's cleaner.
      }
  }, []);

  // Persist data whenever it changes
  useEffect(() => {
      if (!isFirstRun && activeScreen !== 'ONBOARDING') {
          const dataToSave = {
              profile,
              schedule
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
  }, [profile, schedule, isFirstRun, activeScreen]);

  // Determine today's day ID (mon, tue, etc.)
  const getTodayId = () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[new Date().getDay()];
  };

  const [currentDayId] = useState<string>(getTodayId());

  // --- HANDLERS ---

  const handleOnboardingComplete = (newProfile: UserProfile, newSchedule: WorkoutDay[]) => {
      setProfile(newProfile);
      setSchedule(newSchedule);
      setIsFirstRun(false);
      
      // Force Save immediately
      const dataToSave = { profile: newProfile, schedule: newSchedule };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      
      setActiveScreen('HOME');
  };

  // Function to toggle exercise completion
  const handleUpdateExercise = (dayId: string, exerciseId: string) => {
    setSchedule(prevSchedule => prevSchedule.map(day => {
        if (day.id !== dayId) return day;
        
        const updatedExercises = day.exercises.map(ex => {
            if (ex.id === exerciseId) {
                return { ...ex, completed: !ex.completed };
            }
            return ex;
        });

        return { ...day, exercises: updatedExercises };
    }));
  };

  // Function to Apply AI Suggestions (Update details like reps/sets)
  const handleUpdateExerciseDetails = (dayId: string, updates: Partial<Exercise>[]) => {
      setSchedule(prevSchedule => prevSchedule.map(day => {
          if (day.id !== dayId) return day;
          
          const updatedExercises = day.exercises.map(ex => {
              const update = updates.find(u => u.id === ex.id);
              if (update) {
                  return { ...ex, ...update };
              }
              return ex;
          });
          
          return { ...day, exercises: updatedExercises };
      }));
  };

  // Function to completely rewrite a day's schedule (Manual Creation Mode)
  const handleSaveDayConfig = (dayId: string, updatedDay: WorkoutDay) => {
    setSchedule(prevSchedule => prevSchedule.map(day => {
        if (day.id === dayId) {
            return updatedDay;
        }
        return day;
    }));
  };

  // Logic: Mark workout as modified (Penalty)
  const handleModifyWorkout = (dayId: string) => {
    setSchedule(prevSchedule => prevSchedule.map(day => {
        if (day.id === dayId) {
            return { ...day, modified: true };
        }
        return day;
    }));
  };

  // Logic: Finish workout and Calculate Score
  const handleFinishWorkout = (dayId: string) => {
    setSchedule(prevSchedule => prevSchedule.map(day => {
        if (day.id !== dayId) return day;

        const total = day.exercises.length;
        const completed = day.exercises.filter(e => e.completed).length;
        let score: 'GOOD' | 'MEDIUM' | 'BAD' = 'BAD';

        if (completed === 0) {
            score = 'BAD';
        } else if (day.modified || completed < total) {
            score = 'MEDIUM';
        } else {
            score = 'GOOD';
        }

        // Update profile stats if first time completing today
        if (!day.completed) {
             setProfile(prev => ({
                 ...prev,
                 totalExercisesCompleted: prev.totalExercisesCompleted + completed,
                 dailyPoints: prev.dailyPoints + (score === 'GOOD' ? 100 : score === 'MEDIUM' ? 50 : 0)
             }));
             
             // Trigger AI feedback toast/alert (simulated)
             getPostWorkoutFeedback(score, day.muscleGroup).then(feedback => {
                 alert(`Treino finalizado!\nNota: ${score}\n\nCoach: "${feedback}"`);
             });
        }

        return { ...day, completed: true, score };
    }));
    setActiveScreen('HOME');
  };

  const handleUpdateWeight = (newWeight: number) => {
      const today = new Date().toISOString().split('T')[0];
      setProfile(prev => ({
          ...prev,
          currentWeight: newWeight,
          weightHistory: [...prev.weightHistory, { date: today, weight: newWeight }]
      }));
  };

  // --- DATA MANAGEMENT HANDLERS ---

  const handleImportData = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              const data = JSON.parse(text);
              if (data.profile && data.schedule) {
                  setProfile(data.profile);
                  setSchedule(data.schedule);
                  alert('Dados importados com sucesso!');
                  setActiveScreen('PROFILE');
              } else {
                  alert('Arquivo inválido. Formato incorreto.');
              }
          } catch (err) {
              alert('Erro ao ler arquivo. Certifique-se que é um JSON válido.');
          }
      };
      reader.readAsText(file);
  };

  const handleExportData = () => {
      const data = { profile, schedule };
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `neonflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
  };

  const handleClearData = () => {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload(); // Reload to trigger onboarding check
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'ONBOARDING':
          return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'HOME':
        return (
            <Dashboard 
                profile={profile} 
                todayWorkout={schedule.find(d => d.id === currentDayId)}
                onGoToWorkout={() => setActiveScreen('WORKOUT')}
            />
        );
      case 'WORKOUT':
        return (
            <WorkoutView 
                schedule={schedule}
                currentDayId={currentDayId}
                onUpdateExercise={handleUpdateExercise}
                onUpdateExerciseDetails={handleUpdateExerciseDetails}
                onModifyWorkout={handleModifyWorkout}
                onFinishWorkout={handleFinishWorkout}
                onSaveDayConfig={handleSaveDayConfig}
            />
        );
      case 'PROFILE':
        return (
            <Profile 
                profile={profile}
                onUpdateWeight={handleUpdateWeight}
                onGoToSettings={() => setActiveScreen('SETTINGS')}
            />
        );
      case 'SETTINGS':
        return (
            <Settings 
                onBack={() => setActiveScreen('PROFILE')}
                onImport={handleImportData}
                onExport={handleExportData}
                onClear={handleClearData}
            />
        )
      default:
        return null;
    }
  };

  return (
    <Layout activeScreen={activeScreen} onNavigate={setActiveScreen}>
      {renderScreen()}
    </Layout>
  );
};

export default App;