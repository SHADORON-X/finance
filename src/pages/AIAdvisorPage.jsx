import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Sparkles, TrendingUp,
    Target, Globe, Loader, ScrollText, Trash2,
    Zap, ShieldAlert, Coins, History, Menu, Plus, X, MessageSquare
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

    // Get current session messages
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
            content: `🏛️ **SALUTATIONS, GUERRIER.**\n\nJe suis l'Oracle. Ton empire pèse actuellement **${formatCurrency(data.totalBalance)}**. Je suis prêt à analyser tes objectifs et tes dettes.\n\nQuelle est ta requête ?`,
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
        if (!confirm("Effacer cette conversation de l'histoire ?")) return;

        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);

        if (currentSessionId === id) {
            if (newSessions.length > 0) {
                setCurrentSessionId(newSessions[0].id);
            } else {
                createNewSession();
            }
        }
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

        // Update local session messages
        const updatedSessions = sessions.map(s => {
            if (s.id === currentSessionId) {
                const newMessages = [...s.messages, newUserMessage];
                // Update title based on first user message if it's the default
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

            const assistantMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };

            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    return { ...s, messages: [...s.messages, assistantMessage], lastUpdated: new Date().toISOString() };
                }
                return s;
            }));
        } catch (error) {
            toast.error("L'Oracle est silencieux...");
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = (content) => {
        return content.split('\n').map((line, i) => {
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400 font-bold">$1</strong>');
            return <p key={i} className="mb-1 min-h-[1em]" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
        });
    };

    return (
        <div className="flex h-[calc(100vh-130px)] lg:h-[calc(100vh-20px)] overflow-hidden relative">
            {/* SIDEBAR - Desktop: persistent, Mobile: drawer */}
            <AnimatePresence>
                {(isSidebarOpen || window.innerWidth > 1024) && (
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        className={`fixed lg:relative z-50 w-72 h-full bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'left-0' : '-left-full lg:left-0'
                            }`}
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                                <History size={14} className="text-amber-500" />
                                Archives
                            </h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="p-3">
                            <button
                                onClick={createNewSession}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs transition-all shadow-lg shadow-amber-900/10"
                            >
                                <Plus size={16} /> Nouvelle Session
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                            {sessions.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
                                    className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer border text-[11px] transition-all ${currentSessionId === s.id
                                        ? 'bg-slate-900 border-amber-500/20 text-white'
                                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/30 hover:text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <MessageSquare size={14} className={currentSessionId === s.id ? 'text-amber-500' : 'text-slate-600'} />
                                        <span className="truncate">{s.title}</span>
                                    </div>
                                    <button
                                        onClick={(e) => deleteSession(e, s.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col h-full bg-slate-950/20 relative">
                {/* Header Compact */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-1.5 -ml-1 text-slate-400 hover:bg-slate-800 rounded-lg lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-900/40">
                                <Bot size={18} className="text-slate-900" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xs font-black uppercase tracking-widest text-white leading-tight">L'Oracle</h1>
                            <div className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Esprit de Babylone</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zone de Chat - Optimisée Espace */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 no-scrollbar pb-40">
                    <AnimatePresence initial={false}>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-2.5 max-w-[95%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md ${m.role === 'user'
                                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        }`}>
                                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>

                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${m.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                                            }`}>
                                            {renderContent(m.content)}
                                        </div>
                                        <span className={`text-[9px] text-slate-600 font-bold px-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start gap-2.5"
                        >
                            <div className="w-7 h-7 rounded-full bg-amber-500/5 flex items-center justify-center border border-amber-500/10">
                                <Loader size={14} className="text-amber-500 animate-spin" />
                            </div>
                            <div className="px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-xl rounded-tl-none">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-amber-500/30 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-amber-500/30 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-amber-500/30 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Collée en bas pour mobile */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-20">
                    {/* Horizontal Suggestions Compacts */}
                    <div className="flex gap-1.5 overflow-x-auto pb-3 no-scrollbar">
                        <QuickAction
                            icon={<Zap size={12} />}
                            label="Conseil"
                            onClick={() => handleSendMessage(null, "Donne-moi un conseil financier prioritaire.")}
                        />
                        <QuickAction
                            icon={<Target size={12} />}
                            label="Objectifs"
                            onClick={() => handleSendMessage(null, "Fais le point sur mes objectifs.")}
                        />
                        <QuickAction
                            icon={<ShieldAlert size={12} />}
                            label="Dettes"
                            onClick={() => handleSendMessage(null, "Analyse mon plan de désendettement.")}
                        />
                    </div>

                    <form onSubmit={handleSendMessage} className="relative group">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Interroger l'Oracle..."
                            className="w-full bg-slate-900/90 border border-slate-700/50 rounded-xl px-4 py-3.5 pr-12 text-[13px] focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder-slate-600 shadow-xl"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || isLoading}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-lg disabled:opacity-30 transition-all"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const QuickAction = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-400 hover:text-amber-400 hover:border-amber-500/30 whitespace-nowrap transition-all active:scale-95 shadow-lg"
    >
        {icon}
        {label}
    </button>
);

export default AIAdvisorPage;
