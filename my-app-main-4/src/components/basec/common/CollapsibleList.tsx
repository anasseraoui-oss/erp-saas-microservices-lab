
import React, { useState } from 'react';
import styles from './CollapsibleList.module.css';
import { useDarkMode } from '../../DarkModeProvider';

interface CollapsibleListProps {
    items: {
        id: string | number;
        title: React.ReactNode;
        content: React.ReactNode;
    }[];
}

const CollapsibleList: React.FC<CollapsibleListProps> = ({ items }) => {
    const [openItemId, setOpenItemId] = useState<string | number | null>(null);
    const { isDarkMode } = useDarkMode();

    const toggleItem = (id: string | number) => {
        setOpenItemId(openItemId === id ? null : id);
    };

    return (
        <div className={styles.collapsibleList}>
            {items.map(item => (
                <div key={item.id} className={`${styles.item} ${isDarkMode ? styles.dark : ''}`}>
                    <div className={`${styles.header} ${isDarkMode ? styles.dark : ''}`} onClick={() => toggleItem(item.id)}>
                        <span className={styles.title}>{item.title}</span>
                        <span className={`${styles.icon} ${openItemId === item.id ? styles.open : ''}`}>▶</span>
                    </div>
                    {openItemId === item.id && (
                        <div className={`${styles.content} ${isDarkMode ? styles.dark : ''}`}>
                            {item.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CollapsibleList;
