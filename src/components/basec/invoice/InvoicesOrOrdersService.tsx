import {
    deleteOrderOrInvoice,
    getAllOrdersOrInvoices,
    updateOrderOrInvoice,
    updateOrderStatus
} from "../../../api/OrderInvoiceService";
import {Invoice} from "../../../classe/Invoice";
import React, {useCallback, useState} from "react";
import {Order} from "../../../classe/Order";

type ServiceType = "purchases" | "sales";
type OrderType = "Invoice" | "Order";

export function useInvoicesOrOrders(serviceType: ServiceType, orderType: OrderType) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Order[] | Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | Order | null>(null);
    const [showModal, setShowModal] = useState(false); // For Edit/Update Modal
    const [showModaldtls, setShowModaldtls] = useState(false); // For View Details Modal
    const [formData, setFormData] = useState({
        party: '',
        totalAmount: 0,
        paymentStatus: '',
        date: '',
        items: [] as { productId: number; quantity: number; price: number }[],
        paidAmount: 0,
        soldAmount: 0,
        customer: '', // Add this line
        supplier: ''  // Add this line
    });
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedProductType, setSelectedProductType] = useState(0);
    const [selectedPartyType, setSelectedPartyType] = useState('');

    const fetchInvoices = useCallback(async () => {
        if (!serviceType || !orderType) return;
        try {
            let result: (Order | Invoice)[] = await getAllOrdersOrInvoices(serviceType, orderType);
            console.log('result', result);
            const formatted = result.map(item => ({
                ...item,
                items: item.items || []
            }));
            if (orderType === "Order") {
                setOrders(formatted as Order[]);
            } else {
                setInvoices(formatted as Invoice[]);
            }
            setFilteredInvoices(formatted);
            console.log(filteredInvoices);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    }, [serviceType, orderType]);

    const handleDelete = async (id: number) => {
        if (window.confirm(`Are you sure you want to delete this ${orderType}?`)) {
            try {
                await deleteOrderOrInvoice(id, serviceType, orderType);
                alert(`${orderType} deleted successfully`);
                fetchInvoices();
            } catch (error) {
                console.error(`Failed to delete ${orderType} #${id}`, error);
                alert(`Failed to delete ${orderType}.`);
            }
        }
    };

   /* const handleEdit = (invoice: Invoice | Order) => {
        setSelectedInvoice(invoice);
        // Format date to YYYY-MM-DD for the input field
        const formattedDate = invoice.date ? invoice.date.split('T')[0] : '';
        setFormData({
            party: serviceType === "sales" ? invoice.customer || '' : invoice.supplier || '',
            totalAmount: invoice.totalAmount.toString(),
            orderAmountPaid: "orderAmountPaid" in invoice ? invoice.orderAmountPaid : 0,
            soldAmount: "soldAmount" in invoice ? invoice.soldAmount : 0,
            paymentStatus: invoice.paymentStatus || '',
            date: formattedDate,
            items: invoice.items || []
        });
        setShowModal(true); // Show the edit modal
    };*/

    const handleEdit = (invoice: Invoice | Order) => {
        setSelectedInvoice(invoice);
        const formattedDate = invoice.date ? invoice.date.split('T')[0] : '';
        setFormData({
            party: serviceType === "sales" ? invoice.customer || '' : invoice.supplier || '',
            customer: invoice.customer || '',
            supplier: invoice.supplier || '',
            // FIX 2: Do not convert totalAmount to a string. Keep it as a number.
            totalAmount: invoice.totalAmount,
            paidAmount: "paidAmount" in invoice ? invoice.paidAmount : 0,
            soldAmount: "soldAmount" in invoice ? invoice.soldAmount : 0,
            paymentStatus: invoice.paymentStatus || '',
            date: formattedDate,
            items: invoice.items || []
        });
        setShowModal(true);
    };
    const handleSave = async () => {
        if (!selectedInvoice) return;

        try {
            // 1. Start with the merged data as before
            let payload = {
                ...selectedInvoice,
                ...formData,
            };

            // 2. Map the generic 'party' field to the specific field
            if (serviceType === 'sales') {
                payload.customer = formData.party;
            } else {
                payload.supplier = formData.party;
            }
            // @ts-ignore
            delete payload.party;


            // 3. SOLUTION: Adapt the payload ONLY if the type is "Order"
            if (orderType === 'Order') {
                console.log("Adapting payload for Order update...");

                // Map `items` to `salesLines`
                // @ts-ignore
                payload.salesLines = payload.items;
                // @ts-ignore
                delete payload.items; // Clean up the old property

                // Map `orderAmountPaid` to `paidAmount`
            }

            console.log(`Sending this payload for ${orderType} with ID ${selectedInvoice.id}:`, payload);

            // 4. Send the correctly structured payload to the API
            await updateOrderOrInvoice(selectedInvoice.id, payload, serviceType, orderType);

            alert(`${orderType} updated successfully`);
            setShowModal(false);
            await fetchInvoices();

        } catch (error) {
            console.error(`Failed to update ${orderType}:`, error);
            alert(`Error updating ${orderType}. Please check the console.`);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // CORRECTION: Use the new unified field name 'paidAmount'
        const numericFields = ['totalAmount', 'paidAmount', 'soldAmount'];

        if (numericFields.includes(name)) {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };


    const calculateTotalAmount = (items: (Invoice | Order)[]) => {
        return items.reduce((total, item) => total + (item.totalAmount || 0), 0);
    };

    // For View Details Modal
    const handleOpenModal = (invoice: Invoice | Order) => {
        setSelectedInvoice(invoice);
        setShowModaldtls(true);
    };

    // For View Details Modal
    const handleCloseModal = () => {
        setShowModaldtls(false);
        setSelectedInvoice(null);
    };

    const handleShowAll = () => {
        const fullList = orderType === "Order" ? orders : invoices;
        setFilteredInvoices(fullList);
        setSelectedPartyType('');
        setSelectedProductType(0);
        setSelectedDate('');
    };
    // --- THIS IS THE NEW HANDLER FUNCTION ---
    const handleUpdateOrderStatus = async (orderId: number, status: string) => {
        try {
            // Call the API to update the status
            await updateOrderStatus(orderId, status, serviceType);
            alert(`Order #${orderId} status updated to ${status}`);

            // Refresh the data to show the changes
            await fetchInvoices();

            // Optional: Close the details modal after update
            setShowModaldtls(false);

        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("Error updating status. Please try again.");
        }
    };


    return {
        orders,
        invoices,
        filteredInvoices,
        setFilteredInvoices,
        selectedInvoice,
        formData,
        showModal, // For Edit Modal
        setShowModal, // To control Edit Modal from component
        showModaldtls, // For View Modal
        selectedDate,
        setSelectedDate,
        selectedProductType,
        setSelectedProductType,
        selectedPartyType,
        setSelectedPartyType,
        fetchInvoices,
        handleDelete,
        handleEdit,
        handleSave,
        handleInputChange,
        calculateTotalAmount,
        handleOpenModal,
        handleCloseModal,
        handleShowAll,
        handleUpdateOrderStatus,
    };
}