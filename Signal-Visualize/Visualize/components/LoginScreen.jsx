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
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
            {/* Kinetic Background Overlays (adds depth to the global aurora) */}
            <div className="absolute top-0 left-0 w-full h-full bg-matte-950/20 z-0 pointer-events-none" />

            <div className="w-full max-w-[420px] relative z-10 animate-slide-up-fade">
                {/* Logo Section - Floating */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-6 rounded-[2rem] bg-matte-900 border border-white/5 shadow-kinetic-dark mb-8 relative group animate-float-slow">
                        <div className="absolute inset-0 bg-primary-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                        <ShieldCheck className="text-primary-400 relative z-10" size={56} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4">VISUALIZE</h1>
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Researcher Access</span>
                        <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
                    </div>
                </div>

                {/* Login Card - Kinetic Surface */}
                <div className="bg-matte-900/80 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-kinetic-dark relative overflow-hidden group">
                    {/* Magnetic Spotlight */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/10 blur-[80px] rounded-full group-hover:bg-primary-500/20 transition-colors duration-1000" />

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure ID</label>
                            <div className="relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-500 group-focus-within:text-primary-400 transition-colors">
                                    <LogIn size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter Credential"
                                    className="w-full pl-12 pr-4 py-4 bg-matte-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-bold tracking-tight shadow-inner"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus
                                />
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
                            className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 relative overflow-hidden group border border-primary-500/50
                                ${isLoading
                                    ? 'bg-matte-800 text-white/30 cursor-wait'
                                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow-primary hover:-translate-y-1 active:translate-y-0'
                                }
                            `}
                        >
                            {isLoading ? (
                                <RefreshCw className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <Zap size={16} className="transition-transform group-hover:translate-x-1" strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>
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
