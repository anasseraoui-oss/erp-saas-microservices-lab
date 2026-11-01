import axios from 'axios';
import axiosInstance from "../../axiosBasec/axiosInstance";
import {AddUserInData} from "../../axiosBasec/storagByUser";
import activityLogger from "../../classe/ActivityLoggerService";
import {username} from "../authService";
import { GATEWAY_URL } from '../../config/runtime';

const API_BASE_URL = `${GATEWAY_URL}/api/products`;

export const getAllProducts = async () => {
    try {
        activityLogger.logActivity(`GET_PRODUCTS`, { username: username });
        const response = await axiosInstance.get('api/products'); // Update the endpoint if necessary
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error; // Propagate error for handling in the component
    }
}

// @ts-ignore
export const createProduct = async (productData) => {
    try {
        const userId=await AddUserInData();
        const dataWithUser = { ...productData, userCreator: userId };
        activityLogger.logActivity(`CREATE_PRODUCT_${productData.name}`, { username: username });
        const response = await axiosInstance.post(API_BASE_URL, dataWithUser); // Update the endpoint if necessary
        return response.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error; // Propagate error for handling in the component
    }
};

// @ts-ignore
export const deleteProduct = async (id) => {
    activityLogger.logActivity(`DELETE_PRODUCT_${id}`, { username: username });
    return await axiosInstance.delete(`${API_BASE_URL}/delete/${id}`);
};
// @ts-ignore
export const updateProduct = async (id, updatedProduct) => {
    const userId=await AddUserInData();
    const dataWithUser = { ...updatedProduct, userExecutor: userId };
    activityLogger.logActivity(`UPDATE_PRODUCT_${id}`, { username: username });
    console.log(dataWithUser);
    return await axiosInstance.put(`${API_BASE_URL}/products/${id}`, dataWithUser);
};
// @ts-ignore
export const searchSProducts = async (query) => {
    try {
        activityLogger.logActivity(`SEARCH_PRODUCT_${query}`, { username: username });
        const response = await axiosInstance.get(`${API_BASE_URL}/search`, {
            params: { query }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Product:', error);
        return [];
    }
};
// @ts-ignore
export const getProductByName = async (name) => {
    return await axios.get(`${API_BASE_URL}/search/name`, { params: { name } });
};
// @ts-ignore
export const getProductById = async (id) => {
    return await axiosInstance.get(`${API_BASE_URL}/${id}`);
};
export const getProductNameById = async (id: number | string) : Promise<string> => {
    const response = await getProductById(id);
    return response.data.name;
}
// @ts-ignore
export const getProductByBarcode = async (barcode) => {
    const response =await axios.get(`${API_BASE_URL}/search/barcode`, { params: { barcode } });
    return response.data;
};
// @ts-ignore
export const getProductByPrice = async (price) => {
    return await (axiosInstance.get(`${API_BASE_URL}/search/price`, { params: { price } }),
        axiosInstance.get(`${API_BASE_URL}/search/priceInit`, { params: { price } }));
};
// @ts-ignore
export const getProductByQuantity = async (quantity) => {
    return await axios.get(`${API_BASE_URL}/search/quantity`, { params: { quantity } });
};
