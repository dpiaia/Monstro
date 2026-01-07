import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, colorClass = "text-white" }) => {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-neon-purple/50 transition-colors duration-300">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
                <div className={`p-2 rounded-lg bg-white/5 ${colorClass}`}>
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
                {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
            </div>
        </div>
    );
}