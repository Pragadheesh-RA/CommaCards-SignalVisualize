import React from 'react';

/**
 * Premium Card component with support for dark mode and entrance animations.
 * Optimized for smoothness on all devices.
 */
export const Card = ({ title, children, className = "", delay = "" }) => (
    <div className={`premium-card p-6 overflow-hidden relative group animate-slide-up ${delay} ${className}`}>
        {/* Subtle background glow effect for premium feel - hidden on low spec if needed via CSS */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 blur-3xl rounded-full group-hover:bg-primary-500/10 transition-colors duration-500" />

        {title && (
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{title}</h3>
            </div>
        )}
        <div className="relative z-10">{children}</div>
    </div>
);

/**
 * Refined Badge component with better contrast for dark mode.
 */
export const Badge = ({ children, color = "indigo" }) => {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
        orange: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
        slate: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
        amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
        red: "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
        teal: "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20"
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border transform transition-transform hover:scale-105 ${colors[color] || colors.indigo}`}>
            {children}
        </span>
    );
};

/**
 * Responsive Detail Row for lists and grids.
 */
export const DetailRow = ({ label, value, subValue }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-slate-50 dark:border-slate-800 last:border-0 group">
        <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 sm:mb-0 group-hover:text-primary-500 transition-colors">{label}</span>
        <div className="sm:text-right">
            <span className="text-sm text-slate-900 dark:text-slate-200 font-bold block break-all leading-tight">{value}</span>
            {subValue && <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1 font-medium">{subValue}</span>}
        </div>
    </div>
);
