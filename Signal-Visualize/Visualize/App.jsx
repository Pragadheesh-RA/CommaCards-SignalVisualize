import React, { useState, useMemo, useEffect } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, ReferenceLine
} from 'recharts';
import {
    Upload, FileText, AlertCircle, CheckCircle, BarChart2, Users, Clock, Award, X,
    ChevronRight, Activity, Brain, Calendar, List, Timer, Layout, Eye, MousePointer, Zap, AlertTriangle,
    RefreshCw, CornerUpLeft, Microscope, Layers, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, ShieldAlert,
    Flag, MessageSquare, Tag, Save, LogIn, Download, Trash2
} from 'lucide-react';

// --- Configuration ---
const AUTHORIZED_IDS = ['Water2026', 'Earth1919', 'Fire1123'];
const ENV_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3000/api');
const API_BASE_URL = ENV_URL.endsWith('/api') ? ENV_URL : (ENV_URL === '/api' ? '/api' : `${ENV_URL}/api`);

// --- Helpers ---

const formatIST = (seconds) => {
    if (!seconds) return 'N/A';
    return new Date(seconds * 1000).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const getTraitFromId = (qId) => {
    if (!qId) return "Uncategorized";
    const parts = qId.split('_');
    return parts.length > 1 ? parts[0] : "General";
};

const getResponseBehavior = (timeMs, avgTimeMs, score) => {
    const isFast = timeMs < avgTimeMs * 0.5;
    const isSlow = timeMs > avgTimeMs * 1.5;
    const isCorrect = score > 0;

    if (isFast && isCorrect) return { label: "Confident", color: "green" };
    if (isFast && !isCorrect) return { label: "Rushed", color: "orange" };
    if (isSlow && isCorrect) return { label: "Deliberate", color: "blue" };
    if (isSlow && !isCorrect) return { label: "Struggling", color: "red" };
    return null;
};

// --- Components ---

const Card = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        {children}
    </div>
);

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const Badge = ({ children, color = "indigo" }) => {
    const colors = {
        indigo: "bg-indigo-100 text-indigo-800",
        green: "bg-emerald-100 text-emerald-800",
        blue: "bg-blue-100 text-blue-800",
        orange: "bg-orange-100 text-orange-800",
        slate: "bg-slate-100 text-slate-800",
        amber: "bg-amber-100 text-amber-800",
        red: "bg-red-100 text-red-800",
        teal: "bg-teal-100 text-teal-800"
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.indigo}`}>
            {children}
        </span>
    );
};

const DetailRow = ({ label, value, subValue }) => (
    <div className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className="text-right">
            <span className="text-sm text-slate-900 block break-all">{value}</span>
            {subValue && <span className="text-xs text-slate-400 block mt-0.5">{subValue}</span>}
        </div>
    </div>
);

const AnnotationPanel = ({ participantId, annotation, onChange }) => {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag size={16} /> Researcher Annotations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status Label</label>
                    <select
                        className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={annotation?.label || ""}
                        onChange={(e) => onChange('label', e.target.value)}
                    >
                        <option value="">Select Status...</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Suspicious">Suspicious</option>
                    </select>
                </div>

                <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 h-4 w-4"
                            checked={annotation?.flagged || false}
                            onChange={(e) => onChange('flagged', e.target.checked)}
                        />
                        <span className={`text-sm font-medium ${annotation?.flagged ? 'text-red-600' : 'text-slate-600'}`}>
                            Flag This Participant
                        </span>
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Research Notes</label>
                <textarea
                    className="w-full p-2 border border-slate-300 rounded-md text-sm min-h-[80px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add qualitative observations here..."
                    value={annotation?.notes || ""}
                    onChange={(e) => onChange('notes', e.target.value)}
                />
            </div>
            {annotation?.lastUpdatedBy && (
                <p className="text-xs text-slate-400 italic text-right">
                    Last updated by {annotation.lastUpdatedBy}
                </p>
            )}
        </div>
    )
}


// --- Analysis Logic ---

const analyzeTraits = (answers, telemetry) => {
    const traits = {};
    answers.forEach(ans => {
        const trait = getTraitFromId(ans.qId);
        if (!traits[trait]) {
            traits[trait] = { name: trait, totalScore: 0, count: 0, totalTime: 0, timeCount: 0 };
        }
        traits[trait].totalScore += ans.score || 0;
        traits[trait].count++;
        const tData = telemetry.perQ?.[ans.qId];
        if (tData?.totalTimeOnQuestionMs) {
            traits[trait].totalTime += tData.totalTimeOnQuestionMs;
            traits[trait].timeCount++;
        }
    });
    return Object.values(traits).map(t => ({
        name: t.name,
        avgScore: (t.totalScore / t.count).toFixed(2),
        avgTimeSec: t.timeCount > 0 ? (t.totalTime / t.timeCount / 1000).toFixed(2) : 0,
        count: t.count
    })).sort((a, b) => b.avgScore - a.avgScore);
};

const AssessmentDetail = ({ assessment, onClose, cohortAverages, onUpdateAnnotation, currentUserId }) => {
    if (!assessment) return null;
    const { data, id, annotations } = assessment;

    const subscores = data.derivedSignals?.subscores || {};
    const answers = data.answers || [];
    const telemetry = data.telemetry || {};
    const perQ = telemetry.perQ || {};

    const traitAnalysis = useMemo(() => analyzeTraits(answers, telemetry), [answers, telemetry]);

    // Chronometric
    let globalTotalTime = 0;
    let validTimeCount = 0;
    const chronometricData = answers.map((ans, index) => {
        const qData = perQ[ans.qId];
        const timeMs = qData?.totalTimeOnQuestionMs || 0;
        if (timeMs > 0) {
            globalTotalTime += timeMs;
            validTimeCount++;
        }
        return {
            id: ans.qId,
            index: index + 1,
            timeMs: timeMs,
            timeSec: parseFloat((timeMs / 1000).toFixed(2)),
            score: ans.score
        };
    });
    const avgTimeMs = validTimeCount > 0 ? globalTotalTime / validTimeCount : 0;

    // Radar Data (Individual vs Cohort)
    const competencyData = Object.entries(subscores).map(([key, val]) => {
        let score = 0;
        let max = 10;
        if (typeof val === 'number') {
            score = val;
        } else if (typeof val === 'object' && val !== null) {
            score = val.score || 0;
            max = val.max || 12;
        }
        const normalized = (score / max) * 10;
        const cohortAvgRaw = cohortAverages?.[key] || 0;
        const normalizedCohort = (cohortAvgRaw / max) * 10;

        return {
            subject: key,
            A: normalized,
            B: normalizedCohort,
            fullMark: 10,
            rawScore: score,
            maxRaw: max,
            cohortRaw: cohortAvgRaw.toFixed(1)
        };
    });

    const handleAnnotationChange = (field, value) => {
        const newAnnotations = {
            ...(annotations || {}),
            [field]: value,
            lastUpdatedBy: currentUserId
        };
        onUpdateAnnotation(id, newAnnotations);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end transition-opacity" onClick={onClose}>
            <div className="bg-slate-50 w-full max-w-4xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                            {data.email ? data.email.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{data.email || "Unknown User"}</h2>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
                                <span>ID: {id}</span>
                                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                <span>{formatIST(data.timestamp?._seconds)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                        <X size={24} className="text-slate-400 group-hover:text-slate-600" />
                    </button>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto">

                    {/* Annotation Section */}
                    <AnnotationPanel
                        participantId={id}
                        annotation={annotations}
                        onChange={handleAnnotationChange}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Total Score</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-slate-900">{data.rawScore || 0}</p>
                                <span className="text-xs text-slate-400">points</span>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Avg. Response Time</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-slate-900">{(avgTimeMs / 1000).toFixed(2)}s</p>
                                <span className="text-xs text-slate-400">per question</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-sm col-span-2">
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">Archetype Assessment</p>
                            <div className="flex flex-col h-full justify-center">
                                <p className="text-xl font-bold text-indigo-900">
                                    {data.currentArchetype?.title || data.archetype || "N/A"}
                                </p>
                                {data.currentArchetype?.desc && (
                                    <p className="text-sm text-indigo-700 mt-1">{data.currentArchetype.desc}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card title="Psychometric Trait Analysis" className="h-full">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-2 rounded-l-lg">Trait Group</th>
                                            <th className="px-4 py-2">Avg Score</th>
                                            <th className="px-4 py-2 text-right rounded-r-lg">Avg Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {traitAnalysis.map(t => (
                                            <tr key={t.name}>
                                                <td className="px-4 py-3 font-medium text-slate-700">{t.name}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-900">{t.avgScore}</span>
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500" style={{ width: `${(t.avgScore / 2) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{t.avgTimeSec}s</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card title="Competency Profile vs Cohort" className="h-full">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competencyData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Cohort Avg"
                                            dataKey="B"
                                            stroke="#94a3b8"
                                            strokeWidth={2}
                                            fill="#cbd5e1"
                                            fillOpacity={0.2}
                                            strokeDasharray="4 4"
                                        />
                                        <Radar
                                            name="Candidate"
                                            dataKey="A"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            fill="#6366f1"
                                            fillOpacity={0.3}
                                        />
                                        <Legend />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value, name, props) => {
                                                if (name === 'Cohort Avg') return [`${props.payload.cohortRaw}`, name];
                                                return [`${props.payload.rawScore}/${props.payload.maxRaw}`, name];
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <Card title="Chronometric Response Analysis">
                        <p className="text-sm text-slate-500 mb-6">
                            Latency analysis. Spikes indicate deliberation or distraction; dips indicate rapid/instinctive responses.
                        </p>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chronometricData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="index" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val) => [`${val}s`, 'Time']}
                                        labelFormatter={(label) => `Question #${label}`}
                                    />
                                    <ReferenceLine y={avgTimeMs / 1000} stroke="#cbd5e1" strokeDasharray="3 3" label={{ position: 'right', value: 'Avg', fill: '#94a3b8', fontSize: 10 }} />
                                    <Line type="monotone" dataKey="timeSec" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Raw Item Analysis (Detailed)" className="overflow-hidden">
                        <div className="overflow-x-auto -mx-6">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-slate-600">QID</th>
                                        <th className="px-6 py-3 font-semibold text-slate-600">Score</th>
                                        <th className="px-6 py-3 font-semibold text-slate-600 text-right">Time (Exact)</th>
                                        <th className="px-6 py-3 font-semibold text-slate-600 text-center">Interactions</th>
                                        <th className="px-6 py-3 font-semibold text-slate-600">Behavioral Tag</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {answers.map((ans, idx) => {
                                        const qTel = perQ[ans.qId];
                                        const timeSpentMs = qTel?.totalTimeOnQuestionMs || 0;
                                        const timeSpent = timeSpentMs > 0 ? `${(timeSpentMs / 1000).toFixed(2)}s` : '-';
                                        const answerChanges = qTel?.answerChangesCount || 0;
                                        const revisits = qTel?.revisitsCount || 0;
                                        const behavior = getResponseBehavior(timeSpentMs, avgTimeMs, ans.score);

                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-3 font-mono text-xs text-slate-500 font-medium">{ans.qId}</td>
                                                <td className="px-6 py-3 font-medium text-slate-900">{ans.score}</td>
                                                <td className="px-6 py-3 text-right font-mono text-xs text-slate-600">{timeSpent}</td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center justify-center gap-4">
                                                        {answerChanges > 0 ? (
                                                            <div className="flex items-center text-orange-600 text-xs font-bold" title="Answer Changes">
                                                                <RefreshCw size={12} className="mr-1" /> {answerChanges}
                                                            </div>
                                                        ) : <span className="text-slate-200 text-xs">-</span>}
                                                        {revisits > 0 ? (
                                                            <div className="flex items-center text-blue-600 text-xs font-bold" title="Revisits">
                                                                <CornerUpLeft size={12} className="mr-1" /> {revisits}
                                                            </div>
                                                        ) : <span className="text-slate-200 text-xs">-</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    {behavior && (
                                                        <Badge color={behavior.color}>{behavior.label}</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><MousePointer size={16} /> Technical Telemetry</h4>
                            <div className="space-y-0">
                                <DetailRow label="Input Mode" value={telemetry.lastInputMode || 'Unknown'} />
                                <DetailRow label="Tab Blurs" value={telemetry.blurCount || 0} />
                                <DetailRow label="Idle Time" value={`${(telemetry.idleMs || 0) / 1000}s`} />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Brain size={16} /> Derived Signals</h4>
                            <div className="space-y-0">
                                <DetailRow label="Integrity Score" value={data.derivedSignals?.integrityScore ?? 'N/A'} />
                                <DetailRow label="Est. Percentile" value={data.derivedSignals?.estimatedPercentile ? `${data.derivedSignals.estimatedPercentile}th` : 'N/A'} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};


const LoginScreen = ({ onLogin }) => {
    const [id, setId] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const normalizedId = id.trim();

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: normalizedId })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                onLogin(data.user);
            } else {
                setError(data.error || "Authentication failed");
            }
        } catch (err) {
            console.error("Login fetch error details:", err);
            setError(`Server connection failed: ${err.message}. Check console for details.`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <Microscope size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Research Analytics</h1>
                    <p className="text-slate-500 mt-2 text-sm">Enter your Access ID to continue.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Researcher ID</label>
                        <div className="relative">
                            <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Enter ID..."
                                value={id}
                                onChange={(e) => { setId(e.target.value); setError(null) }}
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={!id}
                        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                    >
                        Access Dashboard
                    </button>
                    <p className="text-xs text-slate-400 text-center mt-4">
                        Authorized personnel only. All actions are logged.
                    </p>
                </form>
            </div>
        </div>
    );
};


const FileUpload = ({ onDataLoaded }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = (file) => {
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    // Upload to server
                    const res = await fetch(`${API_BASE_URL}/assessments/upload`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(json)
                    });
                    const data = await res.json();

                    if (res.ok) {
                        onDataLoaded(); // Refresh data from server
                    } else {
                        setError(data.error || "Upload failed");
                    }
                } catch (err) {
                    setError("Invalid JSON format or Server Error.");
                }
            };
            reader.readAsText(file);
        } else {
            setError("Please upload a valid JSON file");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-20">
            <div
                className={`relative border-2 border-dashed rounded-xl p-16 text-center transition-all duration-300 ease-in-out cursor-pointer group
          ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-102' : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
            >
                <input id="file-upload" type="file" accept=".json" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`p-5 rounded-full shadow-sm transition-colors ${error ? 'bg-red-100 text-red-500' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'}`}>
                        {error ? <AlertTriangle size={40} /> : <Upload size={40} />}
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-800">{error ? 'Upload Failed' : 'Upload Research Data'}</p>
                        <p className="text-slate-500 mt-2">{error ? error : 'Drag & drop your JSON export here to begin analysis'}</p>
                    </div>
                    {!error && (
                        <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Supports .json format</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [rawData, setRawData] = useState(null);
    const [processedData, setProcessedData] = useState(null);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/assessments`);
            const data = await res.json();
            setRawData(data);
            setIsDirty(false); // Data from server is clean
        } catch (e) {
            console.error("Failed to fetch data", e);
        }
    };

    // Initial Fetch
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    // Cleanup when user logs out is handled by component unmount/remount


    // Filtering & Sorting State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterArchetype, setFilterArchetype] = useState("All");
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

    // Warn on unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Process data for overview statistics
    useEffect(() => {
        if (!rawData || !Array.isArray(rawData)) return;

        // 1. Basic Stats
        const totalCount = rawData.length;
        const avgScore = rawData.reduce((acc, curr) => acc + (curr.data?.rawScore || 0), 0) / totalCount;
        const avgTime = rawData.reduce((acc, curr) => acc + (curr.data?.timeTakenTotalSec || 0), 0) / totalCount;

        // 2. Archetype Distribution
        const archetypeCounts = {};
        rawData.forEach(item => {
            const arch = item.data?.currentArchetype?.title || item.data?.archetype || "Unknown";
            archetypeCounts[arch] = (archetypeCounts[arch] || 0) + 1;
        });
        const archetypeData = Object.entries(archetypeCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // 3. Score Distribution
        const scoreBuckets = [
            { name: '0-20', min: 0, max: 20, count: 0 },
            { name: '21-30', min: 21, max: 30, count: 0 },
            { name: '31-40', min: 31, max: 40, count: 0 },
            { name: '41-50', min: 41, max: 50, count: 0 },
            { name: '50+', min: 51, max: 999, count: 0 },
        ];
        rawData.forEach(item => {
            const s = item.data?.rawScore || 0;
            const bucket = scoreBuckets.find(b => s >= b.min && s <= b.max);
            if (bucket) bucket.count++;
        });

        // 4. Global Subscore Averages (for Cohort Comparison)
        const subscoreTotals = {};
        const subscoreCounts = {};
        rawData.forEach(item => {
            const subs = item.data?.derivedSignals?.subscores;
            if (subs) {
                Object.entries(subs).forEach(([key, val]) => {
                    let score = 0;
                    if (typeof val === 'number') score = val;
                    else if (typeof val === 'object' && val !== null) score = val.score || 0;

                    subscoreTotals[key] = (subscoreTotals[key] || 0) + score;
                    subscoreCounts[key] = (subscoreCounts[key] || 0) + 1;
                });
            }
        });
        const cohortAverages = {};
        Object.keys(subscoreTotals).forEach(key => {
            cohortAverages[key] = subscoreTotals[key] / subscoreCounts[key];
        });

        // 5. Integrity Check
        const flaggedCount = rawData.filter(i => (i.data?.telemetry?.blurCount || 0) > 2 || (i.data?.timeTakenTotalSec || 999) < (avgTime * 0.3)).length;
        // Also count manually flagged
        const manualFlagged = rawData.filter(i => i.annotations?.flagged).length;

        setProcessedData({
            stats: {
                total: totalCount,
                avgScore: avgScore.toFixed(1),
                avgTime: avgTime.toFixed(0),
                flaggedCount: flaggedCount + manualFlagged
            },
            archetypeData,
            scoreDistribution: scoreBuckets,
            cohortAverages,
            availableArchetypes: ["All", ...Object.keys(archetypeCounts)]
        });

    }, [rawData]);

    const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return <ArrowUpDown size={14} className="text-slate-300" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-600" /> : <ArrowDown size={14} className="text-indigo-600" />;
    };

    // Filter and Sort Logic
    const filteredParticipants = useMemo(() => {
        if (!rawData) return [];

        let result = [...rawData];

        // Filter
        if (filterArchetype !== "All") {
            result = result.filter(item => {
                const arch = item.data?.currentArchetype?.title || item.data?.archetype || "Unknown";
                return arch === filterArchetype;
            });
        }

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.data?.email || "").toLowerCase().includes(lower) ||
                (item.id || "").toLowerCase().includes(lower)
            );
        }

        // Sort
        result.sort((a, b) => {
            let valA, valB;
            switch (sortConfig.key) {
                case 'score':
                    valA = a.data?.rawScore || 0;
                    valB = b.data?.rawScore || 0;
                    break;
                case 'time':
                    valA = a.data?.timeTakenTotalSec || 0;
                    valB = b.data?.timeTakenTotalSec || 0;
                    break;
                case 'timestamp':
                default:
                    valA = a.data?.timestamp?._seconds || 0;
                    valB = b.data?.timestamp?._seconds || 0;
                    break;
            }
            return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        });

        return result;
    }, [rawData, searchTerm, filterArchetype, sortConfig]);

    // --- Annotation Actions ---

    // --- Annotation Actions ---

    const updateAnnotation = async (id, newAnnotation) => {
        try {
            const res = await fetch(`${API_BASE_URL}/assessments/${id}/annotations`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAnnotation)
            });

            if (res.ok) {
                // Optimistic Local Update or Refetch
                // Let's refetch to be safe/consistent
                fetchData();

                // Also update selected assessment to reflect changes immediately
                if (selectedAssessment && selectedAssessment.id === id) {
                    setSelectedAssessment(prev => ({ ...prev, annotations: newAnnotation }));
                }
            }
        } catch (e) {
            console.error("Failed to update annotation", e);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assessment?")) return;
        try {
            await fetch(`${API_BASE_URL}/assessments/${id}`, { method: 'DELETE' });
            fetchData();
            if (selectedAssessment?.id === id) setSelectedAssessment(null);
        } catch (e) { console.error("Delete failed", e); }
    };


    const handleExport = () => {
        if (!rawData) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `research_export_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setIsDirty(false);
    };


    // --- Views ---

    if (!user) {
        return <LoginScreen onLogin={setUser} />;
    }

    if (!rawData) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg"><Microscope className="text-white" size={24} /></div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Research Analytics Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-500">Logged in as: <span className="text-slate-900">{user}</span></span>
                        <button onClick={() => setUser(null)} className="text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
                    </div>
                </div>

                {
                    !rawData || rawData.length === 0 ? (
                        <FileUpload onDataLoaded={fetchData} />
                    ) : (
                        <div className="text-center p-10">
                            <p className="text-slate-500 mb-4">Data loaded successfully.</p>
                            <button onClick={fetchData} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
                                Refresh Data
                            </button>
                        </div>
                    )
                }
            </div >
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg"><Microscope className="text-white" size={20} /></div>
                        <h1 className="text-xl font-bold text-slate-900">Research Analytics</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4 mr-4 text-sm">
                            <span className="text-slate-500">Logged in as: <span className="font-semibold text-slate-900">{user}</span></span>
                            <button onClick={() => setUser(null)} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
                        </div>
                        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium border bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                        >
                            <Upload size={16} />
                            Import Data
                        </button>
                        <button
                            onClick={handleExport}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium border ${isDirty ? 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'}`}
                        >
                            <Download size={16} />
                            {isDirty ? 'Save Changes' : 'Export Data'}
                            {isDirty && <span className="flex h-2 w-2 rounded-full bg-red-400"></span>}
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <button onClick={async () => {
                            if (!window.confirm("Are you sure you want to delete ALL data? This cannot be undone.")) return;
                            try {
                                await fetch(`${API_BASE_URL}/assessments`, { method: 'DELETE' });
                                fetchData();
                                setProcessedData(null);
                            } catch (e) { console.error("Clear failed", e); }
                        }} className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">Clear Data</button>
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Import Research Data</h3>
                            <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-8">
                            <FileUpload onDataLoaded={() => { fetchData(); setShowImportModal(false); }} />
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-8">

                {processedData && (
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard title="Total Participants" value={processedData.stats.total} subtext="Assessments loaded" icon={Users} colorClass="bg-blue-500" />
                            <StatCard title="Mean Score" value={processedData.stats.avgScore} subtext="Cohort Average" icon={Award} colorClass="bg-emerald-500" />
                            <StatCard title="Mean Duration" value={`${Math.floor(processedData.stats.avgTime / 60)}m ${processedData.stats.avgTime % 60}s`} subtext="Completion time" icon={Clock} colorClass="bg-violet-500" />
                            <StatCard title="Session Integrity" value={`${((1 - (processedData.stats.flaggedCount / processedData.stats.total)) * 100).toFixed(0)}%`} subtext={`${processedData.stats.flaggedCount} flagged sessions`} icon={ShieldAlert} colorClass="bg-amber-500" />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Archetype Distribution">
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={processedData.archetypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                                {processedData.archetypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card title="Score Distribution Histogram">
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={processedData.scoreDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                            <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* Registry & Controls */}
                        <Card title="Participant Data Registry" className="overflow-visible">
                            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end md:items-center">
                                <div className="flex gap-4 w-full md:w-auto">
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search email or ID..."
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select
                                            className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                                            value={filterArchetype}
                                            onChange={(e) => setFilterArchetype(e.target.value)}
                                        >
                                            {processedData.availableArchetypes.map(a => (
                                                <option key={a} value={a}>{a}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500">
                                    Showing {filteredParticipants.length} of {rawData.length}
                                </div>
                            </div>

                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-sm font-semibold text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('timestamp')}>
                                                <div className="flex items-center gap-1">Date (IST) {getSortIcon('timestamp')}</div>
                                            </th>
                                            <th className="px-6 py-3 text-sm font-semibold text-slate-500">Participant</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-slate-500">Archetype</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('score')}>
                                                <div className="flex items-center gap-1">Score {getSortIcon('score')}</div>
                                            </th>
                                            <th className="px-6 py-3 text-sm font-semibold text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('time')}>
                                                <div className="flex items-center gap-1">Duration {getSortIcon('time')}</div>
                                            </th>
                                            <th className="px-6 py-3 text-sm font-semibold text-slate-500">Analysis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredParticipants.map((item, i) => (
                                            <tr key={item.id || i} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedAssessment(item)}>
                                                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                    {formatIST(item.data?.timestamp?._seconds)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {item.annotations?.flagged && <Flag size={14} className="text-red-500 fill-red-500" />}
                                                        <div>
                                                            {item.data?.email || "Anonymous"}
                                                            <div className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">{item.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                            {item.data?.currentArchetype?.title || item.data?.archetype || "N/A"}
                                                        </span>
                                                        {item.annotations?.label && (
                                                            <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                {item.annotations.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                    {item.data?.rawScore || 0}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                                    {item.data?.timeTakenTotalSec}s
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                            title="Delete Assessment"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <span className="text-indigo-600 flex items-center gap-1">
                                                            View Report <ChevronRight size={16} />
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                    </div>
                )}
            </div>

            <AssessmentDetail
                assessment={selectedAssessment}
                onClose={() => setSelectedAssessment(null)}
                cohortAverages={processedData?.cohortAverages}
                onUpdateAnnotation={updateAnnotation}
                currentUserId={user}
            />
        </div>
    );
}