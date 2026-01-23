import React, { useState } from 'react';
import {
    LayoutDashboard, Database, ShieldCheck, Settings,
    LogOut, ChevronLeft, ChevronRight, Moon, Sun, Menu, X,
    FileText, Layers, Info
} from 'lucide-react';

/**
 * Kinetic Sidebar - Matte finish with magnetic interactions.
 */
const Sidebar = ({ user, onLogout, isDarkMode, toggleDarkMode, activeView, onViewChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    const SidebarContent = () => (
        <div className="h-full flex flex-col p-6 bg-white/80 dark:bg-matte-900/90 backdrop-blur-xl transition-colors duration-500">
            {/* Logo Section - Magnetic Pulse */}
            <div className={`flex items-center gap-4 mb-12 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0 relative group animate-pulse-magnetic">
                    <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ShieldCheck className="text-white relative z-10" size={24} strokeWidth={2.5} />
                </div>
                {!isCollapsed && (
                    <div className="animate-fade-in text-left">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">VISUALIZE</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analytics</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation - Luminous Pills */}
            <nav className="flex-1 space-y-3">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onViewChange(item.id);
                            setMobileOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                            ${activeView === item.id
                                ? 'bg-primary-500 text-white shadow-glow-primary translate-x-1'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400'
                            }
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        {/* Hover Glow Background */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeView === item.id ? 'hidden' : ''}`} />

                        <item.icon size={22} strokeWidth={activeView === item.id ? 2.5 : 2} className="relative z-10" />
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight relative z-10">{item.label}</span>}

                        {isCollapsed && (
                            <div className="absolute left-16 px-4 py-2 bg-matte-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 shadow-kinetic-dark whitespace-nowrap border border-white/10">
                                {item.label}
                            </div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-6">
                {/* Theme Toggle - Matte Switch */}
                <button
                    onClick={toggleDarkMode}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:scale-[1.02] active:scale-95 transition-all border border-transparent dark:border-white/5
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-500" />}
                    {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>


                {/* User Info - Kinetic Card */}
                <div className={`relative group ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-indigo-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className={`relative flex items-center gap-3 px-3 py-3 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-sm ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                            <span className="text-sm font-black text-slate-600 dark:text-slate-300">{user?.[0]?.toUpperCase()}</span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Researcher</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{user}</p>
                                <button onClick={onLogout} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest mt-1 hover:underline">Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Copyright info */}
                {!isCollapsed && (
                    <div className="pt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center opacity-40 hover:opacity-100 transition-opacity cursor-default">
                            2026 CommaCards
                        </p>
                    </div>
                )}

                {/* Collapse Toggle (Desktop only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex w-8 h-8 rounded-full bg-white dark:bg-matte-800 border border-slate-200 dark:border-white/10 absolute -right-4 top-12 items-center justify-center shadow-kinetic hover:scale-110 active:scale-95 transition-all z-[60] text-primary-500"
                >
                    {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header - Glass Strip */}
            <header className="lg:hidden h-20 bg-white/80 dark:bg-matte-900/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 animate-pulse-magnetic">
                        <ShieldCheck className="text-white" size={22} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-xl text-slate-900 dark:text-white tracking-tighter">VISUALIZE</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Desktop */}
            <aside className={`fixed top-0 left-0 h-screen z-50 transition-all duration-500 ease-in-out hidden lg:block
                ${isCollapsed ? 'w-24' : 'w-80'}
            `}>
                <div className="h-full w-full border-r border-slate-200 dark:border-white/5 shadow-kinetic dark:shadow-none">
                    <SidebarContent />
                </div>
            </aside>

            {/* Sidebar Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-matte-950/60 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setMobileOpen(false)}
                >
                    <aside
                        className="w-80 h-full bg-white dark:bg-matte-900 shadow-2xl animate-slide-up-fade"
                        onClick={e => e.stopPropagation()}
                    >
                        <SidebarContent />
                    </aside>
                </div>
            )}
        </>
    );
};

export default Sidebar;
