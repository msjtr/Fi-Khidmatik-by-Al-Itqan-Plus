/**
 * مدير الطلبات - موديول جلب البيانات من Firestore
 */
export const OrderManager = {
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

    async getOrderFullDetails(orderId) {
        try {
            const orderRes = await this.fetchDoc('orders', orderId);
            if (!orderRes.success) return null;

            const customerRes = await this.fetchDoc('customers', orderRes.customerId);
            
            // دالة داخلية للبحث عن القيمة بأي مسمى محتمل
            const getField = (obj1, obj2, keys) => {
                for (let key of keys) {
                    if (obj1 && obj1[key]) return obj1[key];
                    if (obj2 && obj2[key]) return obj2[key];
                }
                return "---";
            };

            return {
                order: orderRes,
                customer: {
                    name: customerRes.name || orderRes.customerName || "عميل زائر",
                    phone: customerRes.phone || orderRes.customerPhone || "---",
                    city: customerRes.city || orderRes.city || "---",
                    district: customerRes.district || orderRes.district || "---",
                    
                    // البحث عن الشارع بمسميات مختلفة
                    street: getField(customerRes, orderRes, ['street', 'Street', 'streetName', 'street_name']),
                    
                    // البحث عن رقم المبنى
                    buildingNumber: getField(customerRes, orderRes, ['buildingNumber', 'building_number', 'buildingNo', 'building']),
                    
                    // البحث عن الرقم الإضافي
                    additionalNumber: getField(customerRes, orderRes, ['additionalNumber', 'additional_number', 'extraNumber', 'additional']),
                    
                    // البحث عن الرمز البريدي
                    postalCode: getField(customerRes, orderRes, ['postalCode', 'postal_code', 'zipCode', 'postCode', 'post_code'])
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
