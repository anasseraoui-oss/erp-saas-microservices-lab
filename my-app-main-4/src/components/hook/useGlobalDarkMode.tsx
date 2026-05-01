// hooks/useGlobalDarkMode.ts
import { useEffect } from 'react';
import { useDarkMode } from "../DarkModeProvider";

/**
 * Global dark mode hook that automatically applies system-wide CSS custom properties
 * by mapping them to the HSL variables defined in index.css.
 */
export const useGlobalDarkMode = () => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const root = document.documentElement;

        // Instead of hardcoded HEX, we use HSL references to index.css variables
        // This ensures perfect visual harmony across all components.

        // Map legacy statistics variables to the new premium theme system
        root.style.setProperty('--bg-primary', 'hsl(var(--background))');
        root.style.setProperty('--bg-secondary', 'hsl(var(--card))');
        root.style.setProperty('--text-primary', 'hsl(var(--foreground))');
        root.style.setProperty('--text-secondary', 'hsl(var(--muted-foreground))');
        root.style.setProperty('--accent-color', 'hsl(var(--primary))');
        root.style.setProperty('--border-color', 'hsla(var(--border), 0.5)');

        // Success/Warning colors
        root.style.setProperty('--chart-green', 'hsl(var(--success, 142 70% 45%))');
        root.style.setProperty('--chart-yellow', 'hsl(var(--warning, 38 92% 50%))');
        root.style.setProperty('--chart-red', 'hsl(var(--destructive, 0 84% 60%))');

        if (isDarkMode) {
            root.style.setProperty('--chart-cursor', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--hover-bg', 'hsla(var(--muted), 0.4)');
            root.style.setProperty('--active-bg', 'hsla(var(--muted), 0.6)');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.4)');
            root.style.setProperty('--input-bg', 'hsl(var(--card))');
            root.style.setProperty('--input-border', 'hsla(var(--border), 0.3)');
        } else {
            root.style.setProperty('--chart-cursor', 'rgba(0, 0, 0, 0.05)');
            root.style.setProperty('--hover-bg', 'hsla(var(--muted), 0.6)');
            root.style.setProperty('--active-bg', 'hsla(var(--muted), 1)');
            root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--input-bg', '#ffffff');
            root.style.setProperty('--input-border', 'hsl(var(--border))');
        }
    }, [isDarkMode]);

    return { isDarkMode };
};

export const withGlobalDarkMode = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => {
        useGlobalDarkMode();
        return <Component {...props} />;
    };
};

export const useInjectGlobalDarkModeStyles = () => {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const styleId = 'global-dark-mode-styles';
        document.getElementById(styleId)?.remove();

        const style = document.createElement('style');
        style.id = styleId;

        // Minimal transition injection to keep things snappy
        style.textContent = `
            :root {
                --transition-all: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease;
            }
            .stat-transition * {
                transition: var(--transition-all);
            }
        `;

        document.head.appendChild(style);
        return () => {
            style.remove();
        };
    }, [isDarkMode]);
};