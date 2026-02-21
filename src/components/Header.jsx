import { useEffect, useState, useRef } from 'react';
import { Search, Bell, LogOut, Bot, Sparkles, ScrollText, X, Sun, Moon } from 'lucide-react';
import { useAuthStore, useFinanceStore, useUIStore } from '../store';
import { signOut } from '../services/authService';
import { getGamificationData, getCurrentRank } from '../services/gamificationService';
import { getOracleVisions } from '../services/aiService';
import { getBalances } from '../services/balanceService';
import { getDebts } from '../services/debtService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const { user, logout } = useAuthStore();
    const { gamification, setGamification } = useFinanceStore();
    const { oracleVisions, setOracleVisions, theme, toggleTheme } = useUIStore();
    const [rank, setRank] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoadingVisions, setIsLoadingVisions] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        if (user) {
            loadGamification();
            if (oracleVisions.length === 0) {
                loadVisions();
            }
        }
    }, [user]);

    useEffect(() => {
        if (gamification) {
            setRank(getCurrentRank(gamification.xp));
        }
    }, [gamification]);

    // Fermer le menu si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadGamification = async () => {
        try {
            const data = await getGamificationData(user.id);
            setGamification(data);
        } catch (error) { }
    };

    const loadVisions = async () => {
        setIsLoadingVisions(true);
        try {
            const [balances, debts] = await Promise.all([
                getBalances(user.id),
                getDebts(user.id)
            ]);
            const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);
            const visions = await getOracleVisions({ totalBalance, debts });
            setOracleVisions(visions);
        } catch (error) {
            console.error('Error visions:', error);
        } finally {
            setIsLoadingVisions(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            logout();
            navigate('/login');
            toast.success('Déconnexion réussie');
        } catch (error) { }
    };

    return (
        <header className="fixed top-0 left-0 right-0 backdrop-blur-3xl bg-slate-950/60 border-b border-white/5 z-50 transition-all duration-500 light:bg-white/80 light:border-slate-200">
            <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-xl shadow-lg shadow-amber-900/40">
                        ⚔️
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-white light:text-slate-900 tracking-widest">SHADORON</h1>
                        <p className="text-[9px] text-amber-500 font-bold uppercase tracking-tighter">Budget Discipline</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900/50 border border-white/5 text-slate-400 hover:text-amber-500 light:bg-white light:border-black/5 light:text-slate-600 shadow-sm"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={theme}
                                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                            </motion.div>
                        </AnimatePresence>
                    </motion.button>

                    {/* Rank Badge */}
                    {rank && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-white/5 light:bg-white light:border-black/5">
                            <span className="text-base">{rank.icon}</span>
                            <div className="hidden min-[500px]:block text-left">
                                <div className="text-[10px] font-black text-amber-500 leading-none">{rank.name}</div>
                                <div className="text-[8px] text-slate-500 leading-none mt-1 uppercase font-bold">{gamification?.xp || 0} XP</div>
                            </div>
                        </div>
                    )}

                    {/* Notification Bell with Oracle Visions */}
                    <div className="relative" ref={menuRef}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isMenuOpen ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-500'
                                }`}
                        >
                            <Bell size={18} />
                            {oracleVisions.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-72 sm:w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={16} className="text-amber-500" />
                                            <span className="text-xs font-black uppercase text-white tracking-widest">Visions de l'Oracle</span>
                                        </div>
                                        {isLoadingVisions && <Loader size={12} className="text-amber-500 animate-spin" />}
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-2 no-scrollbar">
                                        {oracleVisions.length > 0 ? (
                                            oracleVisions.map((vision, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Bot size={14} className="text-amber-500" />
                                                    </div>
                                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                                        "{vision}"
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <ScrollText size={32} className="mx-auto text-slate-800 mb-2" />
                                                <p className="text-[10px] text-slate-600 uppercase font-black">L'Oracle médite...</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-slate-800">
                                        <button
                                            onClick={loadVisions}
                                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-amber-500 uppercase rounded-lg transition-all"
                                        >
                                            Actualiser les visions
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Logout */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"
                    >
                        <LogOut size={18} />
                    </motion.button>
                </div>
            </div>
        </header>
    );
};

const Loader = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default Header;
