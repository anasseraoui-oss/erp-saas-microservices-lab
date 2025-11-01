import {searchOrdersOrInvoices} from "../../../api/OrderInvoiceService";
import {searchSProducts} from "../../../api/product/productService";
import {searchSupplierClient} from "../../../api/supplierClientService";
import {searchUsersAndRoles} from "../../../api/authService";
import {searchLines} from "../../../api/lineApiService";


export interface FullSearchResults {
    salesInvoice: any[];
    purchasesInvoice: any[];
    salesOrder: any[];
    purchasesOrder: any[];
    products: any[];
    supplierClients: any[];
    UsersToRoles: any[];
    salesLines: any[];
    purchasesLines: any[];
    salesLineReturns: any[];
    purchasesLineReturns: any[];
}

export const searchInAllComponents = async (query: string): Promise<FullSearchResults> => {
    const promises = [
        searchOrdersOrInvoices(query, 'sales', 'Invoice'),
        searchOrdersOrInvoices(query, 'purchases', 'Invoice'),
        searchOrdersOrInvoices(query, 'sales', 'Order'),
        searchOrdersOrInvoices(query, 'purchases', 'Order'),
        searchSProducts(query),
        searchSupplierClient(query),
        searchUsersAndRoles(query),
        searchLines(query, "sales", "line"),
        searchLines(query, "purchases", "line"),
        searchLines(query, "sales", "lineReturn"),
        searchLines(query, "purchases", "lineReturn")
    ];

    const results = await Promise.allSettled(promises);

    const [
        salesInvoiceRes,
        purchasesInvoiceRes,
        salesOrderRes,
        purchasesOrderRes,
        productsRes,
        supplierClientsRes,
        usersToRolesRes,
        salesLineRes,
        purchasesLineRes,
        salesLineReturnRes,
        purchasesLineReturnRes
    ] = results;

    const getFulfilledValue = (result: PromiseSettledResult<any>): any[] => {
        return result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : [];
    };

    return {
        salesInvoice: getFulfilledValue(salesInvoiceRes),
        purchasesInvoice: getFulfilledValue(purchasesInvoiceRes),
        salesOrder: getFulfilledValue(salesOrderRes),
        purchasesOrder: getFulfilledValue(purchasesOrderRes),
        products: getFulfilledValue(productsRes),
        supplierClients: getFulfilledValue(supplierClientsRes),
        UsersToRoles: getFulfilledValue(usersToRolesRes),
        salesLines: getFulfilledValue(salesLineRes),
        purchasesLines: getFulfilledValue(purchasesLineRes),
        salesLineReturns: getFulfilledValue(salesLineReturnRes),
        purchasesLineReturns: getFulfilledValue(purchasesLineReturnRes)
    };
};