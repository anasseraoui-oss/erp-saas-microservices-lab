import { Invoice } from '../../../classe/Invoice';
import { Product } from '../../../classe/Product';
import { Order } from '../../../classe/Order';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Customer {
    id: number | string;
    name: string;
    email?: string;
    phone?: string;
}

interface InvoiceLineItem {
    productId: number;
    quantity: number;
    price: number;
}

// Define a more comprehensive type that includes all possible properties
type PrintableDocument = Invoice & Partial<Order> & {
    dueDate?: string;
    paidDates?: {
        date: string;
        amountPaid: number;
        methodePayment: string;
    }[];
};

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const printPdf = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.contentWindow?.print();
};

export const generateAndDownloadInvoicePdf = async (invoice: PrintableDocument, parties: Customer[] | undefined, products?: Product[]) => {
    try {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const companyName = settings.companyName || 'Your Company';
        const companyLogo = settings.companyLogo;
        const partyId = invoice.customer || invoice.supplier;
        const party = parties?.find(p => String(p.id) === String(partyId));

        const summaryHtml = `
            <div style="font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; font-size: 14px; padding: 40px; color: #333; width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);">
                <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
                    <tr class="top">
                        <td colspan="4" style="padding-bottom: 20px;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="font-size: 45px; line-height: 45px; color: #333;">
                                        ${companyLogo ? `<img src="${companyLogo}" style="width:100%; max-width:150px;">` : `<h2>${companyName}</h2>`}
                                    </td>
                                    <td style="text-align: right;">
                                        Invoice #${invoice.id}<br>
                                        Created: ${new Date(invoice.date).toLocaleDateString()}<br>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr class="information">
                        <td colspan="4" style="padding-bottom: 40px;">
                            <table style="width: 100%;">
                                <tr>
                                    <td>
                                        <strong>${invoice.customer ? 'Customer' : 'Supplier'}:</strong><br>
                                        ${party?.name || 'N/A'}<br>
                                        ${party?.email || ''}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr class="heading" style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold;">
                        <td style="padding: 5px; vertical-align: top;">Item</td>
                        <td style="padding: 5px; vertical-align: top; text-align: right;">Quantity</td>
                        <td style="padding: 5px; vertical-align: top; text-align: right;">Price</td>
                        <td style="padding: 5px; vertical-align: top; text-align: right;">Subtotal</td>
                    </tr>
                    ${(invoice.items || []).map((li: any) => {
                        let productName = li.productName || 'N/A';
                        if (!productName || productName === 'N/A') {
                            const product = products?.find(p => p.id === li.productId);
                            if (product) productName = product.name;
                        }
                        return `
                            <tr class="item" style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px 5px; vertical-align: top;">${productName}</td>
                                <td style="padding: 10px 5px; vertical-align: top; text-align: right;">${li.quantity}</td>
                                <td style="padding: 10px 5px; vertical-align: top; text-align: right;">$${(li.price || 0).toFixed(2)}</td>
                                <td style="padding: 10px 5px; vertical-align: top; text-align: right;">$${((li.price || 0) * (li.quantity || 0)).toFixed(2)}</td>
                            </tr>
                        `}).join('')}
                    <tr class="total">
                        <td colspan="3"></td>
                        <td style="padding: 10px 5px; border-top: 2px solid #eee; font-weight: bold; text-align: right;">
                           Total: $${(invoice.totalAmount || 0).toFixed(2)}
                        </td>
                    </tr>
                    
                    ${'orderStatus' in invoice || 'delivery' in invoice ? `
                    <tr class="heading" style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; margin-top: 30px;">
                        <td colspan="4" style="padding: 5px; vertical-align: top;">Order & Delivery Information</td>
                    </tr>
                    <tr class="details">
                        <td colspan="4" style="padding: 20px 5px;">
                            ${'orderStatus' in invoice && invoice.orderStatus ? `<strong>Order Status:</strong> ${(invoice as Order).orderStatus}<br>` : ''}
                            ${'soldAmount' in invoice && invoice.soldAmount ? `<strong>Sold Amount:</strong> $${(invoice as Order).soldAmount.toFixed(2)}<br>` : ''}
                            ${'delivery' in invoice && invoice.delivery ? `<strong>Delivery Address:</strong> ${(invoice as any).delivery.deliveryAddress}, ${(invoice as any).delivery.deliveryCity}, ${(invoice as any).delivery.deliveryCountry}` : ''}
                        </td>
                    </tr>
                    ` : ''}

                    ${invoice.paymentStatus || (invoice.paidDates && invoice.paidDates.length > 0) ? `
                    <tr class="heading" style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; margin-top: 30px;">
                        <td colspan="4" style="padding: 5px; vertical-align: top;">Payment Information</td>
                    </tr>
                    <tr class="details">
                        <td colspan="4" style="padding: 20px 5px;">
                            <strong>Payment Status:</strong> ${invoice.paymentStatus || 'N/A'}<br>
                            ${invoice.dueDate ? `<strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br>` : ''}
                            ${invoice.paidDates && invoice.paidDates.length > 0 ? `
                                <strong>Payment History:</strong><br>
                                ${invoice.paidDates.map((pd: any) => ` - ${new Date(pd.date).toLocaleDateString()}: $${pd.amountPaid.toFixed(2)} via ${pd.methodePayment}`).join('<br>')}
                            ` : ''}
                        </td>
                    </tr>
                    ` : ''}
                </table>
            </div>
        `;

        let html2canvasFn: any = null;
        let JsPdfCtor: any = null;
        try {
            const html2canvasModule = await import('html2canvas');
            html2canvasFn = html2canvasModule && (html2canvasModule.default || html2canvasModule);
        } catch (e) { console.warn('html2canvas not available, skipping PDF generation', e); }
        try {
            const jspdfModule = await import('jspdf');
            JsPdfCtor = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;
        } catch (e) { console.warn('jspdf not available, skipping PDF generation', e); }

        if (!html2canvasFn || !JsPdfCtor) {
            console.warn('Skipping invoice PDF generation because required libraries are not installed.');
            return null;
        }

        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-9999px';
        wrapper.innerHTML = summaryHtml;
        document.body.appendChild(wrapper);
        const canvas = await html2canvasFn(wrapper as HTMLElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        document.body.removeChild(wrapper);

        const pdf = new JsPdfCtor({ unit: 'pt', format: 'a4' });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const blob = pdf.output('blob');

        const filename = `invoice-${invoice.id}.pdf`;
        downloadBlob(blob, filename);

        return { success: true, filename };
    } catch (err) {
        console.error('Failed to generate/upload PDF:', err);
        throw err;
    }
};

export const generateAndPrintInvoicePdf = async (invoice: PrintableDocument, parties: Customer[] | undefined, products?: Product[]) => {
    try {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const companyName = settings.companyName || 'Your Company';
        const companyLogo = settings.companyLogo;
        const partyId = invoice.customer || invoice.supplier;
        const party = parties?.find(p => String(p.id) === String(partyId));

        const summaryHtml = `
            <div style="font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; font-size: 14px; padding: 40px; color: #333; width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);">
                <table cellpadding="0" cellspacing="0" style="width: 100%; line-height: inherit; text-align: left;">
                    <tr class="top">
                        <td colspan="4" style="padding-bottom: 20px;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="font-size: 45px; line-height: 45px; color: #333;">
                                        ${companyLogo ? `<img src="${companyLogo}" style="width:100%; max-width:150px;">` : `<h2>${companyName}</h2>`}
                                    </td>
                                    <td style="text-align: right;">
                                        Invoice #${invoice.id}<br>
                                        Created: ${new Date(invoice.date).toLocaleDateString()}<br>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr class="information">
                        <td colspan="4" style="padding-bottom: 40px;">
                            <table style="width: 100%;">
                                <tr>
                                    <td>
                                        <strong>${invoice.customer ? 'Customer' : 'Supplier'}:</strong><br>
                                        ${party?.name || 'N/A'}<br>
                                        ${party?.email || ''}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr class="heading" style="background: #eee; border-bottom: 1px solid #ddd; font-weight: bold;">
                        <td style="padding: 5px; vertical-align: top;">Item</td>
                        <td style="padding: 5px; vertical-align: top; text-align: right;">Quantity</td>
                        <td style="padding: 5px; vertical-align: top; text-align: right;">Price</td>
                        <td style="padding: 5px; vertical-align: top; text-align: right;">Subtotal</td>
                    </tr>
                    ${(invoice.items || []).map((li: any) => {
                        let productName = li.productName || 'N/A';
                        if (!productName || productName === 'N/A') {
                            const product = products?.find(p => p.id === li.productId);
                            if (product) productName = product.name;
                        }
                        return `
                            <tr class="item" style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px 5px; vertical-align: top;">${productName}</td>
                                <td style="padding: 10px 5px; vertical-align: top; text-align: right;">${li.quantity}</td>
                                <td style="padding: 10px 5px; vertical-align: top; text-align: right;">$${(li.price || 0).toFixed(2)}</td>
                                <td style="padding: 10px 5px; vertical-align: top; text-align: right;">$${((li.price || 0) * (li.quantity || 0)).toFixed(2)}</td>
                            </tr>
                        `}).join('')}
                    <tr class="total">
                        <td colspan="3"></td>
                        <td style="padding: 10px 5px; border-top: 2px solid #eee; font-weight: bold; text-align: right;">
                           Total: $${(invoice.totalAmount || 0).toFixed(2)}
                        </td>
                    </tr>
                </table>
            </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-9999px';
        wrapper.innerHTML = summaryHtml;
        document.body.appendChild(wrapper);
        const canvas = await html2canvas(wrapper as HTMLElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        document.body.removeChild(wrapper);

        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const blob = pdf.output('blob');

        printPdf(blob);

        return { success: true };
    } catch (err) {
        console.error('Failed to generate/print PDF:', err);
        throw err;
    }
};