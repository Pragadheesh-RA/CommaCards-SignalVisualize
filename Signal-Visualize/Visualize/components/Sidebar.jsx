import React, { useState } from 'react';
import {
    LayoutDashboard, Database, ShieldCheck, Settings,
    LogOut, ChevronLeft, ChevronRight, Moon, Sun, Menu, X,
    FileText, Layers, Info
} from 'lucide-react';

/**
 * Premium Responsive Sidebar with Collapsible logic and Dark Mode Toggle.
 */
const Sidebar = ({ user, onLogout, isDarkMode, toggleDarkMode, activeView, onViewChange, onShowDevInfo }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'format', icon: FileText, label: 'Analysis Format' },
        { id: 'grades', icon: Layers, label: 'Grade Structure' },
    ];

    const SidebarContent = () => (
        <div className="h-full flex flex-col p-4">
            {/* Logo Section */}
            <div className={`flex items-center gap-3 mb-10 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/40 shrink-0 relative group">
                    <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ShieldCheck className="text-white relative z-10" size={28} strokeWidth={2.5} />
                </div>
                {!isCollapsed && (
                    <div className="animate-fade-in text-left">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">VISUALIZE</h2>
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest block mt-1.5 ring-1 ring-primary-500/20 px-2 py-0.5 rounded-full w-fit bg-primary-500/5">Analytics</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onViewChange(item.id);
                            setMobileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative
                            ${activeView === item.id
                                ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        <item.icon size={22} strokeWidth={activeView === item.id ? 2.5 : 2} />
                        {!isCollapsed && <span className="text-sm font-black tracking-tight">{item.label}</span>}
                        {isCollapsed && (
                            <div className="absolute left-20 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-50 shadow-2xl">
                                {item.label}
                            </div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-[1.02] active:scale-95 transition-all
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {!isCollapsed && <span className="text-sm font-black uppercase tracking-widest text-[10px]">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* Developer Info Button */}
                <button
                    onClick={onShowDevInfo}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-primary-500/5 text-primary-500 hover:bg-primary-500/10 transition-all
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    <Info size={20} />
                    {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Developer Info</span>}
                </button>

                {/* User Info */}
                <div className={`flex items-center gap-3 px-2 py-4 border-t border-slate-100 dark:border-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-slate-700">
                        <span className="text-xs font-black text-slate-500">{user?.[0]?.toUpperCase()}</span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 animate-fade-in">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Researcher</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{user}</p>
                            <button onClick={onLogout} className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest mt-1">Sign Out</button>
                        </div>
                    )}
                </div>

                {/* Copyright info */}
                {!isCollapsed && (
                    <div className="px-2 pt-2 pb-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center opacity-40">
                            &copy; 2026 Visualize
                        </p>
                    </div>
                )}

                {/* Collapse Toggle (Desktop only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 absolute -right-4 top-10 items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-[60]"
                >
                    {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden h-20 glass-effect sticky top-0 z-40 px-6 flex items-center justify-between border-b dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <ShieldCheck className="text-white" size={22} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-lg text-slate-900 dark:text-white tracking-tighter">VISUALIZE</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Desktop */}
            <aside className={`fixed top-0 left-0 h-screen glass-effect z-50 border-r dark:border-slate-800 transition-all duration-500 hidden lg:block
                ${isCollapsed ? 'w-20' : 'w-72'}
            `}>
                <SidebarContent />
            </aside>

            {/* Sidebar Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[55] lg:hidden"
                    onClick={() => setMobileOpen(false)}
                >
                    <aside
                        className="w-72 h-full bg-white dark:bg-[#0f172a] shadow-2xl animate-flow-right"
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
