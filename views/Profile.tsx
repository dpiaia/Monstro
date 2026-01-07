import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MOCK_MONTHLY_STATS, getLevel } from '../constants';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Plus, Trash2, Save, Award, Calendar, Settings } from 'lucide-react';

interface ProfileProps {
    profile: UserProfile;
    onUpdateWeight: (newWeight: number) => void;
    onGoToSettings?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdateWeight, onGoToSettings }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY'>('OVERVIEW');
    const [isWeighing, setIsWeighing] = useState(false);
    const [newWeightInput, setNewWeightInput] = useState(profile.currentWeight.toString());

    const handleSaveWeight = () => {
        const val = parseFloat(newWeightInput);
        if (!isNaN(val) && val > 0 && val < 300) {
            onUpdateWeight(val);
            setIsWeighing(false);
        } else {
            alert("Insira um peso válido.");
        }
    };

    const currentLevel = getLevel(profile.dailyPoints);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-900 border border-neutral-700 p-2 rounded shadow-xl">
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    <p className="text-neon-bright font-bold">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 space-y-8 animate-fade-in pb-32">
             <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Seu Perfil</h1>
                    <p className="text-gray-400 text-sm">Acompanhe sua evolução.</p>
                </div>
                <button 
                    onClick={onGoToSettings}
                    className="p-2 rounded-full bg-neutral-800 text-gray-400 hover:text-white hover:bg-neutral-700 transition-colors"
                >
                    <Settings size={20} />
                </button>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-neutral-900 rounded-xl border border-neutral-800">
                <button 
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        activeTab === 'OVERVIEW' ? 'bg-neutral-800 text-white shadow-sm' : 'text-gray-500'
                    }`}
                >
                    Geral
                </button>
                <button 
                    onClick={() => setActiveTab('HISTORY')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        activeTab === 'HISTORY' ? 'bg-neutral-800 text-white shadow-sm' : 'text-gray-500'
                    }`}
                >
                    Histórico Detalhado
                </button>
            </div>

            {activeTab === 'OVERVIEW' ? (
                <div className="space-y-8">
                     {/* Stats Summary */}
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                        <div className="flex-1 min-w-[100px] bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Peso Atual</div>
                            <div className="text-2xl font-bold text-white">{profile.currentWeight} <span className="text-sm font-normal text-gray-500">kg</span></div>
                        </div>
                        <div className="flex-1 min-w-[100px] bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Total Ex.</div>
                            <div className="text-2xl font-bold text-white">{profile.totalExercisesCompleted}</div>
                        </div>
                        <div className="flex-1 min-w-[100px] bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Pontos</div>
                            <div className="text-2xl font-bold text-neon-purple">{profile.dailyPoints}</div>
                        </div>
                    </div>

                    {/* Badge / Level Card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 rounded-3xl border border-neutral-800">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">
                            {currentLevel.icon}
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-3 mb-2">
                                <Award className="text-neon-yellow" size={24} />
                                <span className="text-neon-yellow font-bold uppercase tracking-widest text-xs">Conquista Atual</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-1">{currentLevel.title}</h2>
                            <p className="text-gray-400 text-sm mb-6">Nível {currentLevel.level}</p>

                            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <p className="text-gray-300 text-xs">
                                    Você está no top 15% dos usuários esta semana. Continue firme para alcançar o nível Elite.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Weight Chart (Mini) */}
                    <div className="bg-neutral-900 p-4 rounded-3xl border border-neutral-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white">Evolução de Peso</h3>
                            <button 
                                onClick={() => setIsWeighing(true)}
                                className="bg-neon-purple/20 text-neon-purple hover:bg-neon-purple hover:text-white p-2 rounded-full transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {isWeighing && (
                            <div className="mb-6 p-4 bg-black/40 rounded-xl border border-neutral-700 flex items-center space-x-4">
                                <input 
                                    type="number" 
                                    value={newWeightInput}
                                    onChange={(e) => setNewWeightInput(e.target.value)}
                                    className="bg-transparent border-b border-neon-bright text-white text-xl w-24 focus:outline-none p-1"
                                    placeholder="00.0"
                                    autoFocus
                                />
                                <span className="text-gray-400">kg</span>
                                <div className="flex-1"></div>
                                <button onClick={() => setIsWeighing(false)} className="p-2 text-gray-500 hover:text-white"><Trash2 size={20}/></button>
                                <button onClick={handleSaveWeight} className="p-2 text-neon-bright hover:text-yellow-300"><Save size={20}/></button>
                            </div>
                        )}

                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={profile.weightHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="date" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).getDate().toString()} />
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} width={30} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="weight" stroke="#FAFF00" strokeWidth={3} dot={{ fill: '#0A0A0A', stroke: '#FAFF00', strokeWidth: 2, r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Filter (Mock) */}
                    <div className="flex justify-end">
                        <button className="flex items-center space-x-2 text-xs bg-neutral-800 text-gray-300 px-3 py-1.5 rounded-full">
                            <Calendar size={12} />
                            <span>Últimos 6 Meses</span>
                        </button>
                    </div>

                    {/* Monthly Consistency Chart */}
                    <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                         <h3 className="font-bold text-white mb-4">Frequência Mensal</h3>
                         <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOCK_MONTHLY_STATS}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="month" tick={{fill: '#666', fontSize: 12}} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                                    <Bar dataKey="workouts" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Streak History (Line) */}
                    <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                         <h3 className="font-bold text-white mb-4">Histórico de Ofensiva</h3>
                         <div className="h-48 w-full">
                             {/* Mocking streak data for visualization based on weights */}
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={profile.weightHistory.map((w, i) => ({...w, streak: 5 + i*2}))}>
                                    <XAxis dataKey="date" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} tickFormatter={(val) => `${new Date(val).getDate()}/${new Date(val).getMonth()+1}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="step" dataKey="streak" stroke="#EAB308" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;