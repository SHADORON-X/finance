# 🚀 Installation du Système de Répartition Intelligente

## Étapes d'Installation

### 1. Exécuter le Script SQL

Connectez-vous à votre base de données Supabase et exécutez le script :

```bash
# Dans le SQL Editor de Supabase, exécutez :
database/allocations_table.sql
```

Ou via psql :

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f database/allocations_table.sql
```

### 2. Vérifier l'Installation

Vérifiez que la table a été créée :

```sql
SELECT * FROM allocations LIMIT 1;
```

### 3. Tester le Système

1. Démarrez l'application :
```bash
npm run dev
```

2. Connectez-vous à votre compte

3. Naviguez vers **Répartition** dans la barre de navigation

4. Testez la création d'une allocation :
   - Entrez un montant (ex: 50000 FCFA)
   - Sélectionnez une stratégie (ex: Équilibré)
   - Vérifiez la simulation
   - Créez l'allocation
   - Appliquez-la

## Fonctionnalités Disponibles

✅ **6 Stratégies Prédéfinies**
- Conservateur
- Équilibré
- Agressif
- Liberté des Dettes
- Constructeur de Fortune
- FIRE (Retraite Anticipée)

✅ **6 Sources de Sagesse**
- Babylone (7 règles)
- Chine (5 principes)
- Monde Arabe (5 règles)
- Amérique (5 stratégies)
- Techniques Modernes (6 méthodes)
- Sagesse Royale (3 principes)

✅ **Conseils Personnalisés**
- Analyse automatique de votre situation
- Recommandations adaptées
- Métriques financières en temps réel

✅ **Allocation Automatique**
- Basée sur vos objectifs
- Calcul intelligent des pourcentages
- Application en un clic

## Structure des Fichiers Créés

```
finance/
├── src/
│   ├── data/
│   │   └── financialWisdom.js          # Bibliothèque de sagesse
│   ├── services/
│   │   └── allocationService.js        # Service de répartition
│   └── pages/
│       ├── AllocationPage.jsx          # Page principale
│       └── AllocationPage.css          # Styles
├── database/
│   └── allocations_table.sql           # Schéma SQL
└── ALLOCATION_SYSTEM.md                # Documentation complète
```

## Prochaines Étapes

1. **Créez vos objectifs** dans la page Objectifs
2. **Testez différentes stratégies** pour voir laquelle vous convient
3. **Consultez la sagesse** pour apprendre les principes
4. **Appliquez régulièrement** vos allocations

## Support

Pour toute question, consultez :
- `ALLOCATION_SYSTEM.md` - Documentation complète
- `README.md` - Guide général de l'application

---

**Bonne gestion financière !** 💰⚔️
