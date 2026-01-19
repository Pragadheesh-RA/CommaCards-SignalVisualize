import React from 'react';

/**
 * Premium StatCard with gradients and responsive design.
 * Optimized for smooth performance on low-spec devices by avoiding heavy box-shadows.
 */
const StatCard = ({ title, value, subtext, icon: Icon, colorClass, delay = "" }) => (
    <div className={`premium-card p-6 flex items-start justify-between group overflow-hidden relative ${delay}`}>
        {/* Animated subtle gradient background on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br ${colorClass.replace('bg-', 'from-')}`} />

        <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
            </div>
            {subtext && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    {subtext}
                </p>
            )}
        </div>

        <div className={`relative z-10 p-3 rounded-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colorClass} text-white shadow-current/20`}>
            <Icon size={22} strokeWidth={2.5} />
        </div>
    </div>
);

export default StatCard;
