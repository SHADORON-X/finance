import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Zap, Crown, Flame } from 'lucide-react';

const ConquestSimulator = ({ initialBalance }) => {
    const [principal, setPrincipal] = useState(initialBalance || 1000000); // Montant initial
    const [monthly, setMonthly] = useState(100000);    // Épargne mensuelle
    const [rate, setRate] = useState(10);              // Taux annuel (%)
    const [years, setYears] = useState(10);             // Durée
    const [futureValue, setFutureValue] = useState(0);

    useEffect(() => {
        if (initialBalance) setPrincipal(initialBalance);
    }, [initialBalance]);

    useEffect(() => {
        calculateConquest();
    }, [principal, monthly, rate, years]);

    const calculateConquest = () => {
        const r = rate / 100 / 12;
        const n = years * 12;

        // FV = P * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
        const compoundInterest = principal * Math.pow(1 + r, n);
        const annuity = monthly * ((Math.pow(1 + r, n) - 1) / r);

        setFutureValue(Math.round(compoundInterest + annuity));
    };

    const formatCurrency = (val) => val.toLocaleString('fr-FR') + ' FCFA';

    return (
        <div className="card-warrior p-8 bg-slate-950/80 border-amber-500/20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                    <Zap className="text-amber-500" size={24} />
                </div>
                <div>
                    <h3 className="font-ancient font-black text-xl text-white tracking-widest">SIMULATEUR DE CONQUÊTE</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Visualisez la puissance de votre capital à travers le temps</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contrôles */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                            Trésor Initial <span>{formatCurrency(principal)}</span>
                        </label>
                        <input
                            type="range" min="0" max="10000000" step="100000"
                            value={principal} onChange={(e) => setPrincipal(Number(e.target.value))}
                            className="w-full accent-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                            Renfort Mensuel <span>{formatCurrency(monthly)}</span>
                        </label>
                        <input
                            type="range" min="0" max="1000000" step="10000"
                            value={monthly} onChange={(e) => setMonthly(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Taux de Victoire (%)</label>
                            <input
                                type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))}
                                className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 w-full text-white font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Années de Guerre</label>
                            <input
                                type="number" value={years} onChange={(e) => setYears(Number(e.target.value))}
                                className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 w-full text-white font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Résultat Impérial */}
                <div className="flex flex-col justify-center items-center p-8 bg-amber-500/5 rounded-3xl border border-amber-500/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Crown size={60} className="text-amber-500/20 mb-4" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-2 font-ancient">Trésor dans {years} ans</span>
                    <motion.div
                        key={futureValue}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl md:text-4xl font-black text-white font-ancient text-center leading-tight lg:text-5xl"
                    >
                        {formatCurrency(futureValue)}
                    </motion.div>

                    <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-slate-900/80 rounded-full border border-white/5">
                        <Flame size={14} className="text-orange-500" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Dont {formatCurrency(futureValue - (principal + (monthly * years * 12)))} de Profit Pur
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConquestSimulator;
