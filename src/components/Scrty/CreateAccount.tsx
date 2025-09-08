// src/components/CreateAccountModal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import authService from '../../api/authService';
import { useDarkMode } from '../DarkModeProvider';
import { Role, User } from "../../classe/types";
import styles from '../../Css/account/CreateAccount.module.css';
import ManageRolesPage from "./ManageRolesPage";
import activityLogger from "../../classe/ActivityLoggerService";

interface CreateAccountModalProps {
    userIdToEdit: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

function CreateAccountModal({ userIdToEdit, onClose, onSuccess }: CreateAccountModalProps) {
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const isEditMode = userIdToEdit !== null;

    const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [initializationError, setInitializationError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        selectedRoleIds: new Set<number>(),
    });
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

    // Définir la fonction avec useCallback pour la rendre stable
    const initializeComponent = useCallback(async () => {
        setIsInitializing(true);
        setInitializationError(null);
        try {
            const rolesData = await authService.getAllRoles();
            const roles = Array.isArray(rolesData) ? rolesData : [];
            setAvailableRoles(roles);

            if (isEditMode) {
                const userData: User = await authService.getUserById(userIdToEdit!);
                setFormData({
                    fullName: userData.fullName || '',
                    email: userData.email || '',
                    password: '', // Ne jamais pré-remplir le mot de passe
                    selectedRoleIds: new Set(userData.roles.map(role => role.id)),
                });
            } else {
                // S'assurer que le formulaire est vide en mode création
                setFormData({ fullName: '', email: '', password: '', selectedRoleIds: new Set() });
            }
        } catch (err) {
            console.error("Initialization failed", err);
            setInitializationError(isEditMode ? 'Failed to load user data.' : 'Failed to load roles.');
        } finally {
            setIsInitializing(false);
        }
    // Les dépendances sont les variables externes qui, si elles changent,
    // devraient recréer cette fonction.
    }, [userIdToEdit, isEditMode]);

    // Appeler la fonction lors du montage du composant ou lorsque la fonction elle-même change
    useEffect(() => {
        initializeComponent();
    }, [initializeComponent]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (submissionError) setSubmissionError(null);
    };

    const handleRoleChange = (roleId: number, isChecked: boolean) => {
        setFormData(prev => {
            const newSelectedRoleIds = new Set(prev.selectedRoleIds);
            if (isChecked) {
                newSelectedRoleIds.add(roleId);
            } else {
                newSelectedRoleIds.delete(roleId);
            }
            return { ...prev, selectedRoleIds: newSelectedRoleIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);

        if (!isEditMode && !formData.password) {
            setSubmissionError("Password is required for a new account.");
            return;
        }

        setIsSubmitting(true);
        const payload = {
            id: userIdToEdit,
            fullName: formData.fullName,
            email: formData.email,
            roles: Array.from(formData.selectedRoleIds).map(id => ({ id })),
            ...(formData.password && { password: formData.password }),
        };

        try {
            if (isEditMode) {
                await authService.updateUser(userIdToEdit!, payload);
                activityLogger.logActivity('USER_UPDATED', { updatedUserId: userIdToEdit });

            } else {
                await authService.createUser(payload);
                activityLogger.logActivity('USER_CREATED', { newUserName: payload.fullName });
            }
            onSuccess();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
            setSubmissionError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerClasses = `${styles['create-account-container']} ${isDarkMode ? styles.dark : ''}`;

    const renderContent = () => {
        if (isInitializing) { // Simplifié pour montrer le chargement au démarrage
            return <div className={styles['initialization-state']}>Loading...</div>;
        }

        if (initializationError) {
            return (
                <div className={styles['initialization-state-error']}>
                    <h3 className={styles['error-title']}>An Error Occurred</h3>
                    <p className={styles['error-message']}>{initializationError}</p>
                    <div className={styles['error-actions']}>
                        <button type="button" className={`${styles['btn']} ${styles['btn-secondary']}`} onClick={onClose}>Cancel</button>
                        {/* Ce bouton fonctionne maintenant car initializeComponent est dans la portée du composant */}
                        <button type="button" className={`${styles['btn']} ${styles['btn-primary']}`} onClick={initializeComponent}>Retry</button>
                    </div>
                </div>
            );
        }

        return (
            // Le reste de votre JSX reste le même
            <form className={styles['create-account-form']} onSubmit={handleSubmit} noValidate>
                {/* ... contenu du formulaire ... */}
                <header className={styles['form-header']}>
                    <h2>{isEditMode ? 'Edit Account' : 'Create New Account'}</h2>
                    <button type="button" className={styles['close-btn']} onClick={onClose} aria-label="Close">×</button>
                </header>
                <div className={styles['form-body']}>
                    {submissionError && <div className={styles['form-error-banner']}>{submissionError}</div>}
                    <div className={styles['form-grid']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="fullName">Full Name</label>
                            <input type="text" id="fullName" name="fullName" value={formData.fullName}
                                   onChange={handleInputChange} required/>
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="email">Email (used as Username)</label>
                            <input type="email" id="email" name="email" value={formData.email}
                                   onChange={handleInputChange} required/>
                        </div>
                        <div className={styles['form-group']} style={{gridColumn: 'span 2'}}>
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" value={formData.password}
                                   onChange={handleInputChange}
                                   placeholder={isEditMode ? 'Leave blank to keep current' : ''}
                                   required={!isEditMode}/>
                        </div>
                    </div>
                    <section className={styles['roles-section']}>
                        <h3>Assign Roles</h3>
                        {availableRoles.length > 0 ? (
                            <div className={styles['roles-checklist']}>
                                {availableRoles.map(role => (
                                    <div key={role.id} className={styles['role-checkbox']}>
                                        <input type="checkbox" id={`role-${role.id}`}
                                               checked={formData.selectedRoleIds.has(role.id)}
                                               onChange={e => handleRoleChange(role.id, e.target.checked)}/>
                                        <label htmlFor={`role-${role.id}`}>{role.name.replace('ROLE_', '')}</label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles['no-roles-message']}>No roles available to assign.</p>
                        )}
                    </section>
                </div>
                <footer className={styles['form-actions']}>
                    <button
                        type="button"
                        onClick={() => setIsManageRolesModalOpen(true)}
                        className={styles['manage-roles-link']}
                    >
                        Manage All Roles
                    </button>
                    <button type="button" className={`${styles['btn']} ${styles['btn-secondary']}`}
                            onClick={onClose}>Cancel
                    </button>

                    <button type="submit" className={`${styles['btn']} ${styles['btn-primary']}`}
                            disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Account')}
                    </button>
                </footer>
            </form>
        );
    };

    return (<>
            <div className={styles['backdrop']} onClick={onClose}>
                <div className={containerClasses} onClick={(e) => e.stopPropagation()}>
                    {renderContent()}
                </div>
            </div>
            {isManageRolesModalOpen && (
                <ManageRolesPage
                    onClose={() => setIsManageRolesModalOpen(false)}
                    // Ceci fonctionne aussi maintenant
                    onRolesUpdated={initializeComponent}
                />
            )}</>
    );
}

export default CreateAccountModal;