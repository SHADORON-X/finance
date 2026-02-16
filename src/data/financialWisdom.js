// =====================================================
// BIBLIOTHÈQUE DE SAGESSE FINANCIÈRE UNIVERSELLE
// Règles anciennes et modernes de gestion de richesse
// =====================================================

export const FINANCIAL_WISDOM = {
    // ========== BABYLONE - L'Homme le Plus Riche de Babylone ==========
    babylon: {
        name: "Sagesse de Babylone",
        origin: "Ancienne Mésopotamie (2000 av. J.-C.)",
        icon: "🏛️",
        color: "#FFD700",
        rules: [
            {
                id: "babylon_1",
                title: "Payez-vous d'abord",
                description: "Économisez au minimum 10% de tous vos revenus avant toute dépense",
                allocation: { savings: 10 },
                priority: 1,
                quote: "Une partie de tout ce que vous gagnez vous appartient et doit rester vôtre"
            },
            {
                id: "babylon_2",
                title: "Contrôlez vos dépenses",
                description: "Ne dépensez pas plus de 70% de vos revenus pour vivre",
                allocation: { living: 70 },
                priority: 1,
                quote: "Ne confondez pas les dépenses nécessaires avec les désirs"
            },
            {
                id: "babylon_3",
                title: "Faites fructifier votre or",
                description: "Investissez 20% pour créer des revenus passifs",
                allocation: { investment: 20 },
                priority: 2,
                quote: "Faites travailler votre or pour vous et ses enfants travailleront pour vous"
            },
            {
                id: "babylon_4",
                title: "Protégez votre trésor",
                description: "Évitez les investissements risqués et consultez les sages",
                allocation: { emergency: 5 },
                priority: 1,
                quote: "Protégez votre trésor des pertes en n'investissant que dans des affaires sûres"
            },
            {
                id: "babylon_5",
                title: "Faites de votre demeure un investissement profitable",
                description: "Investissez dans des actifs qui génèrent de la valeur",
                allocation: { assets: 10 },
                priority: 3,
                quote: "Posséder sa propre maison réduit les coûts et augmente la richesse"
            },
            {
                id: "babylon_6",
                title: "Assurez un revenu futur",
                description: "Préparez votre retraite et l'avenir de votre famille",
                allocation: { retirement: 5 },
                priority: 2,
                quote: "Prévoyez pour vos vieux jours et la protection de votre famille"
            },
            {
                id: "babylon_7",
                title: "Augmentez votre capacité à gagner",
                description: "Investissez dans votre éducation et vos compétences",
                allocation: { education: 5 },
                priority: 2,
                quote: "Plus vous en savez, plus vous pouvez gagner"
            }
        ]
    },

    // ========== CHINE - Sagesse Confucéenne et Taoïste ==========
    china: {
        name: "Sagesse Chinoise",
        origin: "Chine Ancienne (500 av. J.-C. - présent)",
        icon: "🐉",
        color: "#DC143C",
        rules: [
            {
                id: "china_1",
                title: "La patience crée la richesse",
                description: "Épargnez lentement mais régulièrement - 15% minimum",
                allocation: { savings: 15 },
                priority: 1,
                quote: "Goutte à goutte, l'eau creuse la pierre"
            },
            {
                id: "china_2",
                title: "Équilibre du Yin et Yang",
                description: "Équilibrez revenus actifs (50%) et passifs (50%)",
                allocation: { active_income: 50, passive_income: 50 },
                priority: 2,
                quote: "L'harmonie entre effort et repos crée la prospérité"
            },
            {
                id: "china_3",
                title: "Trois générations",
                description: "Pensez sur 3 générations: vous, vos enfants, vos petits-enfants",
                allocation: { legacy: 10 },
                priority: 3,
                quote: "Plantez des arbres sous lesquels vous ne vous assiérez jamais"
            },
            {
                id: "china_4",
                title: "Diversification (Ne mettez pas tous vos œufs dans le même panier)",
                description: "Répartissez vos investissements sur 5-7 domaines différents",
                allocation: { diversification: 100 },
                priority: 1,
                quote: "Le sage ne dépend jamais d'une seule source de riz"
            },
            {
                id: "china_5",
                title: "Frugalité vertueuse",
                description: "Vivez avec 60% de vos revenus, le reste est pour l'avenir",
                allocation: { living: 60, future: 40 },
                priority: 1,
                quote: "Celui qui sait se contenter de peu ne manquera jamais de rien"
            }
        ]
    },

    // ========== MONDE ARABE - Sagesse Islamique et Marchande ==========
    arabic: {
        name: "Sagesse Arabe",
        origin: "Monde Arabo-Musulman (700 - présent)",
        icon: "🕌",
        color: "#00A86B",
        rules: [
            {
                id: "arabic_1",
                title: "Zakat - Purification de la richesse",
                description: "Donnez 2.5% de votre richesse annuelle en charité",
                allocation: { charity: 2.5 },
                priority: 1,
                quote: "La charité ne diminue jamais la richesse"
            },
            {
                id: "arabic_2",
                title: "Interdiction de l'usure (Riba)",
                description: "Évitez les dettes à intérêt, remboursez rapidement",
                allocation: { debt_payoff: 20 },
                priority: 1,
                quote: "Celui qui se libère des dettes dort en paix"
            },
            {
                id: "arabic_3",
                title: "Commerce équitable",
                description: "Investissez dans des affaires éthiques et profitables",
                allocation: { ethical_business: 15 },
                priority: 2,
                quote: "Le marchand honnête sera avec les prophètes au Paradis"
            },
            {
                id: "arabic_4",
                title: "Réserve pour l'imprévu",
                description: "Gardez 6 mois de dépenses en réserve",
                allocation: { emergency: 15 },
                priority: 1,
                quote: "Prépare-toi pour les jours difficiles pendant les jours d'abondance"
            },
            {
                id: "arabic_5",
                title: "Investissement productif",
                description: "Investissez dans ce qui produit de la valeur réelle",
                allocation: { productive_assets: 25 },
                priority: 2,
                quote: "La meilleure richesse est celle qui travaille pour toi"
            }
        ]
    },

    // ========== AMÉRIQUE - Capitalisme Moderne ==========
    american: {
        name: "Sagesse Américaine",
        origin: "États-Unis (1900 - présent)",
        icon: "🦅",
        color: "#0052A5",
        rules: [
            {
                id: "american_1",
                title: "Règle 50/30/20 (Elizabeth Warren)",
                description: "50% besoins, 30% désirs, 20% épargne/investissement",
                allocation: { needs: 50, wants: 30, savings: 20 },
                priority: 1,
                quote: "Un budget équilibré est la clé de la liberté financière"
            },
            {
                id: "american_2",
                title: "Payez-vous d'abord (Robert Kiyosaki)",
                description: "Investissez 15-20% avant toute dépense",
                allocation: { investment: 15 },
                priority: 1,
                quote: "Les riches achètent des actifs, les pauvres des passifs"
            },
            {
                id: "american_3",
                title: "Fonds d'urgence de 6 mois",
                description: "Constituez une réserve de 6 mois de dépenses",
                allocation: { emergency: 10 },
                priority: 1,
                quote: "La sécurité financière commence par un coussin de sécurité"
            },
            {
                id: "american_4",
                title: "Investissement agressif (Warren Buffett)",
                description: "Investissez 30-40% dans des actifs à long terme",
                allocation: { long_term_investment: 30 },
                priority: 2,
                quote: "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant"
            },
            {
                id: "american_5",
                title: "Automatisation (David Bach)",
                description: "Automatisez vos épargnes et investissements",
                allocation: { auto_savings: 10, auto_investment: 10 },
                priority: 1,
                quote: "Rendez-vous riche automatiquement"
            }
        ]
    },

    // ========== TECHNIQUES MODERNES DE FORTUNE ==========
    modern: {
        name: "Techniques Modernes",
        origin: "Entrepreneurs et Investisseurs Contemporains",
        icon: "🚀",
        color: "#9D00FF",
        rules: [
            {
                id: "modern_1",
                title: "Règle des 4% (FIRE Movement)",
                description: "Épargnez 25x vos dépenses annuelles pour la retraite anticipée",
                allocation: { fire_savings: 50 },
                priority: 3,
                quote: "Liberté financière = Dépenses annuelles × 25"
            },
            {
                id: "modern_2",
                title: "Méthode Boule de Neige (Dave Ramsey)",
                description: "Remboursez les petites dettes d'abord pour la motivation",
                allocation: { debt_snowball: 30 },
                priority: 1,
                quote: "Les petites victoires créent l'élan pour les grandes"
            },
            {
                id: "modern_3",
                title: "Investissement indiciel (John Bogle)",
                description: "Investissez 20% dans des fonds indiciels à faibles frais",
                allocation: { index_funds: 20 },
                priority: 2,
                quote: "Ne cherchez pas l'aiguille, achetez la botte de foin"
            },
            {
                id: "modern_4",
                title: "Revenus multiples (MJ DeMarco)",
                description: "Créez 3-7 sources de revenus différentes",
                allocation: { income_streams: 100 },
                priority: 2,
                quote: "La richesse se construit sur plusieurs piliers"
            },
            {
                id: "modern_5",
                title: "Réinvestissement des profits",
                description: "Réinvestissez 80% de vos gains dans la croissance",
                allocation: { reinvestment: 80 },
                priority: 2,
                quote: "La croissance exponentielle vient du réinvestissement"
            },
            {
                id: "modern_6",
                title: "Optimisation fiscale légale",
                description: "Utilisez 5-10% pour l'optimisation fiscale",
                allocation: { tax_optimization: 5 },
                priority: 3,
                quote: "Ce n'est pas ce que vous gagnez, c'est ce que vous gardez"
            }
        ]
    },

    // ========== ROIS ET EMPIRES ==========
    royalty: {
        name: "Sagesse Royale",
        origin: "Empires et Royaumes Historiques",
        icon: "👑",
        color: "#FFD700",
        rules: [
            {
                id: "royalty_1",
                title: "Trésor Royal (Règle des Rois)",
                description: "Gardez toujours 20% en réserve liquide",
                allocation: { royal_treasury: 20 },
                priority: 1,
                quote: "Un roi sans trésor n'est pas un roi"
            },
            {
                id: "royalty_2",
                title: "Investissement dans le Royaume",
                description: "Investissez 30% dans des actifs productifs",
                allocation: { kingdom_assets: 30 },
                priority: 2,
                quote: "La richesse d'un royaume se mesure à sa production"
            },
            {
                id: "royalty_3",
                title: "Héritage dynastique",
                description: "Préparez 15% pour les générations futures",
                allocation: { legacy: 15 },
                priority: 3,
                quote: "Un grand roi pense à sept générations"
            }
        ]
    }
};

