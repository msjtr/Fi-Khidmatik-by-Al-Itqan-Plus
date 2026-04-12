/**
 * مدير الطلبات - النسخة المطابقة لمسميات HTML (إدارة الطلبات)
 */
export const OrderManager = {
    // تم تعديل الدالة لتستقبل db كباراميتر أو تبحث عنها في النطاق العام
    async fetchDoc(col, id) {
        const firestore = window.db || firebase.firestore(); 
        if (!firestore) {
            console.error("Firestore is not initialized");
            return { success: false };
        }
        if (!id) return { success: false };

        try {
            const snap = await firestore.collection(col).doc(id).get();
            return snap.exists ? { id: snap.id, ...snap.data(), success: true } : { success: false };
        } catch (e) {
            console.error(`Fetch Error in ${col}:`, e);
            return { success: false };
        }
    },

    async getOrderFullDetails(orderId) {
        try {
            const orderRes = await this.fetchDoc('orders', orderId);
            if (!orderRes.success) return null;

            // جلب بيانات العميل إذا كان موجوداً
            let customerRes = { success: false };
            if (orderRes.customerId) {
                customerRes = await this.fetchDoc('customers', orderRes.customerId);
            }
            
            // دالة مطابقة المسميات الذكية
            const getField = (obj1, obj2, keys) => {
                for (let key of keys) {
                    if (obj1 && obj1[key] && obj1[key] !== "") return obj1[key];
                    if (obj2 && obj2[key] && obj2[key] !== "") return obj2[key];
                }
                return "---";
            };

            return {
                order: orderRes,
                customer: {
                    name: orderRes.customerName || customerRes.name || "عميل زائر",
                    phone: orderRes.customerPhone || customerRes.phone || orderRes.deliveryPhone || "---",
                    city: orderRes.deliveryCity || customerRes.city || orderRes.quickCity || "---",
                    district: orderRes.deliveryDistrict || customerRes.district || "---",
                    
                    // الشارع: البحث في كافة المسميات الممكنة
                    street: getField(orderRes, customerRes, ['deliveryStreet', 'quickStreet', 'street', 'address_street']),
                    
                    // رقم المبنى
                    buildingNumber: getField(orderRes, customerRes, ['deliveryBuildingNo', 'quickBuildingNo', 'buildingNumber', 'building_number']),
                    
                    // الرقم الإضافي
                    additionalNumber: getField(orderRes, customerRes, ['deliveryAdditionalNo', 'quickAdditionalNo', 'additionalNumber']),
                    
                    // الرمز البريدي
                    postalCode: getField(orderRes, customerRes, ['deliveryPoBox', 'quickPoBox', 'postalCode', 'postal_code'])
                }
            };
        } catch (error) {
            console.error("خطأ حرج في getOrderFullDetails:", error);
            return null;
        }
    },

    formatDateTime(timestamp) {
        if (!timestamp) return { date: '---', time: '---' };
        try {
            const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return {
                date: d.toLocaleDateString('en-GB'), // 12/04/2026
                time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            };
        } catch (e) {
            return { date: '---', time: '---' };
        }
    }
};
