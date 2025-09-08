import {getUserIdByUserName} from "./OrderInvoiceService";
import axiosInstance from "../axiosBasec/axiosInstance";

const API_URL = 'http://localhost:9055/SupplierClients'; // SupplierClient Service
export const getSupplerClients = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/supplierClient`);
        return response.data;
    } catch (error) {
        console.error("Error fetching supplier or Client:", error);
        throw error; // Propagate error for handling in the component
    }
};

// @ts-ignore
export const createSupplierClient = async (SupplarclientData) => {
    const storedUsername = localStorage.getItem('username');
    const userId = await getUserIdByUserName(storedUsername);

    const dataWithUser = { ...SupplarclientData, userCreator: userId };
    const response = await axiosInstance.post(`${API_URL}/supplierClient`, dataWithUser);
    return response.data;
};

// @ts-ignore
export const updateSupplierClient = async (clientId, SupplarclientData) => {
    const storedUsername = localStorage.getItem('username');
    const userId = await getUserIdByUserName(storedUsername);
    const dataWithUser = { ...SupplarclientData, userExecutor: userId };
    const response = await axiosInstance.put(`${API_URL}/${clientId}`, dataWithUser);
    return response.data;
};

// @ts-ignore
export const deleteSupplierClient = async (clientId) => {
   const response = await axiosInstance.delete(`${API_URL}/Delete/${clientId}`);
    return response.data;
};
// @ts-ignore
export const searchSupplierClient = async (query) => {
    try {
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
    const response = await axiosInstance.get(`${API_URL}/id/${id}`);
    return response.data;
}
export const getSupplierClientNameById = async (id: number | string) => {
    const response = await getSupplierClientById(id);
    return response.name;
}