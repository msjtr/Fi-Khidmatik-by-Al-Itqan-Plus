/**
 * ملف إدارة بيانات الطلبات - منصة في خدمتك
 */

export const OrderManager = {
    async getOrderFullDetails(orderId) {
        try {
            // محاولة العثور على الدالة في النطاق العام للموقع
            const fetchDoc = window.getDocument || (window.parent && window.parent.getDocument);

            if (!fetchDoc) {
                console.error("خطأ حرج: دالة getDocument غير معرفة في window. تأكد من تحميل ملفات قاعدة البيانات قبل هذا الملف.");
                return null;
            }

            // جلب بيانات الطلب
            const order = await fetchDoc("orders", orderId);
            if (!order) {
                console.warn(`الطلب رقم ${orderId} غير موجود في مجموعة orders`);
                return null;
            }

            // جلب بيانات العميل
            const customer = await fetchDoc("customers", order.customerId);
            
            return {
                order: order,
                customer: customer || { name: "عميل كريم" }
            };
        } catch (error) {
            console.error("حدث خطأ أثناء محاولة الاتصال بقاعدة البيانات:", error);
            return null;
        }
    },

    formatDateTime(createdAt) {
        if (!createdAt) return { date: "---", time: "---" };
        const dateObj = new Date(createdAt);
        const date = dateObj.toLocaleDateString('ar-SA');
        const time = dateObj.toLocaleTimeString('ar-SA', {
            hour: '2-digit', minute: '2-digit', hour12: true
        }).replace("ص", "صباحاً").replace("م", "مساءً");
        return { date, time };
    },

    getLogisticDetails(order) {
        return {
            paymentMethod: order.paymentMethod || "دفع إلكتروني",
            approvalCode: order.approvalCode || order.paymentId || "مكتمل",
            deliveryMethod: order.deliveryMethod || "توصيل رقمي"
        };
    }
};
