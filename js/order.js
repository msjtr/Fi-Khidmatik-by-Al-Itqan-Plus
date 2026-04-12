/**
 * ملف إدارة بيانات الطلبات - منصة في خدمتك
 */

export const OrderManager = {
    // جلب بيانات الطلب والعميل
    async getOrderFullDetails(orderId) {
        try {
            // التحقق من وجود الدالة أو استخدام البديل
            const fetchDoc = window.getDocument || (async (coll, id) => {
                console.warn(`الدالة getDocument غير معرفة للمجموعة ${coll}`);
                return null; 
            });

            const order = await fetchDoc("orders", orderId);
            if (!order) {
                console.error("الطلب غير موجود في قاعدة البيانات");
                return null;
            }

            const customer = await fetchDoc("customers", order.customerId);
            
            return {
                order: order,
                customer: customer || { name: "عميل كريم" }
            };
        } catch (error) {
            console.error("خطأ تقني في جلب البيانات:", error);
            return null;
        }
    },

    formatDateTime(createdAt) {
        const dateObj = new Date(createdAt);
        const date = dateObj.toLocaleDateString('ar-SA');
        const time = dateObj.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).replace("ص", "صباحاً").replace("م", "مساءً");
        return { date, time };
    },

    getLogisticDetails(order) {
        return {
            paymentMethod: order.paymentMethod || "دفع إلكتروني",
            approvalCode: order.approvalCode || order.paymentId || "تم الاعتماد",
            deliveryMethod: order.deliveryMethod || "تفعيل رقمي"
        };
    }
};
