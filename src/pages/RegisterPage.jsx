import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Sparkles, Rocket, Target, Zap } from 'lucide-react';
import { signUp } from '../services/authService';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('⚠️ Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            toast.error('⚠️ Minimum 6 caractères requis');
            return;
        }

        setIsLoading(true);

        try {
            const { user } = await signUp(email, password, username);
            setUser(user);
            toast.success('🎉 Bienvenue ' + username + '!');
            navigate('/');
        } catch (error) {
            console.error('Register error:', error);
            toast.error('❌ ' + (error.message || 'Erreur d\'inscription'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0f0f1e]">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.35, 0.15],
                    }}
                    transition={{ duration: 12, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.1, 0.25, 0.1],
                    }}
                    transition={{ duration: 14, repeat: Infinity, delay: 2 }}
                    className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[90px]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Benefits */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:block space-y-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        <div className="inline-flex items-center gap-3 mb-8">
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-50"
                                />
                                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <Rocket className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white">REJOIGNEZ</h1>
                                <p className="text-emerald-400 font-bold text-sm tracking-widest">L'ÉLITE FINANCIÈRE</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-5xl font-black text-white leading-tight"
                        >
                            Construisez votre<br />
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Empire Financier
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-slate-400 text-lg leading-relaxed"
                        >
                            Rejoignez des milliers de guerriers qui ont pris le contrôle
                            de leurs finances avec discipline et intelligence.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-4"
                    >
                        {[
                            { icon: Target, text: 'Objectifs intelligents', color: 'from-emerald-400 to-green-500', desc: 'Atteignez vos buts financiers' },
                            { icon: Zap, text: 'Oracle IA personnel', color: 'from-cyan-400 to-blue-500', desc: 'Conseils sur mesure 24/7' },
                            { icon: Sparkles, text: 'Gamification totale', color: 'from-purple-400 to-pink-500', desc: 'Progressez en vous amusant' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 + i * 0.1 }}
                                className="flex items-start gap-4 group cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{feature.text}</h3>
                                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Right Side - Register Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 rounded-3xl blur-2xl opacity-20 pointer-events-none" />

                        <div className="relative backdrop-blur-2xl bg-white/[0.05] border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="lg:hidden mb-6 text-center">
                                <div className="inline-flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                        <Rocket className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-2xl font-black text-white">SHADORON</h1>
                                        <p className="text-emerald-400 text-xs font-bold">FINANCE</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-3xl font-black text-white mb-2">Créer un compte</h3>
                                <p className="text-slate-400">Commencez votre ascension financière</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Username */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Nom de guerrier</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                            placeholder="Napoléon"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Mot de passe</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                            placeholder="••••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Confirmer</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                            placeholder="••••••••••"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full py-4 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-500 hover:via-cyan-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50 overflow-hidden group mt-6"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            <span>REJOINDRE L'EMPIRE</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="my-6 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <span className="text-xs text-slate-500 font-bold">OU</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </div>

                            <div className="text-center">
                                <p className="text-slate-400 text-sm">
                                    Déjà membre?{' '}
                                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors underline underline-offset-4">
                                        Se connecter
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-8 text-center text-slate-600 text-xs font-mono"
                    >
                        En créant un compte, vous acceptez nos conditions
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
