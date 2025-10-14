import React, { useState } from 'react';
import styles from '../../Css/Navbar.module.css';
import { FaMoon, FaSearch, FaSignOutAlt, FaSun } from "react-icons/fa";
import { IconType } from "react-icons";
import { useDarkMode } from "../DarkModeProvider";
import { searchInAllComponents, FullSearchResults } from "./search/SearchInAllComponents";
import SearchResultsModal from "./search/SearchResultsModal";
import { AutoTranslateProvider } from '../AutoTranslateProvider';

const Icon: React.FC<{ as: IconType; size?: number }> = ({ as, ...props }) => {
    const IconComponent = as as React.ElementType;
    return <IconComponent {...props} />;
};

const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<FullSearchResults | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const darkModeContext = useDarkMode();
    // @ts-ignore
    const isDarkMode = darkModeContext.isDarkMode;
    // @ts-ignore
    const toggleDarkMode = darkModeContext.toggleDarkMode;

    const handleSearch = async () => {
        if (searchTerm.trim() === '') return;

        setIsSearching(true);
        try {
            const results = await searchInAllComponents(searchTerm);
            setSearchResults(results);
        } catch (error) {
            console.error("A critical error occurred during the search process:", error);
            setSearchResults(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    const closeModal = () => {
        setSearchResults(null);
    };

    return (<AutoTranslateProvider>
        <nav className={`${styles.navbar} ${isDarkMode ? styles.dark : ''}`}>
            <div className={`${styles.logo} ${isDarkMode ? styles.dark : ''}`}>

            <span>My</span> E-commerce

</div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search anything..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={styles.searchInput}
                    disabled={isSearching}
                />
                <button onClick={handleSearch} className={styles.searchButton} disabled={isSearching}>
                    <Icon as={FaSearch} size={16} />
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
            </div>

            <div className={styles.actionsContainer}>
                <button onClick={toggleDarkMode} className={styles.themeToggleBtn} title="Toggle Theme">
                    <Icon as={isDarkMode ? FaSun : FaMoon} size={20} />
                </button>
                <a href="/logout" className={styles.logoutLink}>
                    <Icon as={FaSignOutAlt} size={16} /> Logout
                </a>
            </div>
            {searchResults && (
                <SearchResultsModal
                    searchResults={searchResults}
                    onClose={closeModal}
                />
            )}
        </nav></AutoTranslateProvider>
);
};

export default Navbar;