import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./basec/LanguageSwitcher";
import { useDarkMode } from "./DarkModeProvider";
import Navbar from "./basec/Navbar";

interface DarkModeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const SettingsContent = () => {
    const { t, i18n } = useTranslation();
    const darkModeContext = useDarkMode() as DarkModeContextType;
    const isDarkMode = darkModeContext?.isDarkMode || false;

    // Get current language direction for RTL support
    const isRTL = i18n.language === 'ar';

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 font-sans transition-all duration-300"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <Navbar />
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <header className="text-center mb-8 py-8">
                        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 drop-shadow-sm">
                            {t('common.settings')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            {t('settings_page.subtitle', 'Manage your application preferences')}
                        </p>
                    </header>

                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 transition-all duration-300">

                        {/* Language & Region Section */}
                        <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="text-blue-500">🌐</span>
                                    {t('settings_page.language_region', 'Language & Region')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    {t('settings_page.language_description', 'Choose your preferred language and regional settings')}
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <LanguageSwitcher />
                            </div>
                        </div>

                        {/* Appearance Section */}
                        <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="text-purple-500">🎨</span>
                                    {t('settings_page.appearance', 'Appearance')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    {t('settings_page.appearance_description', 'Customize the look and feel of your application')}
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl transition-all duration-300 hover:bg-blue-50 dark:hover:bg-slate-600/50 hover:-translate-y-0.5 min-h-16">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-base font-medium text-slate-800 dark:text-slate-100">
                                            {t('settings_page.dark_mode', 'Dark Mode')}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {isDarkMode
                                                ? t('settings_page.dark_mode_enabled', 'Dark theme is enabled')
                                                : t('settings_page.light_mode_enabled', 'Light theme is enabled')
                                            }
                                        </span>
                                    </div>
                                    <button
                                        onClick={darkModeContext?.toggleDarkMode}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                            isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                        role="switch"
                                        aria-checked={isDarkMode}
                                        aria-label={t('settings_page.toggle_dark_mode', 'Toggle dark mode')}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* General Section */}
                        <div className="mb-0">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="text-green-500">⚙️</span>
                                    {t('settings_page.general', 'General')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    {t('settings_page.general_description', 'General application settings and preferences')}
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl transition-all duration-300 hover:bg-blue-50 dark:hover:bg-slate-600/50 hover:-translate-y-0.5 min-h-16">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-base font-medium text-slate-800 dark:text-slate-100">
                                            {t('settings_page.notifications', 'Notifications')}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {t('settings_page.notifications_description', 'Receive updates and alerts')}
                                        </span>
                                    </div>
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        {t('settings_page.enabled', 'Enabled')}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl transition-all duration-300 hover:bg-blue-50 dark:hover:bg-slate-600/50 hover:-translate-y-0.5 min-h-16">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-base font-medium text-slate-800 dark:text-slate-100">
                                            {t('settings_page.auto_save', 'Auto-save')}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {t('settings_page.auto_save_description', 'Automatically save your work')}
                                        </span>
                                    </div>
                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                        {t('settings_page.every_30_seconds', 'Every 30 seconds')}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl transition-all duration-300 hover:bg-blue-50 dark:hover:bg-slate-600/50 hover:-translate-y-0.5 min-h-16">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-base font-medium text-slate-800 dark:text-slate-100">
                                            {t('settings_page.data_sync', 'Data Sync')}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {t('settings_page.data_sync_description', 'Keep your data synchronized across devices')}
                                        </span>
                                    </div>
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        {t('settings_page.automatic', 'Automatic')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    return <SettingsContent />;
};

export default Settings;