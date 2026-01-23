import React from 'react';

/**
 * Kinetic StatCard - Responsive with magnetic icon interaction.
 */
const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay = "" }) => (
    <div className={`kinetic-card p-6 flex items-start justify-between group overflow-hidden relative ${delay} hover:border-luminous`}>
        {/* Luminous Background Pulse */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl rounded-full ${colorClass.replace('bg-', 'bg-')}`} />

        <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">{value}</h3>
            </div>
            {subtext && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-bold flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('bg-', 'bg-')} bg-opacity-50`} />
                    {subtext}
                </p>
            )}
        </div>

        {/* Magnetic Icon */}
        <div className={`relative z-10 p-3.5 rounded-2xl shadow-lg transition-all duration-500 ease-out 
            group-hover:scale-110 group-hover:rotate-6 group-hover:translate-x-1 group-hover:-translate-y-1
            ${colorClass} text-white shadow-current/20`}>
            <Icon size={24} strokeWidth={2.5} />
        </div>
    </div>
);

export default StatCard;
