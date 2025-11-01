import axios, { AxiosResponse, AxiosError } from 'axios';
import { NotificationRequest } from './appointmentsService';
import axiosInstance from '../axiosBasec/axiosInstance';

const API_URL = 'http://localhost:9055/api/notifications';
const API_URL1 = 'http://localhost:9055/api/products';
const API_URL2 = 'http://localhost:9055/payment';
const API_URL_SAND = 'http://localhost:9055/api/sand';

// Add timeout configuration
const axiosConfig = {
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
};

export const triggerAllServiceChecks = async (): Promise<AxiosResponse<any>[]> => {
    try {
        const response1 = await axiosInstance.get(`${API_URL1}/trigger-checks`, axiosConfig);
        const response2 = await axiosInstance.get(`${API_URL2}/trigger-checks`, axiosConfig);
        return [response1, response2];
    } catch (error) {
        console.error('Error triggering service checks:', error);
        throw error;
    }
};

export type NotificationStatusType = 'PENDING' | 'SENT' | 'FAILED' | 'READ';

/**
 * Corresponds to the NotificationSandType enum in Java.
 * Represents the method or channel for sending a notification.
 */
export enum NotificationSandType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
  IN_APP = "IN_APP",
}

/**
 * Corresponds to the NotificationType enum in Java.
 * Represents the specific event or reason for the notification.
 */
export enum NotificationType {
  EXPIRATION = "EXPIRATION",
  LOW_STOCK = "LOW_STOCK",
  PRODUCT_DISCONTINUED = "PRODUCT_DISCONTINUED",
  NEW_PRODUCT = "NEW_PRODUCT",
  RESTOCK_NEEDED = "RESTOCK_NEEDED",
  PRICE_CHANGE = "PRICE_CHANGE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  PAYMENT_DUE = "PAYMENT_DUE",
  PAYMENT_OVERDUE = "PAYMENT_OVERDUE",
}

/**
 * Corresponds to the EnableStatus enum in Java.
 * Represents the enabled or disabled state of an entity.
 */
export enum EnableStatus {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

/**
 * Corresponds to the NotificationStatus enum in Java.
 * Represents the delivery status of a single notification.
 */
export enum NotificationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
  DELIVERED = "DELIVERED",
}

export interface Notification {
    id: number;
    recipient: string;
    subject: string;
    message: string;
    status: NotificationStatus;
    createdAt: string;
    sentAt?: string;
}

export interface SandData {
  id?: number; // 'id' is optional when creating a new Sand object
  name: string;
  description: string;
  email: string;
  phoneNumber: string;
  sandType: NotificationSandType;
  notificationType: NotificationType;
  notifications?: Notification[]; // Optional, as it might not always be sent/received
  enableStatus: EnableStatus;
}

/**
 * Enhanced error handling for notification updates
 */
const handleApiError = (error: any, operation: string): never => {
    console.error(`${operation} failed:`, error);

    if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.message;

        switch (status) {
            case 400:
                throw new Error(`Bad Request: ${message}`);
            case 401:
                throw new Error('Unauthorized. Please check your authentication.');
            case 403:
                throw new Error('Forbidden. You do not have permission to perform this action.');
            case 404:
                throw new Error('Resource not found. Please check the API endpoint.');
            case 500:
                throw new Error('Internal Server Error. Please try again later.');
            case 503:
                throw new Error('Service Unavailable. The server is temporarily down. Please try again later.');
            default:
                throw new Error(`Server Error (${status}): ${message}`);
        }
    } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check if the backend is running on http://localhost:9055');
    } else {
        // Something else happened
        throw new Error(`Request Error: ${error.message}`);
    }
};

/**
 * Test backend connectivity
 */
export const testBackendConnection = async (): Promise<boolean> => {
    try {
        const response = await axiosInstance.get(`${API_URL}/health`, { timeout: 5000 });
        console.log('Backend connection successful:', response.status);
        return true;
    } catch (error) {
        console.error('Backend connection failed:', error);
        return false;
    }
};

/**
 * Update notification with enhanced error handling and retry logic
 */
