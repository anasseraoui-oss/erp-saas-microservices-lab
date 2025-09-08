import React, { useEffect, useState } from 'react';
import authService from "../../api/authService";
import { useDarkMode } from '../DarkModeProvider';
import { User } from "../../classe/types";
import UserDetailsModal from "./UserDetailsModal";
import CreateAccountModal from "./CreateAccount";
import UserActivityModal from "./UserActivityModal";

import styles from '../../Css/account/AccountList.module.css';
import {Link} from "react-router-dom";

interface AccountListProps {
    showCreateButtonOnly?: boolean;
}

function AccountList({ showCreateButtonOnly = false }: AccountListProps) {
    const [accounts, setAccounts] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [activityUser, setActivityUser] = useState<User | null>(null);

    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    const fetchAccounts = async () => {
        setLoading(true); // Always set loading to true on fetch attempt
        setError(null);
        try {
            const data = await authService.getAccounts();
            setAccounts(Array.isArray(data) ? data : []);
        } catch (error: any) {
            setError('Failed to load accounts. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showCreateButtonOnly) {
            fetchAccounts();
        } else {
            setLoading(false);
        }
    }, [showCreateButtonOnly]);

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete the user "${name}"?`)) {
            try {
                await authService.deleteAccount(id);
                fetchAccounts();
            } catch (error) {
                setError('Failed to delete the account.');
            }
        }
    };

    const handleViewActivity = (user: User) => setActivityUser(user);
    const handleViewUser = (user: User) => setSelectedUser(user);
    const handleOpenCreateModal = () => { setIsModalOpen(true); setEditingUserId(null); };
    const handleOpenEditModal = (userId: number) => { setEditingUserId(userId); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingUserId(null); };
    const handleSuccess = () => { handleCloseModal(); fetchAccounts(); };

    const mainContainerClasses = `${styles['account-list']} ${isDarkMode ? styles.dark : ''}`;
    const createButtonClasses = `${styles.btn} ${styles['btn-primary']}`;

    return (
        <div className={mainContainerClasses}>
            <header className={styles['account-list__header']}>
                <h1>{showCreateButtonOnly ? 'Create a New Account' : 'Manage Accounts'}</h1>
                <Link to="/dashboard" className={`${styles.btn} ${styles['btn-secondary']}`}>
                    View Activity Dashboard
                </Link>
                <button className={createButtonClasses} onClick={handleOpenCreateModal}>
                    Create New Account
                </button>
            </header>
            {!showCreateButtonOnly && (
                <>
                    {/* --- FIX: Improved error state with a Retry button --- */}
                    {error && (
                        <div className={`${styles.alert} ${styles['alert-danger']}`}>
                            {error}
                            <button onClick={fetchAccounts} className={styles['btn-retry']}>
                                Try Again
                            </button>
                        </div>
                    )}
                    {loading ? (
                        <div>Loading accounts...</div>
                    ) : !error && ( // Only show the grid if there is no error
                        <div className={styles['account-list__grid']}>
                            {accounts.map((account) => {
                                const statusClasses = `${styles['user-card__status']} ${account.enabled ? styles['user-card__status--active'] : styles['user-card__status--disabled']}`;
                                return (
                                    <div key={account.id} className={styles['user-card']}>
                                        <div className={styles['user-card__header']}>
                                            <h3 className={styles['user-card__name']}>{account.fullName || account.username}</h3>
                                            <span className={statusClasses}>
                                                {account.enabled ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                        <div className={styles['user-card__body']}>
                                            <p className={styles['user-card__email']}>{account.email}</p>
                                            <div className={styles['user-card__roles']}>
                                                {account.roles.map(role => (
                                                    <span key={role.id} className={styles['user-card__role-pill']}>
                                                        {role.name.replace('ROLE_', '')}
                                                    </span>
                                                ))}
                                                {account.roles.length === 0 &&
                                                    <span className={`${styles['user-card__role-pill']} ${styles['user-card__role-pill--muted']}`}>
                                                        No Roles
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                        <div className={styles['user-card__actions']}>
                                            <button className={`${styles['user-card__action-btn']} ${styles['user-card__action-btn--view']}`} onClick={() => handleViewUser(account)}>View</button>
                                            <button className={`${styles['user-card__action-btn']} ${styles['user-card__action-btn--activity']}`} onClick={() => handleViewActivity(account)}>Activity</button>
                                            <button className={`${styles['user-card__action-btn']} ${styles['user-card__action-btn--edit']}`} onClick={() => handleOpenEditModal(account.id)}>Edit</button>
                                            <button className={`${styles['user-card__action-btn']} ${styles['user-card__action-btn--delete']}`} onClick={() => handleDelete(account.id, account.fullName || account.username)}>Delete</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {isModalOpen && (
                <CreateAccountModal
                    userIdToEdit={editingUserId}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
            {selectedUser && (
                <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} onUpdate={() => {
                    setSelectedUser(null);
                    fetchAccounts();
                }} isDarkMode={isDarkMode}/>
            )}
            {activityUser && (
                <UserActivityModal user={activityUser} onClose={() => setActivityUser(null)} />
            )}
        </div>
    );
}

export default AccountList;