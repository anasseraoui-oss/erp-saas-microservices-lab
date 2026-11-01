import {getUserIdByUserName} from "./OrderInvoiceService";
import axiosInstance from "../axiosBasec/axiosInstance";
import activityLogger from "../classe/ActivityLoggerService";
import { username } from "./authService";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:9055';
const API_URL = `${API_BASE_URL}/SupplierClients`; // SupplierClient Service
export const getSupplerClients = async () => {
    try {
        activityLogger.logActivity(`GET_SUPPLIER_CLIENTS`, { username: username }, `User ${username} fetched all supplier/clients.`);
        const response = await axiosInstance.get(`${API_URL}/supplierClient`);
        return response.data;
    } catch (error) {
        console.error("Error fetching supplier or Client:", error);
        throw error; // Propagate error for handling in the component
    }
};

// @ts-ignore
export const createSupplierClient = async (SupplarclientData) => {
    activityLogger.logActivity(`CREATE_SUPPLIER_CLIENT`, { username: username }, `User ${username} created a new supplier/client with name "${SupplarclientData.name}".`);
    const userId = await getUserIdByUserName(username);

    const dataWithUser = { ...SupplarclientData, userCreator: userId };
    const response = await axiosInstance.post(`${API_URL}/supplierClient`, dataWithUser);
    return response.data;
};

// @ts-ignore
export const updateSupplierClient = async (clientId, SupplarclientData) => {
    activityLogger.logActivity(`UPDATE_SUPPLIER_CLIENT`, { username: username }, `User ${username} updated supplier/client with ID "${clientId}".`);
    const userId = await getUserIdByUserName(username);
    const dataWithUser = { ...SupplarclientData, userExecutor: userId };
    const response = await axiosInstance.put(`${API_URL}/${clientId}`, dataWithUser);
    return response.data;
};

// @ts-ignore
export const deleteSupplierClient = async (clientId) => {
    activityLogger.logActivity(`DELETE_SUPPLIER_CLIENT`, { username: username }, `User ${username} deleted supplier/client with ID "${clientId}".`);
   const response = await axiosInstance.delete(`${API_URL}/Delete/${clientId}`);
    return response.data;
};
// @ts-ignore
export const searchSupplierClient = async (query) => {
    try {
        activityLogger.logActivity(`SEARCH_SUPPLIER_CLIENTS`, { username: username }, `User ${username} searched for supplier/clients with query "${query}".`);
        const response = await axiosInstance.get(`${API_URL}/search`, {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching suppler clients:', error);
        return [];
    }
};
export const getSupplierClientById = async (id: number | string) => {
    activityLogger.logActivity(`GET_SUPPLIER_CLIENT_BY_ID`, { username: username }, `User ${username} fetched supplier/client with ID "${id}".`);
    const response = await axiosInstance.get(`${API_URL}/id/${id}`);
    return response.data;
}
export const getSupplierClientNameById = async (id: number | string) => {
    const response = await getSupplierClientById(id);
    return response.name;
}