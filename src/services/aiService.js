// =====================================================
// SERVICE IA FINANCIÈRE V3 - L'ORACLE (Babylone x Buffett)
// Analytique, Sage, Investisseur, Visionnaire
// =====================================================

const POLLINATIONS_API_KEY = localStorage.getItem('custom_pollinations_key') || import.meta.env.VITE_POLLINATIONS_API_KEY;
const POLLINATIONS_API_URL = 'https://gen.pollinations.ai/v1/chat/completions';

// Système de personnalité : SAGESSE ULTIME
const AI_PERSONALITY = {
    system: `Tu es L'ORACLE, mentor financier.

DIRECTIVES DE RÉPOUSE (STRICTES):
1. TRÈS COURT : Maximum 2 à 3 petits paragraphes. Pas de romans.
2. FOCUS TOTAL : Réponds UNIQUEMENT à la question posée. Si l'utilisateur parle d'un objectif, parles-en d'abord. Ne fais pas un bilan complet de l'empire à chaque fois.
3. PAS DE RÉPÉTITION : Ne liste pas les données (solde, dettes) si l'utilisateur ne l'a pas demandé. Utilise-les juste pour ton calcul.
4. ACTION UNIQUE : Donne une seule action concrète, pas dix.

STYLE: Direct, sage, et percutant. Pas de sections type 'Scénarios' ou 'Mesures mensuelles' automatiques.`,

    temperature: 0.7,
    maxTokens: 1200
};

/**
 * Fonctions utilitaires
 */
const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR') + ' FCFA';

/**
 * Helper générique pour appeler l'API Pollinations
 */
async function callAI(messages, temperature = 0.7, maxTokens = 2500) {
    // 1. Vérification préventive de la clé API
    if (!POLLINATIONS_API_KEY || POLLINATIONS_API_KEY.length < 5) {
        throw new Error("⚠️ Clé API manquante. Ajoutez VITE_POLLINATIONS_API_KEY dans votre fichier .env.");
    }

    const modelsToTry = ['openai', 'mistral', 'qwen-coder'];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            console.log(`[AI] Tentative avec le modèle : ${model}`);
            const response = await fetch(POLLINATIONS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
                },
                body: JSON.stringify({
                    messages: messages,
                    model: model,
                    temperature: temperature,
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Si 'not allowed' (403), c'est souvent un problème de modèle restreint ou payant
                if (response.status === 403 && errorText.includes('not allowed')) {
                    console.warn(`Modèle '${model}' non autorisé. Suivant...`);
                    continue;
                }
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }

            const rawText = await response.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (jsonError) {
                console.error("JSON invalide", jsonError);
                throw new Error("Format JSON invalide");
            }

            // Vérification rigoureuse du contenu
            const content = data.choices?.[0]?.message?.content;
            const finishReason = data.choices?.[0]?.finish_reason;

            // Si le contenu est vide ou si l'IA s'est arrêtée par manque de place ('length') sans rien écrire
            if (!content || content.trim().length === 0) {
                console.warn(`[AI] Réponse VIDE reçue de ${model} (finish_reason: ${finishReason}). Tentative suivante avec un autre modèle...`);
                continue; // On force le passage au modèle suivant
            }

            return content;

        } catch (error) {
            console.error(`Erreur modèle ${model}:`, error);
            lastError = error;
        }
    }

    throw new Error(`Échec IA : ${lastError?.message || 'Aucune réponse valide'}`);
}

/**
 * 1. ANALYSE DE MARCHÉ & TENDANCES (Simulation de Recherche Perplexity)
 */
export const getMarketInsights = async () => {
    try {
        const prompt = `Agis comme un moteur de recherche financier avancé (Style Perplexity/Bloomberg).
Analyse les tendances actuelles du marché mondial et économique (Inflation, Tech, Crypto, Immobilier, Énergie).

Génère un "BILAN DE MARCHÉ" concis pour un investisseur individuel :
1. 🌍 TENDANCE GLOBALE (Bull/Bear/Uncertain)
2. 🚀 SECTEURS D'AVENIR (Où investir maintenant ?)
3. ⚠️ RISQUES IMMINENTS (Inflation? Récession? Bulles?)
4. 💎 CONSEIL DE SAGE (Une pépite de sagesse pour la période actuelle)

Sois précis, visionnaire et prudent comme Warren Buffett.`;

        return await callAI([
            { role: 'system', content: AI_PERSONALITY.system },
            { role: 'user', content: prompt }
        ], 0.6, 3000);
    } catch (error) {
        return "L'Oracle médite sur les marchés... Réessayez plus tard.";
    }
};

/**
 * 2. ANALYSE PORTEFEUILLE & CONSEIL ULTIME
 */
export const getFinancialAdvice = async (userData) => {
    try {
        const prompt = buildOraclePrompt(userData);
        return await callAI([
            { role: 'system', content: AI_PERSONALITY.system },
            { role: 'user', content: prompt }
        ], 0.7, 3000);
    } catch (error) {
        console.error('Error getting advice:', error);
        throw error;
    }
};

