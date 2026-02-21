-- =====================================================================
-- MIGRATION : SYSTÈME DE CONFIGURATION BUDGÉTAIRE IMPÉRIALE
-- Pour synchroniser le profil, les catégories et les lois de l'opérateur
-- =====================================================================

-- 1. Création de la table de configuration
CREATE TABLE IF NOT EXISTS public.user_budget_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profil JSONB NOT NULL DEFAULT '{
        "titre": "Opérateur Tech — Phase Construction",
        "situation": "Initialisation...",
        "regleOr": "Si revenus ↑ → style de vie = · Seules épargne et business augmentent.",
        "basePrudente": 1000000
    }',
    categories JSONB NOT NULL DEFAULT '[]',
    surplus_rule JSONB NOT NULL DEFAULT '{
        "equipment": 50,
        "business": 30,
        "savings": 20
    }',
    lois JSONB NOT NULL DEFAULT '[]',
    version INTEGER DEFAULT 2,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Activation de la sécurité (RLS)
ALTER TABLE public.user_budget_configs ENABLE ROW LEVEL SECURITY;

-- 3. Politiques d'accès
DROP POLICY IF EXISTS "Users can manage their own budget config" ON public.user_budget_configs;
CREATE POLICY "Users can manage their own budget config"
ON public.user_budget_configs
FOR ALL
USING (auth.uid() = user_id);

-- 4. Trigger pour la mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_budget_configs_updated_at ON public.user_budget_configs;
CREATE TRIGGER update_user_budget_configs_updated_at
BEFORE UPDATE ON public.user_budget_configs
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- 5. Commentaire descriptif
COMMENT ON TABLE public.user_budget_configs IS 'Stocke la configuration impériale personnalisée (profil, secteurs, lois) de l''opérateur.';
