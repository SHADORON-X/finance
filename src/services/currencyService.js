// =====================================================================
// SERVICE DE GESTION MULTI-DEVISES
// Gère la conversion, le formattage et la persistance de la devise
// =====================================================================

const CURRENCY_STORAGE_KEY = 'shadoron_user_currency';
const RATES_STORAGE_KEY = 'shadoron_exchange_rates';

// Configuration des devises supportées (taux par défaut)
export const SUPPORTED_CURRENCIES = {
    GNF: {
        code: 'GNF',
        symbol: 'FG',
        name: 'Franc Guinéen',
        icon: '🇬🇳',
        rate: 1, // Devise de référence (base)
    },
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'Dollar US',
        icon: '🇺🇸',
        rate: 0.000114,
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        icon: '🇪🇺',
        rate: 0.000097,
    },
    BTC: {
        code: 'BTC',
        symbol: '₿',
        name: 'Bitcoin',
        icon: '₿',
        rate: 0.0000000016,
    }
};

/**
 * Charge les taux de change depuis le stockage local ou utilise les valeurs par défaut
 */
const getStoredRates = () => {
    try {
        const saved = localStorage.getItem(RATES_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Fusionner avec les défauts pour être sûr d'avoir toutes les devises
            return { ...SUPPORTED_CURRENCIES, ...parsed };
        }
    } catch (e) {
        console.error("Erreur lors du chargement des taux stockés", e);
    }
    return SUPPORTED_CURRENCIES;
};

// Taux actuels (chargés au démarrage du service)
let currentRates = getStoredRates();

/**
 * Met à jour les taux de change via API
 */
export const updateExchangeRates = async () => {
    try {
        // 1. Récupérer les taux Fiat depuis ExchangeRate-API (Base GNF)
        const fiatResponse = await fetch('https://open.er-api.com/v6/latest/GNF');
        const fiatData = await fiatResponse.json();

        if (fiatData.result === 'success') {
            currentRates.USD.rate = fiatData.rates.USD || currentRates.USD.rate;
            currentRates.EUR.rate = fiatData.rates.EUR || currentRates.EUR.rate;
        }

        // 2. Récupérer le taux BTC depuis Coinbase (BTC -> USD)
        const btcResponse = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
        const btcData = await btcResponse.json();

        if (btcData.data && btcData.data.amount) {
            const btcUsdPrice = parseFloat(btcData.data.amount);
            // Calculer BTC -> GNF (1 GNF = currentRates.USD.rate USD => 1 USD = 1/rate GNF)
            // 1 BTC = btcUsdPrice USD = btcUsdPrice * (1/rate) GNF
            // Le rate que nous stockons est GNF -> Target, donc 1 GNF = X Target
            // Donc rate(BTC) = 1 / (btcUsdPrice / currentRates.USD.rate)
            currentRates.BTC.rate = currentRates.USD.rate / btcUsdPrice;
        }

        // Sauvegarder les nouveaux taux
        localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(currentRates));
        console.log("[Currency] Taux mis à jour :", currentRates);

        return currentRates;
    } catch (error) {
        console.error("Erreur mise à jour taux de change", error);
        return currentRates;
    }
};

/**
 * Charge la devise préférée de l'utilisateur
 */
export const getUserCurrency = () => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved && SUPPORTED_CURRENCIES[saved]) {
        return SUPPORTED_CURRENCIES[saved];
    }
    return SUPPORTED_CURRENCIES.GNF; // Par défaut
};

/**
 * Enregistre la devise préférée
 */
export const setUserCurrency = (currencyCode) => {
    if (SUPPORTED_CURRENCIES[currencyCode]) {
        localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
        window.dispatchEvent(new CustomEvent('currencyChange', { detail: SUPPORTED_CURRENCIES[currencyCode] }));
        return SUPPORTED_CURRENCIES[currencyCode];
    }
    return null;
};

/**
 * Convertit un montant GNF vers la devise cible
 */
export const convertFromGNF = (amount, targetCurrencyCode) => {
    const currency = currentRates[targetCurrencyCode] || SUPPORTED_CURRENCIES[targetCurrencyCode] || SUPPORTED_CURRENCIES.GNF;
    return amount * currency.rate;
};

/**
 * Formatte un montant selon la devise choisie
 */
export const formatCurrency = (amount, currencyCode = null) => {
    const currency = currencyCode ? SUPPORTED_CURRENCIES[currencyCode] : getUserCurrency();

    // Si Bitcoin, on utilise plus de décimales
    if (currency.code === 'BTC') {
        const converted = convertFromGNF(amount, currency.code);
        return converted.toFixed(8) + ' ' + currency.symbol;
    }

    const converted = convertFromGNF(amount, currency.code);

    // Pour EUR/USD on met 2 décimales si < 100, sinon entier
    const fractionDigits = (currency.code !== 'GNF' && converted < 100) ? 2 : 0;

    return converted.toLocaleString('fr-FR', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }) + ' ' + (currency.symbol || currency.code);
};

export default {
    SUPPORTED_CURRENCIES,
    getUserCurrency,
    setUserCurrency,
    convertFromGNF,
    formatCurrency,
    updateExchangeRates
};
