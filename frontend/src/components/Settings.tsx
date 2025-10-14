import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./basec/LanguageSwitcher";
import { useDarkMode } from "./DarkModeProvider";
import Navbar from "./basec/Navbar";
import { Globe, Palette, Settings as SettingsIcon, Bell, Save, CloudCog, Wrench } from 'lucide-react';
import TestButtons from "./Notification/TestButtons";

interface DarkModeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    ariaLabel: string;
}

interface SettingRowProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    control: React.ReactNode;
}

const SettingsContent = () => {
    const { t, i18n } = useTranslation();
    const darkModeContext = useDarkMode() as DarkModeContextType;
    const isDarkMode = darkModeContext?.isDarkMode || false;

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [dataSyncEnabled, setDataSyncEnabled] = useState(true);

    const isRTL = i18n.language === 'ar';

    const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, ariaLabel }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                checked ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );

    const SettingRow: React.FC<SettingRowProps> = ({ icon, title, description, control }) => (
        <div className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-slate-700/50 rounded-xl transition-all duration-300 hover:bg-blue-50 dark:hover:bg-slate-600/50 hover:-translate-y-0.5 min-h-16">
            <div className="flex items-center gap-4">
                {icon}
                <div className="flex flex-col gap-1">
                    <span className="text-base font-medium text-slate-800 dark:text-slate-100">
                        {title}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                        {description}
                    </span>
                </div>
            </div>
            {control}
        </div>
    );

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
                            {t('common.settings', 'Settings')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            {t('settings_page.subtitle', 'Manage your application preferences')}
                        </p>
                    </header>

                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 transition-all duration-300">

                        {/* Language & Region Section */}
                        <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    <Globe className="text-blue-500" size={28} />
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
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    <Palette className="text-purple-500" size={28} />
                                    {t('settings_page.appearance', 'Appearance')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    {t('settings_page.appearance_description', 'Customize the look and feel of your application')}
                                </p>
                            </div>
                            <SettingRow
                                icon={<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-100'}`}><Palette size={20} className="text-purple-600 dark:text-purple-400" /></div>}
                                title={t('settings_page.dark_mode', 'Dark Mode')}
                                description={isDarkMode
                                    ? t('settings_page.dark_mode_enabled', 'Dark theme is enabled')
                                    : t('settings_page.light_mode_enabled', 'Light theme is enabled')
                                }
                                control={<ToggleSwitch
                                    checked={isDarkMode}
                                    onChange={darkModeContext?.toggleDarkMode}
                                    ariaLabel={t('settings_page.toggle_dark_mode', 'Toggle dark mode')}
                                />}
                            />
                        </div>

                        {/* General Section */}
                        <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    <SettingsIcon className="text-green-500" size={28} />
                                    {t('settings_page.general', 'General')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    {t('settings_page.general_description', 'General application settings and preferences')}
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <SettingRow
                                    icon={<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-green-500/10' : 'bg-green-100'}`}><Bell size={20} className="text-green-600 dark:text-green-400" /></div>}
                                    title={t('settings_page.notifications', 'Notifications')}
                                    description={t('settings_page.notifications_description', 'Receive updates and alerts')}
                                    control={<ToggleSwitch
                                        checked={notificationsEnabled}
                                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                        ariaLabel={t('settings_page.toggle_notifications', 'Toggle notifications')}
                                    />}
                                />
                                <SettingRow
                                    icon={<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-100'}`}><Save size={20} className="text-blue-600 dark:text-blue-400" /></div>}
                                    title={t('settings_page.auto_save', 'Auto-save')}
                                    description={t('settings_page.auto_save_description', 'Automatically save your work')}
                                    control={<ToggleSwitch
                                        checked={autoSaveEnabled}
                                        onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                                        ariaLabel={t('settings_page.toggle_auto_save', 'Toggle auto-save')}
                                    />}
                                />
                                <SettingRow
                                    icon={<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-100'}`}><CloudCog size={20} className="text-yellow-600 dark:text-yellow-400" /></div>}
                                    title={t('settings_page.data_sync', 'Data Sync')}
                                    description={t('settings_page.data_sync_description', 'Keep your data synchronized across devices')}
                                    control={<ToggleSwitch
                                        checked={dataSyncEnabled}
                                        onChange={() => setDataSyncEnabled(!dataSyncEnabled)}
                                        ariaLabel={t('settings_page.toggle_data_sync', 'Toggle data sync')}
                                    />}
                                />
                            </div>
                        </div>

                        {/* Advanced Settings Section - NEW */}
                        <div className="mb-0">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    <Wrench className="text-orange-500" size={28} />
                                    {t('settings_page.advanced', 'Advanced Settings')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                    {t('settings_page.advanced_description', 'Developer tools and advanced configuration')}
                                </p>
                            </div>
                            <TestButtons />
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