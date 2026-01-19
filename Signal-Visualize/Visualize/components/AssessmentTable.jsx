import React, { useState } from 'react';
import {
    Search, Filter, Trash2, ChevronRight, ArrowUp, ArrowDown, Flag, User
} from 'lucide-react';
import { Badge } from './UI';

/**
 * Premium Responsive Assessment Table.
 * Optimized for mobile with a card-style fallback and smooth interactions.
 */
const AssessmentTable = ({
    data,
    onDelete,
    onSelect,
    sortConfig,
    onSort,
    searchTerm,
    onSearchChange,
    filterArchetype,
    onFilterChange,
    availableArchetypes
}) => {

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    const formatDate = (seconds) => {
        if (!seconds) return 'N/A';
        return new Date(seconds * 1000).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white/50 dark:bg-slate-900/30 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search researcher or email..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 dark:text-white transition-all outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="appearance-none pl-10 pr-8 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none shadow-sm cursor-pointer"
                            value={filterArchetype}
                            onChange={(e) => onFilterChange(e.target.value)}
                        >
                            {availableArchetypes.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Responsive Table/Card Container */}
            <div className="premium-card overflow-hidden">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                            <tr>
                                {['timestamp', 'data.email', 'score', 'time'].map((key) => (
                                    <th
                                        key={key}
                                        className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => onSort(key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {key === 'timestamp' ? 'Created Date' :
                                                key === 'data.email' ? 'Participant' :
                                                    key === 'score' ? 'Score' : 'Duration'}
                                            {getSortIcon(key)}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-800">
                            {data.map((item, idx) => {
                                const score = item.data?.rawScore || 0;
                                // Utility grading logic (mirrored from App.jsx for consistency)
                                const getGrade = (s) => (s >= 90 ? 'A+' : s >= 80 ? 'A' : s >= 70 ? 'B+' : s >= 60 ? 'B' : s >= 50 ? 'C' : 'D');

                                return (
                                    <tr
                                        key={item.id || idx}
                                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                                        onClick={() => onSelect(item)}
                                    >
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {item.data?.timestamp?._seconds
                                                    ? new Date(item.data.timestamp._seconds * 1000).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                                    : 'N/A'}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">IST Time</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                                                        {item.data?.email || "Anonymous"}
                                                        {item.annotations?.flagged && <Flag size={12} className="inline ml-2 text-red-500 fill-red-500 animate-pulse" />}
                                                    </p>
                                                    <p className="text-xs font-bold text-primary-500/80 truncate max-w-[150px] uppercase tracking-tighter mt-0.5">
                                                        {item.data?.currentArchetype?.title || item.data?.archetype || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-base font-black text-slate-900 dark:text-white">{score}</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">pts</span>
                                                    </div>
                                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary-500"
                                                            style={{ width: `${Math.min(100, (score / 100) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Grade Badge */}
                                                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-black text-primary-600 dark:text-primary-400">{getGrade(score)}</span>
                                                </div>

                                                {/* Quick Annotations Tags */}
                                                <div className="flex flex-wrap gap-1 max-w-[120px]">
                                                    {item.annotations?.tags?.map((tag, idx) => {
                                                        const tagColors = {
                                                            REVIEWED: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                                                            PRIORITY: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                                                            VERIFIED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                                            ANOMALOUS: 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        };
                                                        const colorStyle = tagColors[tag.toUpperCase()] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
                                                        return (
                                                            <span key={idx} className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border ${colorStyle} uppercase tracking-tighter whitespace-nowrap`}>
                                                                {tag}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
                                            {item.data?.timeTakenTotalSec}s
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <div className="p-2 text-primary-500">
                                                    <ChevronRight size={18} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y dark:divide-slate-800">
                    {data.map((item, idx) => {
                        const score = item.data?.rawScore || 0;
                        const grade = (score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C' : 'D');
                        return (
                            <div
                                key={item.id || idx}
                                className="p-4 active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                                onClick={() => onSelect(item)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{item.data?.email || "Anonymous"}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {item.data?.timestamp?._seconds
                                                        ? new Date(item.data.timestamp._seconds * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                                                        : 'N/A'}
                                                </p>
                                                <span className="text-[10px] font-black text-primary-500 bg-primary-500/10 px-1.5 rounded uppercase">{grade}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge color={item.annotations?.flagged ? "red" : "indigo"}>
                                            {score} pts
                                        </Badge>
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {item.annotations?.tags?.slice(0, 2).map((tag, idx) => (
                                                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/20" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-primary-500 uppercase tracking-tighter">
                                        {item.data?.currentArchetype?.title || item.data?.archetype || "N/A"}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                        className="p-2 text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="text-center py-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of dataset • Showing {data.length} results</p>
            </div>
        </div>
    );
};

export default AssessmentTable;
