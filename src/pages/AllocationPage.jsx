import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, TrendingUp, Utensils, Wrench, Sparkles,
    Crown, CheckCircle2, AlertCircle, Zap, ScrollText,
    Flame, Gem, Plus, Trash2, ChevronDown, ChevronUp,
    ArrowRight, Info, Lock, Unlock, Target, Wifi,
    Brain, Bus, Music, Edit3, X, Save, RotateCcw, Settings, Sliders
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getCategories, updateCategory, createCategory, deleteCategory } from '../services/balanceService';
import { createIncome } from '../services/transactionService';
import {
    loadBudgetConfig,
    saveBudgetConfig,
    updateCategoryPercent,
    updateCategoryField,
    updateProfilField,
    getTotalPercent,
    distributeAmount as distributeBudget,
    distributeSurplus,
    getCategoriesByBloc,
    getBlocPercents,
    resetBudgetConfig,
    DEFAULT_BUDGET_CONFIG,
    BLOC_META,
} from '../services/budgetConfigService';
import toast from 'react-hot-toast';
import { useCurrency } from '../hooks/useCurrency';

// ── Color map (style seulement, pas de logique business) ─────────────────
const COLOR_MAP = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500', bar: 'bg-blue-500' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500', bar: 'bg-amber-500' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500', bar: 'bg-emerald-500' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500', bar: 'bg-orange-500' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500', bar: 'bg-rose-500' },
};


