# 📝 GUIDE DE CONFIGURATION SUPABASE

Ce guide vous explique comment configurer Supabase pour SHADORON Finance.

## 🎯 Étape 1: Créer un Projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez un compte ou connectez-vous
4. Cliquez sur "New Project"
5. Remplissez les informations:
   - **Name**: shadoron-finance
   - **Database Password**: Choisissez un mot de passe fort
   - **Region**: Choisissez la région la plus proche
6. Cliquez sur "Create new project"
7. Attendez quelques minutes que le projet soit créé

## 🗄️ Étape 2: Exécuter le Schéma SQL

1. Dans votre projet Supabase, allez dans **SQL Editor** (menu de gauche)
2. Cliquez sur **New query**
3. Ouvrez le fichier `database/schema.sql` de ce projet
4. Copiez TOUT le contenu
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **Run** (ou Ctrl+Enter)
7. Attendez que toutes les commandes s'exécutent (cela peut prendre 1-2 minutes)
8. Vérifiez qu'il n'y a pas d'erreurs

## 🔑 Étape 3: Récupérer les Clés API

1. Allez dans **Settings** > **API** (menu de gauche)
2. Vous verrez deux clés importantes:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (une longue chaîne)
3. Copiez ces deux valeurs

## ⚙️ Étape 4: Configurer l'Application

1. Dans le dossier du projet, copiez `.env.example` vers `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Ouvrez `.env.local` et remplissez:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

3. Sauvegardez le fichier

## 🔒 Étape 5: Configurer l'Authentification

1. Dans Supabase, allez dans **Authentication** > **Providers**
2. Activez **Email** (devrait être activé par défaut)
3. Configurez les options:
   - **Enable email confirmations**: ❌ DÉSACTIVEZ CECI pour le développement (sinon vous serez bloqué par des liens localhost ou rate limits)
   - **Confirm email**: Décochez la case
   - **Enable email change confirmations**: Désactivez pour le développement
   - **Secure email change**: Désactivez pour le développement

4. Allez dans **URL Configuration**:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: Ajoutez:
     ```
     http://localhost:5173/**
     http://127.0.0.1:5173/**
     ```

## ✅ Étape 6: Vérifier l'Installation

1. Dans Supabase, allez dans **Table Editor**
2. Vous devriez voir toutes les tables:
   - users
   - categories
   - balances
   - transactions
   - goals
   - goal_contributions
   - debts
   - debt_payments
   - gamification
   - badges
   - notifications
   - recurring_transactions
   - budgets
   - analytics_cache

3. Cliquez sur une table pour voir sa structure

## 🧪 Étape 7: Tester la Connexion

1. Lancez l'application:
   ```bash
   npm run dev
   ```

2. Ouvrez `http://localhost:5173`
3. Créez un compte de test
4. Si tout fonctionne, vous devriez:
   - Être redirigé vers le dashboard
   - Voir vos catégories par défaut
   - Pouvoir ajouter des transactions

## 🔍 Étape 8: Vérifier les Données dans Supabase

1. Retournez dans Supabase > **Table Editor**
2. Cliquez sur la table **users**
3. Vous devriez voir votre utilisateur de test
4. Cliquez sur **categories**
5. Vous devriez voir les 5 catégories par défaut:
   - Épargne (🔒)
   - Nourriture (🍽️)
   - Projet (🎯)
   - Transport (🚗)
   - Autres (📦)

## 🛠️ Dépannage

### Erreur: "Missing Supabase environment variables"

**Solution**: Vérifiez que `.env.local` existe et contient les bonnes valeurs.

### Erreur: "relation does not exist"

**Solution**: Le schéma SQL n'a pas été exécuté correctement. Réexécutez `database/schema.sql`.

### Erreur: "JWT expired" ou "Invalid JWT"

**Solution**: 
1. Allez dans Supabase > **Settings** > **API**
2. Cliquez sur "Reset JWT Secret"
3. Mettez à jour votre `.env.local` avec la nouvelle clé

### Les données ne s'affichent pas

**Solution**:
1. Vérifiez que RLS (Row Level Security) est bien configuré
2. Dans Supabase > **Authentication** > **Policies**
3. Vérifiez que les policies existent pour toutes les tables

### Impossible de créer un compte

**Solution**:
1. Vérifiez les paramètres d'authentification
2. Désactivez les confirmations d'email pour le développement
3. Vérifiez les logs dans Supabase > **Logs**

## 📊 Requêtes SQL Utiles

### Voir tous les utilisateurs
```sql
SELECT * FROM users;
```

### Voir les transactions d'un utilisateur
```sql
SELECT * FROM transactions WHERE user_id = 'votre-user-id' ORDER BY timestamp DESC;
```

### Voir les soldes
```sql
SELECT 
  b.amount,
  c.name,
  c.icon
FROM balances b
JOIN categories c ON b.category_id = c.id
WHERE b.user_id = 'votre-user-id';
```

### Réinitialiser les données d'un utilisateur
```sql
-- ATTENTION: Ceci supprime TOUTES les données de l'utilisateur
DELETE FROM transactions WHERE user_id = 'votre-user-id';
DELETE FROM goals WHERE user_id = 'votre-user-id';
DELETE FROM debts WHERE user_id = 'votre-user-id';
UPDATE balances SET amount = 0 WHERE user_id = 'votre-user-id';
UPDATE gamification SET xp = 0, level = 1, current_streak = 0 WHERE user_id = 'votre-user-id';
```

## 🚀 Passer en Production

Quand vous êtes prêt pour la production:

1. **Activez les confirmations d'email**:
   - Authentication > Providers > Email
   - Enable email confirmations: ✅

2. **Configurez les URLs de production**:
   - Authentication > URL Configuration
   - Site URL: `https://votre-domaine.com`
   - Redirect URLs: `https://votre-domaine.com/**`

3. **Mettez à jour `.env.local`** (ou créez `.env.production`):
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

4. **Buildez l'application**:
   ```bash
   npm run build
   ```

5. **Déployez** sur Vercel, Netlify, ou votre hébergeur préféré

## 📞 Support

Si vous rencontrez des problèmes:

1. Consultez la [documentation Supabase](https://supabase.com/docs)
2. Vérifiez les logs dans Supabase > **Logs**
3. Ouvrez une issue sur GitHub

---

⚔️ **SHADORON Finance** - Configuration Supabase
