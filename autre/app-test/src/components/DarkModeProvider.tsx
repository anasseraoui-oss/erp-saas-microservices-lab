import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface DarkModeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

interface DarkModeProviderProps {
    children: ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        try {
            const storedValue = localStorage.getItem('isDarkMode');
            return storedValue ? JSON.parse(storedValue) : false;
        } catch (error) {
            console.error("Failed to read dark mode preference from localStorage.", error);
            return false;
        }
    });

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    useEffect(() => {
        const html = document.documentElement;
        // Sync dark mode to html for all components (AccountDashboard, CategoryFilter, etc.)
        if (isDarkMode) {
            html.setAttribute('data-theme', 'dark');
            html.classList.add('dark', 'dark-mode');
        } else {
            html.removeAttribute('data-theme');
            html.classList.remove('dark', 'dark-mode');
        }
        
        try {
            localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
        } catch (error) {
            console.error("Could not save dark mode preference to localStorage.", error);
        }
    }, [isDarkMode]);

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = (): DarkModeContextType => {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};