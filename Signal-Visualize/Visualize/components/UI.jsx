import React from 'react';

/**
 * Kinetic Card - Physical depth with spotlight interaction.
 */
export const Card = ({ title, children, className = "", delay = "" }) => (
    <div className={`kinetic-card p-8 relative overflow-hidden group animate-slide-up-fade ${delay} ${className}`}>
        {/* Luminous Spotlight Gradient - Moves with hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Content Layer - Parallax feel */}
        <div className="relative z-10">
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight group-hover:translate-x-1 transition-transform duration-300 ease-out">{title}</h3>
                </div>
            )}
            {children}
        </div>
    </div>
);

/**
 * Luminous Badge - Glowing, gradient-based status indicators.
 */
export const Badge = ({ children, color = "indigo" }) => {
    const colors = {
        indigo: "bg-indigo-50/50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 ring-1 ring-indigo-500/20 dark:ring-indigo-400/30 shadow-glow-sm shadow-indigo-500/20",
        emerald: "bg-emerald-50/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 ring-1 ring-emerald-500/20 dark:ring-emerald-400/30 shadow-glow-sm shadow-emerald-500/20",
        blue: "bg-blue-50/50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 ring-1 ring-blue-500/20 dark:ring-blue-400/30 shadow-glow-sm shadow-blue-500/20",
        violet: "bg-violet-50/50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 ring-1 ring-violet-500/20 dark:ring-violet-400/30 shadow-glow-sm shadow-violet-500/20",
        amber: "bg-amber-50/50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 ring-1 ring-amber-500/20 dark:ring-amber-400/30 shadow-glow-sm shadow-amber-500/20",
        rose: "bg-rose-50/50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 ring-1 ring-rose-500/20 dark:ring-rose-400/30 shadow-glow-sm shadow-rose-500/20",
    };
    // If color key missing, fallback to indigo
    const activeClass = colors[color] || colors.indigo;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold transform transition-all duration-300 hover:scale-105 hover:brightness-110 ${activeClass}`}>
            {children}
        </span>
    );
};

/**
 * Kinetic Detail Row - Interactive list item.
 */
export const DetailRow = ({ label, value, subValue }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-slate-100 dark:border-white/5 last:border-0 group hover:pl-2 transition-all duration-300 cursor-default">
        <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 sm:mb-0 group-hover:text-primary-500 transition-colors">{label}</span>
        <div className="sm:text-right">
            <span className="text-sm text-slate-900 dark:text-slate-200 font-bold block break-all leading-tight group-hover:text-white transition-colors">{value}</span>
            {subValue && <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1 font-medium">{subValue}</span>}
        </div>
    </div>
);

/**
 * Modal - Matte surface with spring animation.
 */
export const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
        <div className="absolute inset-0 bg-matte-950/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-matte-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-kinetic-dark animate-spring-in border border-white/10" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);