const buildOraclePrompt = (userData) => {
    const {
        totalBalance = 0,
        totalIncome = 0,
        totalExpense = 0,
        savings = 0,
        categories = [],
        goals = [],
        debts = []
    } = userData || {};
    const savingsRate = totalIncome > 0 ? (savings / totalIncome * 100).toFixed(1) : 0;
    const netCashflow = totalIncome - totalExpense;

    let prompt = `🏛️ CONSULTATION AVEC L'ORACLE 🏛️\n\n`;
    prompt += `PROFIL DE L'INVESTISSEUR:\n`;
    prompt += `- Capital Actuel: ${formatCurrency(totalBalance)}\n`;
    prompt += `- Flux de Trésorerie (Cashflow): ${formatCurrency(netCashflow)}/mois\n`;
    prompt += `- Taux d'Épargne "Pay Yourself First": ${savingsRate}%\n`;

    if (debts.length > 0) {
        const totalDebt = debts.reduce((sum, d) => sum + d.remaining_amount, 0);
        prompt += `- ⚠️ Dettes (Chaînes): ${formatCurrency(totalDebt)}\n`;
    }

    prompt += `\nANALYSE REQUISE:\n`;
    prompt += `1. Utilise ta 'Recherche Perplexity' simulée pour comparer ce profil aux benchmarks de richesse.\n`;
    prompt += `2. Applique les '7 Remèdes contre un sac vide' à ce cas précis.\n`;
    prompt += `3. Donne une stratégie 'Value Investing' : Où allouer le capital excédentaire ?\n`;
    prompt += `4. Identifie une 'Dépense Fumée' (Désir vs Besoin) à éliminer.\n\n`;
    prompt += `Parle comme un mentor riche et bienveillant. Mélange les chiffres froids avec la philosophie chaude.`;

    return prompt;
};

/**
 * 3. ANALYSE DE TRANSACTION (Le Gardien du Temple)
 */
export const analyzeTransaction = async (transaction, userContext) => {
    try {
        const isExpense = transaction.type === 'expense';
        let prompt = '';

        if (isExpense) {
            prompt = `Le sujet vient de dépenser ${formatCurrency(transaction.amount)} pour "${transaction.category}".\n`;
            prompt += `Est-ce une dépense nécessaire ou un désir passager ?\n`;
            prompt += `Applique le test de Buffett : "Si tu achètes des choses dont tu n'as pas besoin, bientôt tu devras vendre des choses dont tu as besoin."\n`;
            prompt += `Donne un conseil court (1 phrase) mais profond.`;
        } else {
            prompt = `Le sujet a gagné ${formatCurrency(transaction.amount)}.\n`;
            prompt += `Rappelle-lui la règle de Babylone : "L'or vient volontiers vers l'homme qui en réserve un dixième pour créer un bien pour l'avenir."\n`;
            prompt += `Félicite-le sagement.`;
        }

        return await callAI([
            { role: 'system', content: AI_PERSONALITY.system },
            { role: 'user', content: prompt }
        ], 0.8, 1000); // 150 était trop court
    } catch (error) { return null; }
};

/**
 * 4. STRATÉGIE D'INVESTISSEMENT SMART (Objectifs)
 */
export const suggestGoals = async (userData) => {
    let prompt = `Le sujet a une capacité d'épargne de ${formatCurrency(userData.avgMonthlyIncome - userData.avgMonthlyExpense)}.\n`;
    prompt += `Agis comme un Gestionnaire de Fortune.\n`;
    prompt += `Quels sont les 3 piliers d'investissement qu'il devrait construire ? (Sécurité, Croissance, Spéculation/Apprentissage)\n`;
    prompt += `Définis des objectifs chiffrés basés sur l'intérêt composé.`;

    return await callAI([
        { role: 'system', content: AI_PERSONALITY.system },
        { role: 'user', content: prompt }
    ], 0.7, 3000);
};

/**
 * 5. PLAN DE LIBÉRATION DE DETTES (Stratégie)
 */
export const getDebtRepaymentPlan = async (debts, monthlyBudget) => {
    let prompt = `Situation de crise : Dettes détectées.\n`;
    prompt += `Total Dettes: ${debts.length}\n`;
    prompt += `Budget mensuel pour l'attaque: ${formatCurrency(monthlyBudget)}\n`;
    prompt += `En tant que Sage Babylonien, explique pourquoi les dettes font de l'homme un esclave.\n`;
    prompt += `En tant que Mathématicien Financier, donne le plan optimal (Avalanche) pour briser ces chaînes le plus vite possible.`;

    return await callAI([
        { role: 'system', content: AI_PERSONALITY.system },
        { role: 'user', content: prompt }
    ], 0.7, 3000);
};

/**
 * 6. CHAT LIBRE AVEC L'ORACLE
 */
