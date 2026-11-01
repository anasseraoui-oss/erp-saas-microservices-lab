import {getUserIdByUserName} from "../api/OrderInvoiceService";
import authService from "../api/authService";

export const AddUserInData=async ()  =>{
    // 1. Get the username from localStorage
    const username = localStorage.getItem('username');

    // 2. AWAIT the result of the async function to get the actual ID
    let userId: number | null;
    userId = await getUserIdByUserName(username);

    return userId
}
export const getUserName=async (userId: string |number) =>{
    const username =await authService.getUserById(userId);
    return username ? username.fullName : 'Unknown';
}