// ========== STRATÉGIES DE RÉPARTITION PRÉDÉFINIES ==========
export const ALLOCATION_STRATEGIES = {
    conservative: {
        name: "Conservateur (Babylone + Arabe)",
        description: "Sécurité maximale, croissance lente et stable",
        icon: "🛡️",
        color: "#4CAF50",
        allocation: {
            savings: 15,
            emergency: 15,
            living: 50,
            investment: 10,
            charity: 2.5,
            education: 5,
            debt_payoff: 2.5
        },
        wisdomSources: ["babylon", "arabic"]
    },
    balanced: {
        name: "Équilibré (50/30/20 Moderne)",
        description: "Équilibre entre sécurité et croissance",
        icon: "⚖️",
        color: "#2196F3",
        allocation: {
            needs: 50,
            wants: 30,
            savings: 10,
            investment: 10
        },
        wisdomSources: ["american", "babylon"]
    },
    aggressive: {
        name: "Agressif (Croissance Rapide)",
        description: "Maximiser la croissance et les investissements",
        icon: "🚀",
        color: "#FF5722",
        allocation: {
            living: 40,
            investment: 35,
            savings: 15,
            education: 10
        },
        wisdomSources: ["modern", "american"]
    },
    debtFree: {
        name: "Liberté des Dettes (Boule de Neige)",
        description: "Focus sur l'élimination rapide des dettes",
        icon: "🦅",
        color: "#9C27B0",
        allocation: {
            living: 50,
            debt_payoff: 35,
            emergency: 10,
            savings: 5
        },
        wisdomSources: ["modern", "arabic"]
    },
    wealth_builder: {
        name: "Constructeur de Fortune (Multi-sources)",
        description: "Créer plusieurs sources de revenus",
        icon: "💎",
        color: "#FFD700",
        allocation: {
            living: 40,
            investment: 25,
            business: 20,
            education: 10,
            savings: 5
        },
        wisdomSources: ["modern", "royalty", "china"]
    },
    fire: {
        name: "FIRE (Retraite Anticipée)",
        description: "Épargne maximale pour liberté financière rapide",
        icon: "🔥",
        color: "#FF6F00",
        allocation: {
            living: 30,
            investment: 50,
            emergency: 15,
            education: 5
        },
        wisdomSources: ["modern", "china"]
    }
};

