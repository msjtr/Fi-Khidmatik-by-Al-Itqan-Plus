/**
 * ملف إدارة بيانات الطلبات - منصة في خدمتك
 * مسؤول عن جلب بيانات الطلب، العميل، وطرق الدفع والاستلام
 */

export const OrderManager = {
    // جلب بيانات الطلب والعميل من قاعدة البيانات
    async getOrderFullDetails(orderId) {
        try {
            const order = await window.getDocument("orders", orderId);
            if (!order) throw new Error("الطلب غير موجود");

            const customer = await window.getDocument("customers", order.customerId);
            
            return {
                order: order,
                customer: customer || { name: "عميل غير معروف" }
            };
        } catch (error) {
            console.error("خطأ في جلب بيانات الطلب:", error);
            return null;
        }
    },

    // معالجة التاريخ والوقت بتنسيق "في خدمتك" المعتمد
    formatDateTime(createdAt) {
        const dateObj = new Date(createdAt);
        
        const date = dateObj.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const time = dateObj.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).replace("ص", "صباحاً").replace("م", "مساءً");

        return { date, time };
    },

    // استخراج بيانات الدفع والاستلام لضمان ظهورها في الفاتورة
    getLogisticDetails(order) {
        return {
            paymentMethod: order.paymentMethod || "دفع إلكتروني",
            approvalCode: order.approvalCode || order.paymentId || "تم الاعتماد",
            deliveryMethod: order.deliveryMethod || "تفعيل رقمي فورياً"
        };
    }
};
