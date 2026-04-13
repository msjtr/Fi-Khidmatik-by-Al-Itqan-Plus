// داخل ملف orders-logic.js
export async function getOrders() {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(doc => {
            const data = doc.data();
            const firstItem = (data.items && data.items.length > 0) ? data.items[0] : {};
            
            return {
                id: doc.id,
                // استخراج الحقول المطلوبة بدقة
                approvalCode: data.approvalCode || "N/A", // استدعاء رمز الموافقة
                orderNumber: data.orderNumber || "KF-000",
                customerName: data.customerName || "عميل منصة تيرا",
                packageName: firstItem.name || "باقة غير محددة",
                price: data.total || 0, // السعر النهائي بعد الخصم
                paymentMethod: data.paymentMethodName || "تمارا",
                status: data.status || "مكتمل",
                ...data // تمرير بقية البيانات (مثل createdAt و discount)
            };
        });
    } catch (e) {
        console.error("Error:", e);
        return [];
    }
}
// لا تنسى تصدير دالة toast بالأسفل كما فعلنا سابقاً