// ========== CONSEILS STRATÉGIQUES PAR SITUATION ==========
export const STRATEGIC_ADVICE = {
    low_income: {
        title: "Revenus Modestes",
        advice: [
            "Commencez petit: même 5% d'épargne est un début",
            "Concentrez-vous sur l'augmentation de vos compétences (éducation)",
            "Évitez absolument les dettes à intérêt élevé",
            "Créez un fonds d'urgence de 500-1000 FCFA d'abord"
        ],
        recommendedStrategy: "conservative"
    },
    medium_income: {
        title: "Revenus Moyens",
        advice: [
            "Appliquez strictement la règle 50/30/20",
            "Constituez 3-6 mois de dépenses en fonds d'urgence",
            "Commencez à investir dans des actifs productifs",
            "Diversifiez vos sources de revenus"
        ],
        recommendedStrategy: "balanced"
    },
    high_income: {
        title: "Revenus Élevés",
        advice: [
            "Investissez agressivement (30-50% de vos revenus)",
            "Créez des revenus passifs multiples",
            "Optimisez votre fiscalité légalement",
            "Pensez à l'héritage et aux générations futures"
        ],
        recommendedStrategy: "aggressive"
    },
    in_debt: {
        title: "Endetté",
        advice: [
            "Utilisez la méthode boule de neige pour la motivation",
            "Ou la méthode avalanche pour économiser sur les intérêts",
            "Réduisez vos dépenses au strict minimum (50%)",
            "Augmentez vos revenus avec des activités secondaires"
        ],
        recommendedStrategy: "debtFree"
    },
    entrepreneur: {
        title: "Entrepreneur",
        advice: [
            "Réinvestissez 60-80% des profits dans la croissance",
            "Gardez toujours 6-12 mois de réserve",
            "Séparez finances personnelles et professionnelles",
            "Diversifiez vos investissements hors de votre business"
        ],
        recommendedStrategy: "wealth_builder"
    }
};

export default FINANCIAL_WISDOM;
