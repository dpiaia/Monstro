import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import WorkoutView from './views/WorkoutView';
import Profile from './views/Profile';
import { Screen, UserProfile, WorkoutDay, Exercise } from './types';
import { INITIAL_PROFILE, MOCK_WORKOUT_SCHEDULE } from './constants';
import { getPostWorkoutFeedback } from './services/geminiService';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('HOME');
  
  // State for user profile and schedule
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [schedule, setSchedule] = useState<WorkoutDay[]>(MOCK_WORKOUT_SCHEDULE);

  // Determine today's day ID (mon, tue, etc.)
  const getTodayId = () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[new Date().getDay()];
  };

  const [currentDayId, setCurrentDayId] = useState<string>(getTodayId());

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

  const renderScreen = () => {
    switch (activeScreen) {
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
            />
        );
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