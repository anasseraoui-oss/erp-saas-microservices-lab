import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AutoTranslateContextType {
    T: React.FC<{ children: ReactNode; translationKey?: string }>;
    t: (key: string, fallback?: string) => string;
}

// Simple translation component
const TranslatorComponent: React.FC<{ children: ReactNode; translationKey?: string }> = ({
                                                                                             children,
                                                                                             translationKey
                                                                                         }) => {
    const { t } = useTranslation();

    // If translationKey is provided, use it directly
    if (translationKey) {
        return <>{t(translationKey, children?.toString() || '')}</>;
    }

    // If children is a string, try to translate it
    if (typeof children === 'string' && children.trim()) {
        const text = children.trim();

        // Skip translation for certain patterns
        if (
            /^\d+$/.test(text) || // Numbers only
            /^[^\w\s]*$/.test(text) || // Special characters only
            text.length < 2 || // Very short text
            /^https?:\/\//.test(text) || // URLs
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(text) // Emails
        ) {
            return <>{children}</>;
        }

        // Try common translation keys first
        const commonKeys = [
            text.toLowerCase(),
            `common.${text.toLowerCase()}`,
            `navigation.${text.toLowerCase()}`,
            `settings.${text.toLowerCase().replace(/\s+/g, '_')}`,
            `account.${text.toLowerCase().replace(/\s+/g, '_')}`,
            `product.${text.toLowerCase().replace(/\s+/g, '_')}`,
            `notifications.messages.${text.toLowerCase().replace(/\s+/g, '_')}`,
            `notifications.subjects.${text.toLowerCase().replace(/\s+/g, '_')}`,
            `supplierClient.${text.toLowerCase().replace(/\s+/g, '_')}`
        ];

        for (const key of commonKeys) {
            const translation = t(key);
            if (translation !== key && translation !== text) {
                return <>{translation}</>;
            }
        }
    }

    return <>{children}</>;
};

const AutoTranslateContext = createContext<AutoTranslateContextType | null>(null);

export const useAutoTranslate = () => {
    const context = useContext(AutoTranslateContext);
    if (!context) {
        throw new Error('useAutoTranslate must be used within AutoTranslateProvider');
    }
    return context;
};

export const AutoTranslateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const contextValue: AutoTranslateContextType = {
        T: TranslatorComponent,
        t: (key: string, fallback?: string) => {
            if (fallback !== undefined) {
                return t(key, fallback);
            }
            return t(key);
        }
    };

    return (
        <AutoTranslateContext.Provider value={contextValue}>
            {children}
        </AutoTranslateContext.Provider>
    );
};

// Higher-order component for wrapping entire components
export const withAutoTranslate = <P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> => {
    return (props: P) => (
        <AutoTranslateProvider>
            <Component {...props} />
        </AutoTranslateProvider>
    );
};