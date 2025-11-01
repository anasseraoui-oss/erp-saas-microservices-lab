import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from '../../Css/GenericActionButtons.module.css';
import { useDarkMode } from "../DarkModeProvider";
import { useTranslation } from 'react-i18next';

interface Action {
    label: string;
    onClick: () => void;
    className?: string;
    variant?: 'primary' | 'danger' | 'warning' | 'success' | 'secondary';
    disabled?: boolean;
}

interface GenericActionButtonsProps {
    actions: Action[];
}

const GenericActionButtons: React.FC<GenericActionButtonsProps> = ({ actions }) => {
    const { t } = useTranslation('generic_action_buttons');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    const closeMenu = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleActionClick = (action: Action) => {
        if (!action.disabled) {
            action.onClick();
            closeMenu();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, closeMenu]);

    const getButtonClasses = (variant?: string) => {
        const classes = [styles.dropdownItem];
        if (variant) {
            const variantClass = `variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`;
            if (styles[variantClass]) {
                classes.push(styles[variantClass]);
            }
        }
        return classes.join(' ');
    };

    return (
        <div className={styles.actionsWrapper} ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.dotsButton} ${isDarkMode ? styles.dark : ''}`}
                aria-label={t('more_actions')}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                ⋮
            </button>

            {isOpen && (
                <div
                    className={`${styles.dropdownMenu} ${isDarkMode ? styles.dark : ''} ${styles.open}`}
                    role="menu"
                    aria-orientation="vertical"
                >
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            disabled={action.disabled}
                            className={getButtonClasses(action.variant)}
                            role="menuitem"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GenericActionButtons;
