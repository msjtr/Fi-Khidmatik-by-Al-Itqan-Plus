/**
 * مدير الطلبات - موديول جلب البيانات المحدث
 */
export const OrderManager = {
    // جلب تفاصيل الطلب والعميل معاً
    async getOrderFullDetails(orderId) {
        try {
            // استخدام الدالة التي عرفتها أنت في window
            const orderRes = await window.getDocument('orders', orderId);
            if (!orderRes.success) return null;

            const customerRes = await window.getDocument('customers', orderRes.customerId);
            
            return {
                order: orderRes,
                customer: customerRes.success ? customerRes : { 
                    name: "عميل زائر", 
                    phone: orderRes.customerPhone || "---" 
                }
            };
        } catch (error) {
            console.error("خطأ حرج:", error);
            return null;
        }
    },

    formatDateTime(timestamp) {
        if (!timestamp) return { date: '---', time: '---' };
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return {
            date: d.toLocaleDateString('en-GB'),
            time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        };
    }
};
