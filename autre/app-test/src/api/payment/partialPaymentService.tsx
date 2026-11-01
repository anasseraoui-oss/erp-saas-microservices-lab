import axiosInstance from "../../axiosBasec/axiosInstance";
const API_BASE_URLS = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:9055'}/payment`
// Combined function to handle the new deletion process
const deletePaymentAndUpdateBorrowing = async (dataPaidDateId:number, orderType: string, supplierClientId: number): Promise<void> => {
    if (!supplierClientId) {
        throw new Error("Missing supplier/client ID for borrowing update.");
    }
   const r = await axiosInstance.delete(`${API_BASE_URLS}/delete/partial-payment/${dataPaidDateId}`, {
        params: {
            supplierClientId,
            orderType,
        },
    });
    return r.data;
};

const partialPaymentService = {
    deletePaymentAndUpdateBorrowing,
};

export default partialPaymentService;
