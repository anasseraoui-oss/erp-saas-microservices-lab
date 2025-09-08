
export interface Permission {
    id: number;
    name: string;
    description: string;
}

export interface Role {
    permissionIds: number[];
    id: number;
    name: string;
    permissions: Permission[];
}

export interface User {
    id: number;
    fullName: string;
    email: string;
    username: string;
    roles: Role[];

    enabled: boolean;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;

    createdAt: string;
    updatedAt: string;
}