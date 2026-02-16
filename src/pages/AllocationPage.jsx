// =====================================================
// PAGE DE RÉPARTITION INTELLIGENTE - VERSION ULTRA MODERNE
// Design fluide, cards élégantes, UX exceptionnelle
// =====================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coins, TrendingUp, Target, Sparkles, ChevronRight,
    CheckCircle2, AlertCircle, Zap, Crown, Shield,
    PiggyBank, Wallet, TrendingDown, ArrowRight, Info
} from 'lucide-react';
import { useAuthStore } from '../store';
import {
    createAllocation,
    getStrategicAdvice,
    simulateAllocation,
    getAllocations,
    applyAllocation
} from '../services/allocationService';
import { getAllocationAdvice } from '../services/allocationAIService';
import { ALLOCATION_STRATEGIES, FINANCIAL_WISDOM } from '../data/financialWisdom';
import toast from 'react-hot-toast';
import './AllocationPage.css';

export default function AllocationPage() {
    const { user } = useAuthStore();
    const [amount, setAmount] = useState('');
    const [selectedStrategy, setSelectedStrategy] = useState('balanced');
    const [simulation, setSimulation] = useState(null);
    const [advice, setAdvice] = useState(null);
    const [aiAdvice, setAIAdvice] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);
    const [activeTab, setActiveTab] = useState('allocate');
    const [selectedWisdom, setSelectedWisdom] = useState('babylon');
    const [showWisdomDetail, setShowWisdomDetail] = useState(null);

    useEffect(() => {
        if (user) {
            loadAdvice();
            loadAllocations();
        }
    }, [user]);

    useEffect(() => {
        if (amount && selectedStrategy) {
            const result = simulateAllocation(parseFloat(amount), selectedStrategy);
            if (result.success) {
                setSimulation(result);
            }
        } else {
            setSimulation(null);
        }
    }, [amount, selectedStrategy]);

    const loadAdvice = async () => {
        const result = await getStrategicAdvice(user.id);
        if (result.success) {
            setAdvice(result);
            setSelectedStrategy(result.recommendedStrategy.key);
        }
    };

    const loadAllocations = async () => {
        const result = await getAllocations(user.id);
        if (result.success) {
            setAllocations(result.allocations);
        }
    };

    const getAIAdvice = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Entrez un montant d\'abord');
            return;
        }

        setLoadingAI(true);
        try {
            const userData = {
                totalBalance: advice?.financialMetrics.totalSavings || 0,
                totalIncome: advice?.financialMetrics.totalIncome || 0,
                totalDebt: advice?.financialMetrics.totalDebt || 0
            };

            const aiResponse = await getAllocationAdvice(userData, selectedStrategy, parseFloat(amount));
            setAIAdvice(aiResponse);
        } catch (error) {
            toast.error("L'Oracle médite...");
        } finally {
            setLoadingAI(false);
        }
    };

    const handleCreateAllocation = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Entrez un montant valide');
            return;
        }

        setLoading(true);
        const result = await createAllocation(user.id, parseFloat(amount), selectedStrategy);

        if (result.success) {
            toast.success('✨ Allocation créée avec succès!');
            setAmount('');
            setSimulation(null);
            setAIAdvice(null);
            loadAllocations();
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    const handleApplyAllocation = async (allocationId) => {
        setLoading(true);
        const result = await applyAllocation(user.id, allocationId);

        if (result.success) {
            toast.success(`🎉 Allocation appliquée! ${result.contributionsCount} contributions créées`);
            loadAllocations();
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(value);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="allocation-page-modern">
            {/* Hero Header */}
            <motion.div
                className="hero-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="hero-content">
                    <motion.div
                        className="hero-icon"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Coins size={48} />
                    </motion.div>
                    <div>
                        <h1 className="hero-title">
                            Répartition Intelligente
                        </h1>
                        <p className="hero-subtitle">
                            Distribuez votre argent selon la sagesse millénaire de Babylone, Chine et des grands investisseurs
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs Navigation */}
            <div className="modern-tabs">
                {[
                    { id: 'allocate', icon: Coins, label: 'Répartir' },
                    { id: 'wisdom', icon: Crown, label: 'Sagesse' },
                    { id: 'history', icon: Wallet, label: 'Historique' }
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`modern-tab ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    className="tab-indicator"
                                    layoutId="activeTab"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab: Répartir */}
            <AnimatePresence mode="wait">
                {activeTab === 'allocate' && (
                    <motion.div
                        key="allocate"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="tab-content-modern"
                    >
                        {/* Métriques Financières */}
                        {advice && (
                            <motion.div variants={itemVariants} className="metrics-grid">
                                <div className="metric-card blue">
                                    <div className="metric-icon">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div className="metric-content">
                                        <p className="metric-label">Revenus</p>
                                        <p className="metric-value">{formatCurrency(advice.financialMetrics.totalIncome)}</p>
                                    </div>
                                </div>

                                <div className="metric-card emerald">
                                    <div className="metric-icon">
                                        <PiggyBank size={24} />
                                    </div>
                                    <div className="metric-content">
                                        <p className="metric-label">Épargne</p>
                                        <p className="metric-value">{formatCurrency(advice.financialMetrics.totalSavings)}</p>
                                    </div>
                                </div>

                                <div className="metric-card rose">
                                    <div className="metric-icon">
                                        <TrendingDown size={24} />
                                    </div>
                                    <div className="metric-content">
                                        <p className="metric-label">Dettes</p>
                                        <p className="metric-value">{formatCurrency(advice.financialMetrics.totalDebt)}</p>
                                    </div>
                                </div>

                                <div className="metric-card purple">
                                    <div className="metric-icon">
                                        <Target size={24} />
                                    </div>
                                    <div className="metric-content">
                                        <p className="metric-label">Taux d'épargne</p>
                                        <p className="metric-value">{advice.financialMetrics.savingsRate.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Formulaire de Répartition */}
                        <motion.div variants={itemVariants} className="allocation-form-modern">
                            <div className="form-header">
                                <h2>💰 Montant à répartir</h2>
                                <p>Entrez le montant que vous souhaitez distribuer intelligemment</p>
                            </div>

                            <div className="amount-input-modern">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="amount-field"
                                />
                                <span className="currency-badge">FCFA</span>
                            </div>

                            {/* Sélection de Stratégie */}
                            <div className="strategy-section">
                                <h3 className="section-title">
                                    <Shield size={20} />
                                    Choisissez votre stratégie
                                </h3>

                                <div className="strategy-grid-modern">
                                    {Object.entries(ALLOCATION_STRATEGIES).map(([key, strategy]) => (
                                        <motion.div
                                            key={key}
                                            className={`strategy-card-modern ${selectedStrategy === key ? 'selected' : ''}`}
                                            onClick={() => setSelectedStrategy(key)}
                                            whileHover={{ scale: 1.02, y: -5 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="strategy-header">
                                                <span className="strategy-icon">{strategy.icon}</span>
                                                {selectedStrategy === key && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="selected-badge"
                                                    >
                                                        <CheckCircle2 size={20} />
                                                    </motion.div>
                                                )}
                                            </div>
                                            <h4 className="strategy-name">{strategy.name}</h4>
                                            <p className="strategy-desc">{strategy.description}</p>
                                            <div className="wisdom-badges">
                                                {strategy.wisdomSources.map(source => (
                                                    <span key={source} className="wisdom-badge" title={FINANCIAL_WISDOM[source].name}>
                                                        {FINANCIAL_WISDOM[source].icon}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Simulation */}
                            <AnimatePresence>
                                {simulation && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="simulation-modern"
                                    >
                                        <div className="simulation-header">
                                            <h3>
                                                <Zap size={20} />
                                                Simulation de la répartition
                                            </h3>
                                            <span className="total-badge">
                                                Total: {formatCurrency(simulation.total)}
                                            </span>
                                        </div>

                                        <div className="simulation-items">
                                            {Object.entries(simulation.simulation).map(([category, details], index) => (
                                                <motion.div
                                                    key={category}
                                                    className="simulation-item"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div className="sim-category">
                                                        <span className="category-dot" style={{
                                                            backgroundColor: `hsl(${index * 40}, 70%, 60%)`
                                                        }} />
                                                        <span className="category-name">
                                                            {category.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="sim-details">
                                                        <span className="sim-percentage">{details.percentage}%</span>
                                                        <span className="sim-amount">{formatCurrency(details.amount)}</span>
                                                    </div>
                                                    <div className="sim-bar">
                                                        <motion.div
                                                            className="sim-fill"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${details.percentage}%` }}
                                                            transition={{ duration: 0.8, delay: index * 0.05 }}
                                                            style={{
                                                                backgroundColor: `hsl(${index * 40}, 70%, 60%)`
                                                            }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Conseil IA */}
                            <AnimatePresence>
                                {aiAdvice && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="ai-advice-card"
                                    >
                                        <div className="ai-header">
                                            <Sparkles size={20} />
                                            <h4>Conseil de l'Oracle</h4>
                                        </div>
                                        <div className="ai-content">
                                            {aiAdvice}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="action-buttons">
                                <button
                                    onClick={getAIAdvice}
                                    disabled={loadingAI || !amount}
                                    className="btn-secondary"
                                >
                                    <Sparkles size={18} />
                                    {loadingAI ? 'Consultation...' : 'Consulter l\'Oracle'}
                                </button>
                                <button
                                    onClick={handleCreateAllocation}
                                    disabled={loading || !amount}
                                    className="btn-primary"
                                >
                                    <CheckCircle2 size={18} />
                                    {loading ? 'Création...' : 'Créer la répartition'}
                                </button>
                            </div>
                        </motion.div>

                        {/* Conseils Stratégiques */}
                        {advice && (
                            <motion.div variants={itemVariants} className="strategic-advice-modern">
                                <div className="advice-header">
                                    <h3>
                                        <Target size={20} />
                                        Conseils pour votre situation
                                    </h3>
                                    <span className="situation-badge">
                                        {advice.situation.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="advice-list">
                                    {advice.advice.map((tip, index) => (
                                        <motion.div
                                            key={index}
                                            className="advice-item"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <span className="advice-number">{index + 1}</span>
                                            <p>{tip}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Tab: Sagesse */}
                {activeTab === 'wisdom' && (
                    <motion.div
                        key="wisdom"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="tab-content-modern"
                    >
                        <div className="wisdom-selector-modern">
                            {Object.entries(FINANCIAL_WISDOM).map(([key, wisdom]) => (
                                <motion.button
                                    key={key}
                                    onClick={() => setSelectedWisdom(key)}
                                    className={`wisdom-tab-modern ${selectedWisdom === key ? 'active' : ''}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="wisdom-icon-large">{wisdom.icon}</span>
                                    <span className="wisdom-name">{wisdom.name}</span>
                                    {selectedWisdom === key && (
                                        <motion.div
                                            className="wisdom-indicator"
                                            layoutId="activeWisdom"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <motion.div
                            key={selectedWisdom}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="wisdom-content-modern"
                        >
                            <div className="wisdom-hero">
                                <span className="wisdom-hero-icon">
                                    {FINANCIAL_WISDOM[selectedWisdom].icon}
                                </span>
                                <div>
                                    <h2>{FINANCIAL_WISDOM[selectedWisdom].name}</h2>
                                    <p>{FINANCIAL_WISDOM[selectedWisdom].origin}</p>
                                </div>
                            </div>

                            <div className="wisdom-rules-grid">
                                {FINANCIAL_WISDOM[selectedWisdom].rules.map((rule, index) => (
                                    <motion.div
                                        key={rule.id}
                                        className="wisdom-rule-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => setShowWisdomDetail(showWisdomDetail === rule.id ? null : rule.id)}
                                    >
                                        <div className="rule-number">{index + 1}</div>
                                        <div className="rule-content">
                                            <h4>{rule.title}</h4>
                                            <p className="rule-description">{rule.description}</p>

                                            <AnimatePresence>
                                                {showWisdomDetail === rule.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="rule-details"
                                                    >
                                                        <blockquote className="rule-quote">
                                                            "{rule.quote}"
                                                        </blockquote>
                                                        <div className="rule-allocation">
                                                            <p className="allocation-title">Allocation suggérée:</p>
                                                            <div className="allocation-tags">
                                                                {Object.entries(rule.allocation).map(([cat, percent]) => (
                                                                    <span key={cat} className="allocation-tag">
                                                                        {cat}: {percent}%
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <ChevronRight
                                            className={`expand-icon ${showWisdomDetail === rule.id ? 'expanded' : ''}`}
                                            size={20}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Tab: Historique */}
                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="tab-content-modern"
                    >
                        {allocations.length === 0 ? (
                            <div className="empty-state">
                                <Wallet size={64} className="empty-icon" />
                                <h3>Aucune répartition</h3>
                                <p>Créez votre première répartition intelligente</p>
                                <button
                                    onClick={() => setActiveTab('allocate')}
                                    className="btn-primary"
                                >
                                    <Coins size={18} />
                                    Commencer
                                </button>
                            </div>
                        ) : (
                            <div className="allocations-grid">
                                {allocations.map((allocation, index) => (
                                    <motion.div
                                        key={allocation.id}
                                        variants={itemVariants}
                                        className="allocation-history-card"
                                    >
                                        <div className="allocation-header">
                                            <div>
                                                <h3>{formatCurrency(allocation.amount)}</h3>
                                                <p className="allocation-date">
                                                    {new Date(allocation.created_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`status-badge ${allocation.status}`}>
                                                {allocation.status === 'pending' ? (
                                                    <>
                                                        <AlertCircle size={16} />
                                                        En attente
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={16} />
                                                        Appliquée
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        <div className="allocation-distribution">
                                            {Object.entries(allocation.distribution).map(([category, details]) => (
                                                <div key={category} className="distribution-row">
                                                    <span className="dist-category">{category.replace(/_/g, ' ')}</span>
                                                    <span className="dist-amount">
                                                        {formatCurrency(details.amount)}
                                                        <span className="dist-percent">({details.percentage}%)</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {allocation.status === 'pending' && (
                                            <button
                                                onClick={() => handleApplyAllocation(allocation.id)}
                                                disabled={loading}
                                                className="apply-btn"
                                            >
                                                <CheckCircle2 size={18} />
                                                Appliquer cette répartition
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
