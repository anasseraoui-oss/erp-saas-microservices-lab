import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import en from './locales/en.json';
import supplierClient from './locales/ar/supplierClient.json';
import navigation from './locales/ar/navigation.json';
import navigationEN from './locales/en/navigation.json';
import navigationFR from './locales/fr/navigation.json';
import account from './locales/ar/account.json';
import product from './locales/ar/product.json';
import productEN from './locales/en/product.json';
import order_invoice from './locales/ar/order_invoice.json';
import order_invoice_en from './locales/en/order_invoice.json';
import order_invoice_fr from './locales/fr/order_invoice.json';
import notification from './locales/ar/notification.json';
import notificationEN from './locales/en/notification.json';
import authAR from './locales/ar/auth.json';
import genericActionButtonsAR from './locales/ar/generic_action_buttons.json';
import accountEN from './locales/en/account.json';
import genericActionButtonsEN from './locales/en/generic_action_buttons.json';
import accountFR from './locales/fr/account.json';
import genericActionButtonsFR from './locales/fr/generic_action_buttons.json';
import activityLogEN from './locales/en/activity_log.json';
import activityLogAR from './locales/ar/activity_log.json';
import activityLogFR from './locales/fr/activity_log.json';
import expiredProductFormEN from './locales/en/expired_product_form.json';
import expiredProductFormAR from './locales/ar/expired_product_form.json';
import expiredProductFormFR from './locales/fr/expired_product_form.json';




// English translations
const enTranslations = {
    ...en,
    ...accountEN,
    ...activityLogEN,
    ...genericActionButtonsEN,
    ...navigationEN,
    ...order_invoice_en,
    ...productEN,
    ...notificationEN
};

// Arabic translations
const arTranslations = {
    ...ar,
    ...supplierClient,
    ...navigation,
    ...account,
    ...product,
    ...order_invoice,
    ...notification,
    ...activityLogAR,
    ...authAR,
    ...genericActionButtonsAR
};

// French translations
const frTranslations = { ...fr, ...accountFR, ...activityLogFR, ...genericActionButtonsFR, ...navigationFR, ...order_invoice_fr };

const resources = {
    en: { translation: enTranslations, expired_product_form: expiredProductFormEN, order_invoice: order_invoice_en },
    ar: { translation: arTranslations, expired_product_form: expiredProductFormAR, order_invoice: order_invoice },
    fr: { translation: frTranslations, expired_product_form: expiredProductFormFR, order_invoice: order_invoice_fr }
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
            'notifications',
            'activity_log',
            'auth',
            'generic_action_buttons',
            'expired_product_form'
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