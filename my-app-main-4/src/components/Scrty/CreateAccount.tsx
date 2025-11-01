import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('account');
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
                    password: '',
                    selectedRoleIds: new Set(userData.roles.map(role => role.id)),
                });
            } else {
                setFormData({ fullName: '', email: '', password: '', selectedRoleIds: new Set() });
            }
        } catch (err) {
            console.error("Initialization failed", err);
            setInitializationError(isEditMode ? t('failedToLoadUserData') : t('failedToLoadRoles'));
        } finally {
            setIsInitializing(false);
        }
    }, [userIdToEdit, isEditMode, t]);

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
            setSubmissionError(t("passwordIsRequired"));
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
            const errorMessage = err.response?.data?.message || t('anErrorOccurred');
            setSubmissionError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerClasses = `${styles['create-account-container']} ${isDarkMode ? styles.dark : ''}`;

    const renderContent = () => {
        if (isInitializing) {
            return <div className={styles['initialization-state']}>{t('loading')}</div>;
        }

        if (initializationError) {
            return (
                <div className={styles['initialization-state-error']}>
                    <h3 className={styles['error-title']}>{t('anErrorOccurred')}</h3>
                    <p className={styles['error-message']}>{initializationError}</p>
                    <div className={styles['error-actions']}>
                        <button type="button" className={`${styles['btn']} ${styles['btn-secondary']}`} onClick={onClose}>{t('cancel')}</button>
                        <button type="button" className={`${styles['btn']} ${styles['btn-primary']}`} onClick={initializeComponent}>{t('retry')}</button>
                    </div>
                </div>
            );
        }

        return (
            <form className={styles['create-account-form']} onSubmit={handleSubmit} noValidate>
                <header className={styles['form-header']}>
                    <h2>{isEditMode ? t('editAccount') : t('createAccount')}</h2>
                    <button type="button" className={styles['close-btn']} onClick={onClose} aria-label={t('close')}>×</button>
                </header>
                <div className={styles['form-body']}>
                    {submissionError && <div className={styles['form-error-banner']}>{submissionError}</div>}
                    <div className={styles['form-grid']}>
                        <div className={styles['form-group']}>
                            <label htmlFor="fullName">{t('fullName')}</label>
                            <input type="text" id="fullName" name="fullName" value={formData.fullName}
                                   onChange={handleInputChange} required/>
                        </div>
                        <div className={styles['form-group']}>
                            <label htmlFor="email">{t('emailUsedAsUsername')}</label>
                            <input type="email" id="email" name="email" value={formData.email}
                                   onChange={handleInputChange} required/>
                        </div>
                        <div className={styles['form-group']} style={{gridColumn: 'span 2'}}>
                            <label htmlFor="password">{t('password')}</label>
                            <input type="password" id="password" name="password" value={formData.password}
                                   onChange={handleInputChange}
                                   placeholder={isEditMode ? t('leaveBlankToKeepCurrent') : ''}
                                   required={!isEditMode}/>
                        </div>
                    </div>
                    <section className={styles['roles-section']}>
                        <h3>{t('assignRoles')}</h3>
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
                            <p className={styles['no-roles-message']}>{t('noRolesAvailable')}</p>
                        )}
                    </section>
                </div>
                <footer className={styles['form-actions']}>
                    <button
                        type="button"
                        onClick={() => setIsManageRolesModalOpen(true)}
                        className={styles['manage-roles-link']}
                    >
                        {t('manageAllRoles')}
                    </button>
                    <button type="button" className={`${styles['btn']} ${styles['btn-secondary']}`}
                            onClick={onClose}>{t('cancel')}
                    </button>

                    <button type="submit" className={`${styles['btn']} ${styles['btn-primary']}`}
                            disabled={isSubmitting}>
                        {isSubmitting ? t('saving') : (isEditMode ? t('saveChanges') : t('createAccount'))}
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
                    onRolesUpdated={initializeComponent}
                />
            )}</>
    );
}

export default CreateAccountModal;