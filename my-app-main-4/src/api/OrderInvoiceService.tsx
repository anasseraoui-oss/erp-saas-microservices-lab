import axios from 'axios';
import {Delivery} from "../classe/Delivery";
import authService from "./authService";
import {User} from "../classe/types";
import axiosInstance from "../axiosBasec/axiosInstance";
import activityLogger from '../classe/ActivityLoggerService';

// --- 1. Define types and interfaces ---
export type ServiceType = "sales" | "purchases";
export type OrderType = "Invoice" | "Order";

interface SalesPayload {
    customer: number;
    salesLines: any[];
    paymentStatus: string;
    returns: any[];
    delivery?: Delivery | null;
    userExecutor?: string;
}

interface PurchasePayload {
    supplier: number;
    purchaseLines: any[];
    paymentStatus: string;
    returns: any[];
    delivery?: Delivery | null;
    userExecutor?: string;

}

type InvoicePayload = SalesPayload | PurchasePayload;


// --- 2. A single, simple function to get the correct API endpoint ---
// This function now correctly uses both serviceType and orderType to build the base URL for a resource.
const getApiEndpoint = (serviceType: "sales" | "purchases" | string, orderType: "Invoice" | "Order" | string): string => {
    // Make sure these paths match your backend controllers exactly.
    // For example, this will generate "http://localhost:9055/sales/Invoice"
    return `http://localhost:9055/${serviceType}/${orderType}`;
};
export const getUserIdByUserName = async (username: string | null): Promise<number | null> => {
    if (!username) return null;
    try {
        const user: User = await authService.getUserByUsername(username);
        return user.id;
    } catch (error) {
        console.error("Failed to get user by username", error);
        return null;
    }
}

// --- 3. All service functions now use the corrected getApiEndpoint ---

export const createOrderOrInvoice = async (
    payload: InvoicePayload,
    serviceType: "sales" | "purchases" | string,
    orderType: "Invoice" | "Order" | string
) => {
    // The final URL is now built correctly. Example: http://localhost:9055/sales/Invoice/create
    const url = `${getApiEndpoint(serviceType, orderType)}/create`;

    // 1. Get the username from localStorage
    const username = localStorage.getItem('username');

    // 2. AWAIT the result of the async function to get the actual ID
    const userId = await getUserIdByUserName(username);

    // 3. Check if we got a valid ID
    if (userId === null) {
        // Handle the error: maybe the user is not logged in or the token is expired
        throw new Error("Could not retrieve user ID. User may not be logged in.");
    }    const dataWithUser = { ...payload, userExecutor: userId };

    console.log(`[OrderInvoiceService] Attempting to POST to: ${url}`);
    console.log(`[OrderInvoiceService] Sending Payload:`, dataWithUser);

    try {
        activityLogger.logActivity(`CREATE_${orderType.toUpperCase()}`, { username: username }, `User ${username} created a new ${orderType} for ${serviceType}.`);
        const response = await axiosInstance.post(url, dataWithUser);
        return response.data;
    } catch (error) {
        console.error(`[OrderInvoiceService] Failed to create ${orderType} for ${serviceType}.`, error);
        if (axios.isAxiosError(error)) {
            console.error('[OrderInvoiceService] Axios error details:', {
                message: error.message,
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data,
            });
        }
        throw error;
    }
};

export const getOrderOrInvoiceById = async (id: number, serviceType: ServiceType, orderType: OrderType) => {
    const url = `${getApiEndpoint(serviceType, orderType)}/${id}`;
    const username = localStorage.getItem('username');
    try {
        activityLogger.logActivity(`GET_${orderType.toUpperCase()}_BY_ID`, { username: username }, `User ${username} fetched ${orderType} #${id} from ${serviceType}.`);
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${orderType} #${id} from ${serviceType}:`, error);
        throw error;
    }
};

