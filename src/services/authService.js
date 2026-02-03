// =====================================================
// SERVICE D'AUTHENTIFICATION
// =====================================================
import { supabase } from '../lib/supabase';

/**
 * Inscription d'un nouvel utilisateur
 */
export const signUp = async (email, password, username) => {
    try {
        // 1. Créer l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (authError) throw authError;

        // 2. Créer l'entrée dans la table users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email: email,
                    username: username,
                    password_hash: 'handled_by_supabase_auth'
                }
            ])
            .select()
            .single();

        if (userError) throw userError;

        // 3. Initialiser les données de l'utilisateur
        await initializeUserData(authData.user.id);

        return { user: authData.user, profile: userData };
    } catch (error) {
        console.error('Error in signUp:', error);

        // Gestion spécifique des erreurs de Rate Limit
        if (error.status === 429 || (error.message && error.message.includes('rate limit'))) {
            throw new Error('Trop de tentatives. Veuillez attendre 15 minutes ou utiliser un autre email.');
        }

        throw error;
    }
};

/**
 * Connexion
 */
export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Mettre à jour last_login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);

        return data;
    } catch (error) {
        console.error('Error in signIn:', error);
        throw error;
    }
};

/**
 * Déconnexion
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Obtenir l'utilisateur actuel
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

/**
 * Obtenir le profil complet de l'utilisateur
 */
export const getUserProfile = async (userId) => {
    let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // maybeSingle évite l'exception immédiate

    // Si pas de profil mais userId valide, on tente de réparer (Auto-Healing)
    if (!data) {
        console.warn(`⚠️ Profil introuvable pour ${userId}. Tentative de réparation...`);
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.id === userId) {
            const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert([{
                    id: user.id,
                    email: user.email,
                    username: user.user_metadata?.username || user.email.split('@')[0],
                    password_hash: 'handled_by_supabase_auth'
                }])
                .select()
                .single();

            if (createError) throw createError;

            // Initialiser aussi les données par défaut (catégories, etc.)
            await initializeUserData(userId);

            return newProfile;
        }
    }

    if (error) throw error;
    return data;
};

/**
 * Initialiser les données d'un nouvel utilisateur
 */
const initializeUserData = async (userId) => {
    try {
        // Appeler la fonction SQL pour initialiser l'utilisateur
        const { error } = await supabase.rpc('initialize_new_user', {
            p_user_id: userId
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error initializing user data:', error);
        throw error;
    }
};

/**
 * Réinitialiser le mot de passe
 */
export const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
};

/**
 * Mettre à jour le mot de passe
 */
export const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) throw error;
};

/**
 * Mettre à jour le profil utilisateur
 */
export const updateUserProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};