export default function AllocationPage() {
    const { formatCurrency: fmt } = useCurrency();
    const { user } = useAuthStore();

    // ── Config budgétaire dynamique (Supabase + localStorage) ─────────────────
    const [budgetConfig, setBudgetConfig] = useState(DEFAULT_BUDGET_CONFIG);
    const [editingBlueprint, setEditingBlueprint] = useState(false); // mode édition %

    // Chargement initial
    useEffect(() => {
        if (user) {
            loadBudgetConfig(user.id).then(config => {
                setBudgetConfig(config);
            });
        }
    }, [user]);

    // Helper : met à jour le % d'une catégorie et persiste
    const handleUpdatePercent = useCallback(async (key, val) => {
        const next = updateCategoryPercent(budgetConfig, key, Number(val));
        const saved = await saveBudgetConfig(next, user.id);
        setBudgetConfig(saved);
    }, [budgetConfig, user]);

    // Helper : met à jour un champ de catégorie et persiste
    const handleUpdateCatField = useCallback(async (key, field, val) => {
        const next = updateCategoryField(budgetConfig, key, field, val);
        const saved = await saveBudgetConfig(next, user.id);
        setBudgetConfig(saved);
    }, [budgetConfig, user]);

    // Helper : met à jour le profil
    const handleUpdateProfil = useCallback(async (field, val) => {
        const next = updateProfilField(budgetConfig, field, val);
        const saved = await saveBudgetConfig(next, user.id);
        setBudgetConfig(saved);
    }, [budgetConfig, user]);

    // Onglets
    const [activeTab, setActiveTab] = useState('blueprint'); // blueprint | configure | simulate | distribute

    // Données utilisateur
    const [categories, setCategories] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);

    // Simulateur de revenu — vient de la config
    const [simulatedIncome, setSimulatedIncome] = useState('');
    const baseIncome = budgetConfig.profil.basePrudente;

    // Distribution
    const [distributeAmount, setDistributeAmount] = useState('');
    const [distributing, setDistributing] = useState(false);

    // Edition catégorie
    const [editingCat, setEditingCat] = useState(null);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('📦');
    const [newCatPercent, setNewCatPercent] = useState(0);
    const [showAddCat, setShowAddCat] = useState(false);
    const [savingPercent, setSavingPercent] = useState(false);

    // Mentalité Stratège — Distribution
    const [incomeType, setIncomeType] = useState(null); // 'business' | 'sale' | 'service' | 'bonus'
    const [checkedMindset, setCheckedMindset] = useState([]); // ids des cases cochées
    const [revealDistrib, setRevealDistrib] = useState(false);

    useEffect(() => {
        if (user) loadCategories();
    }, [user]);

    const loadCategories = async () => {
        try {
            const data = await getCategories(user.id);
            setCategories(data);
        } catch (e) {
            toast.error("Erreur chargement des secteurs");
        } finally {
            setLoadingCats(false);
        }
    };

    const totalPercent = categories.reduce((s, c) => s + (c.percent || 0), 0);

    const handleUpdateCatPercent = async (id, val) => {
        const p = parseFloat(val) || 0;
        setCategories(prev => prev.map(c => c.id === id ? { ...c, percent: p } : c));
        setSavingPercent(true);
        try {
            await updateCategory(id, user.id, { percent: p });
        } catch (e) {
            toast.error("Erreur de mise à jour");
        } finally {
            setSavingPercent(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return toast.error("Nom requis");
        try {
            const cat = await createCategory(user.id, { name: newCatName, icon: newCatIcon, percent: newCatPercent });
            setCategories(prev => [...prev, cat]);
            setNewCatName(''); setNewCatIcon('📦'); setNewCatPercent(0);
            setShowAddCat(false);
            toast.success(`Secteur "${cat.name}" créé !`);
        } catch (e) {
            toast.error("Erreur création secteur");
        }
    };

    const handleDeleteCategory = async (id, name) => {
        if (!confirm(`Supprimer le secteur "${name}" ?`)) return;
        try {
            await deleteCategory(id, user.id);
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success("Secteur supprimé");
        } catch (e) {
            toast.error("Erreur suppression");
        }
    };

    const handleDistributeRevenue = async () => {
        const val = parseFloat(distributeAmount);
        if (isNaN(val) || val <= 0) return toast.error("Montant invalide");
        if (Math.abs(totalPercent - 100) > 0.5) return toast.error(`Total des % doit être 100% (actuellement ${totalPercent}%)`);

        setDistributing(true);
        try {
            const catsWithPercent = categories.filter(c => c.percent > 0);
            await createIncome(user.id, val, catsWithPercent);
            toast.success(`${fmt(val)} distribués dans ${catsWithPercent.length} secteurs !`);
            setDistributeAmount('');
        } catch (e) {
            toast.error("Erreur de distribution");
        } finally {
            setDistributing(false);
        }
    };

    // ── Calcul simulateur (DYNAMIQUE) ──────────────────────────────
    const simAmount = parseFloat(simulatedIncome) || baseIncome;
    const surplus = Math.max(0, simAmount - baseIncome);
    const surplusDistrib = distributeSurplus(budgetConfig, surplus);

    const blueprintDistrib = distributeBudget(budgetConfig, baseIncome).map(sub => ({
        ...sub,
        blocColor: BLOC_META[sub.bloc]?.color || 'amber',
        amount: Math.round(baseIncome * sub.percent / 100),
    }));

    return (
        <div className="min-h-screen pb-32 fade-in">
            {/* ── HERO ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden px-4 pt-10 pb-8 mb-8 max-w-6xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="relative z-10 text-center space-y-3">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
                        <Gem size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Chambre des Lois Budgétaires</span>
                    </div>
                    <h1 className="heading-gold text-4xl lg:text-5xl">L'Allocation Impériale</h1>
                    <p className="font-ancient text-slate-500 text-[10px] tracking-[0.25em] uppercase max-w-xl mx-auto">
                        Un opérateur transforme les pics de revenus en actifs. Jamais en dépenses.
                    </p>

                    {/* Profil opérateur (Dynamique) */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/5 border border-rose-500/15 rounded-full mt-1">
                        <span className="text-[9px] font-black text-rose-400/70 uppercase tracking-widest">⚔️ {budgetConfig.profil.situation}</span>
                    </div>

                    {/* Proportions clés (Dynamiques) */}
                    {(() => {
                        const percents = getBlocPercents(budgetConfig);
                        return (
                            <div className="flex items-center justify-center gap-6 pt-3">
                                {[
                                    { label: 'Forteresse', val: `${percents.security}%`, sub: 'Sécurité & Urgence', color: 'text-blue-400' },
                                    { label: 'Croissance', val: `${percents.growth}%`, sub: 'Business & Skills', color: 'text-amber-400' },
                                    { label: 'Vie', val: `${percents.life}%`, sub: 'Nourriture & Vie', color: 'text-emerald-400' },
                                ].map(s => (
                                    <div key={s.label} className="text-center">
                                        <div className={`text-2xl font-ancient font-black ${s.color}`}>{s.val}</div>
                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
                                        <div className="text-[7px] text-slate-700 font-bold mt-0.5 max-w-[110px]">{s.sub}</div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* Règle d'or (Dynamique) */}
                    <div className="max-w-xl mx-auto mt-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
                        <p className="text-[9px] font-black text-amber-400/80 uppercase tracking-wider">
                            🔥 {budgetConfig.profil.regleOr}
                        </p>
                    </div>
                </div>
            </div>


            {/* ── TABS ─────────────────────────────────────────── */}
            <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-white/5 mb-8">
                <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
                    {[
                        { id: 'blueprint', label: 'Blueprint', icon: <ScrollText size={16} /> },
                        { id: 'simulate', label: 'Simuler', icon: <Zap size={16} /> },
                        { id: 'settings', label: 'Paramètres', icon: <Settings size={16} /> },
                        { id: 'configure', label: 'Secteurs', icon: <Wrench size={16} /> },
                        { id: 'distribute', label: 'Distribuer', icon: <Flame size={16} /> },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-4 text-[9px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-600 hover:text-slate-400'}`}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

            </div>

            <div className="max-w-6xl mx-auto px-4">
                <AnimatePresence mode="wait">

                    {/* ══════════════════════════════════════════════
                        TAB 1 — BLUEPRINT (Les 4 blocs)
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'blueprint' && (
                        <motion.div key="blueprint" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                            {/* Règle fondamentale */}
                            <div className="card-warrior p-6 bg-amber-500/5 border-amber-500/20">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 shrink-0"><Crown size={24} /></div>
                                    <div>
                                        <h2 className="font-ancient font-black text-amber-500 uppercase tracking-widest text-sm mb-1">Règle Fondamentale</h2>
                                        <p className="font-ancient text-slate-300 text-xs leading-relaxed">
                                            Quand ton revenu est variable, tu dois structurer <strong className="text-white">4 enveloppes séparées</strong>.
                                            Sinon tu crois investir… mais tu improvises.
                                        </p>
                                        <p className="font-ancient text-slate-500 text-[10px] mt-2 italic">
                                            "Un opérateur transforme les pics en actifs — jamais en dépenses."
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Les 3 blocs — DYNAMIQUE via budgetConfig */}
                            {(() => {
                                const byBloc = getCategoriesByBloc(budgetConfig);
                                const blocPercents = getBlocPercents(budgetConfig);
                                const totalPct = getTotalPercent(budgetConfig);
                                const colors_arr = ['blue', 'amber', 'emerald'];

                                return (
                                    <>
                                        {/* Barre de total */}
                                        <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest ${Math.abs(totalPct - 100) < 0.5
                                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                            }`}>
                                            <span>Total alloué</span>
                                            <span>{totalPct}% {Math.abs(totalPct - 100) < 0.5 ? '✓ Équilibré' : `⚠ ${totalPct > 100 ? '+' : ''}${totalPct - 100}% à ajuster`}</span>
                                        </div>

                                        {Object.entries(BLOC_META).map(([blocKey, meta], bi) => {
                                            const cats = byBloc[blocKey] || [];
                                            const blocPct = blocPercents[blocKey] || 0;
                                            const colors = COLOR_MAP[meta.color];
                                            return (
                                                <motion.div key={blocKey}
                                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: bi * 0.1 }}
                                                    className={`card-warrior p-6 ${colors.bg} ${colors.border}`}>
                                                    {/* Bloc header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl ${colors.badge} flex items-center justify-center text-slate-950 text-2xl`}>
                                                                {meta.icon}
                                                            </div>
                                                            <div>
                                                                <h2 className={`font-ancient font-black text-sm uppercase tracking-widest ${colors.text}`}>{meta.label}</h2>
                                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{meta.subtitle}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => setEditingBlueprint(e => !e)}
                                                                className={`p-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${editingBlueprint
                                                                    ? `${colors.badge} text-slate-950 border-transparent`
                                                                    : `border-slate-800 text-slate-600 hover:${colors.text} hover:border-slate-600`
                                                                    }`}>
                                                                <Sliders size={14} />
                                                            </button>
                                                            <div className={`text-4xl font-ancient font-black ${colors.text}`}>{blocPct}%</div>
                                                        </div>
                                                    </div>

                                                    <p className="text-[10px] text-slate-500 font-bold mb-4 border-l-2 border-white/10 pl-3">{meta.description}</p>

                                                    {/* Sous-catégories */}
                                                    <div className="space-y-2.5">
                                                        {cats.map(cat => (
                                                            <div key={cat.key} className="flex items-center gap-4 p-4 bg-slate-950/40 rounded-xl border border-white/5">
                                                                <span className="text-2xl shrink-0">{cat.icon}</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-ancient font-black text-white text-[10px] uppercase tracking-wider">{cat.name}</span>
                                                                        {cat.locked && <Lock size={10} className="text-amber-500" />}
                                                                    </div>
                                                                    <p className="text-[9px] text-slate-600 leading-relaxed">{cat.description}</p>
                                                                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                                                        <motion.div className={`h-full ${colors.bar} rounded-full`}
                                                                            animate={{ width: `${blocPct > 0 ? (cat.percent / blocPct) * 100 : 0}%` }}
                                                                            transition={{ duration: 0.5 }} />
                                                                    </div>
                                                                </div>
                                                                {/* % — éditable si mode édition */}
                                                                {editingBlueprint && !cat.locked ? (
                                                                    <input
                                                                        type="number" min="0" max="100"
                                                                        value={cat.percent}
                                                                        onChange={e => handleUpdatePercent(cat.key, e.target.value)}
                                                                        className={`w-16 bg-slate-950 border ${colors.border} rounded-xl text-center font-mono font-black text-sm ${colors.text} outline-none focus:ring-1 py-1.5`}
                                                                    />
                                                                ) : (
                                                                    <div className={`text-xl font-ancient font-black ${colors.text} min-w-[3rem] text-right`}>
                                                                        {cat.percent}%
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Total bloc */}
                                                    <div className={`mt-4 flex justify-between items-center text-[9px] font-black uppercase tracking-widest border-t ${colors.border} pt-4`}>
                                                        <span className="text-slate-600">Base {fmt(baseIncome)}</span>
                                                        <span className={colors.text}>{fmt(baseIncome * blocPct / 100)}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {/* Bouton reset */}
                                        {editingBlueprint && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                className="flex justify-between gap-3">
                                                <button onClick={() => { setBudgetConfig(resetBudgetConfig()); setEditingBlueprint(false); toast.success('Config réinitialisée'); }}
                                                    className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:border-rose-500/30 hover:text-rose-400 transition-all flex items-center justify-center gap-2">
                                                    <RotateCcw size={13} /> Réinitialiser
                                                </button>
                                                <button onClick={() => { setEditingBlueprint(false); toast.success('Pourcentages sauvegardés ✓'); }}
                                                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                                                    <Save size={13} /> Sauvegarder
                                                </button>
                                            </motion.div>
                                        )}
                                    </>
                                );
                            })()}


                            {/* ── MANIFESTE DE L'OPÉRATEUR — DYNAMIQUE ── */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                className="card-warrior p-6 bg-gradient-to-br from-amber-500/5 via-slate-900/50 to-purple-500/5 border border-amber-500/15">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 text-lg">👑</div>
                                    <div>
                                        <h3 className="font-ancient font-black text-amber-500 text-[11px] uppercase tracking-widest">Les {budgetConfig.lois.length} Lois de l'Opérateur</h3>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Gravées. Irrévocables. À réciter avant chaque décision.</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        'text-amber-400', 'text-blue-400', 'text-purple-400', 'text-rose-400', 'text-emerald-400',
                                        'text-sky-400', 'text-orange-400',
                                    ].slice(0, budgetConfig.lois.length).map((color, i) => {
                                        const law = budgetConfig.lois[i];
                                        const badgeColors = ['bg-amber-500/15', 'bg-blue-500/15', 'bg-purple-500/15', 'bg-rose-500/15', 'bg-emerald-500/15', 'bg-sky-500/15', 'bg-orange-500/15'];
                                        return (
                                            <div key={law.id} className={`flex items-start gap-4 p-3.5 rounded-xl ${badgeColors[i] || 'bg-slate-800/40'} border border-white/5`}>
                                                <div className={`text-[10px] font-black font-mono ${color} shrink-0 mt-0.5`}>0{i + 1}</div>
                                                <p className="text-[11px] text-slate-300 font-bold leading-relaxed">{law.text}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>


                            {/* Fonds Équipement (règle du surplus) */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="card-warrior p-6 bg-orange-500/5 border-orange-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-slate-950">
                                            <Wrench size={20} />
                                        </div>
                                        <div>
                                            <h2 className="font-ancient font-black text-sm uppercase tracking-widest text-orange-400">FONDS ÉQUIPEMENT</h2>
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Règle du Surplus — Revenu variable</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[9px] text-orange-500/60 font-black uppercase">Débloqué si</div>
                                        <div className="text-xs font-mono text-orange-400">Revenu &gt; Base</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl mb-4">
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                                        Tout revenu <span className="text-orange-400">au-dessus de la base prudente</span> est traité séparément.
                                        Ce surplus ne va <strong className="text-white">jamais</strong> dans les dépenses courantes.
                                    </p>
                                </div>

                                {/* Règle de répartition du surplus */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 bg-slate-950/60 rounded-xl border border-orange-500/10 text-center">
                                        <div className="text-2xl mb-1">🔧</div>
                                        <div className="text-xl font-ancient font-black text-orange-400">{budgetConfig.surplusRule.equipment}%</div>
                                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Équipement<br />& Opportunité</div>
                                    </div>
                                    <div className="p-4 bg-slate-950/60 rounded-xl border border-amber-500/10 text-center">
                                        <div className="text-2xl mb-1">📈</div>
                                        <div className="text-xl font-ancient font-black text-amber-400">{budgetConfig.surplusRule.business}%</div>
                                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Accélération<br />Business</div>
                                    </div>
                                    <div className="p-4 bg-slate-950/60 rounded-xl border border-blue-500/10 text-center">
                                        <div className="text-2xl mb-1">🔒</div>
                                        <div className="text-xl font-ancient font-black text-blue-400">{budgetConfig.surplusRule.savings}%</div>
                                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Épargne<br />Supplémentaire</div>
                                    </div>
                                </div>


                                <div className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-white/5">
                                    <p className="text-[9px] text-slate-500 font-bold text-center italic">
                                        ⚠️ Alerte psychologique : quand tu gagnes 200k en 2 jours, tu peux croire que "ça revient vite".<br />
                                        <span className="text-orange-400">Non. Les pics deviennent des actifs, pas des permissions de dépenser.</span>
                                    </p>
                                </div>

                                <button onClick={() => setActiveTab('simulate')}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500/10 transition-all">
                                    <Zap size={14} /> Simuler avec mon revenu réel <ArrowRight size={14} />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════
                        TAB 2 — SIMULATEUR
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'simulate' && (
                        <motion.div key="simulate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-6">

                            {/* Base de calcul */}
                            <div className="card-warrior p-6 bg-slate-900/60">
                                <h2 className="font-ancient font-black text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Target size={18} className="text-amber-500" /> Base Prudente Mensuelle
                                </h2>
                                <div className="flex items-center gap-3">
                                    <input type="number" value={baseIncome} onChange={e => setBaseIncome(parseFloat(e.target.value) || 0)}
                                        className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-2xl font-mono text-amber-500 outline-none focus:border-amber-500 transition-all text-center"
                                    />
                                    <div className="text-xs font-black text-slate-600 uppercase">Volume Base</div>
                                </div>
                                <p className="text-[9px] text-slate-600 text-center mt-2 font-bold uppercase tracking-widest">Conservateur. Même si tu fais 2x, tu pars de là.</p>
                            </div>

                            {/* Revenu réel du mois */}
                            <div className="card-warrior p-6 bg-slate-900/60 border-amber-500/20">
                                <h2 className="font-ancient font-black text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Flame size={18} className="text-amber-500" /> Revenu Réel Ce Mois
                                </h2>
                                <input type="number" value={simulatedIncome} onChange={e => setSimulatedIncome(e.target.value)}
                                    placeholder={baseIncome.toLocaleString('fr-FR')}
                                    className="w-full bg-slate-950 border-2 border-amber-500/30 rounded-2xl px-6 py-5 text-4xl font-mono text-white outline-none focus:border-amber-500 transition-all text-center placeholder-slate-800"
                                />
                            </div>

                            {/* Distribution de la base */}
                            <div className="card-warrior p-6 bg-slate-900/40">
                                <h3 className="font-ancient font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Shield size={14} /> Distribution Base ({fmt(baseIncome)})
                                </h3>
                                <div className="space-y-2">
                                    {blueprintDistrib.map((item, i) => {
                                        const colors = COLOR_MAP[item.blocColor];
                                        return (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl">
                                                <span className="text-lg w-8 text-center">{item.icon}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{item.name}</span>
                                                        <span className={`text-[10px] font-mono font-black ${colors.text}`}>{fmt(item.amount)}</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={`h-full ${colors.bar}`} style={{ width: `${item.percent}%` }} />
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-700 w-8 text-right">{item.percent}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Surplus */}
                            {surplus > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="card-warrior p-6 bg-orange-500/5 border-orange-500/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><Wrench size={20} /></div>
                                        <div>
                                            <h3 className="font-ancient font-black text-orange-400 text-sm uppercase tracking-widest">Surplus Détecté 🔥</h3>
                                            <p className="text-[9px] text-slate-600 font-bold">{fmt(simAmount)} - {fmt(baseIncome)} = <span className="text-orange-400">{fmt(surplus)}</span></p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl">
                                            <span className="text-xl">🔧</span>
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-white uppercase">Équipement & Opportunité</div>
                                                <div className="text-[9px] text-slate-600">Matériel tech, disque dur, logiciels</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-orange-400 font-mono font-black text-sm">{fmt(surplusDistrib.equipment)}</div>
                                                <div className="text-[8px] text-slate-700">{budgetConfig.surplusRule.equipment}%</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl">
                                            <span className="text-xl">📈</span>
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-white uppercase">Accélération Business</div>
                                                <div className="text-[9px] text-slate-600">Marketing, outils, expansion</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-amber-400 font-mono font-black text-sm">{fmt(surplusDistrib.business)}</div>
                                                <div className="text-[8px] text-slate-700">{budgetConfig.surplusRule.business}%</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl">
                                            <span className="text-xl">🔒</span>
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-white uppercase">Épargne Supplémentaire</div>
                                                <div className="text-[9px] text-slate-600">S'ajoute à la sécurité de base</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-blue-400 font-mono font-black text-sm">{fmt(surplusDistrib.savings)}</div>
                                                <div className="text-[8px] text-slate-700">{budgetConfig.surplusRule.savings}%</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-orange-500/10 flex justify-between text-[9px] font-black uppercase">
                                        <span className="text-slate-600">Total redistribué</span>
                                        <span className="text-orange-400">{fmt(surplusDistrib.equipment + surplusDistrib.business + surplusDistrib.savings)}</span>
                                    </div>
                                </motion.div>

                            )}

                            {surplus === 0 && simulatedIncome && parseFloat(simulatedIncome) > 0 && (
                                <div className="card-warrior p-5 bg-blue-500/5 border-blue-500/20 text-center">
                                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">
                                        Revenu dans la base — distribution standard appliquée.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════
                        TAB — PARAMÈTRES (PROFIL, SURPLUS, LOIS)
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-3xl mx-auto">

                            {/* ÉDITION PROFIL */}
                            <div className="card-warrior p-6 bg-slate-900/60 border-amber-500/20">
                                <h2 className="font-ancient font-black text-amber-400 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Gem size={18} /> Profil de l'Opérateur
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1.5 ml-1">Situation Actuelle</label>
                                        <input value={budgetConfig.profil.situation} onChange={e => handleUpdateProfil('situation', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-ancient outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1.5 ml-1">Règle d'Or (Mantra)</label>
                                        <input value={budgetConfig.profil.regleOr} onChange={e => handleUpdateProfil('regleOr', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 text-xs font-black uppercase outline-none focus:border-amber-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1.5 ml-1">Base Prudente</label>
                                            <input type="number" value={budgetConfig.profil.basePrudente} onChange={e => handleUpdateProfil('basePrudente', Number(e.target.value))}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-amber-500" />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1.5 ml-1">Alerte Seuil Vie</label>
                                            <input value={budgetConfig.profil.alerte} onChange={e => handleUpdateProfil('alerte', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-rose-400 text-xs font-bold outline-none focus:border-rose-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ÉDITION SURPLUS */}
                            <div className="card-warrior p-6 bg-slate-900/60 border-orange-500/20">
                                <h2 className="font-ancient font-black text-orange-400 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Wrench size={18} /> Règles de Redistribution du Surplus
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {['equipment', 'business', 'savings'].map(key => (
                                        <div key={key}>
                                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1.5 ml-1 text-center">
                                                {{ equipment: '🔧 Équipement', business: '📈 Business', savings: '🔒 Épargne' }[key]} (%)
                                            </label>
                                            <input type="number" value={budgetConfig.surplusRule[key]}
                                                onChange={async e => {
                                                    const next = { ...budgetConfig, surplusRule: { ...budgetConfig.surplusRule, [key]: Number(e.target.value) } };
                                                    const saved = await saveBudgetConfig(next, user.id);
                                                    setBudgetConfig(saved);
                                                }}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono text-center outline-none focus:border-orange-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ÉDITION LOIS */}
                            <div className="card-warrior p-6 bg-slate-900/60 border-purple-500/20">
                                <h2 className="font-ancient font-black text-purple-400 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <ScrollText size={18} /> Manifeste : Les Lois de l'Opérateur
                                </h2>
                                <div className="space-y-3">
                                    {budgetConfig.lois.map((law, i) => (
                                        <div key={law.id} className="flex gap-3">
                                            <div className="w-8 h-10 flex items-center justify-center text-[10px] font-black font-mono text-purple-500 bg-purple-500/10 rounded-lg shrink-0">
                                                0{i + 1}
                                            </div>
                                            <input value={law.text}
                                                onChange={async e => {
                                                    const nextLois = budgetConfig.lois.map(l => l.id === law.id ? { ...l, text: e.target.value } : l);
                                                    const next = { ...budgetConfig, lois: nextLois };
                                                    const saved = await saveBudgetConfig(next, user.id);
                                                    setBudgetConfig(saved);
                                                }}
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 text-slate-300 text-[11px] font-bold outline-none focus:border-purple-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={async () => {
                                const fresh = await resetBudgetConfig(user.id);
                                setBudgetConfig(fresh);
                                toast.success('Toutes les variables réinitialisées');
                            }}
                                className="w-full py-4 rounded-2xl border border-slate-800 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-rose-500/40 hover:text-rose-400 transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> Réinitialiser tout le système (Défaut Usine)
                            </button>
                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════
                        TAB 3 — CONFIGURER SES SECTEURS (DATABASE)
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'configure' && (
                        <motion.div key="configure" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                            {/* Indicateur total */}
                            <div className={`card-warrior p-5 flex items-center justify-between ${Math.abs(totalPercent - 100) < 0.5 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                <div className="flex items-center gap-4">
                                    {Math.abs(totalPercent - 100) < 0.5
                                        ? <CheckCircle2 className="text-emerald-500" size={28} />
                                        : <AlertCircle className="text-rose-500 animate-pulse" size={28} />
                                    }
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Pression Fiscale Totale</div>
                                        <div className={`text-3xl font-ancient font-black ${Math.abs(totalPercent - 100) < 0.5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {totalPercent.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {Math.abs(totalPercent - 100) < 0.5
                                        ? <span className="text-[9px] text-emerald-500 font-black uppercase">✓ VALIDÉ — EMPIRE PRÊT</span>
                                        : <span className="text-[9px] text-rose-500 font-black uppercase">⚠ Manque {(100 - totalPercent).toFixed(0)}%</span>
                                    }
                                </div>
                            </div>

                            {/* Liste des catégories */}
                            <div className="card-warrior p-6 bg-slate-900/60">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-ancient font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                                        <Wrench size={18} className="text-amber-500" /> Tes Secteurs ({categories.length})
                                    </h2>
                                    <button onClick={() => setShowAddCat(!showAddCat)}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all">
                                        {showAddCat ? <X size={14} /> : <Plus size={14} />}
                                        {showAddCat ? 'Annuler' : 'Nouveau Secteur'}
                                    </button>
                                </div>

                                {/* Formulaire ajout */}
                                <AnimatePresence>
                                    {showAddCat && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="mb-6 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
                                            <div className="grid grid-cols-3 gap-3 mb-3">
                                                <div>
                                                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Icône</label>
                                                    <input value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xl text-center outline-none focus:border-amber-500"
                                                        maxLength={2} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Nom du Secteur</label>
                                                    <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ex: Velmo Business"
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-ancient outline-none focus:border-amber-500 transition-all" />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">% d'Allocation</label>
                                                <input type="number" value={newCatPercent} onChange={e => setNewCatPercent(e.target.value)} min={0} max={100}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-500 font-mono font-black text-xl text-center outline-none focus:border-amber-500 transition-all" />
                                            </div>
                                            <button onClick={handleAddCategory}
                                                className="w-full btn-empire-primary py-3 text-sm">
                                                FORGER CE SECTEUR
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Grille des catégories */}
                                {loadingCats ? (
                                    <div className="flex justify-center py-10"><Gem className="animate-spin text-amber-500" size={32} /></div>
                                ) : (
                                    <div className="space-y-3">
                                        {categories.map(cat => (
                                            <div key={cat.id} className="flex items-center gap-4 p-4 bg-slate-950/40 border border-white/5 rounded-2xl hover:border-amber-500/20 transition-all group">
                                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-2xl">{cat.icon || '📦'}</div>
                                                <div className="flex-1">
                                                    <div className="font-ancient font-black text-white text-[10px] uppercase tracking-wider">{cat.name}</div>
                                                    {cat.is_locked && <div className="text-[8px] text-amber-500 flex items-center gap-1 mt-0.5"><Lock size={8} /> Verrouillé</div>}
                                                    {/* Barre visuelle */}
                                                    <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(cat.percent, 100)}%` }} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number" value={cat.percent} min={0} max={100}
                                                        onChange={(e) => handleUpdatePercent(cat.id, e.target.value)}
                                                        className="w-16 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-2 py-2 text-amber-500 font-mono font-black text-center text-sm outline-none transition-all"
                                                    />
                                                    <span className="text-slate-700 font-black">%</span>
                                                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-rose-500/50 hover:text-rose-500 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {categories.length === 0 && (
                                            <div className="text-center py-12 text-slate-700">
                                                <Wrench size={40} className="mx-auto mb-3 opacity-30" />
                                                <p className="font-ancient text-sm uppercase tracking-widest">Aucun secteur. Crée-en un.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Structure actuelle du Blueprint (Dynamique) */}
                            <div className="card-warrior p-6 bg-slate-900/40 border-slate-800">
                                <h3 className="font-ancient font-black text-slate-400 text-[9px] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Sparkles size={14} className="text-amber-500" /> Structure Actuelle du Blueprint
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {budgetConfig.categories.map(s => (
                                        <div key={s.key} className="flex items-center gap-2 p-2 bg-slate-950/40 rounded-lg">
                                            <span className="text-base">{s.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[8px] font-black text-slate-400 uppercase truncate">{s.name}</div>
                                            </div>
                                            <div className="text-[9px] font-mono text-amber-500 font-black">{s.percent}%</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex justify-between text-[9px] font-black uppercase tracking-widest border-t border-white/5 pt-3">
                                    <span className="text-slate-600">Total Blueprint</span>
                                    <span className={Math.abs(getTotalPercent(budgetConfig) - 100) < 0.5 ? 'text-emerald-500' : 'text-rose-500'}>
                                        {getTotalPercent(budgetConfig)}%
                                    </span>
                                </div>
                            </div>

                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════
                        TAB 4 — DISTRIBUER UN REVENU
                    ══════════════════════════════════════════════ */}
                    {activeTab === 'distribute' && (
                        <motion.div key="distribute" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="max-w-xl mx-auto space-y-6">

                            {/* ── Alerte psychologique immuable ── */}
                            <div className="card-warrior p-4 bg-rose-500/5 border-rose-500/20 flex items-start gap-3">
                                <div className="text-xl shrink-0 mt-0.5">⚠️</div>
                                <div>
                                    <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Piège du Pic de Revenu</div>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                        Quand tu gagnes vite (200k en 2 jours), tu peux croire <span className="text-rose-400">"ça revient vite"</span>.<br />
                                        Un opérateur alloue <strong className="text-white">avant</strong> de dépenser. Jamais après.
                                    </p>
                                </div>
                            </div>

                            {/* ── Qualification du revenu ── */}
                            <div className="card-warrior p-6 bg-slate-900/60">
                                <h3 className="font-ancient font-black text-slate-400 text-[9px] uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Target size={14} className="text-amber-500" /> Étape 1 — Qualifier ce revenu
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'business', label: 'Velmo / Business', icon: '🚀', desc: 'Vente de service ou produit Velmo' },
                                        { id: 'sale', label: 'Vente Directe', icon: '💰', desc: 'Revente SSD, matériel, service ponctuel' },
                                        { id: 'service', label: 'Prestation', icon: '🛠️', desc: 'Mission, freelance, service rendu' },
                                        { id: 'bonus', label: 'Pic / Inattendu', icon: '⚡', desc: 'Surplus non planifié → règle du surplus' },
                                    ].map(t => (
                                        <button key={t.id} onClick={() => setIncomeType(t.id)}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all ${incomeType === t.id
                                                ? 'bg-amber-500/10 border-amber-500/50'
                                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-600'
                                                }`}>
                                            <div className="text-2xl mb-1">{t.icon}</div>
                                            <div className={`font-ancient font-black text-[9px] uppercase tracking-widest ${incomeType === t.id ? 'text-amber-400' : 'text-slate-400'}`}>{t.label}</div>
                                            <div className="text-[8px] text-slate-600 mt-0.5">{t.desc}</div>
                                        </button>
                                    ))}
                                </div>
                                {incomeType === 'bonus' && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                                        <p className="text-[10px] text-orange-400 font-black leading-relaxed">
                                            🔥 Pic de revenu détecté. <strong>Règle du surplus active.</strong><br />
                                            Calcule ta base prudente dans l'onglet <span className="underline cursor-pointer" onClick={() => setActiveTab('simulate')}>Simuler</span>, puis reviens distribuer le surplus séparément.
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* ── Checklist Mentale avant exécution ── */}
                            {incomeType && incomeType !== 'bonus' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="card-warrior p-6 bg-slate-900/60">
                                    <h3 className="font-ancient font-black text-slate-400 text-[9px] uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Brain size={14} className="text-purple-400" /> Étape 2 — Vérification Mentale
                                    </h3>
                                    <div className="space-y-3 mb-5">
                                        {[
                                            { id: 'no_emotion', text: 'Je ne distribue pas sous une émotion (victoire, soulagement, euphorie).', icon: '🧠' },
                                            { id: 'plan_first', text: 'Je respecte le plan budgétaire même si je veux acheter quelque chose maintenant.', icon: '📋' },
                                            { id: 'no_lifestyle', text: 'Je n\'augmente pas mon niveau de vie parce que j\'ai bien gagné ce mois.', icon: '🏠' },
                                            { id: 'asset_first', text: 'Mon objectif n°1 est de transformer ce revenu en actif, pas en confort.', icon: '🔒' },
                                        ].map(item => {
                                            const checked = checkedMindset.includes(item.id);
                                            return (
                                                <button key={item.id} onClick={() => setCheckedMindset(prev => checked ? prev.filter(i => i !== item.id) : [...prev, item.id])}
                                                    className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${checked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/40 border-slate-800 hover:border-slate-600'
                                                        }`}>
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'
                                                        }`}>
                                                        {checked && <CheckCircle2 size={14} className="text-slate-950" />}
                                                    </div>
                                                    <div>
                                                        <span className="mr-1">{item.icon}</span>
                                                        <span className={`text-[10px] font-bold leading-relaxed ${checked ? 'text-white' : 'text-slate-500'}`}>{item.text}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Verdict mental */}
                                    {checkedMindset.length > 0 && (
                                        <div className={`p-3 rounded-xl text-center text-[9px] font-black uppercase tracking-widest ${checkedMindset.length === 4 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            checkedMindset.length >= 2 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>
                                            {checkedMindset.length === 4 ? '✓ Mentalité d\'opérateur confirmée — Distribution autorisée' :
                                                checkedMindset.length >= 2 ? `⚠ ${4 - checkedMindset.length} point${4 - checkedMindset.length > 1 ? 's' : ''} à valider avant d\'exécuter` :
                                                    '🚫 Mode émotionnel détecté — Attends 10 minutes'}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ── Bloc principal de distribution ── */}
                            {(incomeType && checkedMindset.length === 4) && (
                                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                    className="card-warrior p-8 bg-slate-900/80 border-amber-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5"><Crown size={80} className="text-amber-500" /></div>

                                    <h2 className="font-ancient font-black text-white text-xl uppercase tracking-widest text-center mb-8">
                                        Étape 3 — Diviser le Butin
                                    </h2>

                                    {/* Status validation */}
                                    {Math.abs(totalPercent - 100) > 0.5 && (
                                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                                            <AlertCircle size={20} className="text-rose-500 shrink-0" />
                                            <div>
                                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Configuration incomplète</p>
                                                <p className="text-[8px] text-slate-500 mt-0.5">Tes secteurs totalisent {totalPercent}% — configure 100% d'abord</p>
                                            </div>
                                            <button onClick={() => setActiveTab('configure')} className="ml-auto text-[8px] text-rose-400 font-black uppercase underline whitespace-nowrap">
                                                Corriger →
                                            </button>
                                        </div>
                                    )}

                                    {/* Montant */}
                                    <div className="mb-6">
                                        <label className="text-[10px] font-ancient font-black text-slate-600 uppercase tracking-[0.2em] mb-3 block">Volume à Distribuer (FCFA)</label>
                                        <input type="number" value={distributeAmount} onChange={e => setDistributeAmount(e.target.value)}
                                            placeholder="0" autoFocus
                                            className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-6 text-5xl font-ancient font-black text-amber-500 text-center outline-none focus:border-amber-500 transition-all placeholder-slate-900"
                                        />
                                    </div>

                                    {/* Preview distribution */}
                                    {distributeAmount > 0 && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                            className="space-y-2 mb-6 p-5 bg-slate-950/60 border border-amber-500/10 rounded-2xl">
                                            <div className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest mb-3 flex items-center gap-1">
                                                <Sparkles size={12} /> Distribution Réelle
                                            </div>
                                            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                                {categories.filter(c => c.percent > 0).map(cat => (
                                                    <div key={cat.id} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                                            <span>{cat.icon}</span>{cat.name}
                                                            <span className="text-slate-700">({cat.percent}%)</span>
                                                        </div>
                                                        <span className="text-white font-mono font-black text-[10px]">
                                                            +{fmt(distributeAmount * cat.percent / 100)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-amber-500/10 text-xs font-black uppercase">
                                                <span className="text-amber-500/60">Total</span>
                                                <span className="text-amber-500">{fmt(distributeAmount)}</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Bouton */}
                                    <button onClick={handleDistributeRevenue}
                                        disabled={distributing || !distributeAmount || Math.abs(totalPercent - 100) > 0.5}
                                        className="w-full btn-empire-primary py-6 text-lg font-black tracking-[0.3em] disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        <div className="flex items-center justify-center gap-3">
                                            {distributing ? <Zap className="animate-spin" size={22} /> : <Crown size={22} />}
                                            {distributing ? "DISTRIBUTION EN COURS..." : "EXÉCUTER LE DÉCRET"}
                                        </div>
                                    </button>
                                </motion.div>
                            )}

                            {/* Placeholder si pas encore prêt */}
                            {(!incomeType || checkedMindset.length < 4) && (
                                <div className="card-warrior p-6 bg-slate-950/40 border-slate-800 text-center">
                                    <Lock size={28} className="mx-auto mb-3 text-slate-700" />
                                    <p className="font-ancient text-[10px] text-slate-700 uppercase tracking-widest">
                                        {!incomeType ? 'Qualifie ton revenu pour débloquer la distribution' : `Valide les ${4 - checkedMindset.length} point${4 - checkedMindset.length > 1 ? 's' : ''} restants`}
                                    </p>
                                </div>
                            )}

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
