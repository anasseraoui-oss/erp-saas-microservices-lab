import axiosInstance from '../axiosBasec/axiosInstance';
import { ActivityLog } from '../classe/ActivityLog';

const logActivity = async (activity: ActivityLog): Promise<ActivityLog> => {
    try {
        const activityToSend = {
            ...activity,
            details: activity.details ? JSON.stringify(activity.details) : undefined
        };
        const response = await axiosInstance.post(`/api/activities`, activityToSend);
        return response.data;
    } catch (error) {
        console.error('Failed to log activity to backend', error);
        throw error;
    }
};

const getActivities = async (): Promise<ActivityLog[]> => {
    try {
        const response = await axiosInstance.get(`/api/activities`);
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
