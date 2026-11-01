import React, { useState, useRef, useEffect } from 'react';
import styles from '../../Css/GenericActionButtons.module.css'; // استيراد ملف CSS
import { useDarkMode } from "../DarkModeProvider"; // استيراد الـ Hook

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
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleActionClick = (action: Action) => {
        if (!action.disabled) {
            action.onClick();
            setIsOpen(false);
        }
    };

    const getDropdownMenuClasses = () => {
        const classes = [styles.dropdownMenu];
        if (isDarkMode) classes.push(styles.dark);
        if (isOpen) classes.push(styles.open);
        return classes.join(' ');
    };

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
        <div className={styles.actionsWrapper} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.dotsButton} ${isDarkMode ? styles.dark : ''}`}
                aria-label="More actions"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                ⋮
            </button>

            <div
                className={getDropdownMenuClasses()}
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
        </div>
    );
};

export default GenericActionButtons;