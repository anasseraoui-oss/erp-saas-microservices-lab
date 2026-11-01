import axios from "axios";
import {User} from "../classe/types";
import activityLogger from "../classe/ActivityLoggerService";
import {getUserName} from "../axiosBasec/storagByUser";
import { GATEWAY_URL } from '../config/runtime';

// ====================================================================
//   Axios Interceptor
// ====================================================================
interface LoginCredentials {
    email: string;
    password: string;
}
const API_BASE_URL = GATEWAY_URL;
export const username = localStorage.getItem('username');
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Interceptor  ( 401 Unauthorized)
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized Access - 401. Your session may have expired. Please log in again.");
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ====================================================================
//  (Authentication)
// ====================================================================

const login = async (credentials: LoginCredentials) => {
    try {
        const response = await axiosInstance.post(`/auth/login`, credentials);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username',credentials.email);
            activityLogger.logActivity('LOGIN', { username:credentials.email });
        }
        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }

};
const getCurrentUser = async (): Promise<User | null> => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (!username || !token) {
        return null;
    }
    try {
        const user = await getUserByUsername(username);
        return user;
    } catch (error) {
        console.error(`Failed to fetch user '${username}'. It's possible the token is invalid or the user was deleted.`, error);
        return null;
    }
}


const logout = async () => {
    localStorage.removeItem('token');
    activityLogger.logActivity('LOGOUT', { username: username});
    localStorage.removeItem('username');
    return  await axiosInstance.post("/auth/logout")
};

const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};


// ====================================================================
//   (User Management) -UserController
// ====================================================================

const getAccounts = async () => {
    try {
        const response = await axiosInstance.get('/users');
        activityLogger.logActivity('GET_ACCOUNTS', { username:username });
        console.log('API Response for getAccounts:', response);

        return response.data;
    } catch (error) {
        console.error("Error in getAccounts service function:", error);
        throw error;
    }
};
// Version corrigée de getUserById
const getUserById = async (userId: string | number) => {
    try {
        // 1. Récupérer les données de l'utilisateur
        const response = await axiosInstance.get(`/users/user/${userId}`);
        const userData = response.data; // Stocker les données dans une variable

        console.log(`API Response for getUserById with id ${userId}:`, response);

        // 2. Gérer le logging de manière non-bloquante
        //    Utilisez les données déjà récupérées au lieu de faire un nouvel appel.
        //    Supposons que l'objet utilisateur a une propriété `fullName`.
        // Appelez le logger sans `await` pour ne pas bloquer le retour de la fonction.
        // Le payload { user: userNameForLog } utilise maintenant une variable définie.
        activityLogger.logActivity(`GET_ACCOUNT_BY_ID_${userId}`, {username: username });

        // 3. Retourner immédiatement les données de l'utilisateur
        return userData;

    } catch (error) {
        console.error(`Error fetching user with id ${userId}:`, error);
        // Il est important de relancer l'erreur pour que le composant
        // puisse la détecter et afficher un message d'erreur si nécessaire.
        throw error;
    }
};

