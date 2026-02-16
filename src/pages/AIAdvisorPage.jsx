import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Sparkles, TrendingUp,
    Target, Globe, Loader, ScrollText, Trash2,
    Zap, ShieldAlert, Coins, History, Menu, Plus, X, MessageSquare, Sword, Flame
} from 'lucide-react';
import { useAuthStore } from '../store';
import { chatWithAI, getFinancialAdvice, suggestGoals, getMarketInsights } from '../services/aiService';
import { getBalances } from '../services/balanceService';
import { getTransactions } from '../services/transactionService';
import { getGoals } from '../services/goalService';
import { getDebts } from '../services/debtService';
import toast from 'react-hot-toast';

const AIAdvisorPage = () => {
    const { user } = useAuthStore();
    const [sessions, setSessions] = useState(() => {
        const saved = localStorage.getItem(`ai_sessions_${user?.id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [currentSessionId, setCurrentSessionId] = useState(() => {
        const saved = localStorage.getItem(`ai_current_session_id_${user?.id}`);
        return saved || null;
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR') + ' FCFA';

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
        <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-40px)] overflow-hidden relative pt-6 px-4">

            {/* SIDEBAR - Archives Chamber */}
            <AnimatePresence>
                {(isSidebarOpen || window.innerWidth > 1024) && (
                    <motion.div
                        initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                        className={`fixed lg:relative z-50 w-80 h-full bg-slate-950/80 backdrop-blur-3xl border-r border-amber-500/10 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'left-0' : '-left-full lg:left-0'}`}
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-[10px] font-ancient font-black uppercase tracking-[0.3em] text-amber-500/80 flex items-center gap-2">
                                <History size={14} /> CHAMBRE DES ARCHIVES
                            </h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="p-4">
                            <button onClick={createNewSession} className="btn-empire-primary w-full flex items-center justify-center gap-2 py-3 text-[10px]">
                                <Plus size={16} /> NOUVELLE VISION
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                            {sessions.map(s => (
                                <div
                                    key={s.id} onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
                                    className={`group flex items-center justify-between p-4 rounded-tr-xl rounded-bl-xl border text-[11px] font-ancient transition-all ${currentSessionId === s.id
                                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                                        : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-white hover:border-amber-500/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <ScrollText size={14} className={currentSessionId === s.id ? 'text-slate-950' : 'text-slate-700'} />
                                        <span className="truncate uppercase tracking-wider">{s.title}</span>
                                    </div>
                                    <button onClick={(e) => deleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-opacity">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN ORACLE PANEL */}
            <div className="flex-1 flex flex-col h-full bg-slate-950/20">

                {/* Visual Status Bar */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-amber-500/10 bg-slate-950/80 backdrop-blur-xl z-10 overflow-hidden">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-amber-500 lg:hidden transition-colors"><Menu size={20} /></button>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-amber-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="w-10 h-10 rounded-full bg-slate-950 border border-amber-500/50 flex items-center justify-center relative">
                                <Bot size={20} className="text-amber-500" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-sm font-ancient font-black uppercase tracking-[0.4em] text-white">L'Oracle de Shadoron</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Consultation Impériale Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 hidden md:flex">
                        <div className="text-right">
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Empire Capital</div>
                            <div className="text-sm font-mono font-black text-amber-500">{userData ? formatCurrency(userData.totalBalance) : '...'}</div>
                        </div>
                        <ShieldAlert className="text-slate-800" size={24} />
                    </div>
                </div>

                {/* Chat Feed - Holographic Style */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
                    <AnimatePresence initial={false}>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i} initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[95%] lg:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${m.role === 'user'
                                        ? 'bg-slate-900 border border-white/10 text-slate-500'
                                        : 'bg-amber-500 text-slate-950'
                                        }`}>
                                        {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>

                                    <div className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-6 rounded-tr-3xl rounded-bl-3xl border transition-all duration-500 relative ${m.role === 'user'
                                            ? 'bg-slate-900 border-white/10 text-slate-200'
                                            : 'bg-slate-950/80 border-amber-500/30 text-white shadow-2xl shadow-amber-900/10'
                                            }`}>
                                            {!(m.role === 'user') && <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />}
                                            <div className="relative z-10 text-[13px] leading-relaxed tracking-wide">
                                                {renderContent(m.content)}
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold font-mono text-slate-700 px-1 uppercase">
                                            Transmission {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex justify-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-pulse"><Loader size={16} className="text-slate-950 animate-spin" /></div>
                            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-tr-3xl rounded-bl-3xl">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Control Center */}
                <div className="p-6 bg-slate-950 border-t border-white/5 z-20">
                    <div className="max-w-4xl mx-auto space-y-4">

                        {/* Tactical Quick Actions */}
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            <ActionBtn icon={<Flame size={14} />} label="CONSEIL SUPRÊME" onClick={() => handleSendMessage(null, "Donne-moi un conseil financier prioritaire.")} />
                            <ActionBtn icon={<Sword size={14} />} label="SITUATION D'EMPIRE" onClick={() => handleSendMessage(null, "Analyse l'état global de mes finances.")} />
                            <ActionBtn icon={<ShieldAlert size={14} />} label="MENACE DETTES" onClick={() => handleSendMessage(null, "Analyse mes dettes et le plan d'attaque.")} />
                            <ActionBtn icon={<Target size={14} />} label="FRONTS ACTIFS" onClick={() => handleSendMessage(null, "Fais le point sur mes objectifs de conquête.")} />
                        </div>

                        <form onSubmit={handleSendMessage} className="relative group">
                            <div className="absolute -inset-1 bg-amber-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                            <input
                                type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="INTERROGER L'ORACLE..."
                                className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-5 pr-16 text-[11px] font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500/40 transition-all text-white placeholder-slate-800 uppercase"
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                type="submit" disabled={!inputMessage.trim() || isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xl disabled:opacity-20 transition-all"
                            >
                                <Send size={20} />
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
