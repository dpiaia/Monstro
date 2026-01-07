import { UserProfile, WorkoutDay, LevelConfig, MonthlyStats } from './types';

export const INITIAL_PROFILE: UserProfile = {
    name: "Atleta",
    height: 175,
    startWeight: 85,
    currentWeight: 82.5,
    weightHistory: [
        { date: '2023-10-01', weight: 85 },
        { date: '2023-10-08', weight: 84.2 },
        { date: '2023-10-15', weight: 83.5 },
        { date: '2023-10-22', weight: 83.0 },
        { date: '2023-10-29', weight: 82.5 },
    ],
    streak: 12,
    totalExercisesCompleted: 145,
    dailyPoints: 340, // Starts with some points to show progress
};

export const MOCK_MONTHLY_STATS: MonthlyStats[] = [
    { month: 'Jun', workouts: 12 },
    { month: 'Jul', workouts: 18 },
    { month: 'Ago', workouts: 15 },
    { month: 'Set', workouts: 22 },
    { month: 'Out', workouts: 20 },
];

export const LEVELS: LevelConfig[] = [
    { level: 1, title: "Iniciante", minPoints: 0, maxPoints: 500, icon: "🌱" },
    { level: 2, title: "Dedicado", minPoints: 500, maxPoints: 1500, icon: "🔥" },
    { level: 3, title: "Elite", minPoints: 1500, maxPoints: 3000, icon: "⚡" },
    { level: 4, title: "Lenda", minPoints: 3000, maxPoints: 99999, icon: "👑" },
];

export const getLevel = (points: number): LevelConfig => {
    return LEVELS.find(l => points >= l.minPoints && points < l.maxPoints) || LEVELS[LEVELS.length - 1];
};

// Placeholder images from picsum
export const MOCK_WORKOUT_SCHEDULE: WorkoutDay[] = [
    {
        id: 'mon',
        label: 'Segunda',
        muscleGroup: 'Peito & Tríceps',
        isRestDay: false,
        modified: false,
        completed: false,
        score: 'PENDING',
        exercises: [
            { id: '1', name: 'Supino Reto', equipment: 'Barra', sets: 4, reps: '10-12', imageUrl: 'https://picsum.photos/400/300?random=1', tips: 'Mantenha os cotovelos a 45 graus.', completed: false },
            { id: '2', name: 'Supino Inclinado', equipment: 'Halteres', sets: 3, reps: '12', imageUrl: 'https://picsum.photos/400/300?random=2', tips: 'Controle a descida.', completed: false },
            { id: '3', name: 'Crossover', equipment: 'Polia', sets: 3, reps: '15', imageUrl: 'https://picsum.photos/400/300?random=3', tips: 'Foque na contração no final.', completed: false },
            { id: '4', name: 'Tríceps Corda', equipment: 'Polia', sets: 4, reps: '12-15', imageUrl: 'https://picsum.photos/400/300?random=4', tips: 'Não mova os ombros.', completed: false },
        ]
    },
    {
        id: 'tue',
        label: 'Terça',
        muscleGroup: 'Costas & Bíceps',
        isRestDay: false,
        modified: false,
        completed: false,
        score: 'PENDING',
        exercises: [
            { id: '5', name: 'Puxada Frontal', equipment: 'Máquina', sets: 4, reps: '10-12', imageUrl: 'https://picsum.photos/400/300?random=5', tips: 'Puxe com os cotovelos.', completed: false },
            { id: '6', name: 'Remada Curvada', equipment: 'Barra', sets: 3, reps: '10', imageUrl: 'https://picsum.photos/400/300?random=6', tips: 'Mantenha a coluna reta.', completed: false },
            { id: '7', name: 'Rosca Direta', equipment: 'Barra W', sets: 3, reps: '12', imageUrl: 'https://picsum.photos/400/300?random=7', tips: 'Não balance o tronco.', completed: false },
        ]
    },
    {
        id: 'wed',
        label: 'Quarta',
        muscleGroup: 'Descanso Ativo / Cardio',
        isRestDay: true,
        modified: false,
        completed: false,
        score: 'PENDING',
        exercises: [
            { id: '8', name: 'Esteira - Caminhada Inclinada', equipment: 'Esteira', sets: 1, reps: '45 min', imageUrl: 'https://picsum.photos/400/300?random=8', tips: 'Frequência cardíaca zona 2.', completed: false },
        ]
    },
    {
        id: 'thu',
        label: 'Quinta',
        muscleGroup: 'Pernas Completo',
        isRestDay: false,
        modified: false,
        completed: false,
        score: 'PENDING',
        exercises: [
            { id: '9', name: 'Agachamento Livre', equipment: 'Barra', sets: 4, reps: '8-10', imageUrl: 'https://picsum.photos/400/300?random=9', tips: 'Quebre a paralela.', completed: false },
            { id: '10', name: 'Leg Press 45', equipment: 'Máquina', sets: 3, reps: '12', imageUrl: 'https://picsum.photos/400/300?random=10', tips: 'Não trave os joelhos.', completed: false },
            { id: '11', name: 'Cadeira Extensora', equipment: 'Máquina', sets: 3, reps: '15', imageUrl: 'https://picsum.photos/400/300?random=11', tips: 'Segure 1s no topo.', completed: false },
        ]
    },
    {
        id: 'fri',
        label: 'Sexta',
        muscleGroup: 'Ombros & Abdômen',
        isRestDay: false,
        modified: false,
        completed: false,
        score: 'PENDING',
        exercises: [
            { id: '12', name: 'Desenvolvimento Militar', equipment: 'Halteres', sets: 4, reps: '10', imageUrl: 'https://picsum.photos/400/300?random=12', tips: 'Estenda completamente.', completed: false },
            { id: '13', name: 'Elevação Lateral', equipment: 'Halteres', sets: 4, reps: '15', imageUrl: 'https://picsum.photos/400/300?random=13', tips: 'Foque no deltóide lateral.', completed: false },
            { id: '14', name: 'Prancha Abdominal', equipment: 'Solo', sets: 3, reps: '1 min', imageUrl: 'https://picsum.photos/400/300?random=14', tips: 'Contraia o core.', completed: false },
        ]
    },
    {
        id: 'sat',
        label: 'Sábado',
        muscleGroup: 'Full Body / Weak Points',
        isRestDay: false,
        modified: false,
        completed: false,
        score: 'PENDING',
        exercises: [
            { id: '15', name: 'Levantamento Terra', equipment: 'Barra', sets: 3, reps: '6-8', imageUrl: 'https://picsum.photos/400/300?random=15', tips: 'Técnica perfeita é essencial.', completed: false },
        ]
    },
    {
        id: 'sun',
        label: 'Domingo',
        muscleGroup: 'Descanso Total',
        isRestDay: true,
        modified: false,
        completed: false,
        score: 'PENDING',
        exercises: []
    }
];