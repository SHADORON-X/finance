// =====================================================
// SERVICE IA POUR ALLOCATION - SAGE CONSEILLER
// Intégration de la sagesse ancienne dans les conseils
// =====================================================

import { FINANCIAL_WISDOM, ALLOCATION_STRATEGIES } from '../data/financialWisdom';

const POLLINATIONS_API_KEY = localStorage.getItem('custom_pollinations_key') || import.meta.env.VITE_POLLINATIONS_API_KEY;
const POLLINATIONS_API_URL = 'https://gen.pollinations.ai/v1/chat/completions';

/**
 * Appel IA générique
 */
async function callAI(messages, temperature = 0.8, maxTokens = 3000) {
    if (!POLLINATIONS_API_KEY || POLLINATIONS_API_KEY.length < 5) {
        throw new Error("⚠️ Clé API manquante");
    }

    const modelsToTry = ['openai', 'mistral'];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            const response = await fetch(POLLINATIONS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
                },
                body: JSON.stringify({
                    messages,
                    model,
                    temperature,
                    max_tokens: maxTokens
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 403 && errorText.includes('not allowed')) {
                    continue;
                }
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content || content.trim().length === 0) {
                continue;
            }

            return content;
        } catch (error) {
            lastError = error;
        }
    }

    throw new Error(`Échec IA : ${lastError?.message || 'Aucune réponse valide'}`);
}

/**
 * Conseil personnalisé pour une allocation
 */
export async function getAllocationAdvice(userData, selectedStrategy, amount) {
    const strategy = ALLOCATION_STRATEGIES[selectedStrategy];

    const prompt = `🏛️ CONSEIL DE L'ORACLE SUR LA RÉPARTITION 🏛️

SITUATION:
- Montant à répartir: ${formatCurrency(amount)}
- Stratégie choisie: ${strategy.name}
- Capital actuel: ${formatCurrency(userData.totalBalance || 0)}
- Revenus mensuels: ${formatCurrency(userData.totalIncome || 0)}
- Dettes: ${formatCurrency(userData.totalDebt || 0)}

SAGESSE APPLIQUÉE:
${strategy.wisdomSources.map(source => {
        const wisdom = FINANCIAL_WISDOM[source];
        return `- ${wisdom.icon} ${wisdom.name}: "${wisdom.rules[0].quote}"`;
    }).join('\n')}

MISSION:
En tant qu'Oracle incarnant ${strategy.wisdomSources.map(s => FINANCIAL_WISDOM[s].name).join(', ')}, analyse cette répartition de ${formatCurrency(amount)}.

1. Est-ce que cette stratégie "${strategy.name}" est ADAPTÉE à sa situation ?
2. Quelle est la PREMIÈRE ACTION concrète qu'il doit faire avec cet argent ?
3. Donne UN conseil de sage (métaphore puissante) sur cette répartition

Sois COURT (3 paragraphes max), PRÉCIS (chiffres exacts), et PUISSANT (métaphores).
Parle comme Arkad de Babylone qui conseille un jeune marchand.`;

    const systemPrompt = `Tu es l'Oracle de Shadoron, incarnation de la sagesse financière de Babylone, Chine, monde arabe et des grands investisseurs modernes.
    
Tu INCARNES ces principes:
- "Payez-vous d'abord" (Babylone)
- "Goutte à goutte, l'eau creuse la pierre" (Chine)
- "Celui qui se libère des dettes dort en paix" (Arabes)
- "Les riches achètent des actifs" (Kiyosaki)

Parle avec autorité bienveillante. Utilise des métaphores puissantes. Donne des chiffres précis.`;

    try {
        return await callAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ], 0.8, 2000);
    } catch (error) {
        return `L'Oracle médite sur cette répartition... La sagesse ancienne dit: "Une partie de tout ce que tu gagnes t'appartient." Garde au minimum ${formatCurrency(amount * 0.1)} pour ton avenir.`;
    }
}

/**
 * Analyse d'un objectif avec prédictions
 */
