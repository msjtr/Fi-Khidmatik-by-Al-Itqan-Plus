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

    // جلب تفاصيل الطلب والعميل مع معالجة حقول العنوان
    async getOrderFullDetails(orderId) {
        try {
            const orderRes = await this.fetchDoc('orders', orderId);
            if (!orderRes.success) return null;

            // جلب بيانات العميل
            const customerRes = await this.fetchDoc('customers', orderRes.customerId);
            
            // دمج ذكي: نأخذ بيانات العميل ونعوض النقص من بيانات الطلب (مهم جداً للعملاء الزوار)
            const finalCustomer = {
                name: customerRes.name || orderRes.customerName || "عميل زائر",
                phone: customerRes.phone || orderRes.customerPhone || "---",
                email: customerRes.email || orderRes.customerEmail || "---",
                city: customerRes.city || orderRes.city || "---",
                district: customerRes.district || orderRes.district || "---",
                // جلب الحقول التفصيلية بأي مسمى موجود في أي من الملفين
                buildingNumber: customerRes.buildingNumber || orderRes.buildingNumber || customerRes.building_number || orderRes.building_number || "---",
                additionalNumber: customerRes.additionalNumber || orderRes.additionalNumber || customerRes.additional_number || orderRes.additional_number || "---",
                postalCode: customerRes.postalCode || orderRes.postalCode || customerRes.postal_code || orderRes.postal_code || "---"
            };

            return {
                order: orderRes,
                customer: finalCustomer
            };
        } catch (error) {
            console.error("خطأ حرج في الموديول:", error);
            return null;
        }
    },

    formatDateTime(timestamp) {
        if (!timestamp) return { date: '---', time: '---' };
        try {
            const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return {
                date: d.toLocaleDateString('en-GB'), // 12/04/2026
                time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true })
            };
        } catch (e) {
            return { date: '---', time: '---' };
        }
    }
};
