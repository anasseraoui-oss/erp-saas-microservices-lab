// src/components/Scrty/ManageRolesPage.tsx
import React, {useState, useEffect, FormEvent} from 'react';
import authService from '../../api/authService';
import {FiEdit, FiTrash2, FiPlus, FiArrowLeft} from 'react-icons/fi';
import {IconType} from "react-icons";
import styles from '../../Css/account/AccountManagement.module.css';
import {Permission, Role} from "../../classe/types";
import { useDarkMode } from "../DarkModeProvider";

// --- Icon Component ---
interface IconProps {
    as: IconType;
    className?: string;
    size?: number;
}

const Icon: React.FC<IconProps> = ({as, ...props}) => {
    const IconComponent = as as React.ElementType;
    return <IconComponent {...props} />;
};

// --- Form Data Type ---
export type RoleFormData = {
    id?: number;
    name: string;
    permissionIds: number[];
}

// --- Main Page Component ---
interface ManageRolesPageProps {
    onClose?: () => void,
    onRolesUpdated?: () => Promise<void>
}


function ManageRolesPage({onClose, onRolesUpdated}: ManageRolesPageProps) {
    const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [currentRoleData, setCurrentRoleData] = useState<RoleFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [rolesResponse, permissionsResponse] = await Promise.all([
                authService.getAllRoles(),
                authService.getAllPermissions(),
            ]);
            const rolesFromApi = Array.isArray(rolesResponse.data) ? rolesResponse.data : Array.isArray(rolesResponse) ? rolesResponse : [];
            const allPermissionsFromApi = Array.isArray(permissionsResponse.data) ? permissionsResponse.data : Array.isArray(permissionsResponse) ? permissionsResponse : [];

            const standardizedPermissions: Permission[] = allPermissionsFromApi.map((p: any) => ({
                ...p,
                id: Number(p.id)
            }));
            const permissionsMap = new Map(standardizedPermissions.map(p => [p.id, p]));

            const hydratedRoles: Role[] = rolesFromApi.map((role: any) => {
                const getPermissionIds = (perms: any[] | undefined): number[] => {
                    if (!perms) return [];
                    if (perms.every(p => typeof p === 'number' || typeof p === 'string')) return perms.map(Number);
                    if (perms.every(p => typeof p === 'object' && p !== null && 'id' in p)) return perms.map(p => Number(p.id));
                    return [];
                };
                const permissionIdsAsNumbers = getPermissionIds(role.permissions || role.permissionIds);
                return {
                    ...role,
                    id: Number(role.id),
                    permissionIds: permissionIdsAsNumbers,
                    permissions: permissionIdsAsNumbers.map(id => permissionsMap.get(id)).filter((p): p is Permission => p !== undefined),
                };
            });
            setRoles(hydratedRoles);
            setAllPermissions(standardizedPermissions);
        } catch (err) {
            setError("Error fetching data. Please check the console for details.");
            console.error("Data Fetching Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // This function now correctly handles closing the modal and updating the parent.
    const handleClose = () => {
        if (onRolesUpdated) {
            onRolesUpdated(); // No need for .then() here if not waiting
        }
        if (onClose) {
            onClose();
        }
    };

    const handleSaveRole = async (formData: RoleFormData) => {
        try {
            const payload = {
                id: formData.id,
                name: formData.name,
                permissions: formData.permissionIds.map(id => {
                    const perm = allPermissions.find(p => p.id === id);
                    return {id: perm?.id, name: perm?.name, description: perm?.description};
                })
            };

            if (mode === 'edit' && payload.id) {
                await authService.updateRole(payload.id, payload);
            } else {
                await authService.createRole(payload);
            }
            await fetchData();
            handleReturnToList();
        } catch (err) {
            setError("Failed to save role.");
            console.error("Save Role Error:", err);
        }
    };

    const handleShowCreateForm = () => {
        setCurrentRoleData({name: '', permissionIds: []});
        setMode('create');
    };
    const handleShowEditForm = (role: Role) => {
        setCurrentRoleData({id: role.id, name: role.name, permissionIds: role.permissionIds || []});
        setMode('edit');
    };
    const handleReturnToList = () => {
        setMode('list');
        setCurrentRoleData(null);
    };
    const handleDeleteRole = async (roleId: number, roleName: string) => {
        if (window.confirm(`Are you sure you want to delete "${roleName}"?`)) {
            try {
                await authService.deleteRole(roleId);
                fetchData();
            } catch (err) {
                setError("Failed to delete role.");
            }
        }
    };

    const renderContent = () => {
        if (isLoading) return <div className={styles.loadingState}>Loading...</div>;
        if (error) return <div className={styles.errorState}>{error}</div>;

        return (
            <div className={styles.pageContent}>
                {mode === 'list' ? (
                    <div>
                        <div className={styles.pageHeader}>
                            <h1>Role Management</h1>
                            <button onClick={handleShowCreateForm} className={`${styles.btn} ${styles.btnPrimary}`}>
                                <Icon as={FiPlus}/> Create Role
                            </button>
                        </div>
                        <div className={styles.contentBox}>
                            <table className={styles.rolesTable}>
                                <thead>
                                <tr>
                                    <th>Role Name</th>
                                    <th>Permissions</th>
                                    <th style={{textAlign: 'right'}}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {roles.length > 0 ? (roles.map(role => (
                                    <tr key={role.id}>
                                        <td>{role.name}</td>
                                        <td>
                                            <div className={styles.permissionPills}>
                                                {role.permissions.length > 0 ? (
                                                    role.permissions.map(p => (
                                                        <span key={p.id} className={styles.permissionPill}
                                                              title={p.description}>{p.name}</span>))
                                                ) : (
                                                    <span className={styles.noPermissionsText}>No permissions</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={styles.actionsCell}>
                                            <div className={styles.actionButtons}>
                                                <button onClick={() => handleShowEditForm(role)}
                                                        className={`${styles.actionBtnIcon} ${styles.editBtn}`}
                                                        title="Edit Role"><Icon as={FiEdit} size={20}/></button>
                                                <button onClick={() => handleDeleteRole(role.id, role.name)}
                                                        className={`${styles.actionBtnIcon} ${styles.deleteBtn}`}
                                                        title="Delete Role"><Icon as={FiTrash2} size={20}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))) : (
                                    <tr>
                                        <td colSpan={3} style={{textAlign: 'center', padding: '2rem'}}>No roles found.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <RoleForm initialData={currentRoleData!} allPermissions={allPermissions} onSave={handleSaveRole}
                              onCancel={handleReturnToList} mode={mode}/>
                )}
            </div>
        )
    }

    return (
        <div className={styles.modalBackdrop} onClick={handleClose}>
            <div
                className={`${styles.manageRolesPage} ${isDarkMode ? styles.dark : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* The close button is now part of the modal frame */}
                {(onClose && onRolesUpdated) && (
                    <button onClick={handleClose} className={styles.closeButton}>×</button>
                )}
                {renderContent()}
            </div>
        </div>
    );
}

// --- Form Sub-Component ---
interface RoleFormProps {
    initialData: RoleFormData;
    allPermissions: Permission[];
    onSave: (data: RoleFormData) => void;
    onCancel: () => void;
    mode: 'create' | 'edit';
}

function RoleForm({initialData, allPermissions, onSave, onCancel, mode}: RoleFormProps) {
    const [name, setName] = useState(initialData.name);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set(initialData.permissionIds));

    const handlePermissionChange = (permissionId: number, isChecked: boolean) => {
        const newIds = new Set(selectedPermissionIds);
        if (isChecked) {
            newIds.add(permissionId);
        } else {
            newIds.delete(permissionId);
        }
        setSelectedPermissionIds(newIds);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Role name cannot be empty.");
            return;
        }
        onSave({id: initialData.id, name, permissionIds: Array.from(selectedPermissionIds)});
    };

    const handleSelectAll = () => {
        if (selectedPermissionIds.size === allPermissions.length) {
            setSelectedPermissionIds(new Set());
        } else {
            const allIds = allPermissions.map(p => p.id);
            setSelectedPermissionIds(new Set(allIds));
        }
    };

    return (
        <div className={styles.contentBox}>
            <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                    <button onClick={onCancel} className={styles.backButton} title="Back to list"><Icon as={FiArrowLeft}
                                                                                                        size={20}/>
                    </button>
                    <h2>{mode === 'edit' ? `Edit Role: ${initialData.name}` : "Create New Role"}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="roleName">Role Name</label>
                        <input id="roleName" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                               className={styles.formInput}/>
                    </div>
                    <div className={styles.formGroup}>
                        <div className={styles.permissionsHeader}>
                            <label>Permissions</label>
                            <button type="button" className={styles.selectAllBtn} onClick={handleSelectAll}>
                                {selectedPermissionIds.size === allPermissions.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className={styles.permissionsGrid}>
                            {allPermissions.map(p => (
                                <label key={p.id} className={styles.permissionCheckbox}>
                                    <input type="checkbox" checked={selectedPermissionIds.has(p.id)}
                                           onChange={(e) => handlePermissionChange(p.id, e.target.checked)}/>
                                    <span className={styles.details}>
                                        <span className={styles.name}>{p.name}</span>
                                        <span className={styles.description}>{p.description}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={onCancel}
                                className={`${styles.btn} ${styles.btnSecondary}`}>Cancel
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ManageRolesPage;