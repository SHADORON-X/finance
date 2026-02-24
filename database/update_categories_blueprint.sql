-- =====================================================
-- MISE A JOUR DU COMPTE ACTUEL VERS LE NOUVEAU BLUEPRINT
-- Ce script remplace tes anciennes catégories par le Blueprint Stratégique,
-- redistribue proprement l'argent existant et recrée les balances.
-- =====================================================

DO $$
DECLARE
    v_user_id UUID;
    v_total_available DECIMAL(15,2) := 0;
    
    -- Variables pour stocker les IDs des nouvelles catégories
    v_cat_epargne UUID;
    v_cat_imprevus UUID;
    v_cat_projet UUID;
    v_cat_competences UUID;
    v_cat_internet UUID;
    v_cat_nourriture UUID;
    v_cat_transport UUID;
    v_cat_confort UUID;
BEGIN
    -- S'assurer qu'on traite le seul utilisateur existant (ou ajuster si plusieurs)
    SELECT id INTO v_user_id FROM public.users LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Erreur : Aucun utilisateur trouvé.';
        RETURN;
    END IF;

    -- 1️⃣ Récupérer TOUT l'argent disponible en banque (sum of all balances)
    SELECT COALESCE(SUM(amount), 0) INTO v_total_available
    FROM public.balances
    WHERE user_id = v_user_id;
    
    -- 2️⃣ Supprimer toutes les anciennes catégories (cascade supprimera indirectement les balances, sauf si contraintes fortes)
    -- On supprime les balances en premier pour être propre (l'argent total a été sauvegardé en mémoire)
    DELETE FROM public.balances WHERE user_id = v_user_id;

    -- Les transactions peuvent pointer sur category_id (ON DELETE SET NULL),
    -- on peut donc supprimer les catégories en sécurité de perte d'historique.
    DELETE FROM public.categories WHERE user_id = v_user_id;


    -- 3️⃣ Créer le NOUVEAU Blueprint de A à Z (8 Secteurs/Comptes avec tes pourcentages exacts)
    
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color)
    VALUES (v_user_id, 'Épargne Stratégique', '🔒', 25, true, '#10b981') RETURNING id INTO v_cat_epargne;
    
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color)
    VALUES (v_user_id, 'Fonds Imprévus', '🚨', 10, false, '#ef4444') RETURNING id INTO v_cat_imprevus;
    
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color)
    VALUES (v_user_id, 'Projet / Velmo', '🎯', 30, false, '#3b82f6') RETURNING id INTO v_cat_projet;
    
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color)
    VALUES (v_user_id, 'Compétences', '🧠', 12, false, '#8b5cf6') RETURNING id INTO v_cat_competences;
    
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color)
    VALUES (v_user_id, 'Internet & Outils', '🌐', 8, false, '#06b6d4') RETURNING id INTO v_cat_internet;
    
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color)
    VALUES (v_user_id, 'Nourriture', '🍽️', 10, false, '#f59e0b') RETURNING id INTO v_cat_nourriture;
    
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color)
    VALUES (v_user_id, 'Transport', '🚗', 5, false, '#6366f1') RETURNING id INTO v_cat_transport;
    
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color)
    VALUES (v_user_id, 'Confort / Perso', '🎧', 0, false, '#ec4899') RETURNING id INTO v_cat_confort;

    -- 4️⃣ Créer de nouvelles balances à 0 pour tous les secteurs
    INSERT INTO public.balances (user_id, category_id, amount)
    SELECT v_user_id, id, 0
    FROM public.categories
    WHERE user_id = v_user_id;

    -- 5️⃣ Rembourser (Injecter) tout ton ancien argent dans la nouvelle structure Blueprint
    -- On va s'assurer que tu ne perds pas un centime de ce qu'il y avait avant. 
    -- Tout le monde reçoit une part en fonction de ce Blueprint.
    
    IF v_total_available > 0 THEN
        UPDATE balances SET amount = amount + ROUND(v_total_available * (25.0 / 100.0)) WHERE category_id = v_cat_epargne;
        UPDATE balances SET amount = amount + ROUND(v_total_available * (10.0 / 100.0)) WHERE category_id = v_cat_imprevus;
        UPDATE balances SET amount = amount + ROUND(v_total_available * (30.0 / 100.0)) WHERE category_id = v_cat_projet;
        UPDATE balances SET amount = amount + ROUND(v_total_available * (12.0 / 100.0)) WHERE category_id = v_cat_competences;
        UPDATE balances SET amount = amount + ROUND(v_total_available * (8.0 / 100.0)) WHERE category_id = v_cat_internet;
        UPDATE balances SET amount = amount + ROUND(v_total_available * (10.0 / 100.0)) WHERE category_id = v_cat_nourriture;
        UPDATE balances SET amount = amount + ROUND(v_total_available * (5.0 / 100.0))  WHERE category_id = v_cat_transport;
        -- Confort reste à 0 pour l'instant (0%)
    END IF;

END $$;
