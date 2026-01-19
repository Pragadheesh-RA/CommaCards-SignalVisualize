import React, { useState } from 'react';
import { Microscope, LogIn, AlertTriangle, RefreshCw, Sparkles, Zap, ShieldCheck } from 'lucide-react';

/**
 * Stunning Mesh Gradient Login Screen.
 * Optimized for low-spec devices by using static gradients if animations are reduced.
 */
const LoginScreen = ({ onLogin, API_BASE_URL }) => {
    const [id, setId] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 mesh-gradient overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full animate-float" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-2s' }} />

            <div className="w-full max-w-[420px] relative z-10 animate-slide-up">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <ShieldCheck className="text-primary-400 relative z-10" size={48} strokeWidth={2} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">VISUALIZE</h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="h-px w-8 bg-white/20" />
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Researcher Portal</span>
                        <span className="h-px w-8 bg-white/20" />
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl overflow-hidden relative">
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">Access Credentials</label>
                            <div className="relative group">
                                <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Enter Researcher ID"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all font-bold tracking-tight"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-shake">
                                <AlertTriangle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                                ${isLoading
                                    ? 'bg-white/10 text-white/30 cursor-wait'
                                    : 'bg-primary-500 text-white hover:bg-primary-400 shadow-lg shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0'
                                }
                            `}
                        >
                            {isLoading ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Access Dashboard</span>
                                    <Zap size={18} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Subtle aesthetic details */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-30" />
                </div>

                {/* Footer Credits */}
                <p className="text-center mt-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                    &copy; 2026 COMMACARDS &bull; SECURE ANALYTICS REPORT
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
