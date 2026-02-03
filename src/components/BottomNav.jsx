import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Target, Trophy, Settings, Bot, Sparkles, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Accueil' },
        { path: '/transactions', icon: TrendingUp, label: 'Transactions' },
        { path: '/ai-advisor', icon: Bot, label: 'IA', highlight: true },
        { path: '/goals', icon: Target, label: 'Objectifs' },
        { path: '/debts', icon: ShieldAlert, label: 'Dettes' },
        { path: '/progress', icon: Trophy, label: 'Progrès' },
        { path: '/settings', icon: Settings, label: 'Réglages' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-[var(--glass-border)] z-50">
            <div className="max-w-[480px] mx-auto px-2 py-2 flex justify-around items-center">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[var(--accent-glow)] rounded-lg"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            {item.highlight && !isActive && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute top-0 right-0 border-2 border-[var(--bg-primary)] rounded-full"
                                >
                                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                                </motion.div>
                            )}

                            <Icon
                                size={22}
                                className={`relative z-10 transition-colors ${isActive ? 'text-[var(--accent)]' : item.highlight ? 'text-[var(--positive)]' : 'text-[var(--text-muted)]'
                                    }`}
                            />
                            <span
                                className={`relative z-10 text-[9px] font-bold uppercase tracking-tighter transition-colors hidden min-[360px]:block ${isActive ? 'text-[var(--accent)]' : item.highlight ? 'text-[var(--positive)]' : 'text-[var(--text-muted)]'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
