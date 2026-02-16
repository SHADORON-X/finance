export const IMPERIAL_MISSIONS = [
    {
        id: 'ascetic_warrior',
        title: "Le Guerrier Ascétique",
        description: "Zéro dépense superflue (Vices/Extras) pendant 7 jours consécutifs.",
        reward: 500,
        icon: "🥋",
        type: 'discipline'
    },
    {
        id: 'capital_builder',
        title: "Bâtisseur de Capital",
        description: "Épargner au moins 30% de vos revenus ce mois-ci.",
        reward: 1000,
        icon: "🏗️",
        type: 'wealth'
    },
    {
        id: 'debt_slayer',
        title: "Tueur de Dettes",
        description: "Rembourser 100% d'une de vos dettes actives.",
        reward: 800,
        icon: "⚔️",
        type: 'freedom'
    },
    {
        id: 'oracle_student',
        title: "Disciple de l'Oracle",
        description: "Consulter l'IA 5 jours de suite pour affiner votre stratégie.",
        reward: 300,
        icon: "📜",
        type: 'knowledge'
    }
];

export const getActiveMissions = (userXp) => {
    // On pourrait filtrer par niveau, mais pour l'empire, tout est ouvert
    return IMPERIAL_MISSIONS;
};
