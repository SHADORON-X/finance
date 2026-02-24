-- ================================================================
-- CORRECTIF D'URGENCE RLS POUR LES NOTIFICATIONS
-- Débloque l'insertion/mise à jour pour la table des notifications
-- ================================================================

-- 1. S'assurer que le RLS est actif
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Nettoyer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

-- 3. Créer une politique permissive (Full CRUD) pour le propriétaire
CREATE POLICY "Users can manage their own notifications" 
    ON public.notifications
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
-- Note additionnelle: Si un trigger ou fonction côté serveur crée une notification (ex: en contournant le RLS), 
-- ce droit est déjà inclus si on utilise "SECURITY DEFINER" dans la fonction. 
-- Sinon, la politique FOR ALL gère ça au niveau de l'utilisateur.
