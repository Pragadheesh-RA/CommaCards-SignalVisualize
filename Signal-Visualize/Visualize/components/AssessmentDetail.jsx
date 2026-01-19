import React, { useState } from 'react';
import {
    X, User, Mail, Calendar, Hash, Target, Zap, Clock,
    Shield, Flag, MessageSquare, Save, Tag, Activity, Brain
} from 'lucide-react';
import { Badge, DetailRow, Card } from './UI';

/**
 * Premium Assessment Detail View.
 * Fully responsive full-screen overlay with smooth entrance.
 */
const AssessmentDetail = ({ assessment, onClose, onUpdateAnnotation }) => {
    if (!assessment) return null;

    const data = assessment.data || {};
    const annotations = assessment.annotations || {};

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Slide-out Panel */}
            <div className="relative w-full max-w-2xl h-full bg-white dark:bg-[#0f172a] shadow-2xl overflow-y-auto animate-slide-left p-6 lg:p-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 rotate-3">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Assessment Analysis</h2>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">ID: {assessment.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-all active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Participant Summary */}
                    <Card title="Participant Summary" className="!bg-slate-50/50 dark:!bg-slate-800/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <DetailRow label="Primary Email" value={data.email || 'N/A'} />
                            <DetailRow label="Assigned Archetype" value={data.currentArchetype?.title || data.archetype || 'N/A'} />
                            <DetailRow label="Raw Performance Score" value={`${data.rawScore || 0} Points`} />
                            <DetailRow label="Processing Duration" value={`${data.timeTakenTotalSec || 0} Seconds`} />
                        </div>
                    </Card>

                    {/* Behavioral Insights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card title="Cognitive Flow" className="h-full">
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                                        <Brain size={18} />
                                        <span className="text-xs font-black uppercase tracking-widest">Efficiency</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">Optimal</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Below average response latency</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20">
                                    <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                                        <Shield size={18} />
                                        <span className="text-xs font-black uppercase tracking-widest">Integrity</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">
                                        {data.telemetry?.blurCount > 2 ? 'Flagged' : 'High Integrity'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">{data.telemetry?.blurCount || 0} tab switching events detected</p>
                                </div>
                            </div>
                        </Card>

                        <Card title="Quick Annotations" className="h-full">
                            <div className="flex flex-wrap gap-2">
                                {['Reviewed', 'Priority', 'Anomalous', 'Verified'].map(label => (
                                    <button
                                        key={label}
                                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all transition-transform active:scale-95"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Internal Research Notes</label>
                                <textarea
                                    className="w-full h-24 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20 text-sm font-medium dark:text-white transition-all text-slate-700"
                                    placeholder="Add specialized analysis notes..."
                                />
                                <button className="mt-4 w-full py-3 bg-slate-900 dark:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                                    Save Analysis
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Telemetry Detail */}
                    <Card title="Telemetry Event Log">
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {(data.telemetry?.events || [
                                { type: 'session_start', time: '0s' },
                                { type: 'focus_lost', time: '12s' },
                                { type: 'focus_gain', time: '15s' },
                                { type: 'complete', time: '45s' }
                            ]).map((e, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{e.type.replace('_', ' ')}</span>
                                    </div>
                                    <span className="text-[10px] font-black font-mono text-slate-400">{e.time || 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[80px] pointer-events-none" />
            </div>
        </div>
    );
};

export default AssessmentDetail;