export const chatWithAI = async (message, conversationHistory = [], userData = null) => {
    const messages = [
        { role: 'system', content: AI_PERSONALITY.system },
        ...conversationHistory,
        { role: 'user', content: message }
    ];

    if (userData) {
        let contextMessage = `\n\n[INFO SYSTÈME - Ne pas répéter ceci, l'utiliser seulement comme contexte pour répondre COURT au message precédent] :`;
        contextMessage += `\n- SOLDE: ${formatCurrency(userData.totalBalance)}`;

        // DÉTAIL DES DETTES
        if (userData.debts?.length > 0) {
            contextMessage += `\n- DETTES ACTIVES:`;
            userData.debts.forEach(d => {
                const remains = d.remaining_amount || d.amount;
                if (remains > 0) {
                    contextMessage += `\n  * À ${d.creditor_name || d.creditor}: ${formatCurrency(remains)} (Echéance: ${d.due_date || 'N/A'})`;
                }
            });
        }

        // DÉTAIL DES OBJECTIFS
        if (userData.goals?.length > 0) {
            contextMessage += `\n- OBJECTIFS FINANCIERS:`;
            userData.goals.forEach(g => {
                const progress = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
                contextMessage += `\n  * ${g.title || g.name}: ${formatCurrency(g.current_amount)}/${formatCurrency(g.target_amount)} (${progress}%)`;
            });
        }

        // DERNIÈRES TRANSACTIONS (CONTRÔLE DES DÉPENSES)
        if (userData.transactions?.length > 0) {
            contextMessage += `\n- DERNIERS MOUVEMENTS (Flux):`;
            userData.transactions.slice(0, 10).forEach(t => {
                const sign = t.type === 'income' ? '+' : '-';
                contextMessage += `\n  * ${sign} ${formatCurrency(t.amount)} | ${t.note || (t.categories?.name) || 'Sans titre'}`;
            });
        }

        messages[messages.length - 1].content += contextMessage;
    }

    // On augmente drastiquement les tokens pour éviter le "finish_reason: length"
    return await callAI(messages, 0.8, 4000);
};

/**
 * 7. SAGESSE PROACTIVE (Décrets de l'Oracle)
 * Génère un lot de décrets philosophiques basés sur l'empire.
 */
export const getProactiveWisdom = async (userData) => {
    try {
        const { totalBalance = 0, debts = [], goals = [] } = userData || {};
        const totalDebt = debts.reduce((sum, d) => sum + (d.remaining_amount || d.amount), 0);

        const prompt = `Agis comme l'Oracle de Babylone, sage et implacable. Analyse cet empire :
- Capital : ${formatCurrency(totalBalance)}
- Dettes : ${formatCurrency(totalDebt)}
- Objectifs : ${goals.length}

Génère 5 "DÉCRETS DE L'ORACLE" distincts. Chaque décret doit être une phrase puissante (max 15 mots) qui mélange philosophie ancienne et conseil financier brut.
Format: JSON array de strings uniquement.
Exemple: ["L'homme qui ne paye pas ses dettes construit sa maison sur des sables mouvants.", "L'or ne reste que dans les mains qui le respectent."]`;

        const response = await callAI([
            { role: 'system', content: "Tu es un commerçant-philosophe de l'Antiquité. Réponds uniquement avec un JSON array de strings." },
            { role: 'user', content: prompt }
        ], 0.8, 2500);

        const jsonMatch = response.match(/\[.*\]/s);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : ["La discipline est ta seule arme."];
    } catch (error) {
        return ["L'or aime celui qui est patient et sage.", "Ne laisse pas tes dettes devenir tes maîtres."];
    }
};

/**
 * 8. VISIONS DE L'ORACLE (Système de Notifications)
 * Génère une liste de notifications proactives.
 */
export const getOracleVisions = async (userData) => {
    try {
        const { totalBalance = 0, debts = [], goals = [] } = userData || {};
        const totalDebt = debts.reduce((sum, d) => sum + (d.remaining_amount || d.amount), 0);

        const prompt = `Génère 3 "Visions de l'Oracle" pour cet empire :
- Capital : ${formatCurrency(totalBalance)}
- Dettes : ${formatCurrency(totalDebt)}
Chaque vision doit être une notification TRÈS COURTE (max 10 mots) et ultra-pertinente.
Format : JSON array de strings.
Exemple: ["L'or fuit les mains impatientes. Diffère cet achat.", "Ta dette iPhone est une chaîne. Brise-la ce mois-ci."]`;

        const response = await callAI([
            { role: 'system', content: "Tu es l'esprit de la finance ancienne. Réponds uniquement en JSON valide." },
            { role: 'user', content: prompt }
        ], 0.6, 1000);

        try {
            // Nettoyage au cas où l'IA ajoute du texte autour du JSON
            const jsonMatch = response.match(/\[.*\]/s);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : ["La discipline est ta seule arme."];
        } catch (e) {
            return ["Reste vigilant sur tes dépenses."];
        }
    } catch (error) {
        return ["L'Oracle veille sur toi."];
    }
};

export default {
    getMarketInsights,
    getFinancialAdvice,
    analyzeTransaction,
    suggestGoals,
    getDebtRepaymentPlan,
    chatWithAI,
    getProactiveWisdom,
    getOracleVisions
};
