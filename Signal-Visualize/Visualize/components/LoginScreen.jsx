import React, { useState, useEffect } from 'react';
import { Microscope, LogIn, AlertTriangle, RefreshCw, Zap, ShieldCheck, Lock, Settings, Plus, Trash2, X, User, Search, Eye, EyeOff, UserPlus } from 'lucide-react';

/**
 * Admin Dashboard Component
 * Extracted to prevent re-rendering/focus loss issues.
 */
authorizedUsers,
    onClose,
    onAddUser,
    onDeleteUser,
    isLoading,
    successMsg,
    error,
    currentUserRole // Passed from parent
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Add User Form States
    const [newUsername, setNewUsername] = useState("");
    const [newRole, setNewRole] = useState("researcher"); // researcher | admin
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const filteredUsers = authorizedUsers.filter(u => {
        const name = typeof u === 'string' ? u : (u.username || "");
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleCopy = (text) => {
        if (text) navigator.clipboard.writeText(text);
    };

    const handleAddSubmit = () => {
        if (!newUsername) return;
        onAddUser({ username: newUsername, role: newRole, password: newPassword });
        setNewUsername("");
        setNewPassword("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAddSubmit();
    };

    const confirmDelete = (username) => {
        if (deleteConfirm === username) {
            onDeleteUser(username);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(username);
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
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage Roles & Permissions</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
                    title="Close Portal"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Add User Form */}
            <div className="bg-matte-950/30 p-3 sm:p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={() => setNewRole('researcher')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${newRole === 'researcher' ? 'bg-primary-600/20 text-primary-400 border border-primary-500/50' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                    >
                        Researcher
                    </button>
                    {currentUserRole === 'root' && (
                        <button
                            onClick={() => setNewRole('admin')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${newRole === 'admin' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/50' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                        >
                            Co-Admin
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        placeholder={newRole === 'admin' ? "New Admin Username" : "New Researcher ID"}
                        className="w-full sm:flex-1 px-4 py-3 bg-matte-950/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-rose-500/50 transition-all font-bold placeholder:text-slate-600"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />

                    {newRole === 'admin' && (
                        <div className="relative w-full sm:w-1/3">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full pl-3 pr-8 py-3 bg-matte-950/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-rose-500/50 transition-all font-bold placeholder:text-slate-600"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleAddSubmit}
                        disabled={isLoading || !newUsername}
                        className="w-full sm:w-auto p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-900/20 hover:bg-rose-500 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                        title="Add User"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Search & List */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                    <input
                        type="text"
                        placeholder="Search Users..."
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
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((u, idx) => {
                            const username = typeof u === 'string' ? u : (u.username || "Unknown");
                            const role = typeof u === 'string' ? 'researcher' : (u.role || 'researcher');

                            return (
                                <div key={username + idx} className="flex items-center justify-between p-3 bg-matte-950/30 border border-white/5 rounded-xl hover:bg-white/5 transition-all group relative overflow-hidden">
                                    <div
                                        onClick={() => handleCopy(username)}
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${role === 'admin' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-500/10 text-primary-400'}`}>
                                            {role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-300 group-hover:text-white transition-colors tracking-tight">{username}</span>
                                            <span className="text-[9px] uppercase font-bold text-slate-600">{role}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => confirmDelete(username)}
                                        className={`p-2 rounded-lg transition-all ${deleteConfirm === username
                                            ? 'bg-rose-500 text-white animate-pulse'
                                            : 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10'
                                            }`}
                                    >
                                        {deleteConfirm === username ? <div className="text-[9px] font-black uppercase px-1">Confirm</div> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            );
                        })
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
                    className="text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest flex items-center gap-1 hover:underline decoration-rose-500/50 underline-offset-4 transition-all"
                    onClick={onClose} // Just close portal, logic is in parent
                >
                    <Lock size={10} /> Secure Logout
                </button>
            </div>
        </div>
    );
};

const LoginScreen = ({ onLogin, API_BASE_URL }) => {
    const [id, setId] = useState("");

    // Admin States
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [adminUser, setAdminUser] = useState("");
    const [adminPass, setAdminPass] = useState("");
    const [showAdminPass, setShowAdminPass] = useState(false);
    const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState(false);
    const [adminToken, setAdminToken] = useState(null);
    const [adminRole, setAdminRole] = useState(null); // 'root' or 'admin'
    const [authorizedUsers, setAuthorizedUsers] = useState([]);

    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- Helper: Safe Fetch ---
    const safeFetch = async (url, options) => {
        try {
            const res = await fetch(url, options);
            const contentType = res.headers.get("content-type");

            if (!res.ok) {
                // Try to parse error from JSON if possible, else text
                if (contentType && contentType.includes("application/json")) {
                    const errData = await res.json();
                    throw new Error(errData.error || `Server Error (${res.status})`);
                }
                const text = await res.text();
                console.error("Non-JSON Error Response:", text);
                throw new Error(`Connection Error (${res.status}). Verify API URL.`);
            }

            if (contentType && contentType.includes("application/json")) {
                return await res.json();
            }

            throw new Error("Invalid Server Response (Not JSON)");
        } catch (err) {
            throw err;
        }
    };

    // --- Researcher Login ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const normalizedId = id.trim();
        setIsLoading(true);
        setError(null);

        try {
            const data = await safeFetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: normalizedId })
            });

            if (data.success) {
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('auth_user', data.user);
                }
                onLogin(data.user);
            }
        } catch (err) {
            setError(err.message || "Connection failed.");
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
            const data = await safeFetch(`${API_BASE_URL}/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: adminUser, password: adminPass })
            });

            if (data.success) {
                setAdminToken(data.token);
                setAdminRole(data.role || 'admin'); // Capture role
                setIsAuthenticatedAdmin(true);
                fetchUsers(data.token);
            }
        } catch (err) {
            setError(err.message || "Admin Login Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async (token) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/admin/ids`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.ids) setAuthorizedUsers(data.ids);
        } catch (e) {
            console.error("Failed to fetch Users");
        }
    };

    const handleAddUser = async (userData) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/admin/ids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if (res.ok) {
                setAuthorizedUsers(data.ids);
                setSuccessMsg(`${userData.role === 'admin' ? 'Admin' : 'ID'} Added`);
                setTimeout(() => setSuccessMsg(null), 2000);
            } else {
                setError(data.error || "Failed");
            }
        } catch (e) {
            setError("Network Error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (targetUser) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/admin/ids/${targetUser}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAuthorizedUsers(data.ids);
            } else {
                setError(data.error);
            }
        } catch (e) {
            alert("Delete failed");
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
            {/* Kinetic Background Overlays */}
            <div className="absolute top-0 left-0 w-full h-full bg-matte-950/20 z-0 pointer-events-none" />

            <div className="w-full max-w-[420px] relative z-10 animate-slide-up-fade">
                {/* Logo Section */}
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

                {/* Login Card */}
                <div className="bg-matte-900/80 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-kinetic-dark relative overflow-hidden group transition-all duration-500">
                    {/* Magnetic Spotlight */}
                    <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full group-hover:opacity-100 transition-all duration-1000 opacity-50 ${isAdminMode ? 'bg-rose-500/10 group-hover:bg-rose-500/20' : 'bg-primary-500/10 group-hover:bg-primary-500/20'}`} />

                    {isAuthenticatedAdmin ? (
                        <AdminDashboard
                            authorizedUsers={authorizedUsers}
                            onClose={() => { setIsAuthenticatedAdmin(false); setAdminToken(null); }}
                            onAddUser={handleAddUser}
                            onDeleteUser={handleDeleteUser}
                            isLoading={isLoading}
                            successMsg={successMsg}
                            error={error}
                            currentUserRole={adminRole}
                        />
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
                                                    type={showAdminPass ? "text" : "password"}
                                                    placeholder="Password"
                                                    className="w-full pl-12 pr-12 py-4 bg-matte-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:border-transparent transition-all font-bold tracking-tight shadow-inner focus:ring-rose-500/50"
                                                    value={adminPass}
                                                    onChange={(e) => setAdminPass(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAdminPass(!showAdminPass)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                                >
                                                    {showAdminPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
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
