import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from "./DarkModeProvider";
import Navbar from "./basec/Navbar";
import styles from "../Css/Home.module.css";
import { RouteCategory } from "../App";
import { type IconType } from 'react-icons';
import { FaQuestionCircle } from 'react-icons/fa';

interface SafeIconProps {
    icon?: IconType;
    className?: string;
}

export const SafeIcon: React.FC<SafeIconProps> = ({ icon: Icon, className }) => {
    if (Icon && typeof Icon === 'function') {
        // @ts-ignore
        return <Icon className={className} />;
    }
    // @ts-ignore
    return <FaQuestionCircle className={className} />;
};

interface HomeProps {
    menuItems: RouteCategory[];
}

const Home: React.FC<HomeProps> = ({ menuItems }) => {
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const containerClass = `${styles.homepageContainer} ${isDarkMode ? styles.dark : ''}`;

    return (
        <div className={containerClass}>
        <Navbar />
            <header className={styles.homepageHeader}>
                <h1>Application Dashboard</h1>
                <p>Select a module to begin your journey</p>
            </header>
            <div className={styles.homepageGrid}>
                {Array.isArray(menuItems) && menuItems.map((section) => {
                    const isActive = hoveredCategory === section.category;
                    const sectionClasses = `${styles.menuSection} ${isActive ? styles.open : ''}`;

                    return (
                        <div
                            key={section.category}
                            className={sectionClasses}
                            onMouseEnter={() => setHoveredCategory(section.category)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            <div className={styles.menuSectionHeader}>
                                <h3 className={styles.sectionTitle}>{section.category}</h3>
                            </div>
                            <ul className={styles.menuList}>
                                {Array.isArray(section.items) && section.items.map((item) => (
                                    <li key={item.link} className={styles.menuItem}>
                                        <Link to={item.link} className={styles.menuLink}>
                                            <div className={styles.iconContainer}>
                                                <SafeIcon icon={item.icon} className={styles.menuIcon} />
                                            </div>
                                            <span className={styles.menuName}>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Home;