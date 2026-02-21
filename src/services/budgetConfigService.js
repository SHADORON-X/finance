import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'budget_imperial_config_v2';

// ── Structure par défaut ─────────────────────────────────────────────
export const DEFAULT_BUDGET_CONFIG = {
    version: 2,
    updatedAt: null,
    profil: {
        titre: 'Opérateur Tech — Phase Construction',
        situation: '16 ans · Guinée · Velmo · Phase expansion 10 clients',
        priorites: ['Capital', 'Croissance', 'Compétences'],
        regleOr: "Si revenus ↑ → style de vie = · Seules épargne et business augmentent.",
        alerte: "Bloc Vie = 15% max. Chaque % de plus sur la vie = 1% de liberté perdu.",
        basePrudente: 1000000,
    },
    categories: [
        { key: 'savings', name: 'Épargne Stratégique', icon: '🔒', percent: 25, locked: true, bloc: 'security', description: "Fonds de guerre..." },
        { key: 'emergency', name: 'Fonds Imprévus', icon: '🚨', percent: 10, locked: false, bloc: 'security', description: "Panne matériel..." },
        { key: 'business', name: 'Projet / Velmo', icon: '🎯', percent: 30, locked: false, bloc: 'growth', description: "Marketing..." },
        { key: 'skills', name: 'Compétences', icon: '🧠', percent: 12, locked: false, bloc: 'growth', description: "Anglais, IA..." },
        { key: 'internet', name: 'Internet & Outils', icon: '🌐', percent: 8, locked: false, bloc: 'growth', description: "Connexion..." },
        { key: 'food', name: 'Nourriture', icon: '🍽️', percent: 10, locked: false, bloc: 'life', description: "Performance..." },
        { key: 'transport', name: 'Transport', icon: '🚗', percent: 5, locked: false, bloc: 'life', description: "Optimisé..." },
        { key: 'comfort', name: 'Confort / Perso', icon: '🎧', percent: 0, locked: false, bloc: 'life', description: "Zéro phase construction..." },
    ],
    surplusRule: {
        equipment: 50,
        business: 30,
        savings: 20,
    },
    lois: [
        { id: 'l1', text: "Tu n'es pas un salarié. Tu es un opérateur en construction d'empire." },
        { id: 'l2', text: "La richesse n'est pas ce que tu gagnes. C'est ce que tu gardes." },
        { id: 'l3', text: "Si ton revenu augmente, ton style de vie ne bouge pas." },
        { id: 'l4', text: "25% de chaque franc gagné est intouchable." },
        { id: 'l5', text: "Les compétences à 16 ans sont des investissements à 100x." },
    ],
};

// ── CRUD CLOUD & LOCAL ──────────────────────────────────────────────

/** 
 * Charge depuis Supabase (prioritaire) avec fallback local
 */
export async function loadBudgetConfig(userId) {
    // 1. Essayer de charger depuis Supabase
    if (userId) {
        try {
            const { data, error } = await supabase
                .from('user_budget_configs')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            if (!error && data) {
                const config = {
                    version: data.version,
                    profil: data.profil,
                    categories: data.categories,
                    surplusRule: data.surplus_rule,
                    lois: data.lois,
                    updatedAt: data.updated_at
                };
                // Mettre à jour le local storage pour la rapidité au prochain chargement
                localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
                return config;
            }
        } catch (e) {
            console.warn("Sync error, using local storage", e);
        }
    }

    // 2. Fallback Local Storage
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_BUDGET_CONFIG };
        return JSON.parse(raw);
    } catch {
        return { ...DEFAULT_BUDGET_CONFIG };
    }
}

/** 
 * Sauvegarde sur Supabase ET LocalStorage
 */
export async function saveBudgetConfig(config, userId) {
    const updatedAt = new Date().toISOString();
    const updatedConfig = { ...config, updatedAt };

    // Sauvegarde locale instantanée
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));

    // Sauvegarde Supabase asynchrone
    if (userId) {
        try {
            await supabase
                .from('user_budget_configs')
                .upsert({
                    user_id: userId,
                    profil: config.profil,
                    categories: config.categories,
                    surplus_rule: config.surplusRule,
                    lois: config.lois,
                    version: config.version || 2
                }, { onConflict: 'user_id' });
        } catch (e) {
            console.error("Cloud save failed", e);
        }
    }

    return updatedConfig;
}

// ── OPÉRATIONS DE MISE À JOUR ──────────────────────────────────────────

export function updateProfilField(config, field, value) {
    const updated = {
        ...config,
        profil: { ...config.profil, [field]: value },
    };
    // Note: l'appelant doit appeler saveBudgetConfig avec l'userId
    return updated;
}

export function updateCategoryPercent(config, key, newPercent) {
    const categories = config.categories.map(c =>
        c.key === key ? { ...c, percent: Math.max(0, Math.min(100, newPercent)) } : c
    );
    return { ...config, categories };
}

export function updateCategoryField(config, key, field, value) {
    const categories = config.categories.map(c =>
        c.key === key ? { ...c, [field]: value } : c
    );
    return { ...config, categories };
}

// Les fonctions utilitaires restent identiques mais opèrent sur l'objet config local
export function getTotalPercent(config) {
    return config.categories.reduce((s, c) => s + (c.percent || 0), 0);
}

export function distributeAmount(config, amount) {
    return config.categories.map(cat => ({
        ...cat,
        amount: Math.round(amount * cat.percent / 100),
    }));
}

export function distributeSurplus(config, surplus) {
    const r = config.surplusRule;
    return {
        equipment: Math.round(surplus * r.equipment / 100),
        business: Math.round(surplus * r.business / 100),
        savings: Math.round(surplus * r.savings / 100),
    };
}

export function getCategoriesByBloc(config) {
    const groups = { security: [], growth: [], life: [] };
    config.categories.forEach(cat => {
        if (groups[cat.bloc]) groups[cat.bloc].push(cat);
    });
    return groups;
}

export function getBlocPercents(config) {
    const byBloc = getCategoriesByBloc(config);
    const result = {};
    for (const [bloc, cats] of Object.entries(byBloc)) {
        result[bloc] = cats.reduce((s, c) => s + (c.percent || 0), 0);
    }
    return result;
}

export async function resetBudgetConfig(userId) {
    const fresh = { ...DEFAULT_BUDGET_CONFIG, updatedAt: new Date().toISOString() };
    await saveBudgetConfig(fresh, userId);
    return fresh;
}

export const BLOC_META = {
    security: {
        id: 'security',
        label: 'BLOC 1 — FORTERESSE',
        subtitle: 'Capital inviolable. Survie garantie.',
        color: 'blue',
        icon: '🛡️',
        description: "Garantissent ta survie et indépendance.",
    },
    growth: {
        id: 'growth',
        label: 'BLOC 2 — CROISSANCE',
        subtitle: "L'empire qui s'étend.",
        color: 'amber',
        icon: '📈',
        description: "Contruisent ta machine à revenus.",
    },
    life: {
        id: 'life',
        label: 'BLOC 3 — VIE MINIMALE',
        subtitle: "Carburant. Pas de confort.",
        color: 'emerald',
        icon: '⚡',
        description: "Maintiennent ta performance. Pas ton plaisir.",
    },
};