export const updateNotification = async (
    id: number,
    requestData: NotificationRequest,
    status: NotificationStatusType,
    retryCount: number = 3
): Promise<Notification> => {

    // Input validation
    if (!id || id <= 0) {
        throw new Error('Invalid notification ID');
    }

    if (!requestData) {
        throw new Error('Request data is required');
    }

    if (!['PENDING', 'SENT', 'FAILED', 'READ'].includes(status)) {
        throw new Error('Invalid status provided');
    }

    let lastError: any;

    // Retry logic
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            console.log(`Attempting to update notification ${id} (attempt ${attempt}/${retryCount})`);

            // Test connection first on first attempt
            if (attempt === 1) {
                const isConnected = await testBackendConnection();
                if (!isConnected) {
                    throw new Error('Cannot connect to backend server. Please ensure the server is running on http://localhost:9055');
                }
            }

            const url = `${API_URL}/update/${id}?status=${status}`;
            console.log('Making request to:', url);
            console.log('Request data:', requestData);

            const response = await axiosInstance.put<Notification>(url, requestData, { timeout: 10000 });

            console.log('Update successful:', response.data);
            return response.data;

        } catch (error: any) {
            lastError = error;
            console.error(`Attempt ${attempt} failed:`, error);

            // Don't retry on certain errors
            if (error.response?.status === 400 || error.response?.status === 404) {
                break;
            }

            // Wait before retry (exponential backoff)
            if (attempt < retryCount) {
                const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, etc.
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All retries failed
    return handleApiError(lastError, `Update notification with ID ${id}`);
};

/**
 * Fetch all notifications with error handling
 */
export const fetchAllNotifications = async (): Promise<any[]> => {
    try {
        console.log('Fetching all notifications from:', API_URL);
        const response = await axiosInstance.get(API_URL, { timeout: 10000 });
        console.log('Fetch successful, received', response.data?.length, 'notifications');
        return response.data;
    } catch (error: any) {
        return handleApiError(error, 'Fetch all notifications');
    }
};

/**
 * Create notification with error handling
 */
export const createNotification = async (requestData: NotificationRequest): Promise<Notification> => {
    try {
        console.log('Creating notification:', requestData);
        const response = await axiosInstance.post<Notification>(`${API_URL}/create`, requestData, { timeout: 10000 });
        console.log('Creation successful:', response.data);
        return response.data;
    } catch (error: any) {
        return handleApiError(error, 'Create notification');
    }
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (id: number): Promise<Notification> => {
    try {
        console.log('Fetching notification by ID:', id);
        const response = await axiosInstance.get<Notification>(`${API_URL}/${id}`, { timeout: 10000 });
        console.log('Fetch by ID successful:', response.data);
        return response.data;
    } catch (error: any) {
        return handleApiError(error, `Get notification with ID ${id}`);
    }
};

/**
 * Delete notification
 */
export const deleteNotification = async (id: number): Promise<void> => {
    try {
        console.log('Deleting notification:', id);
        await axiosInstance.delete(`${API_URL}/${id}`, { timeout: 10000 });
        console.log('Deletion successful');
    } catch (error: any) {
        handleApiError(error, `Delete notification with ID ${id}`);
    }
};

/**
 * Utility function to check if backend is healthy
 */
export const checkBackendHealth = async (): Promise<{
    isHealthy: boolean;
    message: string;
    timestamp: string;
}> => {
    try {
        // Try multiple endpoints to check health
        const healthChecks = [
            axiosInstance.get(`${API_URL}/health`, { timeout: 3000 }),
            axiosInstance.get(`${API_URL1}/health`, { timeout: 3000 }),
        ];

        const results = await Promise.allSettled(healthChecks);
        const successfulChecks = results.filter(result => result.status === 'fulfilled').length;

        return {
            isHealthy: successfulChecks > 0,
            message: successfulChecks > 0
                ? `Backend is healthy (${successfulChecks}/${healthChecks.length} services responding)`
                : 'Backend is not responding',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            isHealthy: false,
            message: 'Backend health check failed',
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * A collection of functions to interact with the /api/sand endpoints.
 */
export const sandApi = {
  /**
   * Fetches all Sand objects.
   * Corresponds to: GET /api/sand/
   * @returns {Promise<AxiosResponse<any>>} A promise that resolves with the response from the API.
   */
  getAll: () => {
    return axiosInstance.get(`${API_URL_SAND}/`);
  },

  /**
   * Retrieves a list of emails for a specific notification type.
   * Corresponds to: GET /api/sand/Emails
   * @param {string} notificationType - The type of notification to filter by.
   * @returns {Promise<AxiosResponse<any>>} A promise that resolves with the list of emails.
   */
  getEmailsByType: (notificationType: string) => {
    return axiosInstance.get(`${API_URL_SAND}/Emails`, { params: { notificationType } });
  },

  /**
   * Creates a new Sand object.
   * Corresponds to: POST /api/sand/
   * @param {object} sandData - The data for the new Sand object.
   * @returns {Promise<AxiosResponse<any>>} A promise that resolves with the response from the API.
   */
  save: (sandData: SandData) => {
    return axiosInstance.post(`${API_URL_SAND}/`, sandData);
  },

  /**
   * Deletes a Sand object by its ID.
   * Corresponds to: DELETE /api/sand/{id}
   * @param {number} id - The ID of the Sand object to delete.
   * @returns {Promise<AxiosResponse<any>>} A promise that resolves with the response from the API.
   */
  deleteById: (id: number) => {
    return axiosInstance.delete(`${API_URL_SAND}/${id}`);
  },

  /**
   * Updates an existing Sand object.
   * Corresponds to: PUT /api/sand/{id}
   * @param {number} id - The ID of the Sand object to update.
   * @param {object} sandData - The new data for the Sand object.
   * @returns {Promise<AxiosResponse<any>>} A promise that resolves with the response from the API.
   */
  update: (id: number, sandData: SandData) => {
    return axiosInstance.put(`${API_URL_SAND}/${id}`, sandData);
  },
};