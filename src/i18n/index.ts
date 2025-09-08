import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import en from './locales/en.json';
import supplierClient from './locales/ar/supplierClient.json';
import navigation from './locales/ar/navigation.json';
import account from './locales/ar/account.json';
import product from './locales/ar/product.json';
import order_invoice from './locales/ar/order_invoice.json';
import notification from './locales/ar/notification.json';
// English translations
const enTranslations = en ;

// Arabic translations
const arTranslations = {
    ...ar,
    ...supplierClient,
    ...navigation,
    ...account,
    ...product,
    ...order_invoice,
    ...navigation,
    ...notification
};

// French translations
const frTranslations = fr;

const resources = {
    en: { translation: enTranslations },
    ar: { translation: arTranslations },
    fr: { translation: frTranslations }
};

// Initialize i18n
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || 'ar', // Load from localStorage or default to Arabic
        fallbackLng: 'en',
        debug: false, // Set to false in production

        interpolation: {
            escapeValue: false
        },


        react: {
            useSuspense: false
        },

        // Namespace configuration
        ns: [
            'translation',
            'supplierClient',
            'navigation',
            'account',
            'product',
            'order_invoice',
            'notifications'
        ],
        defaultNS: 'translation',

        // Key separator configuration
        keySeparator: '.',
        nsSeparator: false,

        // Performance optimizations
        load: 'languageOnly',
        preload: ['en', 'ar', 'fr'],

        // Handle missing translations
        saveMissing: false, // Disable in production
        missingKeyHandler: (lng, ns, key, fallbackValue) => {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Missing translation key: ${key} for language: ${lng}`);
            }
        }
    });

// Language change handler
i18n.on('languageChanged', (lng) => {
    // Save to localStorage
    localStorage.setItem('language', lng);

    // Update document direction and language
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;

    // Log language change in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`Language changed to: ${lng}`);
    }
});

// Set initial direction based on current language
const currentLang = i18n.language || 'ar';
document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = currentLang;

export default i18n;