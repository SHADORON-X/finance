import { useUIStore } from '../store';
import { formatCurrency as format, SUPPORTED_CURRENCIES } from '../services/currencyService';

/**
 * Hook personnalisé pour faciliter l'utilisation de la devise partout
 */
export const useCurrency = () => {
    const currencyCode = useUIStore((state) => state.currency);
    const setCurrency = useUIStore((state) => state.setCurrency);

    const currentCurrency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.GNF;

    const formatCurrency = (amount) => format(amount, currencyCode);

    return {
        currencyCode,
        currentCurrency,
        setCurrency,
        formatCurrency,
        SUPPORTED_CURRENCIES
    };
};
