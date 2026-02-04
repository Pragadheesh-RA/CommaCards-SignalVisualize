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
    // Handle both 'answers' (institutional schema) and 'responses' (legacy schema)
    const rawResponses = Array.isArray(data.answers) ? data.answers : (Array.isArray(data.responses) ? data.responses : []);

    // Enrich responses with telemetry latency if available
    const responses = useMemo(() => {
        const perQ = data.telemetry?.perQ || {};
        return rawResponses.map(r => {
            const qId = r.qId || r.id;
            const t = perQ[qId]?.totalTimeOnQuestionMs ? (perQ[qId].totalTimeOnQuestionMs / 1000) : r.time;
            return { ...r, id: qId, time: t };
        });
    }, [rawResponses, data.telemetry]);

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
        <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in bg-matte-950/40 backdrop-blur-md p-0 print:bg-white print:backdrop-blur-none">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 z-0 no-print" onClick={onClose} />

            <div className="relative w-full md:w-[80%] lg:w-[65%] xl:w-[50%] h-full bg-slate-50 dark:bg-slate-900 md:rounded-l-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-l dark:border-white/10 animate-slide-in-right z-10 print:w-full print:h-auto print:bg-white print:shadow-none print:border-none print:rounded-none selection:bg-primary-500/20">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * { visibility: hidden; }
                        #assessment-detail-root, #assessment-detail-root * { visibility: visible; }
                        #assessment-detail-root {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: auto !important;
                            overflow: visible !important;
                            background: white !important;
                        }
                        .flex-1.overflow-y-auto {
                            height: auto !important;
                            overflow: visible !important;
                            max-height: none !important;
                            padding: 0 !important;
                        }
                        .no-print { display: none !important; }
                        .print-break-inside-avoid { break-inside: avoid; }
                        .print-page-break-before { page-break-before: always; }
                        .bg-slate-900, .bg-matte-900, .dark .bg-matte-900 { 
                            background-color: #0f172a !important; 
                            color: white !important;
                        }
                        .dark .bg-white/5, .dark .bg-white/10 { background-color: #f1f5f9 !important; }
                        .dark .text-white { color: #0f172a !important; }
                        .print-grid-cols-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
                        
                        /* Fix for charts in print */
                        .recharts-responsive-container { min-height: 350px !important; }
                        
                        /* Re-style for white paper */
                        .bg-slate-50, .bg-white { background-color: white !important; }
                        .dark .bg-slate-900 { background-color: white !important; }
                        .border, .border-b, .border-t, .border-l, .border-r { border-color: #e2e8f0 !important; }
                        .text-slate-900, .text-slate-500, .text-slate-400, .dark .text-slate-400 { color: #1e293b !important; }
                        
                        /* Keep primary colors */
                        .text-primary-500 { color: #5365ff !important; }
                        .bg-primary-500 { background-color: #5365ff !important; }
                        .bg-primary-600 { background-color: #5365ff !important; }
                    }
                `}} />

                {/* Header: Identity & Master Controls */}
                <header className="px-6 py-4 border-b dark:border-white/5 bg-white dark:bg-matte-900/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between no-print">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 shadow-glow-primary flex items-center justify-center text-white text-base font-black shrink-0 animate-pulse-magnetic">
                            {data.email ? data.email[0].toUpperCase() : <User size={18} />}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs leading-tight flex items-center gap-2">
                                {data.email || 'Anonymous Participant'}
                                {flagged && <Badge color="rose">FLAGGED</Badge>}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Hash size={10} className="text-primary-500" /> <span className="text-slate-600 dark:text-slate-200">{assessment.id}</span></span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} className="text-primary-500" /> {formatTimestamp(data.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => window.print()} className="hidden sm:flex px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-glow-primary flex items-center gap-2" title="Export Analysis">
                            <Save size={14} />
                            Generate Report
                        </button>
                        <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-all active:scale-95" title="Close"><X size={18} /></button>
                    </div>
                </header>

                {/* Print-Only Professional Header */}
                <div className="hidden print:block mb-8 p-6 bg-slate-900 text-white rounded-[2rem]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter mb-1">Visual Intelligence Analysis Report</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Institutional Assessment Registry - Sec: {assessment.id}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-primary-400 uppercase">{data.email}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{formatTimestamp(data.timestamp)}</div>
                        </div>
                    </div>
                </div>

                {/* Content: The High-Fidelity Scientific Report */}
                <div id="assessment-detail-root" className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 print:space-y-12">

                    {/* Primary Stats Grid - Version 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
                        <div className="bg-white dark:bg-white/5 border dark:border-white/10 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Score</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{data.rawScore || 0}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">points</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-white/5 border dark:border-white/10 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg. Response Time</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{((data.timeTakenTotalSec || 0) / (responses.length || 1)).toFixed(2)}s</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">per question</span>
                            </div>
                        </div>

                        <div className="bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500 opacity-[0.05] blur-3xl" />
                            <p className="text-[8px] font-black text-primary-500 uppercase tracking-[0.2em] mb-3">Archetype Assessment</p>
                            <h4 className="text-2xl font-black text-indigo-900 dark:text-white leading-tight mb-2">{data.currentArchetype?.title || data.archetype || "Steady Operator"}</h4>
                            <p className="text-[11px] text-primary-600/80 dark:text-primary-400 font-bold leading-snug">{data.currentArchetype?.description || "Functional but needs structure and guidance."}</p>
                        </div>
                    </div>

                    {/* Primary Analytics Section (Radar & Traits) */}
                    <div className="grid grid-cols-1 gap-6 print:grid-cols-2">
                        {/* Radar Comparison */}
                        <div className="bg-matte-900 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden shadow-kinetic-dark h-[380px] flex flex-col print-break-inside-avoid">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-violet-500 print:hidden" />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xs font-black text-white dark:text-white uppercase tracking-widest flex items-center gap-2 print:text-white"><Brain className="text-primary-500 print:text-primary-400" size={16} /> Cognitive Radar</h3>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider print:text-slate-400">Candidate vs Cohort Benchmark</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={performanceRadarData}>
                                        <PolarGrid stroke="#ffffff10" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '900' }} />
                                        <Radar name="Candidate" dataKey="A" stroke={THEME_PRIMARY} fill={THEME_PRIMARY} fillOpacity={0.5} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Psychometric Trait Analysis */}
                        <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-sm print-break-inside-avoid print:border print:border-slate-200">
                            <div className="p-6 pb-2">
                                <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2 print:text-slate-900">Psychometric Trait Analysis</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 print:text-slate-500">Institutional Variable Breakdown</p>
                            </div>
                            <div className="flex-1 overflow-x-auto px-2">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/5 print:bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest print:text-slate-500">Trait Group</th>
                                            <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest print:text-slate-500">Avg Score</th>
                                            <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right print:text-slate-500">Avg Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-white/5 print:divide-slate-200">
                                        {traitAnalysis.map((tr, i) => (
                                            <tr key={i} className="hover:bg-primary-500/5 transition-colors group">
                                                <td className="px-4 py-4">
                                                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{tr.trait}</span>
                                                </td>
                                                <td className="px-4 py-4 min-w-[140px]">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[11px] font-mono font-black text-slate-900 dark:text-white w-8">{tr.avgScore}</span>
                                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary-500 rounded-full"
                                                                style={{ width: `${(Number(tr.avgScore) / 2) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="text-[11px] font-mono font-bold text-slate-500 print:text-slate-600">{tr.avgTime}s</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Latency Map (Line Chart) */}
                    <div className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-[2rem] p-6 print-break-inside-avoid print:border print:border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-1 flex items-center gap-2 print:text-slate-900"><ChartIcon className="text-primary-500" size={16} /> Response Phase Map</h3>
                                <p className="text-[8px] font-medium text-slate-500 max-w-sm leading-relaxed print:text-slate-600">Behavioral patterns and deliberative spikes mapping.</p>
                            </div>
                            <div className="flex items-center gap-4 p-2 bg-slate-50 dark:bg-white/5 rounded-xl border dark:border-white/5 print:hidden">
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /><span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Time</span></div>
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20" /><span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Mean</span></div>
                            </div>
                        </div>
                        <div className="h-[250px] w-full print:h-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chronometricData}>
                                    <defs>
                                        <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={THEME_PRIMARY} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={THEME_PRIMARY} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: '900' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 8 }} unit="s" />
                                    <Area type="monotone" dataKey="time" stroke={THEME_PRIMARY} strokeWidth={2} fill="url(#latencyGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Researcher Annotation Nexus */}
                    <div className="bg-white dark:bg-matte-900 border dark:border-white/10 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group print:hidden">

                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Badge color="blue">Annotation Nexus</Badge>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-2">Researcher Observables</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Classification Status</label>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {['Reviewed', 'Anomalous', 'Verified', 'Priority'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setStatus(s)}
                                                        className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-all ${status === s ? 'bg-primary-600 text-white border-primary-500 shadow-glow-primary' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-slate-300 dark:hover:border-white/10'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setFlagged(!flagged)}
                                            className={`w-full p-3 rounded-xl flex items-center justify-between border transition-all ${flagged ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Flag size={14} className={flagged ? 'fill-rose-500' : ''} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Escalation Flag</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${flagged ? 'bg-rose-500 border-rose-500' : 'border-slate-300 dark:border-white/10'}`}>
                                                {flagged && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                                            </div>
                                        </button>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2 italic"><Microscope size={10} /> Field Observations</label>
                                        <textarea
                                            className="flex-1 min-h-[100px] w-full bg-slate-50 dark:bg-matte-950 p-4 rounded-xl text-xs font-medium dark:text-slate-200 border dark:border-white/5 outline-none focus:ring-2 focus:ring-primary-500/10 resize-none transition-all placeholder:text-slate-600 shadow-inner"
                                            placeholder="Annotate behavioral signals..."
                                            value={notes} onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t dark:border-white/5 gap-3">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ID: {assessment.id}</span>
                                    <span className="text-[7px] font-bold text-slate-400 italic">EARTH1919 SYNC</span>
                                </div>
                                <button onClick={handleSave} className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all shadow-glow-primary active:scale-95 flex items-center justify-center gap-2">
                                    <Save size={12} strokeWidth={3} />
                                    Commit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Itemized Telemetry (The Raw Table) */}
                    <div className="bg-white dark:bg-matte-950 border dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm print:rounded-none print:border-slate-200 print-page-break-before">
                        <div className="p-4 border-b dark:border-white/5 flex items-center justify-between print:bg-slate-50">
                            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest print:text-slate-900">Telemetry Breakdown</h3>
                            <div className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border dark:border-white/10 font-mono text-[8px] text-slate-500 print:bg-white">
                                {responses.length} RECORDS
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-white/5 print:bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest print:text-slate-600">Query</th>
                                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center print:text-slate-600">Score</th>
                                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right print:text-slate-600">Latency</th>
                                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right print:text-slate-600">Signal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-white/5">
                                    {responses.map((r, i) => {
                                        const tag = getBehavioralTag(r);
                                        return (
                                            <tr key={i} className="hover:bg-primary-500/5 transition-all group print:bg-white">
                                                <td className="px-6 py-3">
                                                    <span className="text-[9px] font-mono font-black text-slate-400 group-hover:text-primary-500 uppercase print:text-slate-600">{r.id || 'NULL'}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 dark:bg-white/10 font-black text-[10px] text-slate-900 dark:text-white print:bg-slate-50 print:text-slate-900">
                                                        {r.score}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className="text-[9px] font-mono font-bold text-slate-500 print:text-slate-700">{parseFloat(r.time || 0).toFixed(2)}s</span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {tag ? (
                                                        <span className={`text-[7px] font-black px-2 py-1 rounded border uppercase tracking-tighter shadow-sm ${tagStyles[tag] || ''} print:border-slate-200 print:text-slate-900`}>
                                                            {tag}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[7px] font-bold text-slate-300 dark:text-white/10 uppercase italic print:text-slate-400">Normal</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Technical Telemetry & Derived Signals - Version 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8 border-t dark:border-white/5">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <Settings size={14} className="text-primary-500" /> Technical Telemetry
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Input Mode</span>
                                    <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-200">{data.telemetry?.lastInputMode || 'mouse'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tab Blurs</span>
                                    <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-200">{data.telemetry?.blurCount || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Idle Time</span>
                                    <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-200">{data.telemetry?.idleTime || '0'}s</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity size={14} className="text-primary-500" /> Derived Signals
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Integrity Score</span>
                                    <span className="text-xs font-mono font-black text-primary-500">{(1.0 - (data.telemetry?.blurCount || 0) * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Est. Percentile</span>
                                    <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-200">{Math.min(99, Math.round(((data.rawScore || 0) / 50) * 100))}th</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden print:block text-center text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em] pt-12 border-t border-slate-100">
                        Generated by Visualize Platform © {new Date().getFullYear()} - Confidential Researcher Report
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
