import {addLine, deleteLine, getLineById, searchLines, updateLine} from "../../api/lineApiService";
import type { ServiceType, LineType } from "../../api/lineApiService";
import {Item} from "../../classe/Item";

export const useLinesActions = () => {
    const moveToReturns = async (line:Item , serviceType: ServiceType) => {
        if (!line) return;
        await addLine(line, serviceType, 'lineReturn');
    };

    const restoreLine = (lineId: number, serviceType: ServiceType) => {
        console.log(`Restoring line ${lineId} in ${serviceType}`);
    };

    const deleteLineOrReturn = async (id: number, lineType: LineType, serviceType: ServiceType) => {
        if (!id || !lineType || !serviceType) return;
        await deleteLine(id, serviceType, lineType);
    };

    const updateLineOrReturn = async (id: number, data: any, lineType: LineType, serviceType: ServiceType) => {
        if (!id || !data || !lineType || !serviceType) return;
        await updateLine(id, data, serviceType, lineType);
    };
    const getLineOrReturnById = async (id: number | string, serviceType: ServiceType, lineType: LineType) => {
        return await getLineById(id, serviceType, lineType);
    };
    const searchLineOrReturn = async (query: string, serviceType: ServiceType, lineType: LineType) => {
        return await searchLines(query, serviceType, lineType);
    };

    return { moveToReturns, deleteLineOrReturn, restoreLine, updateLineOrReturn, getLineOrReturnById, searchLineOrReturn };
};

export default useLinesActions;