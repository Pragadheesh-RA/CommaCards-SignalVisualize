import React, { useState, useMemo, useEffect } from 'react';
import {
    Users, Award, Clock, ShieldAlert, Upload, Download, Trash2,
    RefreshCw, Layers, Microscope, Info, FileText, CheckCircle, X, AlertTriangle
} from 'lucide-react';

// --- Components ---
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import AssessmentTable from './components/AssessmentTable';
import AssessmentDetail from './components/AssessmentDetail';
import LoginScreen from './components/LoginScreen';
import { Card, Badge } from './components/UI';

// --- Configuration ---
const ENV_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3000/api');
const API_BASE_URL = ENV_URL.endsWith('/api') ? ENV_URL : (ENV_URL === '/api' ? '/api' : `${ENV_URL}/api`);

// --- Specialized Components ---

const FileUpload = ({ onUpload, onClose }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [showChoiceModal, setShowChoiceModal] = useState(false);

    const handleFile = (selectedFile) => {
        if (selectedFile && selectedFile.type === "application/json") {
            setFile(selectedFile);
            setShowChoiceModal(true);
        } else {
            alert("Please upload a valid JSON file.");
        }
    };

    const processUpload = async (mode) => {
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const res = await fetch(`${API_BASE_URL}/assessments/upload?mode=${mode}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    onUpload();
                    onClose();
                } else {
                    alert("Upload failed. Verify file format.");
                }
            } catch (err) {
                alert("Invalid JSON data.");
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[60] flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={24} />
                </button>

                <div className="p-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-950 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-500">
                            <Upload size={32} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Import Research Data</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Scale your dataset with institutional exports.</p>
                    </div>

                    {!showChoiceModal ? (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
                            className={`
                                border-3 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group
                                ${isDragging
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                                }
                            `}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input id="file-input" type="file" className="hidden" accept=".json" onChange={(e) => handleFile(e.target.files[0])} />
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-primary-500 transition-all shadow-sm">
                                <FileText size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to browse or drag & drop</p>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">JSON Format Only</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-slide-up">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center gap-3 mb-6">
                                <CheckCircle className="text-emerald-500" size={20} />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                            </div>

                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Conflict Strategy</h4>

                            <button
                                onClick={() => processUpload('replace')}
                                className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 flex items-center justify-between group hover:bg-red-500 hover:text-white transition-all"
                            >
                                <div className="text-left">
                                    <p className="font-black text-red-600 group-hover:text-white uppercase text-[10px] tracking-widest">Overwrite Mode</p>
                                    <p className="text-xs font-bold text-slate-500 group-hover:text-red-100 mt-0.5">Delete everything and start fresh</p>
                                </div>
                                <Trash2 size={20} />
                            </button>

                            <button
                                onClick={() => processUpload('append')}
                                className="w-full p-4 rounded-2xl bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/20 flex items-center justify-between group hover:bg-primary-500 hover:text-white transition-all"
                            >
                                <div className="text-left">
                                    <p className="font-black text-primary-600 group-hover:text-white uppercase text-[10px] tracking-widest">Merge Mode</p>
                                    <p className="text-xs font-bold text-slate-500 group-hover:text-primary-100 mt-0.5">Add to current research records</p>
                                </div>
                                <Layers size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Components ---

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [rawData, setRawData] = useState(null);
    const [processedData, setProcessedData] = useState(null);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterArchetype, setFilterArchetype] = useState("All");
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);

    // Initial Theme Sync
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    // Auto-login on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        if (savedToken && savedUser) setUser(savedUser);
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/assessments`);
            const data = await res.json();
            setRawData(Array.isArray(data) ? data : []);
            setIsDirty(false);
        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    // Process data for overview statistics
    useEffect(() => {
        if (!rawData || !Array.isArray(rawData)) return;
        const totalCount = rawData.length;
        if (totalCount === 0) {
            setProcessedData({ stats: { total: 0, avgScore: 0, avgTime: 0, flaggedCount: 0 }, availableArchetypes: ["All"] });
            return;
        }

        const avgScore = rawData.reduce((acc, curr) => acc + (curr.data?.rawScore || 0), 0) / totalCount;
        const avgTime = rawData.reduce((acc, curr) => acc + (curr.data?.timeTakenTotalSec || 0), 0) / totalCount;
        const archetypeCounts = {};
        rawData.forEach(item => {
            const arch = item.data?.currentArchetype?.title || item.data?.archetype || "Unknown";
            archetypeCounts[arch] = (archetypeCounts[arch] || 0) + 1;
        });

        const flaggedCount = rawData.filter(i => (i.data?.telemetry?.blurCount || 0) > 2 || i.annotations?.flagged).length;

        setProcessedData({
            stats: {
                total: totalCount,
                avgScore: Math.round(avgScore),
                avgTime: Math.round(avgTime),
                flaggedCount: flaggedCount
            },
            availableArchetypes: ["All", ...Object.keys(archetypeCounts)]
        });
    }, [rawData]);

    const filteredParticipants = useMemo(() => {
        if (!rawData) return [];
        let result = [...rawData];

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(i =>
                (i.data?.email?.toLowerCase().includes(lower)) ||
                (i.id?.toLowerCase().includes(lower))
            );
        }

        // Filter
        if (filterArchetype !== "All") {
            result = result.filter(item => (item.data?.currentArchetype?.title || item.data?.archetype || "Unknown") === filterArchetype);
        }

        // Sort
        result.sort((a, b) => {
            let aVal = a;
            let bVal = b;
            const keys = sortConfig.key.split('.');
            keys.forEach(k => { aVal = aVal?.[k]; bVal = bVal?.[k]; });

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [rawData, searchTerm, filterArchetype, sortConfig]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assessment?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/assessments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
                if (selectedAssessment?.id === id) setSelectedAssessment(null);
            }
        } catch (e) { alert("Delete failed. Server error."); }
    };

    const handleClear = async () => {
        if (!window.confirm("Clear all data?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/assessments`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
                setProcessedData(null);
            }
        } catch (e) { alert("Clear failed."); }
    };

    const handleUpdateAnnotation = async (id, annotations) => {
        try {
            const res = await fetch(`${API_BASE_URL}/assessments/${id}/annotations`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(annotations)
            });
            if (res.ok) {
                const data = await res.json();
                // Update local state to reflect changes immediately
                setRawData(prev => prev.map(item =>
                    item.id === id ? { ...item, annotations: data.annotations } : item
                ));
                if (selectedAssessment?.id === id) {
                    setSelectedAssessment(prev => ({ ...prev, annotations: data.annotations }));
                }
            } else {
                alert("Failed to save analysis.");
            }
        } catch (e) {
            console.error("Save annotation error:", e);
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    if (isLoading && !user) return <div className="min-h-screen mesh-gradient flex items-center justify-center"><RefreshCw className="animate-spin text-white" size={48} /></div>;

    if (!user) return <LoginScreen onLogin={setUser} API_BASE_URL={API_BASE_URL} />;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex flex-col lg:flex-row transition-colors duration-500 overflow-x-hidden">
            {/* Navigation Component */}
            <Sidebar
                user={user}
                onLogout={handleLogout}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
            />

            {/* Main Content Area */}
            <main className="flex-1 p-6 lg:p-10 lg:ml-72 transition-all">
                <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Research Dashboard</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest">
                                Comprehensive Analysis &bull; Real-time Data
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-primary-500 text-white hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20"
                            >
                                <Upload size={16} strokeWidth={3} />
                                Import Data
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                            >
                                Clear Dataset
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    {processedData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            <StatCard title="Assessments" value={processedData.stats.total} subtext="Total records loaded" icon={Users} colorClass="bg-primary-500" delay="animate-delay-100" />
                            <StatCard title="Mean Score" value={processedData.stats.avgScore} subtext="Cohort performance" icon={Award} colorClass="bg-emerald-500" delay="animate-delay-200" />
                            <StatCard title="Mean Time" value={`${processedData.stats.avgTime}s`} subtext="Completion speed" icon={Clock} colorClass="bg-violet-500" delay="animate-delay-300" />
                            <StatCard title="Integrity" value={`${((1 - (processedData.stats.flaggedCount / (processedData.stats.total || 1))) * 100).toFixed(0)}%`} subtext={`${processedData.stats.flaggedCount} flagged entries`} icon={ShieldAlert} colorClass="bg-amber-500" delay="animate-delay-400" />
                        </div>
                    )}

                    {/* Data Explorer */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg text-primary-500">
                                <Microscope size={18} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Participant Registry</h3>
                        </div>

                        {rawData && (
                            <AssessmentTable
                                data={filteredParticipants}
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                filterArchetype={filterArchetype}
                                onFilterChange={setFilterArchetype}
                                availableArchetypes={processedData?.availableArchetypes || ["All"]}
                                sortConfig={sortConfig}
                                onSort={handleSort}
                                onDelete={handleDelete}
                                onSelect={setSelectedAssessment}
                            />
                        )}

                        {(!rawData || rawData.length === 0) && !isLoading && (
                            <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                                    <Layers size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Research Data Detected</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                                    Your research registry is currently empty. Import participant data to begin your analysis.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Import Now
                                    </button>
                                    <button
                                        onClick={fetchData}
                                        className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals & Overlays */}
            {showImportModal && <FileUpload onUpload={fetchData} onClose={() => setShowImportModal(false)} />}
            <AssessmentDetail
                assessment={selectedAssessment}
                onClose={() => setSelectedAssessment(null)}
                onUpdateAnnotation={handleUpdateAnnotation}
            />
        </div>
    );
}