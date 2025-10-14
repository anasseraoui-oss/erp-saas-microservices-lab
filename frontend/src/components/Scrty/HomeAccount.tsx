import React, { useState, FormEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from '../../Css/account/AccountDashboard.module.css';
import { FiUsers, FiUserPlus, FiShield, FiBarChart2, FiSearch } from 'react-icons/fi';
import { User } from "../../classe/types";
import authService from "../../api/authService";
import { IconType } from "react-icons";
import { useDarkMode } from "../DarkModeProvider";

// --- Icon Helper Component ---
interface IconProps {
    as: IconType;
    className?: string;
    size?: number;
}

const Icon: React.FC<IconProps> = ({ as, ...props }) => {
    const IconComponent = as as React.ElementType;
    return <IconComponent {...props} />;
};

function AccountDashboard() {
    const { t } = useTranslation('account');
    const navigate = useNavigate();
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Apply dark mode class to document element for CSS variables to work
    useEffect(() => {
        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        if (isDarkMode) {
            // Apply dark mode to multiple elements to ensure it works
            htmlElement.classList.add('dark-mode');
            htmlElement.setAttribute('data-theme', 'dark');
            bodyElement.classList.add('dark-mode');

            // Also apply dark background to body
            bodyElement.style.backgroundColor = '#1a1d21';
            bodyElement.style.color = '#ffffff';
        } else {
            htmlElement.classList.remove('dark-mode');
            htmlElement.removeAttribute('data-theme');
            bodyElement.classList.remove('dark-mode');

            // Reset body styles
            bodyElement.style.backgroundColor = '';
            bodyElement.style.color = '';
        }

        // Cleanup function
        return () => {
            if (!isDarkMode) {
                htmlElement.classList.remove('dark-mode');
                htmlElement.removeAttribute('data-theme');
                bodyElement.classList.remove('dark-mode');
                bodyElement.style.backgroundColor = '';
                bodyElement.style.color = '';
            }
        };
    }, [isDarkMode]);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const results = await authService.searchUsersAndRoles(searchTerm);
            setSearchResults(Array.isArray(results) ? results : []);
            if (results.length === 0) {
                setSearchError(t('noUsersOrRolesFound'));
            }
        } catch (error) {
            console.error("Search failed:", error);
            setSearchError(t('searchFailed'));
        } finally {
            setIsSearching(false);
        }
    };

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const handleResultClick = (user: User) => {
        // Navigate to accounts list and potentially highlight the specific user
        navigate('/accounts', { state: { highlightUserId: user.id } });
    };

    const handleRoleManagementClick = () => {
        // Navigate to role management page
        navigate('/edit-roles/username');
    };

    const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback();
        }
    };

    return (
        <div className={`${styles.dashboardContainer} ${isDarkMode ? 'dark-mode' : ''}`} data-theme={isDarkMode ? 'dark' : 'light'}>
            {/* 1. Header with Title and Search Bar */}
            <header className={styles.dashboardHeader}>
                <div className={styles.headerContent}>
                    <h1>{t('accountsDashboard')}</h1>
                    <p>{t('centralHubMessage')}</p>
                </div>
                <form className={styles.searchBar} onSubmit={handleSearch}>
                    <Icon as={FiSearch} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={t('searchByNameEmailOrRole')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isSearching}
                        aria-label={t('searchUsersAndRoles')}
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        aria-label={isSearching ? t('searching') : t('search')}
                    >
                        {isSearching ? t('searching') : t('search')}
                    </button>
                </form>
            </header>

            {/* 2. Search Results Section */}
            {(searchResults.length > 0 || searchError) && (
                <section className={styles.searchResultsSection} role="region" aria-label={t('searchResults')}>
                    <h2>{t('searchResults')}</h2>
                    {searchError && (
                        <p className={styles.errorMessage} role="alert">{searchError}</p>
                    )}
                    {searchResults.length > 0 && (
                        <ul className={styles.resultsList} role="list">
                            {searchResults.map(user => (
                                <li
                                    key={user.id}
                                    onClick={() => handleResultClick(user)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => handleKeyDown(e, () => handleResultClick(user))}
                                    aria-label={`${t('viewDetailsFor')} ${user.fullName}`}
                                >
                                    <span className={styles.resultName}>
                                        {user.fullName} ({user.email})
                                    </span>
                                    <div className={styles.resultRoles}>
                                        {user.roles.map(role => (
                                            <span
                                                key={role.id}
                                                className={styles.roleBadge}
                                                aria-label={`${t('role')}: ${role.name.replace('ROLE_', '')}`}
                                            >
                                                {role.name.replace('ROLE_', '')}
                                            </span>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            {/* 3. Main Action Cards Grid */}
            <main className={styles.actionsGrid} role="main">
                <div
                    className={`${styles.actionCard} ${styles.accounts}`}
                    onClick={() => handleNavigate('/accounts')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, () => handleNavigate('/accounts'))}
                    aria-label={t('goToAccountList')}
                >
                    <Icon as={FiUsers} className={styles.cardIcon} aria-hidden="true" />
                    <h3>{t('accountList')}</h3>
                    <p>{t('viewEditManageAccounts')}</p>
                    <span className={styles.cardAction}>{t('goToList')} →</span>
                </div>

                <div
                    className={`${styles.actionCard} ${styles.create}`}
                    onClick={() => handleNavigate('/accounts/create')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, () => handleNavigate('/accounts/create'))}
                    aria-label={t('createNewAccount')}
                >
                    <Icon as={FiUserPlus} className={styles.cardIcon} aria-hidden="true" />
                    <h3>{t('createAccount')}</h3>
                    <p>{t('onboardNewUser')}</p>
                    <span className={styles.cardAction}>{t('createNow')} →</span>
                </div>

                <div
                    className={`${styles.actionCard} ${styles.roles}`}
                    onClick={handleRoleManagementClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, handleRoleManagementClick)}
                    aria-label={t('manageUserRoles')}
                >
                    <Icon as={FiShield} className={styles.cardIcon} aria-hidden="true" />
                    <h3>{t('roleManagement')}</h3>
                    <p>{t('defineAndManageRoles')}</p>
                    <span className={styles.cardAction}>{t('manageRoles')} →</span>
                </div>

                <div
                    className={`${styles.actionCard} ${styles.stats}`}
                    onClick={() => handleNavigate('/dashboard')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, () => handleNavigate('/dashboard'))}
                    aria-label={t('viewActivityStatistics')}
                >
                    <Icon as={FiBarChart2} className={styles.cardIcon} aria-hidden="true" />
                    <h3>{t('activityStatistics')}</h3>
                    <p>{t('monitorUserActivity')}</p>
                    <span className={styles.cardAction}>{t('viewDashboard')} →</span>
                </div>
            </main>
        </div>
    );
}

export default AccountDashboard;