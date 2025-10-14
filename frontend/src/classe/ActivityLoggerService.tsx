// src/services/ActivityLoggerService.ts
import authService from '../api/authService';
import { User } from "./types";
import activityService from "../api/activityService"; // Import the new service
import { ActivityLog } from "./ActivityLog";

class ActivityLoggerService {

    public async logActivity(type: string, details?: any, description?: string): Promise<void> {
        try {
            const user: User | null = await authService.getCurrentUser();

            if (!user) {
                console.warn(`Cannot log activity of type '${type}': No user is currently logged in or could not be fetched.`);
                return;
            }

            const newLog: ActivityLog = {
                userId: user.id,
                userFullName: user.fullName,
                activityType: type,
                description: description,
                timestamp: Date.now(),
                details: details ? JSON.stringify(details) : undefined,
            };

            try {
                await activityService.logActivity(newLog);
                console.log('Activity Logged to backend:', newLog);
            } catch (e) {
                console.error("Failed to log activity to backend", e);
            }

        } catch (error) {
            console.error("An error occurred in logActivity:", error);
        }
    }

    public async getAllActivities(): Promise<ActivityLog[]> {
        try {
            return await activityService.getActivities();
        } catch (error) {
            console.error("Failed to get activities from backend", error);
            return [];
        }
    }

    public async getActivitiesForUser(userId: number): Promise<ActivityLog[]> {
        const allActivities = await this.getAllActivities();
        return allActivities.filter(log => log.userId === userId);
    }
}

const activityLogger = new ActivityLoggerService();
export default activityLogger;