import axios from "axios";
import {getUserIdByUserName, ServiceType} from "../OrderInvoiceService";
import {Payment} from "../../classe/Payment";
import axiosInstance from "../../axiosBasec/axiosInstance";
import {AddUserInData} from "../../axiosBasec/storagByUser";
import activityLogger from "../../classe/ActivityLoggerService";
import { username } from "../authService";

const API_BASE_URLS ="http://localhost:9055/payment"
// paymentService.tsx -> CORRECTED CODE
// ---------------------------------------------------------------------------------
// THIS IS NOW THE ONLY FUNCTION FOR ADDING/UPDATING A PAYMENT.
// We rename it to something clearer.
// ---------------------------------------------------------------------------------
// In your paymentService file, make sure the addOrUpdatePayment function
// matches the backend endpoint signature:

export const addOrUpdatePayment = async (
    orderType: string,
    orderId: number,
    amount: number,
    status: string,
    paymentScheduleStatus: string,
    methodePayment: string,
    totalAmount: number,
    supplierClientId: number,
    dueDate?: Date
) => {
    activityLogger.logActivity(`ADD_OR_UPDATE_PAYMENT`, { username: username }, `User ${username} added or updated payment for ${orderType} #${orderId}.`);

    if (!username) {
        throw new Error('Username not found in localStorage');
    }

    // 2. AWAIT the result of the async function to get the actual ID
    const userId = await getUserIdByUserName(username);

    if (!userId) {
        throw new Error('User ID not found');
    }

    // 3. Build parameters object
    const params = new URLSearchParams({
        amount: amount.toString(),
        status: status,
        paymentScheduleStatus: paymentScheduleStatus,
        methodePayment: methodePayment,
        totalAmount: totalAmount.toString(),
        userId: userId.toString(), // Ensure it's converted to string
        supplierClientId: supplierClientId.toString(),
    });

    // 4. Add dueDate only if it exists
    if (dueDate) {
        params.append('dueDate', dueDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }

    const response = await axiosInstance.put(`${API_BASE_URLS}/update/${orderType}/${orderId}`, null, { params });

    return response.data;
};

// ---------------------------------------------------------------------------------
// DELETE THE INCORRECT FUNCTION. IT SHOULD NOT EXIST.
// ---------------------------------------------------------------------------------
/*
export const creatPayment = async (paymentDTO: any) => {
    // THIS FUNCTION IS DANGEROUS BECAUSE IT ALWAYS CREATES A NEW RECORD.
    // DELETE IT.
};
*/
// ---------------------------------------------------------------------------------

// Getter functions remain the same.
export const getPaymentByServiceTypeAndOrderId = async (ServiceType: ServiceType, OrderId: number) => {
    activityLogger.logActivity(`GET_PAYMENT`, { username: username }, `User ${username} fetched payment for ${ServiceType} order #${OrderId}.`);
    try {
        const response = await axiosInstance.get(`${API_BASE_URLS}/${ServiceType}/${OrderId}`);
        return response.data;
    } catch (error) {
        // It's normal for this to fail with a 404 if no payment exists yet.
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null; // Return null if no payment record is found.
        }
        console.error('Error getting payment by ID:', error);
        throw error;
    }
};

export const getAllPayments = async (): Promise<Payment[]> => {
    activityLogger.logActivity(`GET_ALL_PAYMENTS`, { username: username }, `User ${username} fetched all payments.`);
    try {
        const response = await axiosInstance.get<Payment[]>(`${API_BASE_URLS}`);
        return response.data;
    } catch (error) {
        console.error('Error getting all payments:', error);
        throw error;
    }
};