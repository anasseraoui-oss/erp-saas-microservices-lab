import axios from 'axios';
import {getUserIdByUserName, OrderType} from "./OrderInvoiceService";
import { axiosInstance } from "./authService";

const API_GATEWAY_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:9055';

export type ServiceType = 'sales' | 'purchases';
export type LineType = 'line' | 'lineReturn';

const buildApiUrl = (serviceType: ServiceType, lineType: LineType, action: string, id?: number | string): string => {
    const basePath = `/${lineType}/${serviceType}`;

    switch (action) {
        case 'create':
            return `${API_GATEWAY_URL}${basePath}/line/create`;
        case 'getAll':
            return `${API_GATEWAY_URL}${basePath}`;
        case 'search': // --- الإضافة الجديدة هنا ---
            return `${API_GATEWAY_URL}${basePath}/search`;
        case 'getById':
        case 'delete':
            if (!id) throw new Error('ID is required for this operation.');
            return `${API_GATEWAY_URL}${basePath}/line/${id}`;
        case 'update':
            if (!id) throw new Error('ID is required for this operation.');
            return `${API_GATEWAY_URL}${basePath}/line/update/${id}`;
        default:
            throw new Error(`Invalid action specified: ${action}`);
    }
};

export const getAllLines = async (serviceType: ServiceType, lineType: LineType): Promise<any[]> => {
    const url = buildApiUrl(serviceType, lineType, 'getAll');
    try {
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching all ${lineType}s for ${serviceType}:`, error);
        throw error;
    }
};

export const getLineById = async (id: number | string, serviceType: ServiceType, lineType: LineType): Promise<any> => {
    const url = buildApiUrl(serviceType, lineType, 'getById', id);
    try {
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${lineType} with id ${id} for ${serviceType}:`, error);
        throw error;
    }
};

export const addLine = async (data: any, serviceType: ServiceType, lineType: LineType): Promise<any> => {
    const url = buildApiUrl(serviceType, lineType, 'create');
    try {
        // 1. Get the username from localStorage
        const username = localStorage.getItem('username');

        // 2. AWAIT the result of the async function to get the actual ID
        const userId = await getUserIdByUserName(username);
        // 3. Check if we got a valid ID
        if (userId === null) {
            // Handle the error: maybe the user is not logged in or the token is expired
            throw new Error("Could not retrieve user ID. User may not be logged in.");
        }    const dataWithUser = { ...data, userCreator: userId };
        console.log(data);
        const response = await axiosInstance.post(url, dataWithUser);
        return response.data;
    } catch (error) {
        console.error(`Error adding a new ${lineType} for ${serviceType}:`, error);
        throw error;
    }
};

export const updateLine = async (id: number | string, data: any, serviceType: ServiceType, lineType: LineType): Promise<any> => {
    // 1. Get the username from localStorage
    const username = localStorage.getItem('username');
    // 2. AWAIT the result of the async function to get the actual ID
    const userId = await getUserIdByUserName(username);
    // 3. Check if we got a valid ID
    if (userId === null) {
        // Handle the error: maybe the user is not logged in or the token is expired
        throw new Error("Could not retrieve user ID. User may not be logged in.");
    }    const dataWithUser = { ...data, userExecutor: userId };
    const url = buildApiUrl(serviceType, lineType, 'update', id);
    try {
        const response = await axiosInstance.put(url, dataWithUser);
        return response.data;
    } catch (error) {
        console.error(`Error updating ${lineType} with id ${id} for ${serviceType}:`, error);
        throw error;
    }
};

export const deleteLine = async (id: number | string, serviceType: ServiceType, lineType: LineType): Promise<any> => {
    const url = buildApiUrl(serviceType, lineType, 'delete', id);
    try {
        const response = await axiosInstance.delete(url);
        return response.data;
    } catch (error) {
        console.error(`Error deleting ${lineType} with id ${id} for ${serviceType}:`, error);
        throw error;
    }
};

export const getLinesByParentId = async (parentId: number | string, serviceType: ServiceType, parentType: OrderType): Promise<any[]> => {
    const url = `${API_GATEWAY_URL}/${serviceType}/${parentType}/lines/${parentId}`;
    try {
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching lines for ${parentType} ${parentId} in ${serviceType}:`, error);
        throw error;
    }
};

export const filterLines = async (serviceType: ServiceType, params: { id?: number | string | null; date?: Date | null; type?: string | null; }): Promise<any[]> => {
    const url = `${API_GATEWAY_URL}/line/${serviceType}/filter`;
    const query: any = {};
    if (params.id != null) query[serviceType === 'sales' ? 'customerId' : 'supplierId'] = params.id;
    if (params.date != null) query['dateMillis'] = params.date.getTime();
    if (params.type != null) query['type'] = params.type;
    try {
        const response = await axiosInstance.get(url, { params: query });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error filtering lines for ${serviceType}:`, error);
        return [];
    }
};

export const searchLines = async (query: string, serviceType: ServiceType, lineType: LineType): Promise<any[]> => {
    if (!query || query.trim() === '') {
        return [];
    }
    const url = buildApiUrl(serviceType, lineType, 'search');
    try {
        const response = await axiosInstance.get(url, {
            params: { query }
        });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error searching ${lineType}s for ${serviceType} with query "${query}":`, error);
        return [];
    }
};