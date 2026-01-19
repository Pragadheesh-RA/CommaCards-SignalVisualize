import React, { useState } from 'react';
import {
    LayoutDashboard, Database, ShieldCheck, Settings,
    LogOut, ChevronLeft, ChevronRight, Moon, Sun, Menu, X
} from 'lucide-react';

/**
 * Premium Responsive Sidebar with Collapsible logic and Dark Mode Toggle.
 */
const Sidebar = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Only Dashboard is active in this version
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', active: true },
    ];

    const SidebarContent = () => (
        <div className="h-full flex flex-col p-4">
            {/* Logo Section */}
            <div className={`flex items-center gap-3 mb-10 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                    <ShieldCheck className="text-white" size={24} strokeWidth={2.5} />
                </div>
                {!isCollapsed && (
                    <div className="animate-fade-in text-left">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">COMMA CARDS</h2>
                        <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest block mt-1">Dev: RA &bull; Analytics</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item, idx) => (
                    <button
                        key={idx}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                            ${item.active
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        <item.icon size={22} strokeWidth={item.active ? 2.5 : 2} />
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                        {isCollapsed && !item.active && (
                            <div className="absolute left-16 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-[1.02] active:scale-95 transition-all
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {!isCollapsed && <span className="text-sm font-bold">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* User Info */}
                <div className={`flex items-center gap-3 px-2 py-4 border-t border-slate-100 dark:border-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-500">{user?.[0]?.toUpperCase()}</span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 animate-fade-in">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user}</p>
                            <button onClick={onLogout} className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider">Logout</button>
                        </div>
                    )}
                </div>

                {/* Copyright info */}
                {!isCollapsed && (
                    <div className="px-2 pt-4 pb-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center opacity-60">
                            &copy; 2026 Comma Cards
                        </p>
                    </div>
                )}

                {/* Collapse Toggle (Desktop only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 absolute -right-4 top-10 items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden h-16 glass-effect sticky top-0 z-40 px-6 flex items-center justify-between border-b dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="text-primary-500" size={24} strokeWidth={2.5} />
                    <span className="font-black text-slate-900 dark:text-white tracking-tighter">VISUALIZE</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-slate-600 dark:text-slate-400"
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
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setMobileOpen(false)}
                >
                    <aside
                        className="w-72 h-full bg-white dark:bg-[#0f172a] shadow-2xl animate-slide-right"
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
