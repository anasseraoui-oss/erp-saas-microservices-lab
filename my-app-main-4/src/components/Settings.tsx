import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./basec/LanguageSwitcher";
import Navbar from "./basec/Navbar";
import { Globe, Palette, Settings as SettingsIcon, Bell, Save, CloudCog, Wrench } from 'lucide-react';
import { useDarkMode } from "./DarkModeProvider";
import styles from './Settings.module.css';

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

interface AppSettings {
    notificationsEnabled: boolean;
    autoSaveEnabled: boolean;
    dataSyncEnabled: boolean;
    autoPrintInvoice: boolean;
    autoDownloadPdf: boolean;
    companyName: string;
    companyLogo: string;
}

const useSettings = () => {
    const { t, i18n } = useTranslation();
    const { isDarkMode, toggleDarkMode } = useDarkMode() || { isDarkMode: false, toggleDarkMode: () => {} };

    const [settings, setSettings] = useState<AppSettings>(() => {
        const storedSettings = localStorage.getItem('appSettings');
        const defaults: AppSettings = {
            notificationsEnabled: true,
            autoSaveEnabled: false,
            dataSyncEnabled: true,
            autoPrintInvoice: true,
            autoDownloadPdf: false,
            companyName: '',
            companyLogo: '',
        };
        return storedSettings ? { ...defaults, ...JSON.parse(storedSettings) } : defaults;
    });

    useEffect(() => { localStorage.setItem('appSettings', JSON.stringify(settings)); }, [settings]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, companyLogo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return {
        t, i18n, isDarkMode, toggleDarkMode,
        settings,
        handleSettingChange,
        handleLogoUpload,
        companyName: settings.companyName,
        companyLogo: settings.companyLogo
    };
};

const Settings = () => {
    const {
        t,
        i18n,
        isDarkMode,
        toggleDarkMode,
        settings,
        handleSettingChange,
        companyName, companyLogo,
        handleLogoUpload
    } = useSettings();
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
        <div className={styles.settingRow}>
            <div className={styles.settingRowInfo}>
                {icon}
                <div className={styles.settingRowText}>
                    <span className={styles.settingTitle}>
                        {title}
                    </span>
                    <span className={styles.settingDescription}>
                        {description}
                    </span>
                </div>
            </div>
            {control}
        </div>
    );

    return (
        <div
            className={`${styles.settingsPage} ${isDarkMode ? styles.dark : ''}`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <Navbar />
            <div className={styles.container}>
                <div className="max-w-4xl mx-auto">
                    <header className="text-center mb-8 py-8">
                        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 drop-shadow-sm">
                            {t('common.settings', 'Settings')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300">
                            {t('settings_page.subtitle', 'Manage your application preferences')}
                        </p>
                    </header>

                    <div className={styles.contentWrapper}>

                        {/* Language & Region Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <Globe className="text-blue-500" size={28} />
                                    {t('settings_page.language_region', 'Language & Region')}
                                </h2>
                                <p className={styles.sectionDescription}>
                                    {t('settings_page.language_description', 'Choose your preferred language and regional settings')}
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <LanguageSwitcher />
                            </div>
                        </div>

                        {/* Appearance Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <Palette className="text-purple-500" size={28} />
                                    {t('settings_page.appearance', 'Appearance')}
                                </h2>
                                <p className={styles.sectionDescription}>
                                    {t('settings_page.appearance_description', 'Customize the look and feel of your application')}
                                </p>
                            </div>
                            <SettingRow
                                icon={<div className={styles.settingIcon}><Palette size={20} /></div>}
                                title={t('settings_page.dark_mode', 'Dark Mode')}
                                description={isDarkMode
                                    ? t('settings_page.dark_mode_enabled', 'Dark theme is enabled')
                                    : t('settings_page.light_mode_enabled', 'Light theme is enabled')
                                }
                                control={<ToggleSwitch
                                    checked={isDarkMode}
                                    onChange={toggleDarkMode}
                                    ariaLabel={t('settings_page.toggle_dark_mode', 'Toggle dark mode')}
                                />}
                            />
                        </div>

                        {/* General Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <SettingsIcon className="text-green-500" size={28} />
                                    {t('settings_page.general', 'General')}
                                </h2>
                                <p className={styles.sectionDescription}>
                                    {t('settings_page.general_description', 'General application settings and preferences')}
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <SettingRow
                                    icon={<div className={styles.settingIcon}><Bell size={20} /></div>}
                                    title={t('settings_page.notifications', 'Notifications')}
                                    description={t('settings_page.notifications_description', 'Receive updates and alerts')}
                                    control={<ToggleSwitch
                                        checked={settings.notificationsEnabled}
                                        onChange={() => handleSettingChange('notificationsEnabled', !settings.notificationsEnabled)}
                                        ariaLabel={t('settings_page.toggle_notifications', 'Toggle notifications')}
                                    />}
                                />
                                <SettingRow
                                    icon={<div className={styles.settingIcon}><Save size={20} /></div>}
                                    title={t('settings_page.auto_save', 'Auto-save')}
                                    description={t('settings_page.auto_save_description', 'Automatically save your work')}
                                    control={<ToggleSwitch
                                        checked={settings.autoSaveEnabled}
                                        onChange={() => handleSettingChange('autoSaveEnabled', !settings.autoSaveEnabled)}
                                        ariaLabel={t('settings_page.toggle_auto_save', 'Toggle auto-save')}
                                    />}
                                />
                                <SettingRow
                                    icon={<div className={styles.settingIcon}><CloudCog size={20} /></div>}
                                    title={t('settings_page.data_sync', 'Data Sync')}
                                    description={t('settings_page.data_sync_description', 'Keep your data synchronized across devices')}
                                    control={<ToggleSwitch
                                        checked={settings.dataSyncEnabled}
                                        onChange={() => handleSettingChange('dataSyncEnabled', !settings.dataSyncEnabled)}
                                        ariaLabel={t('settings_page.toggle_data_sync', 'Toggle data sync')}
                                    />}
                                />
                            </div>
                        </div>

                        {/* Invoice Settings Section */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>
                                    <Wrench className="text-cyan-500" size={28} />
                                    {t('settings_page.invoice_settings', 'Invoice Settings')}
                                </h2>
                                <p className={styles.sectionDescription}>
                                    {t('settings_page.invoice_description', 'Customize company details for invoices')}
                                </p>
                            </div>
                            <SettingRow
                                icon={<div className={styles.settingIcon}><Save size={20} /></div>}
                                title={t('settings_page.auto_print_invoice', 'Auto-print Invoice')}
                                description={t('settings_page.auto_print_invoice_description', 'Automatically open the print dialog when an invoice is created')}
                                control={<ToggleSwitch
                                    checked={settings.autoPrintInvoice}
                                    onChange={() => handleSettingChange('autoPrintInvoice', !settings.autoPrintInvoice)}
                                    ariaLabel={t('settings_page.toggle_auto_print_invoice', 'Toggle auto-print invoice')}
                                />}
                            />
                            <SettingRow
                                icon={<div className={styles.settingIcon}><Save size={20} /></div>}
                                title={t('settings_page.auto_download_pdf', 'Auto-download PDF')}
                                description={t('settings_page.auto_download_pdf_description', 'Automatically download a PDF when an invoice is created')}
                                control={<ToggleSwitch
                                    checked={settings.autoDownloadPdf}
                                    onChange={() => handleSettingChange('autoDownloadPdf', !settings.autoDownloadPdf)}
                                    ariaLabel={t('settings_page.toggle_auto_download_pdf', 'Toggle auto-download PDF')}
                                />}
                            />
                            <div className="mt-4">
                                <label className={styles.settingTitle}>{t('settings_page.company_name', 'Company Name')}</label>
                                <input
                                    type="text"
                                    className="form-control mt-2"
                                    value={settings.companyName}
                                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                                    placeholder={t('settings_page.company_name_placeholder', 'Your Company LLC')}
                                />
                            </div>
                            <div className="mt-4">
                                <label className={styles.settingTitle}>{t('settings_page.company_logo', 'Company Logo')}</label>
                                <input type="file" className="form-control mt-2" accept="image/*" onChange={handleLogoUpload} />
                                {companyLogo && <img src={companyLogo} alt="Company Logo" className="mt-2 rounded" style={{ maxHeight: '60px', border: '1px solid #ddd', padding: '5px' }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;