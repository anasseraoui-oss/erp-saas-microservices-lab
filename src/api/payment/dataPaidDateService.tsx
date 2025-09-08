// src/services/dataPaidDateService.js
import axios from 'axios';
import {DataPaidDate} from "../../classe/DataPaidDate";
import axiosInstance from "../../axiosBasec/axiosInstance";
import {AddUserInData} from "../../axiosBasec/storagByUser";

const API_BASE_URL = 'http://localhost:9055/api/dataPaidDates'; // بدّل العنوان حسب الخادم ديالك
const dataPaidDateService = {

    getAll: () => axiosInstance.get(API_BASE_URL),

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
            return axiosInstance.post(`${API_BASE_URL}/${id}`, payload);
        }
        if (typeAction == "create"){
            return axiosInstance.post(`${API_BASE_URL}`, payload);
        }
    },

    delete: (id:number) => axiosInstance.delete(`${API_BASE_URL}/${id}`),

    getByStatus: (status: string) => axiosInstance.get(`${API_BASE_URL}/by-status/${status}`),

    getByScheduleStatus: (scheduleStatus: string) =>
        axiosInstance.get(`${API_BASE_URL}/by-schedule-status/${scheduleStatus}`),

    getByUserExecutor: (userId: string) =>
        axiosInstance.get(`${API_BASE_URL}/by-user-executor/${userId}`),

    getByDate: (date: Date) =>
        axiosInstance.get(`${API_BASE_URL}/by-date`, {
            params: { date }, // Expecting format: YYYY-MM-DD
        }),
};

export default dataPaidDateService;
