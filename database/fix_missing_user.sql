-- =====================================================
-- FIX MANUEL : CRÉER L'UTILISATEUR MANQUANT
-- =====================================================
-- Remplacez l'ID ci-dessous par celui qui s'affiche dans vos erreurs
-- (Exemple d'id vu dans vos logs : d9d0c25d-340b-47a0-9df7-f84d9109501d)

INSERT INTO public.users (id, email, username, password_hash)
VALUES 
  ('d9d0c25d-340b-47a0-9df7-f84d9109501d', 'votre-email@ici.com', 'Admin', 'supabase_auth')
ON CONFLICT (id) DO NOTHING;

-- Créer les données par défaut (catégories, profil gamification, etc.)
SELECT initialize_new_user('d9d0c25d-340b-47a0-9df7-f84d9109501d');

-- Si initialize_new_user échoue, voici la gamification manuelle :
INSERT INTO public.gamification (user_id, xp, level, current_streak)
VALUES ('d9d0c25d-340b-47a0-9df7-f84d9109501d', 0, 1, 0)
ON CONFLICT (user_id) DO NOTHING;
