import React, { useState } from 'react';
import { Microscope, LogIn, AlertTriangle, RefreshCw, Sparkles, Zap, ShieldCheck, Lock, Settings, Plus, Trash2, X, User, Search } from 'lucide-react';

/**
 * Stunning Mesh Gradient Login Screen with Admin Portal.
 * Optimized for low-spec devices by using static gradients if animations are reduced.
 */
const LoginScreen = ({ onLogin, API_BASE_URL }) => {
    const [id, setId] = useState("");

    // Admin States
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [adminUser, setAdminUser] = useState("");
    const [adminPass, setAdminPass] = useState("");
    const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
    const [adminToken, setAdminToken] = useState(null);
    const [authorizedIds, setAuthorizedIds] = useState([]);
    const [newId, setNewId] = useState("");

    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- Researcher Login ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const normalizedId = id.trim();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: normalizedId })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('auth_user', data.user);
                }
                onLogin(data.user);
            } else {
                setError(data.error || "Access Denied");
            }
        } catch (err) {
            setError("Connection failed. Check your internet.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Admin Functions ---
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: adminUser, password: adminPass })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setAdminToken(data.token);
                setIsAuthenticatedAdmin(true);
                fetchIds(data.token);
            } else {
                setError(data.error || "Invalid Credentials");
            }
        } catch (err) {
            setError("Admin Login Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchIds = async (token) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/admin/ids`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.ids) setAuthorizedIds(data.ids);
        } catch (e) {
            console.error("Failed to fetch IDs");
        }
    };

    const handleAddId = async () => {
        if (!newId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/admin/ids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ newId })
            });
            const data = await res.json();
            if (res.ok) {
                setAuthorizedIds(data.ids);
                setNewId("");
                setSuccessMsg("ID Added Successfully");
                setTimeout(() => setSuccessMsg(null), 2000);
            } else {
                setError(data.error || "Failed to add ID");
            }
        } catch (e) {
            setError("Network Error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteId = async (targetId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/admin/ids/${targetId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAuthorizedIds(data.ids);
            }
        } catch (e) {
            alert("Delete failed");
        }
    };

    const AdminDashboard = () => {
        const [searchTerm, setSearchTerm] = useState("");
        const [deleteConfirm, setDeleteConfirm] = useState(null);

        const filteredIds = authorizedIds.filter(aid =>
            aid.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const handleCopy = (text) => {
            navigator.clipboard.writeText(text);
            setSuccessMsg("ID Copied to Clipboard");
            setTimeout(() => setSuccessMsg(null), 2000);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') handleAddId();
        };

        const confirmDelete = (aid) => {
            if (deleteConfirm === aid) {
                handleDeleteId(aid);
                setDeleteConfirm(null);
            } else {
                setDeleteConfirm(aid);
                setTimeout(() => setDeleteConfirm(null), 3000);
            }
        };

        return (
            <div className="space-y-5 animate-slide-up-fade">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            Access Control
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[9px] tracking-wide">ADMIN</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage Authorized Researchers</p>
                    </div>
                    <button
                        onClick={() => { setIsAuthenticatedAdmin(false); setIsAdminMode(false); }}
                        className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
                        title="Close Portal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Add New ID */}
                <div className="relative group z-20">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Add New Researcher ID..."
                                className="w-full pl-4 pr-4 py-3 bg-matte-950/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all font-bold placeholder:text-slate-600"
                                value={newId}
                                onChange={(e) => setNewId(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button
                            onClick={handleAddId}
                            disabled={isLoading || !newId}
                            className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-900/20 hover:bg-rose-500 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                            title="Add ID"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Search & List */}
                <div className="space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input
                            type="text"
                            placeholder="Search IDs..."
                            className="w-full pl-9 pr-3 py-2 bg-white/5 border-none rounded-lg text-xs font-bold text-slate-300 focus:text-white outline-none focus:bg-white/10 transition-all placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Messages */}
                    <div className="h-6 flex items-center justify-center">
                        {successMsg && <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider animate-fade-in flex items-center gap-1"><ShieldCheck size={10} /> {successMsg}</p>}
                        {error && <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider animate-shake flex items-center gap-1"><AlertTriangle size={10} /> {error}</p>}
                    </div>

                    {/* Scrollable List */}
                    <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredIds.length > 0 ? (
                            filteredIds.map(aid => (
                                <div key={aid} className="flex items-center justify-between p-3 bg-matte-950/30 border border-white/5 rounded-xl hover:bg-white/5 transition-all group relative overflow-hidden">
                                    {/* Hover Highlight */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                                    <div
                                        onClick={() => handleCopy(aid)}
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                        title="Click to Copy"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary-400 transition-colors">
                                            <User size={14} />
                                        </div>
                                        <span className="text-sm font-black text-slate-400 group-hover:text-white transition-colors tracking-tight">{aid}</span>
                                    </div>

                                    <button
                                        onClick={() => confirmDelete(aid)}
                                        className={`p-2 rounded-lg transition-all ${deleteConfirm === aid
                                                ? 'bg-rose-500 text-white animate-pulse'
                                                : 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10'
                                            }`}
                                        title={deleteConfirm === aid ? "Confirm Delete?" : "Delete Access"}
                                    >
                                        {deleteConfirm === aid ? <div className="text-[9px] font-black uppercase px-1">Confirm</div> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 opacity-30">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">No Matches Found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secure Logout Footer */}
                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Administrator: Santhosh</p>
                    <button
                        onClick={() => { setIsAuthenticatedAdmin(false); setAdminToken(null); }}
                        className="text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest flex items-center gap-1 hover:underline decoration-rose-500/50 underline-offset-4 transition-all"
                    >
                        <Lock size={10} /> Secure Logout
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
            {/* Kinetic Background Overlays (adds depth to the global aurora) */}
            <div className="absolute top-0 left-0 w-full h-full bg-matte-950/20 z-0 pointer-events-none" />

            <div className="w-full max-w-[420px] relative z-10 animate-slide-up-fade">
                {/* Logo Section - Floating */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-6 rounded-[2rem] bg-matte-900 border border-white/5 shadow-kinetic-dark mb-8 relative group animate-float-slow">
                        <div className={`absolute inset-0 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 ${isAdminMode ? 'bg-rose-500/20' : 'bg-primary-500/20'}`} />
                        {isAdminMode ? <Lock className="text-rose-400 relative z-10" size={56} strokeWidth={1.5} /> : <ShieldCheck className="text-primary-400 relative z-10" size={56} strokeWidth={1.5} />}
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4">VISUALIZE</h1>
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
                        <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isAdminMode ? 'text-rose-400' : 'text-primary-400'}`}>
                            {isAdminMode ? 'Admin Portal' : 'Researcher Access'}
                        </span>
                        <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
                    </div>
                </div>

                {/* Login Card - Kinetic Surface */}
                <div className="bg-matte-900/80 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-kinetic-dark relative overflow-hidden group transition-all duration-500">
                    {/* Magnetic Spotlight */}
                    <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full group-hover:opacity-100 transition-all duration-1000 opacity-50 ${isAdminMode ? 'bg-rose-500/10 group-hover:bg-rose-500/20' : 'bg-primary-500/10 group-hover:bg-primary-500/20'}`} />

                    {isAuthenticatedAdmin ? (
                        <AdminDashboard />
                    ) : (
                        <div className="relative z-10">
                            <form onSubmit={isAdminMode ? handleAdminLogin : handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isAdminMode ? 'Admin Username' : 'Secure ID'}</label>
                                        <button
                                            type="button"
                                            onClick={() => { setIsAdminMode(!isAdminMode); setError(null); }}
                                            className="text-[10px] font-bold text-slate-600 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1"
                                        >
                                            {isAdminMode ? <ShieldCheck size={10} /> : <Settings size={10} />}
                                            {isAdminMode ? 'Researcher Login' : 'Admin'}
                                        </button>
                                    </div>

                                    {/* Inputs */}
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-500 group-focus-within:text-white transition-colors">
                                                {isAdminMode ? <User size={20} /> : <LogIn size={20} />}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={isAdminMode ? "Username" : "Enter Credential"}
                                                className="w-full pl-12 pr-4 py-4 bg-matte-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:border-transparent transition-all font-bold tracking-tight shadow-inner focus:ring-primary-500/50"
                                                value={isAdminMode ? adminUser : id}
                                                onChange={(e) => isAdminMode ? setAdminUser(e.target.value) : setId(e.target.value)}
                                                disabled={isLoading}
                                                autoFocus
                                            />
                                        </div>

                                        {isAdminMode && (
                                            <div className="relative group animate-slide-up-fade">
                                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-500 group-focus-within:text-white transition-colors">
                                                    <Lock size={20} />
                                                </div>
                                                <input
                                                    type="password"
                                                    placeholder="Password"
                                                    className="w-full pl-12 pr-4 py-4 bg-matte-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:border-transparent transition-all font-bold tracking-tight shadow-inner focus:ring-rose-500/50"
                                                    value={adminPass}
                                                    onChange={(e) => setAdminPass(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-pulse-magnetic">
                                        <AlertTriangle size={16} className="shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 relative overflow-hidden group border 
                                        ${isAdminMode
                                            ? 'bg-rose-600 hover:bg-rose-500 border-rose-500/50 shadow-lg shadow-rose-900/20'
                                            : 'bg-primary-600 hover:bg-primary-500 border-primary-500/50 shadow-glow-primary'
                                        }
                                        text-white hover:-translate-y-1 active:translate-y-0
                                        ${isLoading ? 'opacity-50 cursor-wait' : ''}
                                    `}
                                >
                                    {isLoading ? (
                                        <RefreshCw className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <span>{isAdminMode ? 'Enter Portal' : 'Authenticate'}</span>
                                            <Zap size={16} className="transition-transform group-hover:translate-x-1" strokeWidth={3} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Credits */}
                <p className="text-center mt-10 text-[9px] font-black text-white/10 uppercase tracking-[0.3em] hover:text-white/30 transition-colors cursor-default">
                    &copy; 2026 CommaCards &bull; Secured
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
