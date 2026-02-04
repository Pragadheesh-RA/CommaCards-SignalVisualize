import React, { useState, useEffect, useMemo } from 'react';
import {
    X, User, Mail, Calendar, Hash, Target, Zap, Clock,
    Shield, Flag, MessageSquare, Save, Tag, Activity, Brain,
    Layout, LineChart as ChartIcon, List, Eye, Settings, ShieldCheck, Microscope, Info,
    AlertCircle, CheckCircle, RefreshCw, BarChart as LucideBarChart
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import { Badge, DetailRow, Card } from './UI';

/**
 * Premium Assessment Analysis Report v2.0
 * Enhanced with deep telemetry, defensive rendering, and diagnostic logging.
 */
const AssessmentDetail = ({ assessment, onClose, onUpdateAnnotation }) => {
    // Diagnostic Logging
    useEffect(() => {
        console.log("[AssessmentDetail] Mounting with assessment data:", assessment);
    }, [assessment]);

    const [notes, setNotes] = useState("");
    const [flagged, setFlagged] = useState(false);
    const [status, setStatus] = useState("Reviewed");
    const [renderError, setRenderError] = useState(null);

    useEffect(() => {
        if (assessment) {
            setNotes(assessment.annotations?.notes || "");
            setFlagged(assessment.annotations?.flagged || false);
            setStatus(assessment.annotations?.status || "Reviewed");
        }
    }, [assessment]);

    // Safety check for invalid assessment object
    if (!assessment || typeof assessment !== 'object') {
        return (
            <div className="fixed inset-0 z-[100] bg-matte-950/90 backdrop-blur-xl flex items-center justify-center p-8">
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl text-center max-w-md border border-red-500/20">
                    <AlertCircle className="text-red-500 mx-auto mb-6" size={64} />
                    <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Data Link Severed</h2>
                    <p className="text-slate-400 font-medium mb-8">The assessment record could not be loaded or is malformed.</p>
                    <button onClick={onClose} className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Return to Registry</button>
                </div>
            </div>
        );
    }

    const data = assessment.data || {};
    const responses = Array.isArray(data.responses) ? data.responses : [];

    const handleSave = () => {
        try {
            onUpdateAnnotation(assessment.id, {
                notes,
                flagged,
                status,
                lastUpdatedBy: 'EARTH1919',
                lastUpdatedDate: new Date().toISOString()
            });
        } catch (e) {
            console.error("[AssessmentDetail] Save error:", e);
        }
    };

    // --- Defensive Data Processing ---

    // 1. Grouped Trait Analysis
    const traitAnalysis = useMemo(() => {
        try {
            const groups = {
                'STR': { score: 0, time: 0, count: 0 },
                'MOT': { score: 0, time: 0, count: 0 },
                'INF': { score: 0, time: 0, count: 0 },
                'EGO': { score: 0, time: 0, count: 0 },
                'VAL': { score: 0, time: 0, count: 0 },
                'EX': { score: 0, time: 0, count: 0 },
            };

            responses.forEach(r => {
                if (!r) return;
                const idStr = String(r.id || '');
                const prefix = idStr.split('_')[0]?.toUpperCase();
                if (groups[prefix]) {
                    groups[prefix].score += (Number(r.score) || 0);
                    groups[prefix].time += (parseFloat(r.time) || 0);
                    groups[prefix].count += 1;
                }
            });

            return Object.keys(groups).map(key => ({
                trait: key,
                avgScore: groups[key].count ? (groups[key].score / groups[key].count).toFixed(2) : "0.00",
                avgTime: groups[key].count ? (groups[key].time / groups[key].count).toFixed(2) : "0.00",
                rawScore: groups[key].score
            }));
        } catch (e) {
            console.error("Trait analysis calculation error:", e);
            return [];
        }
    }, [responses]);

    // 2. Performance Radar
    const performanceRadarData = useMemo(() => {
        try {
            const avgTime = (Number(data.timeTakenTotalSec) || 0) / (responses.length || 1);
            const efficiency = Math.min(100, Math.max(20, (30 / (avgTime || 30)) * 70));
            const integrity = Math.max(20, 100 - (Number(data.telemetry?.blurCount) || 0) * 10);
            const precision = Math.max(20, ((Number(data.rawScore) || 0) / 100) * 100);
            const focus = Math.max(20, 100 - (Number(data.telemetry?.focusLostCount) || 0) * 15);
            const speed = Math.min(100, Math.max(20, (100 / (Number(data.timeTakenTotalSec) || 1)) * 5));

            return [
                { subject: 'Efficiency', A: efficiency },
                { subject: 'Integrity', A: integrity },
                { subject: 'Precision', A: precision },
                { subject: 'Focus', A: focus },
                { subject: 'Speed', A: speed },
            ];
        } catch (e) {
            console.error("Performance radar calculation error:", e);
            return [];
        }
    }, [data, responses]);

    // 3. Chronometric Latency
    const chronometricData = useMemo(() => {
        return responses.map((r, i) => ({
            name: (i + 1).toString(),
            time: parseFloat(r.time || 0),
            avg: 15
        }));
    }, [responses]);

    const getBehavioralTag = (r) => {
        if (!r) return null;
        const t = parseFloat(r.time || 0);
        const s = Number(r.score || 0);
        if (t > 25) return 'DELIBERATE';
        if (t < 8 && s === 2) return 'CONFIDENT';
        if (t < 5 && s < 2) return 'RAPID';
        if (t > 12 && t < 22) return 'FOCUSED';
        return null;
    };

    const tagStyles = {
        DELIBERATE: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        CONFIDENT: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        RAPID: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        FOCUSED: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
    };

    const THEME_PRIMARY = "#5365ff";

    // Formatting timestamp safely
    const formatTimestamp = (ts) => {
        if (!ts) return "N/A";
        // Handle Firestore-style timestamp {_seconds, _nanoseconds}
        if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        // Handle ISO strings or Date objects
        const d = new Date(ts);
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (renderError) {
        return (
            <div className="fixed inset-0 z-[100] bg-matte-950 flex items-center justify-center">
                <div className="text-white text-center p-10 bg-red-500/10 rounded-3xl border border-red-500/20">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                    <h2 className="text-xl font-black mb-2">Analysis Engine Failure</h2>
                    <p className="text-sm opacity-60 mb-6">{renderError}</p>
                    <button onClick={onClose} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">Close Report</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in bg-matte-950/95 backdrop-blur-[20px] p-0 sm:p-2 md:p-10">
            <div className="relative w-full max-w-7xl h-full bg-slate-50 dark:bg-slate-900 md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border dark:border-white/10 animate-spring-in">

                {/* Header: Identity & Master Controls */}
                <header className="px-8 py-6 border-b dark:border-white/5 bg-white dark:bg-matte-900/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary-500 shadow-glow-primary flex items-center justify-center text-white text-xl font-black shrink-0 animate-pulse-magnetic">
                            {data.email ? data.email[0].toUpperCase() : <User size={24} />}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[300px] sm:max-w-[500px] leading-tight flex items-center gap-3">
                                {data.email || 'Anonymous Participant'}
                                {flagged && <Badge color="rose">FLAGGED</Badge>}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Hash size={12} className="text-primary-500" /> <span className="text-slate-600 dark:text-slate-200">{assessment.id}</span></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} className="text-primary-500" /> {formatTimestamp(data.timestamp)}</span>
                                <Badge color="violet">{data.currentArchetype?.title || "Unknown Archetype"}</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.print()} className="hidden md:flex p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-primary-500 transition-all active:scale-90" title="Export Analysis"><LucideBarChart size={24} /></button>
                        <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-90" title="Close"><X size={24} /></button>
                    </div>
                </header>

                {/* Content: The High-Fidelity Scientific Report */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-12 space-y-12">

                    {/* Operational Summary Grid (Master Metrics) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {[
                            { label: 'Cumulative Score', value: data.rawScore || 0, sub: 'Points Total', icon: Target, color: 'bg-primary-500' },
                            { label: 'Response Velocity', value: ((responses.length || 0) / (data.timeTakenTotalSec || 1) * 60).toFixed(1), sub: 'Items / min', icon: Zap, color: 'bg-amber-500' },
                            { label: 'Cognitive Latency', value: ((data.timeTakenTotalSec || 0) / (responses.length || 1)).toFixed(2), sub: 'Seconds / Item', icon: Clock, color: 'bg-emerald-500' },
                            { label: 'Integrity Rating', value: integrityRating(data), sub: 'Based on tab focus', icon: ShieldCheck, color: 'bg-violet-500' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white dark:bg-white/5 border dark:border-white/10 p-8 rounded-[2rem] group hover:scale-[1.02] transition-all relative overflow-hidden shadow-sm hover:shadow-glow-sm">
                                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity blur-3xl`} />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{stat.value}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{stat.sub}</span>
                                </div>
                                <stat.icon className="absolute bottom-6 right-6 text-slate-100 dark:text-white/10 group-hover:text-primary-500/20 transition-colors" size={48} strokeWidth={1} />
                            </div>
                        ))}
                    </div>

                    {/* Primary Analytics Section (Radar & Traits) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Radar Comparison */}
                        <div className="bg-matte-900 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-kinetic-dark h-[500px] flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-violet-500" />
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3"><Brain className="text-primary-500" size={20} /> Cognitive Competency Radar</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Candidate Profile vs Institutional Cohort Benchmark</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceRadarData}>
                                        <PolarGrid stroke="#ffffff10" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                                        <Radar name="Candidate" dataKey="A" stroke={THEME_PRIMARY} fill={THEME_PRIMARY} fillOpacity={0.5} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Trait Matrix */}
                        <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
                            <div className="p-8 pb-4">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3"><Settings className="text-primary-500" size={20} /> Psychometric Trait Matrix</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Calculated Average Performance by Question Archetype Grouping</p>
                            </div>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-white/5 border-b dark:border-white/5">
                                        <tr>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Construct</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency</th>
                                            <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Precision</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-white/5">
                                        {traitAnalysis.map((tr, i) => (
                                            <tr key={i} className="hover:bg-primary-500/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-primary-500">{tr.trait}</span>
                                                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">Psychometric Index</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <span className="text-[10px] font-mono font-bold text-slate-400">{tr.avgTime}s</span>
                                                        <div className="w-20 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-slate-300 dark:bg-white/20" style={{ width: `${Math.min(100, (parseFloat(tr.avgTime) / 30) * 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden min-w-[100px]">
                                                            <div className="h-full bg-primary-500 shadow-glow-sm" style={{ width: `${(parseFloat(tr.avgScore) / 2) * 100}%` }} />
                                                        </div>
                                                        <span className="text-xs font-black text-slate-900 dark:text-white w-8">{tr.avgScore}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Latency Map (Line Chart) */}
                    <div className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-[2.5rem] p-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-3"><ChartIcon className="text-primary-500" size={20} /> Chronometric Response Phase Analysis</h3>
                                <p className="text-[11px] font-medium text-slate-500 max-w-xl leading-relaxed">Latency mapping reveals behavioral patterns. Sharp spikes indicate deliberative thought processes or distractions, while valleys suggest instinctive or intuitive responses.</p>
                            </div>
                            <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border dark:border-white/5">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary-500 shadow-glow-sm" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Latent Time</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cohort Mean</span></div>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chronometricData}>
                                    <defs>
                                        <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME_PRIMARY} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={THEME_PRIMARY} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: '900' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} unit="s" />
                                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} cursor={{ stroke: THEME_PRIMARY, strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area type="monotone" dataKey="time" stroke={THEME_PRIMARY} strokeWidth={3} fill="url(#latencyGrad)" dot={{ r: 5, fill: THEME_PRIMARY, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, fill: THEME_PRIMARY, stroke: '#fff', strokeWidth: 3 }} />
                                    <Line type="monotone" dataKey="avg" stroke="#64748b" strokeDasharray="5 5" dot={false} strokeOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Researcher Annotation Nexus */}
                    <div className="bg-white dark:bg-matte-900 border dark:border-white/10 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-primary-500/10 group-hover:text-primary-500/20 transition-colors pointer-events-none rotate-12"><MessageSquare size={120} /></div>

                        <div className="relative z-10 flex flex-col xl:flex-row gap-12">
                            <div className="xl:w-1/3 space-y-8">
                                <div>
                                    <Badge color="blue">Annotation Nexus</Badge>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-3">Researcher Observables</h3>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Classification Status</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Reviewed', 'Anomalous', 'Verified', 'Priority'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setStatus(s)}
                                                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${status === s ? 'bg-primary-600 text-white border-primary-500 shadow-glow-primary' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-slate-300 dark:hover:border-white/10'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setFlagged(!flagged)}
                                        className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${flagged ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-glow-rose' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Flag size={18} className={flagged ? 'fill-rose-500' : ''} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Mark for Escalation</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${flagged ? 'bg-rose-500 border-rose-500' : 'border-slate-300 dark:border-white/10'}`}>
                                            {flagged && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="xl:flex-1 flex flex-col">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2 italic"><Microscope size={12} /> Qualitative Field Observations</label>
                                <textarea
                                    className="flex-1 min-h-[180px] w-full bg-slate-50 dark:bg-matte-950 p-8 rounded-[2rem] text-sm font-medium dark:text-slate-200 border dark:border-white/5 outline-none focus:ring-4 focus:ring-primary-500/10 resize-none transition-all placeholder:text-slate-600 shadow-inner"
                                    placeholder="Annotate behavioral signals, environmental factors, or anomalies observed during data ingestion..."
                                    value={notes} onChange={(e) => setNotes(e.target.value)}
                                />
                                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registry ID: {assessment.id}</span>
                                        <span className="text-[9px] font-bold text-slate-400 italic">Synchronized at: {new Date().toLocaleTimeString()} by EARTH1919</span>
                                    </div>
                                    <button onClick={handleSave} className="w-full sm:w-auto px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-glow-primary active:scale-95 flex items-center justify-center gap-3">
                                        <Save size={16} strokeWidth={3} />
                                        Commit Analysis
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Itemized Telemetry (The Raw Table) */}
                    <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b dark:border-white/5 flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Technical Item Telemetry</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Granular breakdown of every responder interaction</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border dark:border-white/10 font-mono text-[10px] text-slate-500">
                                RECORD_COUNT: {responses.length} ITEMS
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Query ID</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Outcome</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Latency</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Behavioral Signal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-white/5">
                                    {responses.map((r, i) => {
                                        const tag = getBehavioralTag(r);
                                        return (
                                            <tr key={i} className="hover:bg-primary-500/5 transition-all group">
                                                <td className="px-8 py-5">
                                                    <span className="text-[11px] font-mono font-black text-slate-400 group-hover:text-primary-500 transition-colors uppercase">{r.id || 'NULL_ID'}</span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 font-black text-xs text-slate-900 dark:text-white">
                                                        {r.score}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className="text-xs font-mono font-bold text-slate-500">{parseFloat(r.time || 0).toFixed(3)}s</span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    {tag ? (
                                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-tighter shadow-sm ${tagStyles[tag] || ''}`}>
                                                            {tag}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-slate-300 dark:text-white/10 uppercase italic">Nominal</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Environmental Telemetry Footer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        <div className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-[2rem] p-8 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Settings size={14} /> System Telemetry</h4>
                            <div className="space-y-4">
                                <DetailRow label="Input Protocol" value={data.telemetry?.inputMode || 'HID/Mouse'} />
                                <DetailRow label="Display Ratio" value={`${window.innerWidth}x${window.innerHeight}`} />
                                <DetailRow label="Session Duration" value={`${data.timeTakenTotalSec || 0}s`} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-[2rem] p-8 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Security Audit</h4>
                            <div className="space-y-4">
                                <DetailRow label="Tab Blurs" value={data.telemetry?.blurCount || 0} subValue={(data.telemetry?.blurCount || 0) > 0 ? "Potential multi-tasking detected" : "Constant focus maintained"} />
                                <DetailRow label="Integrity Score" value={integrityRating(data)} subValue="Calculated coefficient" />
                            </div>
                        </div>
                        <div className="bg-matte-900 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
                            <RefreshCw className="text-primary-500 mb-4 animate-spin-slow" size={32} />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Analysis Complete</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Report generated by Visual Intelligence Engine v2.4</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Helper Functions ---
const integrityRating = (data) => {
    const blurs = Number(data.telemetry?.blurCount) || 0;
    if (blurs === 0) return "HIGHEST (1.00)";
    if (blurs === 1) return "STABLE (0.95)";
    if (blurs < 3) return "CAUTION (0.80)";
    return "LOW (0.50)";
};

export default AssessmentDetail;