const deleteAccount = async (userId: number) => {
    try {
        const response = await axiosInstance.delete(`/users/delete-user/${userId}`);
        activityLogger.logActivity(`DELETE_ACCOUNT_BY_ID_${userId}::${await getUserName(userId)}`, { username:username });
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with id ${userId}:`, error);
        throw error;
    }
};
const updateUser = async (userId: number | null, userData: {
    roles: { id: number }[];
    fullName: string;
    id: number | null;
    email: string
}) => {
    const response = await axiosInstance.put(`/users/update-user/${userId}`, userData);
    activityLogger.logActivity(`UPDATE_ACCOUNT_BY_ID_${userId}::${userData.fullName}`, { username: username });
    return response.data;
};
const getUserByUsername = async (username: string | null) :Promise<User> => {
    const response = await axiosInstance.get(`/users/user/username/${username}`);
    return response.data;
};
const createUser = async (userData: any) => {
    const response = await axiosInstance.post('/users/admin/create-user', userData);
    activityLogger.logActivity(`CREATE_ACCOUNT::${userData.fullName}`, { username:username });
    return response.data;
};

export const searchUsersAndRoles = async (query: string): Promise<User[]> => {
    try {
        // L'URL LE S7I7A
        // Assurez-vous que le chemin correspond à celui de votre contrôleur.
        // Si le contrôleur a @RequestMapping("/users"), alors ceci est correct.
        // Si le contrôleur a @RequestMapping("/api/v1/users"), alors il faut l'ajouter ici.
        const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
        activityLogger.logActivity(`SEARCH_ACCOUNTS`, { username:username });
        return response.data;
    } catch (error) {
        console.error(`Search failed for query: ${query}`, error);
        throw error;
    }
};

// ====================================================================
//   (Role Management)
// ====================================================================

const getAllRoles = async () => {
    try {
        const response = await axiosInstance.get('/users/admin/roles');
        return response.data;
    } catch (error) {
        console.error("Error fetching all roles:", error);
        throw error;
    }
};

const createRole = async (roleData: {
    permissions: { name: string | undefined; description: string | undefined; id: number | undefined }[];
    name: string;
    id: number | undefined
}) => {
    const response = await axiosInstance.post('/users/admin/role', roleData);
    return response.data;
};

const addRoleToUser = async (userId: number, roleId: number) => {
    try {
        const response = await axiosInstance.post(`/users/${userId}/roles/${roleId}`);
        return response.data;
    } catch (error) {
        console.error(`Error adding role ${roleId} to user ${userId}:`, error);
        throw error;
    }
};
const getRolesForUser = async (username: string) => {
    const response = await axiosInstance.get(`/admin/user/username/${username}/roles`);
    return response.data;
};
const removeRoleFromUser = async (userId: number, roleId: React.Key | null | undefined) => {
    try {
        const response = await axiosInstance.delete(`/users/${userId}/roles/${roleId}`);
        return response.data;
    } catch (error) {
        console.error(`Error removing role ${roleId} from user ${userId}:`, error);
        throw error;
    }
};


// ====================================================================
//  5(Permission Management). RoleController & PermissionController
// ====================================================================

const getAllPermissions = async () => {
    try {
        const response = await axiosInstance.get('/api/permissions');
        return response.data;
    } catch (error) {
        console.error("Error fetching all permissions:", error);
        throw error;
    }
};

const addPermissionToRole = async (roleId: number, permission: any) => {
    try {
        const response = await axiosInstance.post(`/admin/${roleId}/permissions`, permission);
        return response.data;
    } catch (error) {
        console.error(`Error adding permission to role ${roleId}:`, error);
        throw error;
    }
};

const removePermissionFromRole = async (roleId: number, permission: any) => {
    try {
        const response = await axiosInstance.delete(`/admin/${roleId}/permissions`, { data: permission });
        return response.data;
    } catch (error) {
        console.error(`Error removing permission from role ${roleId}:`, error);
        throw error;
    }
};

const searchUsers =async (qurey: string) => {
    const response = await axiosInstance.get(`/users/search/${qurey}`)
    return  response.data
}
const updateRole=async (id: number | string, role: {
    permissions: { name: string | undefined; description: string | undefined; id: number | undefined }[];
    name: string;
    id: number | undefined
})=>{
    await axiosInstance.put(`/admin/${id}`,role);
}
const deleteRole=async (id:number|string)=>{
    return await axiosInstance.delete(`/admin/${id}`);
}
// ====================================================================
// ====================================================================

const authService = {
    // Auth
    login,
    logout,
    isAuthenticated,
    // Users
    getAccounts,
    getUserById,
    deleteAccount,
    updateUser,
    getUserByUsername,
    searchUsers,
    createUser,
    searchUsersAndRoles,
    // Roles
    createRole,
    getAllRoles,
    addRoleToUser,
    removeRoleFromUser,
    getRolesForUser,
    updateRole,
    deleteRole,
    // Permissions
    getAllPermissions,
    addPermissionToRole,
    removePermissionFromRole,
    getCurrentUser,
};

export default authService;
