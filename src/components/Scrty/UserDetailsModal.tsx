import React, { useState, useEffect } from 'react';
import authService from '../../api/authService';
import '../../Css/account/UserDetailsModal.css';
import { Role, User } from "../../classe/types";

interface UserDetailsModalProps {
    user: User;
    onClose?: () => void;
    onUpdate?: () => void;
    isDarkMode: boolean;
    isModalView?: boolean; // جديد
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
                                                               user,
                                                               onClose,
                                                               onUpdate,
                                                               isDarkMode,
                                                               isModalView = false
                                                           }) => {
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllRoles = async () => {
            try {
                const response = await authService.getAllRoles();
                const rolesData = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
                setAllRoles(rolesData);
            } catch (err) {
                console.error("Failed to fetch roles", err);
            }
        };
        fetchAllRoles();
    }, []);

    const handleAddRole = async () => {
        if (!selectedRoleId) return;
        setLoading(true);
        setError(null);
        try {
            await authService.addRoleToUser(user.id, Number(selectedRoleId));
            if (onUpdate) onUpdate();
            setSelectedRoleId('');
        } catch (err) {
            setError('Failed to add role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRole = async (roleId: React.Key | null | undefined) => {
        setLoading(true);
        setError(null);
        try {
            await authService.removeRoleFromUser(user.id, roleId);
            if (onUpdate) onUpdate();
        } catch (err) {
            setError('Failed to remove role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const availableRolesToAdd = allRoles.filter(
        (role) => !user.roles.some((userRole) => userRole.id === role.id)
    );

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // إذا كان isModalView، اعرضه كـ card مدمج
    if (isModalView) {
        return (
            <div className={`details-modal__content inline-view ${isDarkMode ? 'dark' : ''}`}>
                <header className="details-modal__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: isDarkMode ? '#4299e1' : '#3182ce',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}>
                            {user.fullName
                                ? user.fullName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)
                                : user.email ? user.email[0].toUpperCase() : 'U'
                            }
                        </div>
                        <div>
                            <h2 className="details-modal__title">{user.fullName || 'Unnamed User'}</h2>
                            <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>@{user.username}</p>
                        </div>
                    </div>
                </header>

                <main className="details-modal__body">
                    <div className="details-modal__user-info">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>User ID:</strong> #{user.id}</p>
                        <p><strong>Joined:</strong> {formatDate(user.createdAt)}</p>
                    </div>

                    <hr className="details-modal__section-divider" />

                    <h4 className="details-modal__section-title">User Roles ({user.roles.length})</h4>
                    <div className="roles-list">
                        {user.roles.map((role) => (
                            <div key={role.id} className="role-item">
                                <span>{role.name.replace('ROLE_', '')}</span>
                                {onUpdate && (
                                    <button
                                        onClick={() => handleRemoveRole(role.id)}
                                        className="remove-role-btn"
                                        disabled={loading}
                                        aria-label={`Remove ${role.name} role`}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        {user.roles.length === 0 && <p>This user has no assigned roles.</p>}
                    </div>

                    {onUpdate && (
                        <div className="add-role-section">
                            <select
                                value={selectedRoleId}
                                onChange={(e) => setSelectedRoleId(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">Add a new role...</option>
                                {availableRolesToAdd.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name.replace('ROLE_', '')}
                                    </option>
                                ))}
                            </select>
                            <button onClick={handleAddRole} disabled={loading || !selectedRoleId}>
                                {loading ? 'Adding...' : 'Add Role'}
                            </button>
                        </div>
                    )}
                    {error && <p className="details-modal__error-msg">{error}</p>}

                    <hr className="details-modal__section-divider" />

                    <h4 className="details-modal__section-title">Permissions Summary</h4>
                    <div className="permissions-container">
                        {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                                <div key={`role-perms-${role.id}`} className="permission-group-summary">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <strong>{role.name.replace('ROLE_', '')}</strong>
                                        <span style={{
                                            backgroundColor: isDarkMode ? '#4299e1' : '#bee3f8',
                                            color: isDarkMode ? '#ffffff' : '#2c5282',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px'
                                        }}>
                                            {role.permissions.length} permissions
                                        </span>
                                    </div>
                                    {role.permissions.length > 0 && (
                                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                            {role.permissions.slice(0, 3).map(p => p.name).join(', ')}
                                            {role.permissions.length > 3 && ` and ${role.permissions.length - 3} more...`}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No permissions to display as the user has no roles.</p>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // العرض العادي كـ modal
    return (
        <div className="details-modal__backdrop" onClick={onClose}>
            <div className={`details-modal__content ${isDarkMode ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
                <header className="details-modal__header">
                    <h2 className="details-modal__title">{user.fullName}</h2>
                    {onClose && (
                        <button onClick={onClose} className="details-modal__close-btn" aria-label="Close modal">×</button>
                    )}
                </header>

                <main className="details-modal__body">
                    <div className="details-modal__user-info">
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Joined:</strong> {formatDate(user.createdAt)}</p>
                    </div>

                    <hr className="details-modal__section-divider" />

                    <h4 className="details-modal__section-title">User Roles</h4>
                    <div className="roles-list">
                        {user.roles.map((role) => (
                            <div key={role.id} className="role-item">
                                <span>{role.name.replace('ROLE_', '')}</span>
                                <button onClick={() => handleRemoveRole(role.id)} className="remove-role-btn" disabled={loading} aria-label={`Remove ${role.name} role`}>×</button>
                            </div>
                        ))}
                        {user.roles.length === 0 && <p>This user has no assigned roles.</p>}
                    </div>

                    <div className="add-role-section">
                        <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} disabled={loading}>
                            <option value="">Add a new role...</option>
                            {availableRolesToAdd.map((role) => (
                                <option key={role.id} value={role.id}>{role.name.replace('ROLE_', '')}</option>
                            ))}
                        </select>
                        <button onClick={handleAddRole} disabled={loading || !selectedRoleId}>
                            {loading ? 'Adding...' : 'Add Role'}
                        </button>
                    </div>
                    {error && <p className="details-modal__error-msg">{error}</p>}

                    <hr className="details-modal__section-divider" />

                    <h4 className="details-modal__section-title">Permissions Overview</h4>
                    <div className="permissions-container">
                        {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                                <details key={`role-perms-${role.id}`} className="permission-group">
                                    <summary>{role.name.replace('ROLE_', '')} ({role.permissions.length} Permissions)</summary>
                                    <ul>
                                        {role.permissions.length > 0 ? (
                                            role.permissions.map((perm) => (
                                                <li key={perm.id} title={perm.description}>{perm.name}</li>
                                            ))
                                        ) : (
                                            <li>No specific permissions for this role.</li>
                                        )}
                                    </ul>
                                </details>
                            ))
                        ) : (
                            <p>No permissions to display as the user has no roles.</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserDetailsModal;