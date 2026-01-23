import React, { useState } from 'react';
import { Microscope, LogIn, AlertTriangle, RefreshCw, Sparkles, Zap, ShieldCheck, Lock, Settings, Plus, Trash2, X, User } from 'lucide-react';

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
        if (!window.confirm(`Delete access for ${targetId}?`)) return;
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

    const AdminDashboard = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Access Control</h3>
                <button onClick={() => { setIsAuthenticatedAdmin(false); setIsAdminMode(false); }} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Add New ID */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="New Researcher ID"
                    className="flex-1 px-4 py-3 bg-matte-950/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-primary-500 transition-all font-bold"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                />
                <button
                    onClick={handleAddId}
                    disabled={isLoading || !newId}
                    className="p-3 bg-primary-600 text-white rounded-xl shadow-lg hover:bg-primary-500 disabled:opacity-50 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            {successMsg && <p className="text-xs font-bold text-emerald-400 text-center animate-pulse">{successMsg}</p>}
            {error && <p className="text-xs font-bold text-red-400 text-center animate-shake">{error}</p>}

            {/* List */}
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {authorizedIds.map(aid => (
                    <div key={aid} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white">{aid}</span>
                        <button
                            onClick={() => handleDeleteId(aid)}
                            className="text-slate-500 hover:text-red-500 transition-colors p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest mt-4">System Administrator: Santhosh</p>
        </div>
    );

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
