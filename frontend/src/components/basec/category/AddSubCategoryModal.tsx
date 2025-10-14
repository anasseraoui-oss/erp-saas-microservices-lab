import React, { useState, useEffect } from 'react';
import styles from '../../../Css/AddSubCategoryModal.module.css';

interface AddSubCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (subCategoryName: string) => void;
    parentCategoryName: string;
    isDarkMode?: boolean;
}

const AddSubCategoryModal: React.FC<AddSubCategoryModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSubmit,
                                                                     parentCategoryName,
                                                                     isDarkMode = false,
                                                                 }) => {
    const [subCategoryName, setSubCategoryName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSubCategoryName('');
        }
    }, [isOpen]);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subCategoryName.trim()) {
            onSubmit(subCategoryName.trim());
            setSubCategoryName(''); // Clear the input after submission
        }
    };

    const handleClose = () => {
        setSubCategoryName(''); // Clear input when closing
        onClose();
    };

    const modalOverlayClass = `${styles.modalOverlay} ${isDarkMode ? styles.darkMode : ''}`;

    return (
        <div
            className={modalOverlayClass}
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <h3
                        id="modal-title"
                        className={styles.modalTitle}
                    >
                        Add Sub-category to "{parentCategoryName}"
                    </h3>
                    <div className={styles.modalBody}>
                        <input
                            type="text"
                            className={styles.modalInput}
                            placeholder="Enter new sub-category name"
                            value={subCategoryName}
                            onChange={(e) => setSubCategoryName(e.target.value)}
                            autoFocus
                            required
                            aria-label="Sub-category name"
                        />
                    </div>
                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`${styles.modalBtn} ${styles.modalBtnSubmit}`}
                            disabled={!subCategoryName.trim()}
                        >
                            Save Sub-category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSubCategoryModal;