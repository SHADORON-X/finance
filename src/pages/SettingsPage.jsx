import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Moon, Sun, Monitor, Cpu, Key,
    Download, Trash2, LogOut, ChevronRight,
    Shield, Sparkles, Palette, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SETTINGS_SECTIONS = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'ai', label: 'Intelligence Artificielle', icon: Cpu },
    { id: 'data', label: 'Données & Sécurité', icon: Shield },
];

const THEMES = [
    { id: 'dark', name: 'Sombre (Défaut)', color: '#0f172a' },
    { id: 'light', name: 'Clair', color: '#f8fafc' },
    { id: 'cyber', name: 'Cyberpunk', color: '#09090b', accent: '#f472b6' },
    { id: 'forest', name: 'Forêt Profonde', color: '#052e16', accent: '#34d399' },
    { id: 'gold', name: 'Luxe', color: '#271c19', accent: '#fbbf24' },
];

const SettingsPage = () => {
    const { user, logout } = useAuthStore();
    const { theme, setTheme } = useUIStore(); // Supposé exister dans le store
    const [activeSection, setActiveSection] = useState('profile');
    const [apiKey, setApiKey] = useState('');
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Charger la clé perso
        const storedKey = localStorage.getItem('custom_pollinations_key');
        if (storedKey) setApiKey(storedKey);

        // Charger profil
        if (user) {
            setUsername(user.user_metadata?.username || user.email.split('@')[0]);
        }
    }, [user]);

    const handleSaveKey = () => {
        if (!apiKey.trim()) {
            localStorage.removeItem('custom_pollinations_key');
            toast.success("Clé personnalisée supprimée. Retour à la clé par défaut.");
        } else {
            localStorage.setItem('custom_pollinations_key', apiKey.trim());
            toast.success("Clé API sauvegardée ! L'Oracle est rechargé.");
        }
        setIsEditingKey(false);
        // Force refresh pour recharger le service (simple reload)
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleThemeChange = (newTheme) => {
        // Ici on ferait setTheme(newTheme) si le store le gérait vraiment.
        // Pour l'instant on simule en mettant une classe sur html
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('app-theme', newTheme);
        toast.success(`Thème ${newTheme} appliqué`);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        logout();
        toast.success("À bientôt !");
    };

    const handleExportData = () => {
        const data = {
            exportDate: new Date(),
            user: user.email,
            note: "Export complet des données financières"
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shadoron_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        toast.success("Export téléchargé");
    };

    return (
        <div className="fade-in pb-20">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Monitor className="text-slate-400" />
                Paramètres
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
                {/* SIDEBAR NAVIGATION */}
                <nav className="space-y-2">
                    {SETTINGS_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="font-medium text-sm">{section.label}</span>
                                {isActive && <ChevronRight size={16} className="ml-auto" />}
                            </button>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="font-medium text-sm">Déconnexion</span>
                        </button>
                    </div>
                </nav>

                {/* CONTENT AREA */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeSection === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold border-b border-slate-800 pb-4">Mon Profil</h2>

                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-amber-500 transition-colors">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-slate-500" />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs text-white center">Modifier</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-slate-400 uppercase font-bold">Pseudo</div>
                                        <div className="text-xl font-bold text-white">{username}</div>
                                        <div className="text-sm text-slate-500">{user?.email}</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
                                    <Shield className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-500">Compte Guerrier</h4>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Votre compte est actif et protégé par les standards de Babylone.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'appearance' && (
                            <motion.div
                                key="appearance"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold border-b border-slate-800 pb-4">Apparence</h2>
                                <p className="text-sm text-slate-400">Personnalisez votre interface de commandement.</p>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {THEMES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleThemeChange(t.id)}
                                            className="group relative h-24 rounded-xl border-2 border-slate-800 overflow-hidden hover:scale-105 transition-all text-left"
                                            style={{ backgroundColor: t.color }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                                            <div className="absolute bottom-2 left-3 z-10">
                                                <span className="text-xs font-bold text-white shadow-sm block bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-md">
                                                    {t.name}
                                                </span>
                                            </div>
                                            {t.accent && (
                                                <div
                                                    className="absolute top-2 right-2 w-4 h-4 rounded-full shadow-lg"
                                                    style={{ backgroundColor: t.accent }}
                                                ></div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Monitor size={20} className="text-slate-400" />
                                        <span className="text-sm font-medium">Mode Système</span>
                                    </div>
                                    <div className="text-xs text-slate-500">Bientôt</div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'ai' && (
                            <motion.div
                                key="ai"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold border-b border-slate-800 pb-4 flex items-center gap-2">
                                    <Cpu className="text-emerald-400" />
                                    Configuration IA
                                </h2>

                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <Key size={16} /> Clé API Pollinations / OpenAI
                                    </h3>
                                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                        Par défaut, l'application utilise la clé publique/partagée.
                                        Si vous avez votre propre clé (pour GPT-4, Claude, etc.), entrez-la ici pour des réponses plus rapides et sans limites.
                                        <br />
                                        <a href="https://enter.pollinations.ai" target="_blank" className="text-amber-500 hover:underline">Obtenir une clé</a>
                                    </p>

                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type={isEditingKey ? "text" : "password"}
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                disabled={!isEditingKey}
                                                placeholder="sk_..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono focus:border-amber-500 outline-none disabled:opacity-50"
                                            />
                                            {apiKey && !isEditingKey && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 text-xs font-bold">
                                                    <CheckCircle2 size={12} /> Active
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            {!isEditingKey ? (
                                                <button
                                                    onClick={() => setIsEditingKey(true)}
                                                    className="text-xs btn bg-slate-700 hover:bg-slate-600"
                                                >
                                                    Modifier
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => { setIsEditingKey(false); setApiKey(localStorage.getItem('custom_pollinations_key') || ''); }}
                                                        className="text-xs btn text-slate-400 hover:text-white"
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button
                                                        onClick={handleSaveKey}
                                                        className="text-xs btn bg-emerald-600 hover:bg-emerald-500"
                                                    >
                                                        Sauvegarder
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                                    ℹ️ Modèles utilisés : <strong>OpenAI GPT-4o-Mini</strong>, fallback sur <strong>Mistral</strong>.
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'data' && (
                            <motion.div
                                key="data"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold border-b border-slate-800 pb-4">Données & Sécurité</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <Download className="text-emerald-500" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Exporter mes données</h4>
                                                <p className="text-xs text-slate-400">Télécharger une copie JSON de vos finances.</p>
                                            </div>
                                        </div>
                                        <button onClick={handleExportData} className="px-3 py-1.5 text-xs bg-slate-700 rounded-md hover:bg-slate-600 transition-colors">
                                            Exporter
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-rose-950/10 rounded-xl border border-rose-900/30 hover:bg-rose-950/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-500/10 rounded-lg">
                                                <AlertTriangle className="text-rose-500" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-rose-500">Zone Danger</h4>
                                                <p className="text-xs text-rose-400/70">Ces actions sont irréversibles.</p>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1.5 text-xs bg-rose-900/50 text-rose-400 rounded-md hover:bg-rose-900 transition-colors border border-rose-800">
                                            Réinitialiser le compte
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
