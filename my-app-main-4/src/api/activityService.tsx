import { axiosInstance } from './authService';
import { ActivityLog } from '../classe/ActivityLog';
const API_BASE_URL = 'http://localhost:9055'; //Gateway Port

const logActivity = async (activity: ActivityLog): Promise<ActivityLog> => {
    try {
        const activityToSend = {
            ...activity,
            details: activity.details ? JSON.stringify(activity.details) : undefined
        };
        const response = await axiosInstance.post(`${API_BASE_URL}/api/activities`, activityToSend);
        return response.data;
    } catch (error) {
        console.error('Failed to log activity to backend', error);
        throw error;
    }
};

const getActivities = async (): Promise<ActivityLog[]> => {
    try {
        const response = await axiosInstance.get(`${API_BASE_URL}/api/activities`);
        return response.data;
    } catch (error) {
        console.error('Failed to get activities from backend', error);
        throw error;
    }
};

const activityService = {
    logActivity,
    getActivities,
};

export default activityService;
