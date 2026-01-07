import React, { useState } from 'react';
import { UserProfile, GoalType, WorkoutDay } from '../types';
import { generateFullRoutine } from '../services/geminiService';
import { ArrowRight, Check, Dumbbell, User, Target, Calendar, Sparkles, Loader2 } from 'lucide-react';

interface OnboardingProps {
    onComplete: (profile: UserProfile, schedule: WorkoutDay[]) => void;
}

const steps = [
    { id: 'INTRO', title: 'Bem-vindo' },
    { id: 'NAME', title: 'Sobre Você' },
    { id: 'BIOMETRICS', title: 'Medidas' },
    { id: 'GOAL', title: 'Objetivos' },
    { id: 'ROUTINE', title: 'Rotina' }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [height, setHeight] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [targetWeight, setTargetWeight] = useState<string>('');
    const [goal, setGoal] = useState<GoalType>('GAIN_MUSCLE');
    const [frequency, setFrequency] = useState(4);
    const [useAI, setUseAI] = useState<boolean | null>(null);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        setIsLoading(true);

        const newProfile: UserProfile = {
            name: name || 'Atleta',
            height: parseFloat(height) || 170,
            startWeight: parseFloat(weight) || 70,
            currentWeight: parseFloat(weight) || 70,
            targetWeight: parseFloat(targetWeight) || parseFloat(weight) || 70,
            goal,
            workoutFrequency: frequency,
            weightHistory: [{ date: new Date().toISOString().split('T')[0], weight: parseFloat(weight) || 70 }],
            streak: 0,
            totalExercisesCompleted: 0,
            dailyPoints: 0
        };

        let newSchedule: WorkoutDay[] = [];

        if (useAI) {
            // Generate via Gemini
            try {
                newSchedule = await generateFullRoutine(newProfile);
            } catch (e) {
                console.error("Failed to generate", e);
                // Fallback if AI fails
                newSchedule = createEmptySchedule(); 
            }
        } else {
            // Create Empty Schedule
            newSchedule = createEmptySchedule();
        }

        // Ensure we have a fallback if AI returned empty array
        if (!newSchedule || newSchedule.length === 0) {
             newSchedule = createEmptySchedule();
        }

        onComplete(newProfile, newSchedule);
        setIsLoading(false);
    };

    const createEmptySchedule = (): WorkoutDay[] => {
        const ids = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const labels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        return ids.map((id, idx) => ({
            id,
            label: labels[idx],
            muscleGroup: 'Descanso / Livre',
            isRestDay: idx >= frequency, // Simple logic: rest days at end of week for template
            modified: false,
            completed: false,
            score: 'PENDING',
            exercises: []
        }));
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-neon-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                            <Dumbbell size={40} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Eu Monstro</h1>
                            <p className="text-gray-400">Seu personal trainer de bolso.</p>
                        </div>
                        <button 
                            onClick={handleNext}
                            className="mt-8 px-8 py-3 bg-neon-bright text-black font-bold rounded-full hover:bg-white transition-all flex items-center space-x-2"
                        >
                            <span>Começar</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <User size={48} className="mx-auto text-neon-yellow mb-4" />
                            <h2 className="text-2xl font-bold text-white">Como devemos te chamar?</h2>
                        </div>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            className="w-full bg-neutral-900 border-b-2 border-neutral-700 p-4 text-2xl text-center text-white focus:border-neon-bright focus:outline-none"
                            autoFocus
                        />
                        <button 
                            onClick={handleNext}
                            disabled={!name}
                            className="w-full py-4 bg-neutral-800 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-neutral-700"
                        >
                            Próximo
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <Target size={48} className="mx-auto text-neon-purple mb-4" />
                            <h2 className="text-2xl font-bold text-white">Suas Medidas</h2>
                            <p className="text-gray-400 text-sm">Usaremos para calcular métricas de saúde.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Altura (cm)</label>
                                <input 
                                    type="number" 
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="175"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Peso Atual (kg)</label>
                                <input 
                                    type="number" 
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="75.5"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-neon-purple focus:outline-none"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleNext}
                            disabled={!height || !weight}
                            className="w-full py-4 bg-neutral-800 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-neutral-700"
                        >
                            Próximo
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">Seu Objetivo</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'LOSE_WEIGHT', label: 'Emagrecer', icon: '🔥' },
                                { id: 'GAIN_MUSCLE', label: 'Ganhar Massa', icon: '💪' },
                                { id: 'STRENGTH', label: 'Força Pura', icon: '🏋️' },
                                { id: 'ENDURANCE', label: 'Resistência', icon: '🏃' }
                            ].map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => setGoal(g.id as GoalType)}
                                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                                        goal === g.id 
                                            ? 'bg-neon-purple/20 border-neon-purple text-white' 
                                            : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{g.icon}</span>
                                        <span className="font-bold">{g.label}</span>
                                    </div>
                                    {goal === g.id && <Check size={20} className="text-neon-purple" />}
                                </button>
                            ))}
                        </div>

                        <div className="pt-4">
                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block text-center">Peso Alvo (kg)</label>
                            <input 
                                type="number" 
                                value={targetWeight}
                                onChange={(e) => setTargetWeight(e.target.value)}
                                placeholder="Ex: 80"
                                className="w-1/2 mx-auto block bg-neutral-900 border-b border-neon-bright p-2 text-center text-xl text-white focus:outline-none"
                            />
                        </div>

                        <button 
                            onClick={handleNext}
                            disabled={!targetWeight}
                            className="w-full py-4 bg-neutral-800 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-neutral-700"
                        >
                            Próximo
                        </button>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <Calendar size={48} className="mx-auto text-blue-500 mb-4" />
                            <h2 className="text-2xl font-bold text-white">Frequência</h2>
                            <p className="text-gray-400">Quantos dias por semana você vai treinar?</p>
                        </div>

                        <div className="flex justify-center space-x-2 py-4">
                            {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setFrequency(num)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                        frequency === num 
                                            ? 'bg-white text-black scale-110 shadow-lg' 
                                            : 'bg-neutral-800 text-gray-500'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
                            <p className="text-sm text-gray-300">
                                Você se compromete a treinar <span className="text-neon-yellow font-bold">{frequency}x</span> por semana.
                            </p>
                        </div>
                        
                        <div className="space-y-3 pt-4">
                            <p className="text-center text-sm font-bold text-white mb-2">Como montar seu treino?</p>
                            <button 
                                onClick={() => { setUseAI(true); handleFinish(); }}
                                className="w-full p-4 bg-gradient-to-r from-neon-purple to-purple-600 rounded-xl flex items-center justify-between group hover:opacity-90"
                            >
                                <div className="text-left">
                                    <div className="font-bold text-white flex items-center">
                                        <Sparkles size={16} className="mr-2" /> 
                                        Criar com IA
                                    </div>
                                    <div className="text-xs text-white/70">Personalizado para seu objetivo</div>
                                </div>
                                <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button 
                                onClick={() => { setUseAI(false); handleFinish(); }}
                                className="w-full p-4 bg-neutral-800 rounded-xl flex items-center justify-between hover:bg-neutral-700"
                            >
                                <div className="text-left">
                                    <div className="font-bold text-gray-300">Montar Manualmente</div>
                                    <div className="text-xs text-gray-500">Tenho minha própria ficha</div>
                                </div>
                                <ArrowRight className="text-gray-500" />
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
                <Loader2 size={64} className="text-neon-bright animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-white mb-2">Montando seu Treino</h2>
                <p className="text-gray-400 text-sm">A inteligência artificial está analisando seu perfil e criando a melhor rotina...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6">
            {step > 0 && (
                <div className="w-full bg-neutral-800 h-1 rounded-full mb-8">
                    <div 
                        className="bg-neon-bright h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>
            )}
            
            <div className="flex-1 flex flex-col justify-center">
                {renderStep()}
            </div>
        </div>
    );
};

export default Onboarding;