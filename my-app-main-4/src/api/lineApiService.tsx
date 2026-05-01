import { getUserIdByUserName, OrderType } from "./OrderInvoiceService";
import { axiosInstance } from "./authService";

const API_GATEWAY_URL = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:9055';

export type ServiceType = 'sales' | 'purchases';
export type LineType = 'line' | 'lineReturn';

/** List paths: Sales order|invoice, Purchase orders|invoices */
const getListSegment = (serviceType: ServiceType, parentType: OrderType): string => {
    if (serviceType === 'sales') return parentType === 'Order' ? 'order' : 'invoice';
    return parentType === 'Order' ? 'orders' : 'invoices';
};

/** Resource paths: Sales & Purchase line use order|invoice (singular); Purchase list uses orders|invoices */
const getResourceSegment = (serviceType: ServiceType, parentType: OrderType): string => {
    return parentType === 'Order' ? 'order' : 'invoice';
};

/**
 * Builds URL to match backend:
 * - Sales Line:     /line/sales/order | /line/sales/invoice  (PUT/DELETE /order/{id})
 * - Sales Return:   /lineReturn/sales/order | ...  (PUT .../order/update/{id})
 * - Purchase Line:  /line/purchases/orders | /invoices (GET), PUT/DELETE /order/{id} | /invoice/{id}
 * - Purchase Return: /lineReturn/purchases/orders | ...  (PUT .../orders/update no id in path)
 */
const buildApiUrl = (
    serviceType: ServiceType,
    lineType: LineType,
    parentType: OrderType,
    action: string,
    id?: number | string
): string => {
    const listSegment = getListSegment(serviceType, parentType);
    const resourceSegment = getResourceSegment(serviceType, parentType);
    const baseList = `/${lineType}/${serviceType}/${listSegment}`;
    const baseResource = `/${lineType}/${serviceType}/${resourceSegment}`;

    switch (action) {
        case 'getAll':
            return `${API_GATEWAY_URL}${baseList}`;
        case 'create':
            return `${API_GATEWAY_URL}${baseList}/create`;
        case 'search':
            return `${API_GATEWAY_URL}${baseList}/search`;
        case 'getById':
        case 'delete':
            if (id == null) throw new Error('ID is required for this operation.');
            return `${API_GATEWAY_URL}${baseResource}/${id}`;
        case 'update':
            if (lineType === 'line') {
                return `${API_GATEWAY_URL}${baseResource}/${id}`;
            }
            if (serviceType === 'sales') {
                return `${API_GATEWAY_URL}${baseResource}/update/${id}`;
            }
            return `${API_GATEWAY_URL}${baseList}/update`;
        default:
            throw new Error(`Invalid action specified: ${action}`);
    }
};

export const getAllLines = async (
    serviceType: ServiceType,
    lineType: LineType,
    parentType: OrderType
): Promise<any[]> => {
    const url = buildApiUrl(serviceType, lineType, parentType, 'getAll');
    try {
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching all ${lineType}s for ${serviceType}/${parentType}:`, error);
        throw error;
    }
};

export const getLineById = async (
    id: number | string,
    serviceType: ServiceType,
    lineType: LineType,
    parentType: OrderType
): Promise<any> => {
    const url = buildApiUrl(serviceType, lineType, parentType, 'getById', id);
    try {
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${lineType} with id ${id} for ${serviceType}:`, error);
        throw error;
    }
};

export const addLine = async (
    data: any,
    serviceType: ServiceType,
    lineType: LineType,
    parentType: OrderType
): Promise<any> => {
    const url = buildApiUrl(serviceType, lineType, parentType, 'create');
    try {
        const username = localStorage.getItem('username');
        const userId = await getUserIdByUserName(username);
        if (userId === null) {
            throw new Error("Could not retrieve user ID. User may not be logged in.");
        }
        const dataWithUser = { ...data, userCreator: userId };
        const response = await axiosInstance.post(url, dataWithUser);
        return response.data;
    } catch (error) {
        console.error(`Error adding ${lineType} for ${serviceType}:`, error);
        throw error;
    }
};