export async function analyzeGoalProgress(goal, contributions, prediction, optimization) {
    const progress = (goal.current_amount / goal.target_amount) * 100;

    const prompt = `🎯 ANALYSE D'OBJECTIF PAR L'ORACLE 🎯

OBJECTIF: ${goal.name}
- Cible: ${formatCurrency(goal.target_amount)}
- Actuel: ${formatCurrency(goal.current_amount)} (${Math.round(progress)}%)
- Deadline: ${goal.deadline ? new Date(goal.deadline).toLocaleDateString('fr-FR') : 'Non définie'}

PRÉDICTION MATHÉMATIQUE:
${prediction ? `
- Contribution moyenne: ${formatCurrency(prediction.avgContribution)}
- Fréquence: Tous les ${Math.round(prediction.avgDaysBetween)} jours
- Date prévue: ${prediction.predictedDate.toLocaleDateString('fr-FR')}
- Sur la bonne voie: ${prediction.onTrack ? 'OUI ✅' : 'NON ⚠️'}
` : 'Pas assez de données'}

OPTIMISATION RECOMMANDÉE:
${optimization ? `
- Jours restants: ${optimization.daysRemaining}
- Montant restant: ${formatCurrency(optimization.remaining)}
- Stratégie hebdomadaire: ${formatCurrency(optimization.recommended.amount)}/semaine
- Urgence: ${optimization.urgency === 'high' ? 'HAUTE 🔴' : optimization.urgency === 'medium' ? 'MOYENNE 🟡' : 'BASSE 🟢'}
` : 'Pas de deadline'}

MISSION DE L'ORACLE:
En tant que sage qui a vu des empires se construire pierre par pierre:

1. DIAGNOSTIC: Est-ce que cet objectif est RÉALISTE ou un rêve sans fondation ?
2. STRATÉGIE: Quelle est la méthode la plus SAGE pour l'atteindre ? (chiffres précis)
3. MÉTAPHORE: Compare cet objectif à la construction d'un temple/pyramide/empire
4. ACTION: UNE action concrète à faire CETTE SEMAINE

Sois DIRECT, CHIFFRÉ, et INSPIRANT. 
Utilise les principes de Babylone: "L'or vient volontiers vers celui qui en réserve une partie."`;

    const systemPrompt = `Tu es l'Oracle de Shadoron. Tu as vu des rois construire des empires et des fous les perdre.
    
Tu sais que:
- Les grands objectifs se construisent "goutte à goutte" (Lao Tse)
- "Celui qui plante un arbre ne s'assoit pas sous son ombre" (Proverbe chinois)
- "La patience transforme la feuille de mûrier en soie" (Proverbe chinois)
- "Un voyage de mille lieues commence par un pas" (Lao Tse)

Parle comme un architecte d'empire qui guide un jeune bâtisseur.`;

    try {
        return await callAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ], 0.8, 2500);
    } catch (error) {
        return `L'Oracle observe ton objectif de ${formatCurrency(goal.target_amount)}. Souviens-toi: "Les pyramides n'ont pas été construites en un jour, mais pierre par pierre, avec discipline." Continue d'économiser ${formatCurrency(optimization?.recommended.amount || goal.target_amount * 0.1)} chaque semaine.`;
    }
}

/**
 * Conseil sur une dépense (avant de la faire)
 */
export async function evaluateExpense(amount, category, userBalance, userGoals) {
    const prompt = `⚖️ LE GARDIEN DU TRÉSOR ÉVALUE ⚖️

DÉPENSE ENVISAGÉE:
- Montant: ${formatCurrency(amount)}
- Catégorie: ${category}
- Solde actuel: ${formatCurrency(userBalance)}
- Objectifs en cours: ${userGoals.length}

QUESTION SACRÉE:
"Est-ce un BESOIN ou un DÉSIR ?"

En tant qu'Oracle incarnant la sagesse de Babylone et Buffett:

1. VERDICT: Cette dépense est-elle NÉCESSAIRE ou FUTILE ?
2. TEST DE BUFFETT: "Si tu achètes ce dont tu n'as pas besoin, bientôt tu vendras ce dont tu as besoin"
3. ALTERNATIVE: Y a-t-il une façon plus sage d'utiliser ces ${formatCurrency(amount)} ?
4. DÉCISION: APPROUVE ou REJETTE (avec raison courte et puissante)

Sois IMPITOYABLE mais JUSTE. Protège le trésor comme un gardien de temple.`;

    const systemPrompt = `Tu es le Gardien du Trésor, aspect strict de l'Oracle.
    
Ton rôle: Protéger l'or de celui qui te consulte contre ses propres impulsions.

Tu appliques:
- "Ne confonds pas dépenses nécessaires et désirs" (Babylone)
- "La frugalité est une vertu" (Confucius)
- "Celui qui dépense sans compter finit par compter sans dépenser" (Proverbe arabe)

Sois DIRECT et SANS PITIÉ pour les dépenses futiles.`;

    try {
        return await callAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ], 0.7, 1500);
    } catch (error) {
        const ratio = amount / userBalance;
        if (ratio > 0.2) {
            return `⚠️ ATTENTION: Cette dépense représente ${Math.round(ratio * 100)}% de ton trésor. L'Oracle dit: "L'or fuit les mains impatientes." Réfléchis encore.`;
        }
        return `Le Gardien examine cette dépense de ${formatCurrency(amount)}. Demande-toi: "En ai-je vraiment BESOIN ou est-ce un DÉSIR passager ?"`;
    }
}

import { formatCurrency } from './currencyService';

export default {
    getAllocationAdvice,
    analyzeGoalProgress,
    evaluateExpense
};