export const getAllOrdersOrInvoices = async (serviceType: ServiceType, orderType: OrderType) => {
    const url = getApiEndpoint(serviceType, orderType);
    const username = localStorage.getItem('username');
    try {
        activityLogger.logActivity(`GET_ALL_${orderType.toUpperCase()}S`, { username: username }, `User ${username} fetched all ${orderType}s from ${serviceType}.`);
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching all ${orderType}s from ${serviceType}:`, error);
        throw error;
    }
};

export const updateOrderOrInvoice = async (id: number, updatedData: any, serviceType: ServiceType, orderType: OrderType) => {
    const url = `${getApiEndpoint(serviceType, orderType)}/update/${id}`;
    const username = localStorage.getItem('username');
    try {
        activityLogger.logActivity(`UPDATE_${orderType.toUpperCase()}`, { username: username }, `User ${username} updated ${orderType} #${id} in ${serviceType}.`);
        const storedUsername = await getUserIdByUserName(username);
        const dataWithUser = { ...updatedData, userExecutor: storedUsername };
        const response = await axiosInstance.put(url, dataWithUser);
        return response.data;
    } catch (error) {
        console.error(`Error updating ${orderType} #${id} in ${serviceType}:`, error);
        throw error;
    }
};

export const deleteOrderOrInvoice = async (id: number, serviceType: ServiceType, orderType: OrderType) => {
    // This will generate a correct URL like "http://localhost:9055/sales/Invoice/delete/5"
    const url = `${getApiEndpoint(serviceType, orderType)}/delete/${id}`;
    const username = localStorage.getItem('username');
    try {
        activityLogger.logActivity(`DELETE_${orderType.toUpperCase()}`, { username: username }, `User ${username} deleted ${orderType} #${id} in ${serviceType}.`);
        await axiosInstance.delete(url);
    } catch (error) {
        console.error(`Error deleting ${orderType} #${id} in ${serviceType}:`, error);
        throw error;
    }
};


export const searchOrdersOrInvoices = async (query: string, serviceType: ServiceType, orderType: OrderType) => {
    const url = `${getApiEndpoint(serviceType, orderType)}/search`;
    const username = localStorage.getItem('username');
    try {
        activityLogger.logActivity(`SEARCH_${orderType.toUpperCase()}S`, { username: username }, `User ${username} searched for ${orderType}s in ${serviceType} with query "${query}".`);
        const response = await axiosInstance.get(url, { params: { query } });
        return response.data;
    } catch (error) {
        console.error(`Error searching ${orderType}s in ${serviceType}:`, error);
        return [];
    }
};

export const getOrderOrInvoiceBySalesLineId = async (id: number, serviceType: ServiceType, orderType: OrderType) => {
    const url = `${getApiEndpoint(serviceType, orderType)}/line/${id}/order`;
    const username = localStorage.getItem('username');
    try {
        activityLogger.logActivity(`GET_${orderType.toUpperCase()}_BY_LINE_ID`, { username: username }, `User ${username} fetched ${orderType} by Sales Line ID #${id} from ${serviceType}.`);
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${orderType} by Sales Line ID from ${serviceType}:`, error);
        throw error;
    }
};
// In your api/OrderInvoiceService.ts

// ... (your existing axios instance and other functions)
export const updateOrderStatus = async (orderId: number, status: string, serviceType: string) => {
    // We need to map the generic status to a specific endpoint action
    let action = '';
    switch (status.toUpperCase()) {
        case 'CONFIRMED':
            action = 'confirm';
            break;
        case 'SHIPPED':
            action = 'ship';
            break;
        case 'CANCELED':
            action = 'cancel';
            break;
        case 'PENDING':
            action = 'pending';
            break;
        default:
            // Handle unknown or unsupported statuses, like PENDING or DELIVERED
            console.error(`Status update for "${status}" is not supported by an endpoint.`);
            // You might want to throw an error or show a message to the user
            throw new Error(`Unsupported order status: ${status}`);
    }

    // Construct the correct, specific URL
    const endpointUrl = `${getApiEndpoint(serviceType,"Order")}/${orderId}/${action}`;
    const username = localStorage.getItem('username');

    try {
        activityLogger.logActivity(`UPDATE_ORDER_STATUS`, { username: username }, `User ${username} updated order #${orderId} to status "${status}".`);
        // Use PUT method and send NO request body, as expected by the backend
        const response = await axiosInstance.put(endpointUrl);
        console.log(`Order #${orderId} successfully updated to action: ${action}`);
        return response.data;
    } catch (error) {
        console.error(`Error performing action "${action}" for order ID ${orderId}:`, error);
        throw error;
    }
};