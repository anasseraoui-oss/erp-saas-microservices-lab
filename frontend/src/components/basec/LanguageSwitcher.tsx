import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

const languages: Language[] = [
    {
        code: "en",
        name: "English",
        nativeName: "English",
        flag: "🇺🇸"
    },
    {
        code: "ar",
        name: "Arabic",
        nativeName: "العربية",
        flag: "🇲🇦"
    },
    {
        code: "fr",
        name: "French",
        nativeName: "Français",
        flag: "🇫🇷"
    }
];

const LanguageSwitcher: React.FC = () => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[1]; // Default to Arabic
    const isRTL = i18n.language === 'ar';

    const handleLanguageChange = async (newLang: string) => {
        if (newLang === i18n.language) {
            setIsOpen(false);
            return;
        }

        setIsChanging(true);
        try {
            await i18n.changeLanguage(newLang);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to change language:', error);
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('common.language')}
            </label>

            {/* Custom Select Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isChanging}
                className={`
                    relative w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 
                    rounded-lg px-4 py-3 text-left shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    transition-all duration-200 min-h-[50px] flex items-center justify-between
                    ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isRTL ? 'text-right' : 'text-left'}
                `}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={t('common.language')}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{currentLanguage.flag}</span>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {currentLanguage.nativeName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {currentLanguage.name}
                        </span>
                    </div>
                </div>

                {isChanging ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                ) : (
                    <svg
                        className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={`
                    absolute z-50 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 
                    rounded-lg shadow-lg max-h-60 overflow-auto
                    ${isRTL ? 'right-0' : 'left-0'}
                `}>
                    {languages.map((language) => {
                        const isSelected = language.code === i18n.language;
                        return (
                            <button
                                key={language.code}
                                onClick={() => handleLanguageChange(language.code)}
                                className={`
                                    w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 
                                    flex items-center gap-3 transition-colors duration-150
                                    ${isSelected
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'text-slate-900 dark:text-slate-100'}
                                    ${isRTL ? 'text-right' : 'text-left'}
                                    first:rounded-t-lg last:rounded-b-lg
                                `}
                                disabled={isChanging}
                            >
                                <span className="text-xl">{language.flag}</span>
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm font-medium">
                                        {language.nativeName}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {language.name}
                                    </span>
                                </div>
                                {isSelected && (
                                    <svg
                                        className="h-4 w-4 text-blue-600 dark:text-blue-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default LanguageSwitcher;