export const updateLine = async (
    id: number | string,
    data: any,
    serviceType: ServiceType,
    lineType: LineType,
    parentType: OrderType
): Promise<any> => {
    const username = localStorage.getItem('username');
    const userId = await getUserIdByUserName(username);
    if (userId === null) {
        throw new Error("Could not retrieve user ID. User may not be logged in.");
    }
    const dataWithUser = { ...data, userExecutor: userId };
    // Purchase lineReturn: backend expects body with id, no id in path
    const url = buildApiUrl(serviceType, lineType, parentType, 'update', id);
    try {
        const payload = serviceType === 'purchases' && lineType === 'lineReturn'
            ? { ...dataWithUser, id }
            : dataWithUser;
        const response = await axiosInstance.put(url, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating ${lineType} with id ${id} for ${serviceType}:`, error);
        throw error;
    }
};

export const deleteLine = async (
    id: number | string,
    serviceType: ServiceType,
    lineType: LineType,
    parentType: OrderType
): Promise<any> => {
    const url = buildApiUrl(serviceType, lineType, parentType, 'delete', id);
    try {
        const response = await axiosInstance.delete(url);
        return response.data;
    } catch (error) {
        console.error(`Error deleting ${lineType} with id ${id} for ${serviceType}:`, error);
        throw error;
    }
};

export const getLinesByParentId = async (
    parentId: number | string,
    serviceType: ServiceType,
    parentType: OrderType
): Promise<any[]> => {
    const url = `${API_GATEWAY_URL}/${serviceType}/${parentType}/lines/${parentId}`;
    try {
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching lines for ${parentType} ${parentId} in ${serviceType}:`, error);
        throw error;
    }
};

/** Backend filter: Sales has /line/sales/order/filter and /line/sales/invoice/filter */
export const filterLines = async (
    serviceType: ServiceType,
    parentType: OrderType,
    params: { id?: number | string | null; date?: Date | null; type?: string | null }
): Promise<any[]> => {
    const segment = getListSegment(serviceType, parentType);
    const url = `${API_GATEWAY_URL}/line/${serviceType}/${segment}/filter`;
    const query: Record<string, unknown> = {};
    if (params.id != null) query[serviceType === 'sales' ? 'customerId' : 'supplierId'] = params.id;
    if (params.date != null) query['date'] = params.date instanceof Date ? params.date.toISOString().slice(0, 10) : params.date;
    if (params.type != null) query['type'] = params.type;
    try {
        const response = await axiosInstance.get(url, { params: query });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error filtering lines for ${serviceType}:`, error);
        return [];
    }
};

export const searchLines = async (
    query: string,
    serviceType: ServiceType,
    lineType: LineType,
    parentType: OrderType
): Promise<any[]> => {
    if (!query?.trim()) return [];
    const url = buildApiUrl(serviceType, lineType, parentType, 'search');
    try {
        const response = await axiosInstance.get(url, { params: { query } });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error searching ${lineType}s for ${serviceType} with query "${query}":`, error);
        return [];
    }
};

/** Fetches lines for both Order and Invoice and merges (for components that need all lines). */
export const getAllLinesAllContexts = async (
    serviceType: ServiceType,
    lineType: LineType
): Promise<any[]> => {
    const [orderLines, invoiceLines] = await Promise.all([
        getAllLines(serviceType, lineType, 'Order'),
        getAllLines(serviceType, lineType, 'Invoice'),
    ]);
    return [...(Array.isArray(orderLines) ? orderLines : []), ...(Array.isArray(invoiceLines) ? invoiceLines : [])];
};

/** Searches lines for both Order and Invoice and merges (for global search). */
export const searchLinesAllContexts = async (
    query: string,
    serviceType: ServiceType,
    lineType: LineType
): Promise<any[]> => {
    if (!query?.trim()) return [];
    const [orderLines, invoiceLines] = await Promise.all([
        searchLines(query, serviceType, lineType, 'Order'),
        searchLines(query, serviceType, lineType, 'Invoice'),
    ]);
    return [...(Array.isArray(orderLines) ? orderLines : []), ...(Array.isArray(invoiceLines) ? invoiceLines : [])];
};
