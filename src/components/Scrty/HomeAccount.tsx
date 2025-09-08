// src/pages/AccountDashboard.tsx (Enhanced Dark Mode Version)

import React, { useState, FormEvent, useEffect } from 'react';
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
                setSearchError("No users or roles found matching your query.");
            }
        } catch (error) {
            console.error("Search failed:", error);
            setSearchError("An error occurred during the search. Please try again.");
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
                    <h1>Accounts Dashboard</h1>
                    <p>Central hub for managing users, roles, and system activity.</p>
                </div>
                <form className={styles.searchBar} onSubmit={handleSearch}>
                    <Icon as={FiSearch} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isSearching}
                        aria-label="Search users and roles"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        aria-label={isSearching ? 'Searching...' : 'Search'}
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </header>

            {/* 2. Search Results Section */}
            {(searchResults.length > 0 || searchError) && (
                <section className={styles.searchResultsSection} role="region" aria-label="Search results">
                    <h2>Search Results</h2>
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
                                    aria-label={`View details for ${user.fullName}`}
                                >
                                    <span className={styles.resultName}>
                                        {user.fullName} ({user.email})
                                    </span>
                                    <div className={styles.resultRoles}>
                                        {user.roles.map(role => (
                                            <span
                                                key={role.id}
                                                className={styles.roleBadge}
                                                aria-label={`Role: ${role.name.replace('ROLE_', '')}`}
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
                    aria-label="Go to Account List"
                >
                    <Icon as={FiUsers} className={styles.cardIcon} aria-hidden="true" />
                    <h3>Account List</h3>
                    <p>View, edit, and manage all user accounts.</p>
                    <span className={styles.cardAction}>Go to List →</span>
                </div>

                <div
                    className={`${styles.actionCard} ${styles.create}`}
                    onClick={() => handleNavigate('/accounts/create')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, () => handleNavigate('/accounts/create'))}
                    aria-label="Create new account"
                >
                    <Icon as={FiUserPlus} className={styles.cardIcon} aria-hidden="true" />
                    <h3>Create Account</h3>
                    <p>Onboard a new user by creating a new account.</p>
                    <span className={styles.cardAction}>Create Now →</span>
                </div>

                <div
                    className={`${styles.actionCard} ${styles.roles}`}
                    onClick={handleRoleManagementClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, handleRoleManagementClick)}
                    aria-label="Manage user roles"
                >
                    <Icon as={FiShield} className={styles.cardIcon} aria-hidden="true" />
                    <h3>Role Management</h3>
                    <p>Define and manage roles and their permissions.</p>
                    <span className={styles.cardAction}>Manage Roles →</span>
                </div>

                <div
                    className={`${styles.actionCard} ${styles.stats}`}
                    onClick={() => handleNavigate('/dashboard')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, () => handleNavigate('/dashboard'))}
                    aria-label="View activity statistics"
                >
                    <Icon as={FiBarChart2} className={styles.cardIcon} aria-hidden="true" />
                    <h3>Activity Statistics</h3>
                    <p>Monitor user activity and system performance.</p>
                    <span className={styles.cardAction}>View Dashboard →</span>
                </div>
            </main>
        </div>
    );
}

export default AccountDashboard;