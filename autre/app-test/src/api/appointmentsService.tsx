import axios from 'axios';
import axiosInstance from "../axiosBasec/axiosInstance";
import activityLogger from "../classe/ActivityLoggerService";
import { username } from "./authService";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:9055';
const API_URL = `${API_BASE_URL}/api/notifications`;

export interface AppointmentData {
    recipient: string;
    title: string;
    description: string;
    appointmentTime: string; // ISO string format, e.g., "2025-12-31T10:00:00"
}

export interface NotificationRequest {
    recipient: string;
    subject: string;
    message: string;
    sentAt: string;
    metadata: string;
    type: string;
    priority: string;
    notificationType: string;
}

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: AppointmentData) => {
    try {
        await activityLogger.logActivity(`CREATE_APPOINTMENT_${appointmentData.title}`, { username: username }, `User ${username} created an appointment with title "${appointmentData.title}".`);

        const requestPayload: NotificationRequest = {
            recipient: appointmentData.recipient,
            subject: appointmentData.title,
            message: appointmentData.description,
            sentAt: new Date(appointmentData.appointmentTime).toISOString().replace("Z", ""),
            metadata: JSON.stringify({ isAppointment: true }),
            type: 'EMAIL', // or whatever enum value you need
            priority: 'NORMAL', // or whatever priority you want
            notificationType: 'APPOINTMENT' // or whatever type you need
        };
        console.log(requestPayload);
        const response = await axiosInstance.post(`${API_URL}/create`, requestPayload);
        console.log('Create appointment response:', response);
        return response.data;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

/**
 * Get appointments by recipient with proper error handling
 */
export const getAppointmentsByRecipient = async (recipient: string) => {
    try {
        await activityLogger.logActivity(`GET_APPOINTMENTS_BY_RECIPIENT_${recipient}`, { username: username }, `User ${username} fetched appointments for recipient "${recipient}".`);
        const response = await axiosInstance.get(`${API_URL}/recipient/${recipient}`);

        // Handle case where backend returns null or undefined
        const allNotifications = response.data;

        if (!Array.isArray(allNotifications)) {
            console.warn('Backend returned non-array data:', allNotifications);
            return []; // Return empty array instead of trying to filter null/undefined
        }

        // Filter for appointments only
        return allNotifications.filter((notif: any) => {
            try {
                if (!notif.metadata) return false;
                const metadata = JSON.parse(notif.metadata);
                return metadata.isAppointment === true;
            } catch (e) {
                console.warn('Error parsing notification metadata:', e);
                return false;
            }
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        // If it's a 404 or similar, return empty array instead of throwing
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return [];
        }
        throw error;
    }
};