# 🚀 SHADORON FINANCE - Application de Gestion Financière

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Description

**SHADORON Finance** est une application web moderne de gestion financière personnelle avec gamification. Elle vous aide à gérer vos revenus, dépenses, objectifs financiers et dettes avec discipline et motivation.

### ✨ Fonctionnalités Principales

- 💰 **Gestion des Transactions**: Enregistrez vos revenus et dépenses
- 📊 **Catégories Personnalisables**: Organisez votre budget par catégories
- 🎯 **Objectifs Financiers**: Définissez et suivez vos objectifs (achats, épargne, etc.)
- 💳 **Gestion des Dettes**: Suivez et remboursez vos dettes avec stratégies optimales
- 🏆 **Gamification**: XP, niveaux, badges et streaks pour rester motivé
- 📈 **Analytics**: Visualisez vos finances avec des graphiques
- 🌙 **Thèmes**: Dark, Light, Neon, Zen
- 📱 **PWA**: Installez l'app sur mobile/desktop
- 🔒 **Sécurisé**: Authentification Supabase avec RLS

## 🏗️ Architecture

### Stack Technique

- **Frontend**: React 18 + Vite
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS Variables + Animations
- **Charts**: Chart.js
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

### Structure du Projet

```
finance/
├── database/
│   └── schema.sql              # Schéma SQL complet pour Supabase
├── src/
│   ├── components/             # Composants React réutilisables
│   ├── pages/                  # Pages de l'application
│   ├── services/               # Services Supabase
│   │   ├── authService.js
│   │   ├── transactionService.js
│   │   ├── goalService.js
│   │   ├── debtService.js
│   │   ├── gamificationService.js
│   │   └── balanceService.js
│   ├── store/                  # Zustand stores
│   ├── lib/                    # Configuration Supabase
│   ├── App.jsx                 # Composant principal
│   ├── main.jsx                # Point d'entrée
│   └── index.css               # Styles globaux
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (gratuit)

### Étape 1: Cloner et Installer

```bash
cd /Users/developpement/Documents/finance
npm install
```

### Étape 2: Configuration Supabase

1. **Créer un projet Supabase**:
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Notez votre `URL` et `anon key`

2. **Exécuter le schéma SQL**:
   - Ouvrez le SQL Editor dans Supabase
   - Copiez le contenu de `database/schema.sql`
   - Exécutez le script

3. **Configurer les variables d'environnement**:
   ```bash
   cp .env.example .env.local
   ```
   
   Éditez `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
   ```

### Étape 3: Lancer l'Application

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📊 Base de Données

### Tables Principales

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs de l'application |
| `categories` | Catégories de budget |
| `balances` | Soldes par catégorie |
| `transactions` | Historique revenus/dépenses |
| `goals` | Objectifs financiers |
| `goal_contributions` | Contributions aux objectifs |
| `debts` | Dettes à rembourser |
| `debt_payments` | Paiements de dettes |
| `gamification` | XP, niveaux, streaks |
| `badges` | Badges débloqués |
| `notifications` | Notifications utilisateur |

### Fonctions SQL Utiles

- `initialize_new_user(user_id)`: Initialise un nouvel utilisateur
- `update_user_streak(user_id)`: Met à jour le streak
- `calculate_total_balance(user_id)`: Calcule le solde total

### Vues

- `user_financial_summary`: Résumé financier par utilisateur
- `active_goals_progress`: Objectifs actifs avec progression
- `active_debts_summary`: Dettes actives

## 🎮 Système de Gamification

### Rangs et Niveaux

| Niveau | Rang | XP Requis | Icône |
|--------|------|-----------|-------|
| 1 | Recrue | 0 | 🎖️ |
| 2 | Soldat | 100 | ⚔️ |
| 3 | Sergent | 300 | 🗡️ |
| 4 | Lieutenant | 600 | 🛡️ |
| 5 | Capitaine | 1000 | 🏅 |
| 6 | Commandant | 1500 | 👑 |
| 7 | Général | 2500 | ⭐ |
| 8 | Légende | 5000 | 🌟 |

### Gains d'XP

- **+10 XP**: Enregistrer un revenu
- **+5 XP**: Enregistrer une dépense
- **Bonus Streak**: +X XP (X = nombre de jours consécutifs)

### Badges Disponibles

- 🌱 **Premier Pas**: Premier revenu
- 📈 **Régulier**: 10 revenus
- 💪 **Discipline**: 50 revenus
- 🏦 **Épargnant**: 10,000 FCFA en épargne
- 💎 **Coffre Fort**: 100,000 FCFA en épargne
- 🔥 **Semaine Parfaite**: 7 jours de streak
- 🏆 **Mois Héroïque**: 30 jours de streak
- 👑 **Centurion**: 100 jours de streak
- ⚡ **Actif**: 100 opérations
- 🎯 **Vétéran**: 500 opérations
- ✅ **Accomplissement**: Premier objectif atteint
- 🦅 **Liberté**: Toutes les dettes payées

## 🎯 Gestion des Objectifs

### Types d'Objectifs

- **Achats**: Disque dur, téléphone, ordinateur, etc.
- **Épargne**: Fonds d'urgence, vacances
- **Investissement**: Actions, crypto, formation
- **Dettes**: Remboursement de prêts

### Priorités

1-5 (1 = faible, 5 = critique)

## 💳 Gestion des Dettes

### Stratégies de Remboursement

1. **Méthode Boule de Neige**: Rembourser les petites dettes d'abord
2. **Méthode Avalanche**: Rembourser les dettes à haut taux d'intérêt d'abord

## 🔐 Sécurité

- **Row Level Security (RLS)**: Chaque utilisateur ne voit que ses données
- **Authentification**: JWT via Supabase Auth
- **Validation**: Côté client et serveur
- **HTTPS**: Toutes les communications sont chiffrées

## 📱 PWA (Progressive Web App)

L'application peut être installée sur:
- 📱 Mobile (iOS/Android)
- 💻 Desktop (Windows/Mac/Linux)

### Installation

1. Ouvrez l'app dans votre navigateur
2. Cliquez sur "Installer" dans la barre d'adresse
3. L'app sera disponible comme une application native

## 🎨 Thèmes

- **Dark** (Stealth): Thème sombre par défaut
- **Light** (Tactical): Thème clair
- **Neon** (Warrior): Thème cyberpunk
- **Zen** (Minimal): Thème minimaliste

## 🚀 Déploiement

### Build de Production

```bash
npm run build
```

Les fichiers seront dans le dossier `dist/`

### Déploiement sur Vercel

```bash
npm install -g vercel
vercel
```

### Déploiement sur Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🤝 Contribution

Les contributions sont les bienvenues! Pour contribuer:

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

MIT License - voir le fichier LICENSE pour plus de détails

## 👨‍💻 Auteur

**SHADORON Team**

## 🙏 Remerciements

- Supabase pour la BaaS
- Vite pour le build tool
- React pour le framework
- Chart.js pour les graphiques
- Framer Motion pour les animations

---

⚔️ **SHADORON Finance** - La discipline financière, gamifiée.
