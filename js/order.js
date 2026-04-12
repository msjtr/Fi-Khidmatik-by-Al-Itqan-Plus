/**
 * مدير الطلبات - موديول جلب البيانات من Firestore
 */
export const OrderManager = {
    // دالة داخلية للجلب تضمن عدم الاعتماد على ملفات خارجية
    async fetchDoc(col, id) {
        if (!window.db) return { success: false };
        try {
            const snap = await window.db.collection(col).doc(id).get();
            return snap.exists ? { id: snap.id, ...snap.data(), success: true } : { success: false };
        } catch (e) {
            console.error("Fetch Error:", e);
            return { success: false };
        }
    },

    // جلب تفاصيل الطلب والعميل
    async getOrderFullDetails(orderId) {
        try {
            const orderRes = await this.fetchDoc('orders', orderId);
            if (!orderRes.success) return null;

            // جلب بيانات العميل
            const customerRes = await this.fetchDoc('customers', orderRes.customerId);
            
            return {
                order: orderRes,
                customer: customerRes.success ? customerRes : { 
                    name: "عميل زائر", 
                    phone: orderRes.customerPhone || "---" 
                }
            };
        } catch (error) {
            console.error("خطأ حرج في الموديول:", error);
            return null;
        }
    },

    formatDateTime(timestamp) {
        if (!timestamp) return { date: '---', time: '---' };
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return {
            date: d.toLocaleDateString('en-GB'),
            time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
    }
};
