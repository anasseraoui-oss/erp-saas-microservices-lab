export interface ActivityLog {
    userId: number;
    userFullName: string;
    activityType: string; // e.g., 'LOGIN_SUCCESS', 'PRODUCT_ADDED'
    description?: string;
    timestamp: number;
    details?: string;
}
