// hooks/useGlobalDarkMode.ts
import { useEffect } from 'react';
// Assuming your DarkModeProvider is in a parent directory
import { useDarkMode } from "../DarkModeProvider";

/**
 * Global dark mode hook that automatically applies CSS custom properties
 * by directly manipulating the root element's style.
 */
export const useGlobalDarkMode = () => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const root = document.documentElement;

        if (isDarkMode) {
            // Dark mode properties
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.setProperty('--text-primary', '#f8fafc');
            root.style.setProperty('--text-secondary', '#94a3b8');
            root.style.setProperty('--accent-color', '#3b82f6');
            root.style.setProperty('--border-color', '#334155');
            root.style.setProperty('--chart-green', '#10b981');
            root.style.setProperty('--chart-yellow', '#f59e0b');
            root.style.setProperty('--chart-red', '#ef4444');
            root.style.setProperty('--chart-cursor', 'rgba(200, 210, 220, 0.1)');
            root.style.setProperty('--hover-bg', '#334155');
            root.style.setProperty('--active-bg', '#475569');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
            root.style.setProperty('--input-bg', '#1e293b');
            root.style.setProperty('--input-border', '#475569');
        } else {
            // Light mode properties
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f8fafc');
            root.style.setProperty('--text-primary', '#1e293b');
            root.style.setProperty('--text-secondary', '#64748b');
            root.style.setProperty('--accent-color', '#3b82f6');
            root.style.setProperty('--border-color', '#e2e8f0');
            root.style.setProperty('--chart-green', '#10b981');
            root.style.setProperty('--chart-yellow', '#f59e0b');
            root.style.setProperty('--chart-red', '#ef4444');
            root.style.setProperty('--chart-cursor', 'rgba(139, 153, 168, 0.1)');
            root.style.setProperty('--hover-bg', '#f1f5f9');
            root.style.setProperty('--active-bg', '#e2e8f0');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--input-bg', '#ffffff');
            root.style.setProperty('--input-border', '#d1d5db');
        }
    }, [isDarkMode]);

    return { isDarkMode };
};

// Alternative: Higher-Order Component approach
export const withGlobalDarkMode = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
        useGlobalDarkMode();
        return <Component {...props} />;
    };
};

// --- FIX IS HERE ---
// Alternative: Custom hook that injects a <style> tag.
// Renamed from 'injectGlobalDarkModeStyles' to follow the Rules of Hooks.
export const useInjectGlobalDarkModeStyles = () => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const styleId = 'global-dark-mode-styles';
        // Clean up any existing style tag to prevent duplication
        document.getElementById(styleId)?.remove();

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            :root {
                --transition-colors: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
            }
            
            * {
                transition: var(--transition-colors);
            }
            
            ${isDarkMode ? `
                :root {
                    --bg-primary: #0f172a;
                    --bg-secondary: #1e293b;
                    --text-primary: #f8fafc;
                    --text-secondary: #94a3b8;
                    --accent-color: #3b82f6;
                    --border-color: #334155;
                    --chart-green: #10b981;
                    --chart-yellow: #f59e0b;
                    --chart-red: #ef4444;
                    --chart-cursor: rgba(200, 210, 220, 0.1);
                    --hover-bg: #334155;
                    --active-bg: #475569;
                    --shadow-color: rgba(0, 0, 0, 0.3);
                    --input-bg: #1e293b;
                    --input-border: #475569;
                }
            ` : `
                :root {
                    --bg-primary: #ffffff;
                    --bg-secondary: #f8fafc;
                    --text-primary: #1e293b;
                    --text-secondary: #64748b;
                    --accent-color: #3b82f6;
                    --border-color: #e2e8f0;
                    --chart-green: #10b981;
                    --chart-yellow: #f59e0b;
                    --chart-red: #ef4444;
                    --chart-cursor: rgba(139, 153, 168, 0.1);
                    --hover-bg: #f1f5f9;
                    --active-bg: #e2e8f0;
                    --shadow-color: rgba(0, 0, 0, 0.1);
                    --input-bg: #ffffff;
                    --input-border: #d1d5db;
                }
            `}
        `;

        document.head.appendChild(style);

        // Optional: Cleanup function to remove the style when the component unmounts
        return () => {
            style.remove();
        };
    }, [isDarkMode]);
};