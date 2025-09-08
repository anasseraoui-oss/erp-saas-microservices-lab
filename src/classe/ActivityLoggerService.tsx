// src/services/ActivityLoggerService.ts

import authService from '../api/authService';
import {User} from "./types";

export interface ActivityLog {
    userId: number;
    userFullName: string;
    type: string; // e.g., 'LOGIN_SUCCESS', 'PRODUCT_ADDED'
    timestamp: number;
    details?: any;
}

const STORAGE_KEY = 'userActivities';

class ActivityLoggerService {

    public async logActivity(type: string, details?: any): Promise<void> {
        try {
            const user: User | null = await authService.getCurrentUser();

            if (!user) {
                console.warn(`Cannot log activity of type '${type}': No user is currently logged in or could not be fetched.`);
                return;
            }

            const newLog: ActivityLog = {
                userId: user.id,
                userFullName: user.fullName,
                type: type,
                timestamp: Date.now(),
                details: details,
            };

            const allActivities = this.getAllActivities();
            allActivities.push(newLog);

            // استخدام try-catch لتجنب تعطل التطبيق إذا فشلت الكتابة في localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allActivities));
                console.log('Activity Logged:', newLog);
            } catch (e) {
                console.error("Failed to write activities to localStorage", e);
            }

        } catch (error) {
            console.error("An error occurred in logActivity:", error);
        }
    }


    public getAllActivities(): ActivityLog[] {
        try {
            const storedActivities = localStorage.getItem(STORAGE_KEY);
            return storedActivities ? JSON.parse(storedActivities) : [];
        } catch (error) {
            console.error("Failed to parse activities from localStorage", error);
            return []; // إرجاع مصفوفة فارغة في حالة حدوث خطأ
        }
    }

    public getActivitiesForUser(userId: number): ActivityLog[] {
        return this.getAllActivities().filter(log => log.userId === userId);
    }


    public clearAllActivities(): void {
        localStorage.removeItem(STORAGE_KEY);
        console.log("All activities cleared.");
    }
}

const activityLogger = new ActivityLoggerService();
export default activityLogger;