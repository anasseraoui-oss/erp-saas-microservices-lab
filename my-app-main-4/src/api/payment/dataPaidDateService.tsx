// src/services/dataPaidDateService.js
import axios from 'axios';
import {DataPaidDate} from "../../classe/DataPaidDate";
import axiosInstance from "../../axiosBasec/axiosInstance";
import {AddUserInData} from "../../axiosBasec/storagByUser";
import activityLogger from "../../classe/ActivityLoggerService";
import { username } from "../authService";

const API_BASE_URL = 'http://localhost:9055/api/dataPaidDates'; // بدّل العنوان حسب الخادم ديالك
const dataPaidDateService = {

    getAll: () => {
        activityLogger.logActivity(`GET_ALL_DATA_PAID_DATES`, { username: username }, `User ${username} fetched all data paid dates.`);
        return axiosInstance.get(API_BASE_URL)
    },

    // Modify the save method to ensure correct format
    save: async (id: number ,data: DataPaidDate ,typeAction: "create" | "update") => {
        // Create a DTO-compliant payload
        const payload = {
            date: data.date,
            amountPaid: data.amountPaid,
            status: data.status,
            methodePayment: data.methodePayment,
            paymentScheduleStatus: data.paymentScheduleStatus,
            userExecutor: await AddUserInData()||data.userExecutor,
            userCreator: await AddUserInData()||data.userCreator,
            paymentId: data.paymentId, // Get paymentId from either source
        };

        // Ensure we don't send null/undefined paymentId
        if (!payload.paymentId) {
            return Promise.reject(new Error("Payment ID is missing in the data to be saved."));
        }
        if (typeAction == "update") {
            activityLogger.logActivity(`UPDATE_DATA_PAID_DATE`, { username: username }, `User ${username} updated data paid date with ID "${id}".`);
            return axiosInstance.put(`${API_BASE_URL}/${id}`, payload);
        }
        if (typeAction == "create"){
            activityLogger.logActivity(`CREATE_DATA_PAID_DATE`, { username: username }, `User ${username} created a new data paid date for payment ID "${payload.paymentId}".`);
            return axiosInstance.post(`${API_BASE_URL}`, payload);
        }
    },

    delete: (id:number) => {
        activityLogger.logActivity(`DELETE_DATA_PAID_DATE`, { username: username }, `User ${username} deleted data paid date with ID "${id}".`);
        return axiosInstance.delete(`${API_BASE_URL}/${id}`)
    },

    getByStatus: (status: string) => {
        activityLogger.logActivity(`GET_DATA_PAID_DATES_BY_STATUS`, { username: username }, `User ${username} fetched data paid dates with status "${status}".`);
        return axiosInstance.get(`${API_BASE_URL}/by-status/${status}`)
    },

    getByScheduleStatus: (scheduleStatus: string) => {
        activityLogger.logActivity(`GET_DATA_PAID_DATES_BY_SCHEDULE_STATUS`, { username: username }, `User ${username} fetched data paid dates with schedule status "${scheduleStatus}".`);
        return axiosInstance.get(`${API_BASE_URL}/by-schedule-status/${scheduleStatus}`)
    },

    getByUserExecutor: (userId: string) => {
        activityLogger.logActivity(`GET_DATA_PAID_DATES_BY_USER`, { username: username }, `User ${username} fetched data paid dates for user ID "${userId}".`);
        return axiosInstance.get(`${API_BASE_URL}/by-user-executor/${userId}`)
    },

    getByDate: (date: Date) => {
        activityLogger.logActivity(`GET_DATA_PAID_DATES_BY_DATE`, { username: username }, `User ${username} fetched data paid dates for date "${date}".`);
        return axiosInstance.get(`${API_BASE_URL}/by-date`, {
            params: { date }, // Expecting format: YYYY-MM-DD
        })
    },
};

export default dataPaidDateService;
