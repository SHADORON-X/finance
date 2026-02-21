import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Sparkles, TrendingUp,
    Target, Globe, Loader, ScrollText, Trash2,
    Zap, ShieldAlert, Coins, History, Menu, Plus, X, MessageSquare, Sword, Flame
} from 'lucide-react';
import { useAuthStore } from '../store';
import { useCurrency } from '../hooks/useCurrency';
import { chatWithAI, getFinancialAdvice, suggestGoals, getMarketInsights } from '../services/aiService';
import { getBalances } from '../services/balanceService';
import { getTransactions } from '../services/transactionService';
import { getGoals } from '../services/goalService';
import { getDebts } from '../services/debtService';
import toast from 'react-hot-toast';

const AIAdvisorPage = () => {
    const { user } = useAuthStore();
    const { formatCurrency } = useCurrency();
    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem(`ai_sessions_${user?.id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [currentSessionId, setCurrentSessionId] = useState(() => {
        const saved = localStorage.getItem(`ai_current_session_id_${user?.id}`);
        return saved || null;
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const messagesEndRef = useRef(null);

    const currentSession = sessions.find(s => s.id === currentSessionId);
    const messages = currentSession?.messages || [];

    useEffect(() => {
        if (sessions.length === 0) {
            createNewSession();
        } else if (!currentSessionId) {
            setCurrentSessionId(sessions[0].id);
        }
        loadData();
    }, []);

    useEffect(() => {
        scrollToBottom();
        if (sessions.length > 0) {
            localStorage.setItem(`ai_sessions_${user?.id}`, JSON.stringify(sessions));
        }
        if (currentSessionId) {
            localStorage.setItem(`ai_current_session_id_${user?.id}`, currentSessionId);
        }
    }, [sessions, currentSessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadData = async () => {
        try {
            const data = await gatherUserData();
            setUserData(data);
        } catch (error) {
            console.error('Data load error:', error);
        }
    };

    const createNewSession = async () => {
        const newId = Date.now().toString();
        const data = userData || await gatherUserData();

        const welcomeMessage = {
            role: 'assistant',
            content: `🏛️ **SALUTATIONS, MONARQUE.**\n\nL'Oracle est prêt. Ton empire pèse actuellement **${formatCurrency(data.totalBalance)}**. Je scrute les ombres pour protéger tes intérêts.\n\nQuelle vérité cherches-tu aujourd'hui ?`,
            timestamp: new Date().toISOString()
        };

        const newSession = {
            id: newId,
            title: "Nouvelle Consultation",
            messages: [welcomeMessage],
            lastUpdated: new Date().toISOString()
        };

        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        setIsSidebarOpen(false);
    };

    const deleteSession = (e, id) => {
        e.stopPropagation();
        if (!confirm("Effacer cette vision de l'histoire ?")) return;
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        if (currentSessionId === id && newSessions.length > 0) setCurrentSessionId(newSessions[0].id);
        else if (newSessions.length === 0) createNewSession();
    };

    const gatherUserData = async () => {
        const [balances, transactions, goals, debts] = await Promise.all([
            getBalances(user.id),
            getTransactions(user.id, 20),
            getGoals(user.id),
            getDebts(user.id)
        ]);
        const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);
        return { totalBalance, transactions, goals, debts };
    };

    const handleSendMessage = async (e, customMessage = null) => {
        if (e) e.preventDefault();
        const msg = customMessage || inputMessage.trim();
        if (!msg || isLoading || !currentSessionId) return;

        if (!customMessage) setInputMessage('');
        const newUserMessage = { role: 'user', content: msg, timestamp: new Date().toISOString() };

        const updatedSessions = sessions.map(s => {
            if (s.id === currentSessionId) {
                const newMessages = [...s.messages, newUserMessage];
                const newTitle = s.title === "Nouvelle Consultation" ? (msg.slice(0, 30) + (msg.length > 30 ? '...' : '')) : s.title;
                return { ...s, messages: newMessages, title: newTitle, lastUpdated: new Date().toISOString() };
            }
            return s;
        });
        setSessions(updatedSessions);
        setIsLoading(true);

        try {
            const data = userData || await gatherUserData();
            const sessionToUpdate = updatedSessions.find(s => s.id === currentSessionId);
            const history = sessionToUpdate.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
            const response = await chatWithAI(msg, history, data);

            const assistantMessage = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) return { ...s, messages: [...s.messages, assistantMessage], lastUpdated: new Date().toISOString() };
                return s;
            }));
        } catch (error) {
            toast.error("L'Oracle est plongé dans le silence...");
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = (content) => {
        return content.split('\n').map((line, i) => {
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-500 font-bold">$1</strong>');
            return <p key={i} className="mb-2 min-h-[1.2em] font-ancient" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
        });
    };

    return (
        <div className="relative flex h-[calc(100vh-200px)] md:h-[calc(100vh-130px)] overflow-hidden rounded-2xl border border-white/5 bg-slate-950/30">

            {/* ====== SIDEBAR - Toujours visible sur desktop, overlay sur mobile ====== */}

            {/* Overlay (mobile) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar — absolute dans le conteneur, slide in/out */}
            <div
                className={`
                    absolute top-0 left-0 h-full z-30 w-64
                    flex flex-col flex-shrink-0
                    bg-slate-950 border-r border-amber-500/10
                    transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header de la sidebar */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-[10px] font-ancient font-black uppercase tracking-[0.3em] text-amber-500/80 flex items-center gap-2">
                        <History size={13} /> ARCHIVES
                    </h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        title="Fermer les archives"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Bouton nouvelle session */}
                <div className="p-3 flex-shrink-0">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-500 rounded-xl text-[10px] font-ancient font-black uppercase tracking-widest transition-all"
                    >
                        <Plus size={14} /> NOUVELLE VISION
                    </button>
                </div>

                {/* Liste des sessions */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                    {sessions.length === 0 && (
                        <p className="text-center text-[9px] text-slate-700 uppercase font-bold tracking-widest py-6">Aucune archive</p>
                    )}
                    {sessions.map(s => (
                        <div
                            key={s.id}
                            onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
                            className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer text-[10px] font-ancient transition-all ${currentSessionId === s.id
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60 hover:border-amber-500/20'
                                }`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden min-w-0">
                                <ScrollText size={12} className={`flex-shrink-0 ${currentSessionId === s.id ? 'text-slate-950' : 'text-slate-600'}`} />
                                <span className="truncate uppercase tracking-wide text-[9px]">{s.title}</span>
                            </div>
                            <button
                                onClick={(e) => deleteSession(e, s.id)}
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-opacity ml-1"
                            >
                                <Trash2 size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ====== PANNEAU PRINCIPAL DE L'ORACLE ====== */}
            {/* Le margin-left suit l'état de la sidebar pour libérer/occuper l'espace */}
            <div
                className={`
                    flex-1 flex flex-col min-w-0 overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}
                `}
            >

                {/* Barre de statut */}
                <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between border-b border-amber-500/10 bg-slate-950/80 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        {/* Bouton hamburger — visible quand la sidebar est fermée */}
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-1 text-slate-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-slate-800"
                                title="Ouvrir les archives"
                            >
                                <Menu size={18} />
                            </button>
                        )}
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500 blur-md opacity-20"></div>
                            <div className="w-9 h-9 rounded-full bg-slate-950 border border-amber-500/50 flex items-center justify-center relative">
                                <Bot size={18} className="text-amber-500" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xs font-ancient font-black uppercase tracking-[0.3em] text-[var(--text-main)]">L'Oracle de Shadoron</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Empire Capital</div>
                            <div className="text-sm font-mono font-black text-amber-500">{userData ? formatCurrency(userData.totalBalance) : '...'}</div>
                        </div>
                    </div>
                </div>

                {/* Zone de chat — défilable */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 no-scrollbar">
                    <AnimatePresence initial={false}>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-3 max-w-[90%] lg:max-w-[78%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${m.role === 'user'
                                        ? 'bg-slate-800 border border-white/10 text-slate-400'
                                        : 'bg-amber-500 text-slate-950'
                                        }`}>
                                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>

                                    <div className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-5 py-4 rounded-2xl border relative ${m.role === 'user'
                                            ? 'bg-slate-800 border-white/10 text-slate-200'
                                            : 'bg-slate-950 border-amber-500/20 text-white'
                                            }`}>
                                            {m.role !== 'user' && (
                                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                                            )}
                                            <div className="text-[12px] leading-relaxed">
                                                {renderContent(m.content)}
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-mono text-slate-700 px-1 uppercase">
                                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex justify-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                                <Loader size={14} className="text-slate-950 animate-spin" />
                            </div>
                            <div className="px-5 py-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                                    <div className="w-2 h-2 bg-amber-500/50 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="flex-shrink-0 p-4 bg-slate-950/90 border-t border-white/5">
                    <div className="space-y-3 max-w-4xl mx-auto">
                        {/* Actions rapides */}
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <ActionBtn icon={<Flame size={12} />} label="CONSEIL" onClick={() => handleSendMessage(null, "Donne-moi un conseil financier prioritaire.")} />
                            <ActionBtn icon={<Sword size={12} />} label="SITUATION" onClick={() => handleSendMessage(null, "Analyse l'état global de mes finances.")} />
                            <ActionBtn icon={<ShieldAlert size={12} />} label="DETTES" onClick={() => handleSendMessage(null, "Analyse mes dettes et le plan d'attaque.")} />
                            <ActionBtn icon={<Target size={12} />} label="OBJECTIFS" onClick={() => handleSendMessage(null, "Fais le point sur mes objectifs de conquête.")} />
                        </div>

                        {/* Champ de saisie */}
                        <form onSubmit={handleSendMessage} className="relative">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Interroger l'Oracle..."
                                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500/50 rounded-xl px-5 py-4 pr-14 text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-20 text-slate-950 rounded-lg transition-all"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionBtn = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 px-6 py-3 bg-slate-900/80 border border-white/5 rounded-tr-xl rounded-bl-xl text-[9px] font-ancient font-black text-slate-500 hover:text-amber-500 hover:border-amber-500/30 whitespace-nowrap transition-all active:scale-95 uppercase tracking-widest shadow-xl"
    >
        <span className="text-amber-500/40">{icon}</span>
        {label}
    </button>
);

export default AIAdvisorPage;
