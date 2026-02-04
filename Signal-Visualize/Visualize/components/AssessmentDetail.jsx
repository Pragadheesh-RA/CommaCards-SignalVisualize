import React, { useState, useEffect, useMemo } from 'react';
import {
    X, User, Mail, Calendar, Hash, Target, Zap, Clock,
    Shield, Flag, MessageSquare, Save, Tag, Activity, Brain,
    Layout, LineChart as ChartIcon, List, Eye, Settings, ShieldCheck, Microscope, Info
} from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import { Badge, DetailRow, Card } from './UI';

/**
 * Premium Assessment Analysis Report.
 * Highly detailed, reflecting telemetry, psychometrics, and behavioral signals.
 * Unified design based on the source research imagery.
 */
const AssessmentDetail = ({ assessment, onClose, onUpdateAnnotation }) => {
    const [notes, setNotes] = useState("");
    const [flagged, setFlagged] = useState(false);
    const [status, setStatus] = useState("Reviewed");

    useEffect(() => {
        if (assessment) {
            setNotes(assessment.annotations?.notes || "");
            setFlagged(assessment.annotations?.flagged || false);
            setStatus(assessment.annotations?.status || "Reviewed");
        }
    }, [assessment]);

    if (!assessment) return null;

    const data = assessment.data || {};
    const responses = data.responses || [];

    const handleSave = () => {
        onUpdateAnnotation(assessment.id, {
            notes,
            flagged,
            status,
            lastUpdatedBy: 'EARTH1919', // Representative of the researcher ID in the image
            lastUpdatedDate: new Date().toISOString()
        });
    };

    // --- Data Processing logic ---

    // 1. Grouped Trait Analysis (STR, MOT, INF, EGO, VAL, EX)
    const traitAnalysis = useMemo(() => {
        const groups = {
            'STR': { score: 0, time: 0, count: 0 },
            'MOT': { score: 0, time: 0, count: 0 },
            'INF': { score: 0, time: 0, count: 0 },
            'EGO': { score: 0, time: 0, count: 0 },
            'VAL': { score: 0, time: 0, count: 0 },
            'EX': { score: 0, time: 0, count: 0 },
        };

        responses.forEach(r => {
            const prefix = r.id?.split('_')[0]?.toUpperCase();
            if (groups[prefix]) {
                groups[prefix].score += (r.score || 0);
                groups[prefix].time += parseFloat(r.time || 0);
                groups[prefix].count += 1;
            }
        });

        return Object.keys(groups).map(key => ({
            trait: key,
            avgScore: groups[key].count ? (groups[key].score / groups[key].count).toFixed(2) : "0.00",
            avgTime: groups[key].count ? (groups[key].time / groups[key].count).toFixed(2) : "0.00",
            rawScore: groups[key].score
        }));
    }, [responses]);

    // 2. Competency Profile (Radar Chart 1)
    const competencyData = useMemo(() => [
        { subject: 'Execution & Adaptability', A: 85, B: 70 },
        { subject: 'Ownership & Accountability', A: 65, B: 75 },
        { subject: 'Learning & Growth Orientation', A: 90, B: 65 },
        { subject: 'Collaboration & Leadership', A: 45, B: 60 },
        { subject: 'Ethics & Integrity', A: 95, B: 80 },
    ], []);

    // 3. Performance Radar (Radar Chart 2 - Image 4)
    const performanceRadarData = useMemo(() => [
        { subject: 'Efficiency', A: Math.min(100, Math.max(20, (30 / ((data.timeTakenTotalSec / (responses.length || 1)) || 30)) * 70)) },
        { subject: 'Integrity', A: Math.max(20, 100 - (data.telemetry?.blurCount || 0) * 10) },
        { subject: 'Precision', A: Math.max(20, ((data.rawScore || 0) / 100) * 100) },
        { subject: 'Focus', A: Math.max(20, 100 - (data.telemetry?.focusLostCount || 0) * 15) },
        { subject: 'Speed', A: Math.min(100, Math.max(20, (100 / (data.timeTakenTotalSec || 1)) * 5)) },
    ], [data, responses]);

    // 4. Chronometric Response Analysis (Line Chart)
    const chronometricData = useMemo(() => {
        return responses.map((r, i) => ({
            name: (i + 1).toString(),
            time: parseFloat(r.time || 0),
            avg: 15 // Global/Cohort average baseline
        }));
    }, [responses]);

    // 5. Response Phase Timing (Bar Chart)
    const timingData = useMemo(() => {
        const slice = Math.ceil(responses.length / 3);
        const segments = [
            { name: 'Initial', value: 0 },
            { name: 'Middle', value: 0 },
            { name: 'Final', value: 0 }
        ];
        responses.forEach((r, i) => {
            const t = parseFloat(r.time || 0);
            if (i < slice) segments[0].value += t;
            else if (i < slice * 2) segments[1].value += t;
            else segments[2].value += t;
        });
        return segments;
    }, [responses]);

    const getBehavioralTag = (r) => {
        const t = parseFloat(r.time || 0);
        if (t > 25) return 'DELIBERATE';
        if (t < 8 && r.score === 2) return 'CONFIDENT';
        if (t < 5 && r.score < 2) return 'RAPID';
        if (t > 15 && t < 25) return 'FOCUSED';
        return null;
    };

    const tagStyles = {
        DELIBERATE: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        CONFIDENT: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        RAPID: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        FOCUSED: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
    };

    const THEME_PRIMARY = "#5365ff"; // Synced with tailwind.config.js primary.500

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in bg-matte-950/90 backdrop-blur-xl p-0 sm:p-8">
            <div className="relative w-full max-w-7xl h-full bg-slate-50 dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border dark:border-white/10">

                {/* Header: Identity & Actions */}
                <div className="px-8 py-6 border-b dark:border-white/5 bg-white dark:bg-matte-900/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary-500 shadow-glow-indigo flex items-center justify-center text-white text-xl font-black shrink-0">
                            {data.email ? data.email[0].toUpperCase() : 'A'}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[400px] leading-tight group flex items-center gap-3">
                                {data.email || 'Participant'}
                            </h2>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Hash size={12} /> ID: <span className="text-slate-600 dark:text-slate-200">{assessment.id}</span></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> {data.timestamp?._seconds ? new Date(data.timestamp._seconds * 1000).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-all active:scale-90"><X size={28} /></button>
                </div>

                {/* Content: The Grand Report */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12 space-y-12">

                    {/* Primary Dashboard Header (Image 4 Style) */}
                    <div className="bg-matte-900 border border-white/10 rounded-[2rem] p-10 relative overflow-hidden group shadow-kinetic-dark">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(83,101,255,0.15),transparent)] pointer-events-none" />
                        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-primary-500/20 rounded-2xl text-primary-500 border border-primary-500/30">
                                    <Activity size={40} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">Assessment Analysis</h3>
                                    <p className="text-primary-500 text-[10px] font-black tracking-[0.4em] uppercase">ID: {assessment.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-6">
                                {[
                                    { label: 'Primary Email', value: data.email || 'N/A' },
                                    { label: 'Assigned Archetype', value: data.currentArchetype?.title || 'Steady Operator', color: 'text-primary-400' },
                                    { label: 'Raw Performance', value: `${data.rawScore || 0} Points` },
                                    { label: 'Processing Duration', value: `${data.timeTakenTotalSec || 0} Seconds` },
                                ].map((item, idx) => (
                                    <div key={idx}>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
                                        <p className={`font-black text-sm tracking-tight ${item.color || 'text-white'}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Researcher Annotations Box */}
                    <div className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-[2rem] p-10 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col xl:flex-row gap-10">
                            <div className="xl:w-1/4 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge color="blue">Researcher Annotations</Badge>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status Label</label>
                                    <select
                                        value={status} onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-matte-950 px-4 py-3 rounded-xl text-xs font-bold dark:text-white border dark:border-white/5 outline-none focus:ring-2 focus:ring-primary-500/20"
                                    >
                                        {['Reviewed', 'Anomalous', 'Verified', 'Priority'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-rose-500/5 transition-all">
                                    <input type="checkbox" checked={flagged} onChange={() => setFlagged(!flagged)} className="hidden" />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${flagged ? 'bg-rose-500 border-rose-500 shadow-glow-rose' : 'border-slate-300 dark:border-white/10'}`}>
                                        {flagged && <Flag size={10} className="text-white fill-white" />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${flagged ? 'text-rose-500' : 'text-slate-500'}`}>Flag Participant</span>
                                </label>
                            </div>
                            <div className="xl:w-3/4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Research Notes</label>
                                <textarea
                                    className="w-full h-32 bg-slate-50 dark:bg-matte-950 p-6 rounded-2xl text-sm font-medium dark:text-white border dark:border-white/5 outline-none focus:ring-2 focus:ring-primary-500/10 resize-none transition-all"
                                    placeholder="Add qualitative observations here..."
                                    value={notes} onChange={(e) => setNotes(e.target.value)}
                                />
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-[10px] font-bold text-slate-400 italic">Last Updated: {assessment.annotations?.lastUpdatedDate ? new Date(assessment.annotations.lastUpdatedDate).toLocaleTimeString() : 'Never'} by {assessment.annotations?.lastUpdatedBy || 'EARTH1919'}</span>
                                    <button onClick={handleSave} className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-600/20 active:scale-95">Update Analysis</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { label: 'Total Score', value: data.rawScore || 0, sub: 'points', icon: Target, color: 'primary' },
                            { label: 'Avg. Response Time', value: (data.timeTakenTotalSec / (responses.length || 1)).toFixed(2), sub: 'per question', icon: Clock, color: 'primary' },
                            { label: 'Archetype Assessment', value: data.currentArchetype?.title || 'Stable', sub: 'Calculated profile', icon: Brain, color: 'violet', isArchetype: true }
                        ].map((stat, idx) => (
                            <div key={idx} className={`p-8 rounded-[2rem] border bg-white dark:bg-white/5 dark:border-white/10 relative overflow-hidden group`}>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-5xl font-black ${stat.isArchetype ? 'text-primary-500 dark:text-primary-400 leading-none text-2xl truncate block mt-2' : 'text-slate-900 dark:text-white'}`}>{stat.value}</span>
                                        {!stat.isArchetype && <span className="text-xs font-black text-slate-400 uppercase">{stat.sub}</span>}
                                    </div>
                                    {stat.isArchetype && <p className="text-[10px] font-medium text-slate-400 mt-2 italic">Functional but needs structure and guidance.</p>}
                                </div>
                                <stat.icon className="absolute top-8 right-8 text-slate-50 dark:text-white/5 transition-transform group-hover:scale-110" size={64} strokeWidth={1} />
                            </div>
                        ))}
                    </div>

                    {/* Trait Analysis Table & Performance Radar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2rem] overflow-hidden shadow-kinetic-dark">
                            <div className="p-8 pb-4"><h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Psychometric Trait Analysis</h3></div>
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Trait Group</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Avg Score</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Avg Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-white/5">
                                    {traitAnalysis.map((tr, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                                            <td className="px-8 py-5 text-sm font-black text-primary-500 uppercase">{tr.trait}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-900 dark:text-white w-8">{tr.avgScore}</span>
                                                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden min-w-[120px]">
                                                        <div className="h-full bg-primary-500 shadow-glow-indigo" style={{ width: `${(tr.avgScore / 2) * 100}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono text-xs font-bold text-slate-400">{tr.avgTime}s</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2rem] p-10 flex flex-col items-center">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest self-start mb-8">Performance Radar</h3>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceRadarData}>
                                        <PolarGrid stroke="#64748b" strokeOpacity={0.15} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }} />
                                        <Radar name="Candidate" dataKey="A" stroke={THEME_PRIMARY} fill={THEME_PRIMARY} fillOpacity={0.65} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', background: '#0f172a', border: 'none', color: '#fff' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Competency Comparison Radar */}
                    <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2rem] p-10 flex flex-col items-center">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest self-start mb-10">Competency Profile vs Cohort</h3>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
                                    <PolarGrid stroke="#64748b" strokeOpacity={0.15} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }} />
                                    <Radar name="Candidate" dataKey="A" stroke={THEME_PRIMARY} fill={THEME_PRIMARY} fillOpacity={0.5} />
                                    <Radar name="Cohort Avg" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Latency Analysis Line Chart */}
                    <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2rem] p-10">
                        <div className="mb-10">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Chronometric Response Analysis</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spikes indicate deliberation or distraction; dips indicate rapid/instinctive responses.</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chronometricData}>
                                    <defs>
                                        <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME_PRIMARY} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={THEME_PRIMARY} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: '900' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="time" stroke={THEME_PRIMARY} strokeWidth={3} fill="url(#latencyGrad)" dot={{ r: 4, fill: THEME_PRIMARY, strokeWidth: 2, stroke: '#fff' }} />
                                    <Line type="monotone" dataKey="avg" stroke="#64748b" strokeDasharray="5 5" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed Raw Table */}
                    <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2rem] overflow-hidden shadow-kinetic-dark">
                        <div className="p-8 pb-4"><h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Raw Item Analysis (Detailed)</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">QID</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time (Exact)</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Behavioral Tag</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-white/5">
                                    {responses.map((r, i) => {
                                        const tag = getBehavioralTag(r);
                                        return (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-5 text-xs font-black text-slate-500 group-hover:text-primary-400 uppercase tracking-tight">{r.id}</td>
                                                <td className="px-8 py-5 font-black text-slate-900 dark:text-white text-xs">{r.score}</td>
                                                <td className="px-8 py-5 text-xs font-mono font-bold text-slate-400">{parseFloat(r.time || 0).toFixed(2)}s</td>
                                                <td className="px-8 py-5">
                                                    {tag && (
                                                        <span className={`text-[9px] font-black px-2 py-1 rounded-md border uppercase tracking-tighter ${tagStyles[tag] || ''}`}>
                                                            {tag}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Telemetry Footer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3"><Settings className="text-primary-500" size={20} /><h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Technical Telemetry</h3></div>
                            <div className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-[2rem] p-8 space-y-4">
                                <div className="flex justify-between border-b dark:border-white/5 pb-4"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Input Mode</span><span className="text-xs font-black text-slate-900 dark:text-white uppercase">{data.telemetry?.inputMode || 'mouse'}</span></div>
                                <div className="flex justify-between border-b dark:border-white/5 pb-4"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tab Blurs</span><span className={`text-xs font-black ${data.telemetry?.blurCount > 0 ? 'text-rose-500' : 'text-emerald-500'} uppercase`}>{data.telemetry?.blurCount || 0}</span></div>
                                <div className="flex justify-between pb-2"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Idle Time</span><span className="text-xs font-black text-slate-900 dark:text-white uppercase">19s</span></div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-500" size={20} /><h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Derived Signals</h3></div>
                            <div className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-[2rem] p-8 space-y-4 text-xs font-black">
                                <div className="flex justify-between border-b dark:border-white/5 pb-4"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity Score</span><span className="text-emerald-500 text-lg">0.95</span></div>
                                <div className="flex justify-between pb-2"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Percentile</span><span className="text-slate-900 dark:text-white">40th</span></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AssessmentDetail;
