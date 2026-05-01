import { addLine, deleteLine, getLineById, searchLines, updateLine } from "../../api/lineApiService";
import type { ServiceType, LineType } from "../../api/lineApiService";
import type { OrderType } from "../../api/OrderInvoiceService";
import { Item } from "../../classe/Item";

export const useLinesActions = () => {
    const moveToReturns = async (line: Item, returnQuantity: number, returnReason: string, serviceType: ServiceType, parentType: OrderType) => {
        if (!line) return;
        const returnData: any = {
            ...line,
            quantity: returnQuantity,
            returnReason: returnReason,
            returnDate: new Date().toISOString(),
            lineId: line.id // Save original line ID reference if needed by backend
        };

        // Simplified: Backend now uses LineReturnDto which expects top-level IDs
        // No need to map to nested objects anymore.

        // Remove the original ID as this is a NEW entity in many backends (lineReturn table)
        delete returnData.id;

        await addLine(returnData, serviceType, "lineReturn", parentType);
    };

    const restoreLine = (lineId: number, serviceType: ServiceType) => {
        console.log(`Restoring line ${lineId} in ${serviceType}`);
    };

    const deleteLineOrReturn = async (id: number, lineType: LineType, serviceType: ServiceType, parentType: OrderType) => {
        if (!id || !lineType || !serviceType || !parentType) return;
        await deleteLine(id, serviceType, lineType, parentType);
    };

    const updateLineOrReturn = async (id: number, data: any, lineType: LineType, serviceType: ServiceType, parentType: OrderType) => {
        if (!id || !data || !lineType || !serviceType || !parentType) return;
        await updateLine(id, data, serviceType, lineType, parentType);
    };

    const getLineOrReturnById = async (id: number | string, serviceType: ServiceType, lineType: LineType, parentType: OrderType) => {
        return await getLineById(id, serviceType, lineType, parentType);
    };

    const searchLineOrReturn = async (query: string, serviceType: ServiceType, lineType: LineType, parentType: OrderType) => {
        return await searchLines(query, serviceType, lineType, parentType);
    };

    return { moveToReturns, deleteLineOrReturn, restoreLine, updateLineOrReturn, getLineOrReturnById, searchLineOrReturn };
};

export default useLinesActions;