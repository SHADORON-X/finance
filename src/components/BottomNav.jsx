import { Link, useLocation } from 'react-router-dom';
import {
    TrendingUp, Target, Trophy, Settings, Bot,
    Coins, ShieldAlert, LayoutDashboard, Wallet,
    Gem, Sword, Map, Zap, ScrollText, Flame, Crown, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const location = useLocation();

    const navBlocks = [
        {
            id: 'command',
            label: 'COMMANDEMENT',
            items: [
                { path: '/', icon: LayoutDashboard, label: 'QG Impérial', color: 'amber' },
                { path: '/transactions', icon: Sword, label: 'Conquêtes', color: 'slate' },
            ]
        },
        {
            id: 'wealth',
            label: 'TRÉSORERIE',
            items: [
                { path: '/allocation', icon: Gem, label: 'Territoires', color: 'amber', highlight: true },
                { path: '/goals', icon: Target, label: 'Objectifs', color: 'emerald' },
                { path: '/debts', icon: ShieldAlert, label: 'Dettes', color: 'rose' },
            ]
        },
        {
            id: 'intel',
            label: 'INTELLIGENCE',
            items: [
                { path: '/ai-advisor', icon: Bot, label: 'L\'Oracle', color: 'amber', highlight: true },
                { path: '/academie', icon: BookOpen, label: 'Académie', color: 'purple' },
                { path: '/progress', icon: Trophy, label: 'Glorification', color: 'yellow' },
                { path: '/settings', icon: Settings, label: 'Système', color: 'slate' },
            ]
        }
    ];

    const allItems = navBlocks.flatMap(block => block.items);

    const getColorClasses = (color, isActive) => {
        const colors = {
            amber: isActive ? 'text-amber-500 bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_var(--primary-glow)]' : 'text-slate-500 hover:text-amber-500',
            emerald: isActive ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-500 hover:text-emerald-500',
            rose: isActive ? 'text-rose-500 bg-rose-500/10 border border-rose-500/30' : 'text-slate-500 hover:text-rose-500',
            yellow: isActive ? 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/30' : 'text-slate-500 hover:text-yellow-500',
            purple: isActive ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30' : 'text-slate-500 hover:text-purple-400',
            slate: isActive ? 'text-slate-300 bg-slate-800/40 border border-white/10 light:text-slate-700 light:bg-slate-100 light:border-black/5' : 'text-slate-500 hover:text-slate-200 light:hover:text-slate-800',
        };
        return colors[color] || colors.slate;
    };

    return (
        <>
            {/* --- MOBILE NAVIGATION (Bottom Bar) --- */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 light:bg-white/90 light:border-slate-200 z-50 safe-area-bottom transition-all duration-300">
                <div className="flex justify-around items-center px-2 py-3">
                    {allItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 group">
                                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg shadow-amber-500/40' : 'text-slate-500 hover:text-amber-500'}`}>
                                    <Icon size={20} />
                                </div>
                                <span className={`text-[8px] font-ancient font-bold uppercase tracking-widest ${isActive ? 'text-amber-500' : 'text-slate-600'}`}>
                                    {item.label.split(' ')[0]}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* --- DESKTOP NAVIGATION (Imperial Sidebar) --- */}
            <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-white/5 light:bg-white light:border-slate-200 z-40 overflow-y-auto no-scrollbar transition-all duration-500">
                <div className="p-8">
                    {/* Header: Imperial Insignia */}
                    <div className="mb-12">
                        <h1 className="text-xl font-ancient font-black tracking-[0.2em] heading-gold flex items-center gap-3">
                            <Crown className="text-amber-500" size={28} />
                            SHADORON
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Imperial Finance</span>
                        </div>
                    </div>

                    {/* Navigation Groups */}
                    <div className="space-y-10">
                        {navBlocks.map((block) => (
                            <div key={block.id}>
                                <h3 className="text-[10px] font-ancient font-black text-slate-600 uppercase tracking-[0.4em] mb-4 px-2">
                                    {block.label}
                                </h3>
                                <div className="space-y-2">
                                    {block.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-center gap-4 px-4 py-3 rounded-tr-2xl rounded-bl-2xl transition-all duration-300 group relative ${getColorClasses(item.color, isActive)}`}
                                            >
                                                {isActive && (
                                                    <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-amber-500/5 rounded-tr-2xl rounded-bl-2xl" />
                                                )}
                                                <Icon size={18} className={`transition-transform duration-500 ${isActive ? 'scale-110 rotate-12' : 'group-hover:scale-110 group-hover:-rotate-12'}`} />
                                                <span className="font-ancient text-sm font-bold tracking-widest uppercase">{item.label}</span>

                                                {item.highlight && !isActive && (
                                                    <div className="ml-auto w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Warrior Status Dock */}
                    <div className="mt-16 p-6 card-warrior border-white/5 bg-slate-900/50 light:bg-slate-50 light:border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Flame size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">État du Monarque</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-500 font-bold font-ancient">FORCE</span>
                                <span className="text-xs font-mono font-black text-amber-500">10,240 XP</span>
                            </div>
                            <div className="w-full h-1 bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[65%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Spacer */}
            <div className="hidden md:block w-72" />
        </>
    );
};

export default BottomNav;
