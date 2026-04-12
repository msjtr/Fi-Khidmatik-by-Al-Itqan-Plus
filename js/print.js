import { TERMS_DATA } from './terms.js';
import { OrderManager } from './order.js'; // استدعاء الملف المستقل الجديد
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId) return;

    try {
        // استخدام OrderManager لجلب البيانات بدلاً من الجلب المباشر
        const data = await OrderManager.getOrderFullDetails(orderId);
        if (!data) return;

        const { order, customer } = data;
        const { date, time } = OrderManager.formatDateTime(order.createdAt);
        const logistics = OrderManager.getLogisticDetails(order);
        const seller = window.invoiceSettings;

        // ... بقية كود الطباعة يستخدم الآن (date, time, logistics.paymentMethod) إلخ.
        
        // مثال لتحديث قسم بيانات الدفع في html الخاص بـ print.js:
        /*
        <div class="single-row-payment">
            <div class="p-item"><b>طريقة الدفع:</b> ${logistics.paymentMethod}</div>
            <div class="p-item"><b>رمز الموافقة:</b> ${logistics.approvalCode}</div>
            <div class="p-item"><b>طريقة الاستلام:</b> ${logistics.deliveryMethod}</div>
        </div>
        */

        // ... استكمال الكود كما هو في الملف السابق
    } catch (e) {
        console.error(e);
    }
};
