import axios from "axios";
import {getUserIdByUserName, ServiceType} from "../OrderInvoiceService";
import {Payment} from "../../classe/Payment";
import axiosInstance from "../../axiosBasec/axiosInstance";
import {AddUserInData} from "../../axiosBasec/storagByUser";
import { GATEWAY_URL } from '../../config/runtime';

const API_BASE_URLS = `${GATEWAY_URL}/payment`;
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
    // 1. Get the username from localStorage
    const username = localStorage.getItem('username');

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

    const response = await fetch(`${API_BASE_URLS}/update/${orderType}/${orderId}?${params}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to update payment: ${response.statusText}`);
    }

    return response.json();
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

export const getAllPayments = async () => {
    try {
        const response = await axiosInstance.get(`${API_BASE_URLS}`);
        return response.data;
    } catch (error) {
        console.error('Error getting all payments:', error);
        throw error;
    }
};



