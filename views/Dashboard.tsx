import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutDay } from '../types';
import { getLevel } from '../constants';
import { StatCard } from '../components/StatCard';
import { Activity, Flame, Scale, ChevronRight, Quote } from 'lucide-react';
import { getMotivationalTip } from '../services/geminiService';

interface DashboardProps {
    profile: UserProfile;
    todayWorkout?: WorkoutDay;
    onGoToWorkout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, todayWorkout, onGoToWorkout }) => {
    const [motivationalQuote, setMotivationalQuote] = useState<string>("Sua única competição é quem você era ontem.");
    
    const exercisesDoneToday = todayWorkout?.exercises.filter(e => e.completed).length || 0;
    const totalExercisesToday = todayWorkout?.exercises.length || 0;
    const workoutProgress = totalExercisesToday > 0 ? (exercisesDoneToday / totalExercisesToday) * 100 : 0;
    
    const weightLost = (profile.startWeight - profile.currentWeight).toFixed(1);

    // Gamification Logic
    const currentLevel = getLevel(profile.dailyPoints);
    const nextLevelPoints = currentLevel.maxPoints;
    const levelProgress = Math.min(100, (profile.dailyPoints / nextLevelPoints) * 100);

    // Dynamic Greeting Logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Bom dia";
        if (hour >= 12 && hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    // Load generic motivation on mount
    useEffect(() => {
        getMotivationalTip("Mindset de Campeão").then(tip => {
            if (tip) setMotivationalQuote(tip);
        });
    }, []);

    return (
        <div className="p-6 space-y-8 animate-fade-in pb-32">
            {/* New Header Section */}
            <header className="space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-lg text-gray-400 font-medium tracking-wide">
                            {getGreeting()},
                        </h1>
                        <h2 className="text-4xl font-bold text-white tracking-tight">
                            {profile.name}
                        </h2>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-neon-purple flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-neon-purple/20 border-2 border-neutral-800">
                        {profile.name.charAt(0)}
                    </div>
                </div>

                {/* Streak Display */}
                <div className="flex items-center space-x-2 pt-2">
                    <Flame className="text-orange-500 fill-orange-500/20" size={24} />
                    <span className="text-lg font-bold text-gray-200">
                        Você está há <span className="text-orange-500 text-xl">{profile.streak}</span> dias em ofensiva.
                    </span>
                </div>

                {/* Motivational Quote Card */}
                <div className="mt-4 relative bg-neutral-900/80 border-l-4 border-neon-bright p-4 rounded-r-xl rounded-bl-xl shadow-lg">
                    <Quote size={20} className="absolute top-2 right-2 text-neutral-700" />
                    <p className="text-gray-300 italic text-sm font-medium pr-4">
                        "{motivationalQuote}"
                    </p>
                </div>
            </header>

            {/* Level Progress */}
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">{currentLevel.icon}</span>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Nível {currentLevel.level}</p>
                            <p className="text-white font-bold text-sm">{currentLevel.title}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-neon-yellow font-bold text-sm">{profile.dailyPoints} xp</p>
                        <p className="text-[10px] text-gray-500">Próx: {nextLevelPoints}</p>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-neon-yellow shadow-[0_0_10px_#EAB308]"
                        style={{ width: `${levelProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    title="Hoje" 
                    value={`${exercisesDoneToday}/${totalExercisesToday}`} 
                    subtitle="Exercícios"
                    icon={<Activity size={18} />}
                    colorClass="text-neon-bright"
                />
                <StatCard 
                    title="Perda Total" 
                    value={`-${weightLost} kg`} 
                    subtitle="Desde o início"
                    icon={<Scale size={18} />}
                    colorClass="text-neon-purple"
                />
            </div>

            {/* Today's Workout Card */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h3 className="text-xl font-bold text-white">Treino de Hoje</h3>
                    <span className="text-xs text-neon-yellow font-medium uppercase tracking-wider">
                        {todayWorkout?.label}
                    </span>
                </div>

                <div 
                    onClick={onGoToWorkout}
                    className="relative group cursor-pointer overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neon-bright transition-all duration-300"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-lg font-bold text-white mb-1">
                                    {todayWorkout?.muscleGroup || "Descanso"}
                                </h4>
                                <p className="text-sm text-gray-500">
                                    {totalExercisesToday} exercícios • {todayWorkout?.score === 'PENDING' ? 'Não avaliado' : todayWorkout?.score}
                                </p>
                            </div>
                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-neon-bright group-hover:text-black transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Progresso</span>
                                <span>{Math.round(workoutProgress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-neon-purple to-neon-bright transition-all duration-500 ease-out"
                                    style={{ width: `${workoutProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;