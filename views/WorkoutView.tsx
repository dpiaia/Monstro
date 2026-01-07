import React, { useState, useEffect } from 'react';
import { WorkoutDay, Exercise } from '../types';
import { ChevronDown, CheckCircle, Circle, AlertTriangle, PlayCircle, Info, Sparkles, X, ArrowRight, Edit3, Save, Plus, Trash2, Calendar } from 'lucide-react';
import { getMotivationalTip, getWorkoutAdaptation } from '../services/geminiService';

interface WorkoutViewProps {
    schedule: WorkoutDay[];
    currentDayId: string;
    onUpdateExercise: (dayId: string, exerciseId: string) => void;
    onUpdateExerciseDetails: (dayId: string, updates: Partial<Exercise>[]) => void;
    onModifyWorkout: (dayId: string) => void;
    onFinishWorkout: (dayId: string) => void;
    onSaveDayConfig: (dayId: string, updatedDay: WorkoutDay) => void;
}

const WorkoutView: React.FC<WorkoutViewProps> = ({ 
    schedule, 
    currentDayId, 
    onUpdateExercise,
    onUpdateExerciseDetails,
    onModifyWorkout,
    onFinishWorkout,
    onSaveDayConfig
}) => {
    const [selectedDayId, setSelectedDayId] = useState(currentDayId);
    const [aiTip, setAiTip] = useState<string>("");
    const [loadingTip, setLoadingTip] = useState(false);
    const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
    
    // Adaptation State
    const [showAdaptationModal, setShowAdaptationModal] = useState(false);
    const [isAdapting, setIsAdapting] = useState(false);
    const [suggestedAdaptations, setSuggestedAdaptations] = useState<any[]>([]);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);

    const selectedWorkout = schedule.find(d => d.id === selectedDayId);
    const isToday = selectedDayId === currentDayId;

    useEffect(() => {
        if (selectedWorkout && !selectedWorkout.isRestDay && !isEditing) {
            setLoadingTip(true);
            getMotivationalTip(selectedWorkout.muscleGroup).then(tip => {
                setAiTip(tip);
                setLoadingTip(false);
            });
        }
    }, [selectedDayId, selectedWorkout?.muscleGroup, isEditing]); // eslint-disable-next-line react-hooks/exhaustive-deps

    // Handlers for Manual Editing
    const handleUpdateLabel = (val: string) => {
        if (selectedWorkout) onSaveDayConfig(selectedDayId, { ...selectedWorkout, muscleGroup: val });
    };

    const handleToggleRest = () => {
        if (selectedWorkout) {
            onSaveDayConfig(selectedDayId, { 
                ...selectedWorkout, 
                isRestDay: !selectedWorkout.isRestDay,
                muscleGroup: !selectedWorkout.isRestDay ? "Descanso" : "Novo Treino"
            });
        }
    };

    const handleAddExercise = () => {
        if (!selectedWorkout) return;
        const newEx: Exercise = {
            id: Date.now().toString(),
            name: "Novo Exercício",
            equipment: "Livre",
            sets: 3,
            reps: "10",
            imageUrl: "https://picsum.photos/400/300?grayscale",
            tips: "Configure os detalhes deste exercício.",
            completed: false
        };
        onSaveDayConfig(selectedDayId, {
            ...selectedWorkout,
            exercises: [...selectedWorkout.exercises, newEx]
        });
    };

    const handleRemoveExercise = (exId: string) => {
        if (!selectedWorkout) return;
        onSaveDayConfig(selectedDayId, {
            ...selectedWorkout,
            exercises: selectedWorkout.exercises.filter(e => e.id !== exId)
        });
    };

    const handleEditExerciseField = (exId: string, field: keyof Exercise, value: any) => {
        if (!selectedWorkout) return;
        const updatedExs = selectedWorkout.exercises.map(e => 
            e.id === exId ? { ...e, [field]: value } : e
        );
        onSaveDayConfig(selectedDayId, { ...selectedWorkout, exercises: updatedExs });
    };

    const handleModify = () => {
        if (confirm("Mudar o treino reduzirá sua pontuação diária. Tem certeza?")) {
            onModifyWorkout(selectedDayId);
        }
    };

    const handleAnalyzeWorkout = async () => {
        if (!selectedWorkout) return;
        setIsAdapting(true);
        setShowAdaptationModal(true);
        
        const suggestions = await getWorkoutAdaptation(selectedWorkout.exercises);
        setSuggestedAdaptations(suggestions);
        setIsAdapting(false);
    };

    const applyAdaptations = () => {
        if (!selectedWorkout) return;
        
        const updates = suggestedAdaptations.map(s => ({
            id: s.id,
            reps: s.suggestedReps,
            sets: s.suggestedSets,
            suggestedChanges: undefined // clear suggestion flag
        }));

        onUpdateExerciseDetails(selectedDayId, updates);
        setShowAdaptationModal(false);
    };

    return (
        <div className="flex flex-col h-full bg-neutral-950 relative">
            {/* Days Tabs */}
            <div className="bg-neutral-900/80 backdrop-blur border-b border-neutral-800 pt-6 pb-2 px-4 sticky top-0 z-30">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-white">Agenda Semanal</h1>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-neon-bright text-black' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
                    >
                        {isEditing ? <Save size={20} /> : <Edit3 size={20} />}
                    </button>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {schedule.map(day => (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDayId(day.id)}
                            className={`flex flex-col items-center justify-center min-w-[3.5rem] h-14 rounded-xl transition-all duration-200 ${
                                selectedDayId === day.id 
                                    ? 'bg-neon-bright text-black font-bold shadow-lg shadow-neon-yellow/20' 
                                    : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                            }`}
                        >
                            <span className="text-[10px] uppercase">{day.label.substring(0, 3)}</span>
                            {day.completed && <div className="w-1.5 h-1.5 rounded-full bg-black mt-1"></div>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-32">
                {selectedWorkout ? (
                    <div className="space-y-6">
                        {/* Header Info or Edit Header */}
                        {isEditing ? (
                            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase">Foco do Dia</label>
                                    <input 
                                        type="text" 
                                        value={selectedWorkout.muscleGroup}
                                        onChange={(e) => handleUpdateLabel(e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white focus:border-neon-yellow focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button 
                                        onClick={handleToggleRest}
                                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-bold transition-all ${selectedWorkout.isRestDay ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-neutral-800 border-neutral-700 text-gray-400'}`}
                                    >
                                        {selectedWorkout.isRestDay ? 'Dia de Descanso (Ativo)' : 'Marcar como Descanso'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedWorkout.muscleGroup}</h2>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            selectedWorkout.score === 'GOOD' ? 'bg-green-500/20 text-green-400' :
                                            selectedWorkout.score === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                            selectedWorkout.score === 'BAD' ? 'bg-red-500/20 text-red-400' :
                                            'bg-gray-700 text-gray-400'
                                        }`}>
                                            Nota: {selectedWorkout.score === 'PENDING' ? '-' : selectedWorkout.score}
                                        </span>
                                        {selectedWorkout.modified && (
                                            <span className="text-[10px] text-orange-400 flex items-center">
                                                <AlertTriangle size={10} className="mr-1" /> Modificado
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {isToday && !selectedWorkout.completed && !selectedWorkout.isRestDay && (
                                    <button 
                                        onClick={handleModify}
                                        className="text-xs text-gray-500 underline hover:text-white"
                                    >
                                        Mudar Treino
                                    </button>
                                )}
                            </div>
                        )}

                        {/* AI Tip (Only if not editing and not rest day) */}
                        {!isEditing && !selectedWorkout.isRestDay && (
                            <div className="bg-neutral-900 border-l-2 border-neon-purple p-3 rounded-r-lg">
                                <p className="text-xs text-neon-purple font-bold mb-1">AI COACH SAYS:</p>
                                <p className="text-sm text-gray-300 italic">
                                    {loadingTip ? "Analisando..." : `"${aiTip}"`}
                                </p>
                            </div>
                        )}

                        {/* AI Optimize Button */}
                        {!isEditing && isToday && !selectedWorkout.completed && !selectedWorkout.isRestDay && (
                             <button 
                                onClick={handleAnalyzeWorkout}
                                className="w-full py-3 rounded-xl border border-neon-purple/50 bg-neon-purple/10 flex items-center justify-center space-x-2 hover:bg-neon-purple/20 transition-all"
                             >
                                <Sparkles size={16} className="text-neon-purple" />
                                <span className="text-sm font-bold text-neon-purple">Otimizar com IA</span>
                             </button>
                        )}

                        {/* Exercises List (View Mode vs Edit Mode) */}
                        <div className="space-y-4">
                            {selectedWorkout.exercises.length === 0 && !isEditing ? (
                                <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                                    <Calendar size={48} className="mb-4 opacity-20" />
                                    <p>Dia de descanso ou sem exercícios.</p>
                                    <button onClick={() => setIsEditing(true)} className="mt-4 text-neon-bright text-sm underline">Criar Treino</button>
                                </div>
                            ) : (
                                selectedWorkout.exercises.map((exercise) => (
                                    <div 
                                        key={exercise.id} 
                                        className={`bg-neutral-900 rounded-2xl overflow-hidden border transition-all duration-300 ${
                                            exercise.completed && !isEditing
                                                ? 'border-green-900/50 opacity-75' 
                                                : 'border-neutral-800 hover:border-neutral-700'
                                        }`}
                                    >
                                        {isEditing ? (
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center space-x-2">
                                                    <input 
                                                        className="flex-1 bg-neutral-800 border border-neutral-700 rounded p-1.5 text-white text-sm font-bold focus:border-neon-yellow focus:outline-none"
                                                        value={exercise.name}
                                                        onChange={(e) => handleEditExerciseField(exercise.id, 'name', e.target.value)}
                                                        placeholder="Nome do exercício"
                                                    />
                                                    <button 
                                                        onClick={() => handleRemoveExercise(exercise.id)}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase">Séries</label>
                                                        <input 
                                                            type="number"
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-white text-xs"
                                                            value={exercise.sets}
                                                            onChange={(e) => handleEditExerciseField(exercise.id, 'sets', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase">Reps</label>
                                                        <input 
                                                            type="text"
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-white text-xs"
                                                            value={exercise.reps}
                                                            onChange={(e) => handleEditExerciseField(exercise.id, 'reps', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase">Equip.</label>
                                                        <input 
                                                            type="text"
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-white text-xs"
                                                            value={exercise.equipment}
                                                            onChange={(e) => handleEditExerciseField(exercise.id, 'equipment', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase">Dicas de Execução</label>
                                                    <textarea 
                                                        className="w-full bg-neutral-800 border border-neutral-700 rounded p-1.5 text-white text-xs resize-y min-h-[60px] focus:border-neon-yellow focus:outline-none"
                                                        value={exercise.tips}
                                                        onChange={(e) => handleEditExerciseField(exercise.id, 'tips', e.target.value)}
                                                        placeholder="Ex: Cotovelos fechados, descer devagar..."
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div 
                                                    className="p-4 flex items-center justify-between cursor-pointer"
                                                    onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (isToday) onUpdateExercise(selectedDayId, exercise.id);
                                                            }}
                                                            disabled={!isToday || selectedWorkout.completed}
                                                            className={`transition-colors ${
                                                                exercise.completed ? 'text-neon-bright' : 'text-gray-600 hover:text-gray-400'
                                                            }`}
                                                        >
                                                            {exercise.completed ? <CheckCircle size={28} fill="rgba(250, 255, 0, 0.1)" /> : <Circle size={28} />}
                                                        </button>
                                                        <div>
                                                            <h3 className={`font-bold text-white ${exercise.completed ? 'line-through text-gray-500' : ''}`}>
                                                                {exercise.name}
                                                            </h3>
                                                            <div className="flex space-x-3 text-sm text-gray-400">
                                                                <span>{exercise.sets} Séries</span>
                                                                <span>{exercise.reps} Reps</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronDown 
                                                        size={20} 
                                                        className={`text-gray-500 transition-transform ${expandedExercise === exercise.id ? 'rotate-180' : ''}`} 
                                                    />
                                                </div>

                                                {/* Expanded Content */}
                                                {expandedExercise === exercise.id && (
                                                    <div className="px-4 pb-4 border-t border-neutral-800 bg-neutral-900/50">
                                                        <div className="mt-4 rounded-xl overflow-hidden h-40 bg-black relative">
                                                            <img 
                                                                src={exercise.imageUrl} 
                                                                alt={exercise.name} 
                                                                className="w-full h-full object-cover opacity-80"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                                <PlayCircle size={40} className="text-white/80" />
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 space-y-2">
                                                            <div className="flex items-start text-sm text-gray-400">
                                                                <Info size={16} className="mt-0.5 mr-2 text-neon-purple flex-shrink-0" />
                                                                <p>{exercise.tips}</p>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500 mt-2">
                                                                <span className="font-semibold mr-2">Equipamento:</span> 
                                                                {exercise.equipment}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))
                            )}

                             {/* Add Exercise Button (Edit Mode Only) */}
                             {isEditing && !selectedWorkout.isRestDay && (
                                <button
                                    onClick={handleAddExercise}
                                    className="w-full py-3 rounded-xl border-2 border-dashed border-neutral-700 text-gray-400 hover:text-white hover:border-neon-bright flex items-center justify-center space-x-2 transition-all"
                                >
                                    <Plus size={20} />
                                    <span>Adicionar Exercício</span>
                                </button>
                            )}
                        </div>

                        {/* Finish Workout Button */}
                        {!isEditing && isToday && !selectedWorkout.completed && !selectedWorkout.isRestDay && (
                            <button
                                onClick={() => onFinishWorkout(selectedDayId)}
                                className="w-full py-4 rounded-xl bg-neon-bright text-black font-bold text-lg uppercase tracking-wide hover:bg-yellow-300 transition-colors shadow-lg shadow-neon-yellow/20 mt-8"
                            >
                                Finalizar Treino
                            </button>
                        )}

                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="w-full py-4 rounded-xl bg-neon-bright text-black font-bold text-lg uppercase tracking-wide hover:bg-yellow-300 transition-colors shadow-lg shadow-neon-yellow/20 mt-8"
                            >
                                Salvar Alterações
                            </button>
                        )}
                         
                        {!isEditing && selectedWorkout.completed && (
                            <div className="mt-8 p-6 bg-green-500/10 rounded-2xl border border-green-500/20 text-center">
                                <h3 className="text-green-400 font-bold text-xl mb-2">Treino Concluído!</h3>
                                <p className="text-gray-400 text-sm">Bom descanso. Nos vemos amanhã.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-20">Selecione um dia</div>
                )}
            </div>

            {/* Adaptation Modal */}
            {showAdaptationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 rounded-3xl w-full max-w-sm border border-neutral-700 overflow-hidden shadow-2xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center">
                                    <Sparkles size={20} className="text-neon-purple mr-2" />
                                    Coach IA
                                </h3>
                                <button onClick={() => setShowAdaptationModal(false)} className="text-gray-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            {isAdapting ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full border-4 border-t-neon-purple border-r-transparent border-b-neutral-800 border-l-neutral-800 animate-spin"></div>
                                    <p className="text-gray-400 text-sm animate-pulse">Analisando seu desempenho...</p>
                                </div>
                            ) : suggestedAdaptations.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-400 mb-4">Com base no seu histórico, sugiro aumentar a intensidade nestes exercícios:</p>
                                    
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {suggestedAdaptations.map((s, idx) => {
                                            const original = selectedWorkout?.exercises.find(e => e.id === s.id);
                                            return (
                                                <div key={idx} className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700">
                                                    <div className="font-bold text-white text-sm mb-2">{original?.name}</div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="text-gray-500">
                                                            <div>{original?.sets} séries</div>
                                                            <div>{original?.reps} reps</div>
                                                        </div>
                                                        <ArrowRight size={14} className="text-neon-purple" />
                                                        <div className="text-neon-bright font-bold text-right">
                                                            <div>{s.suggestedSets || original?.sets} séries</div>
                                                            <div>{s.suggestedReps} reps</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-[10px] text-gray-400 italic">
                                                        "{s.reason}"
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button 
                                        onClick={applyAdaptations}
                                        className="w-full py-3 mt-4 bg-neon-bright text-black font-bold rounded-xl hover:bg-yellow-300"
                                    >
                                        Aceitar Sugestões
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-400">Nenhuma sugestão necessária no momento. Seu treino está equilibrado!</p>
                                    <button 
                                        onClick={() => setShowAdaptationModal(false)}
                                        className="mt-4 px-4 py-2 bg-neutral-800 text-white rounded-lg"
                                    >
                                        Voltar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutView;