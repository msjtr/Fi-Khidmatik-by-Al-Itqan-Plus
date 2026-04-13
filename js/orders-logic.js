import { db } from './orders-firebase-db.js';
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function getOrders() {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(doc => {
            const data = doc.data();
            
            // استخراج تفاصيل المنتج من مصفوفة items
            const firstItem = (data.items && data.items.length > 0) ? data.items[0] : {};
            
            return {
                id: doc.id,
                // استخراج اسم المنتج من مصفوفة items
                packageName: firstItem.name || data.packageName || "باقة غير محددة",
                // استخراج السعر الإجمالي
                price: data.total || data.subtotal || 0,
                // رقم الطلب
                orderNumber: data.orderNumber || "KF-OLD",
                // طريقة الدفع
                paymentMethod: data.paymentMethodName || data.paymentMethod || "غير محدد",
                // حالة الطلب
                status: data.status || "معلق",
                // العميل (بما أن الاسم غير موجود في هذا الكائن، سنحاول جلبه من customerId إذا لزم الأمر)
                customerName: data.customerName || "عميل منصة تيرا", 
                phone: data.phone || "---",
                ...data
            };
        });
    } catch (e) {
        console.error("خطأ في جلب البيانات:", e);
        return [];
    }
}

export async function getStock() {
    try {
        const snap = await getDocs(collection(db, "products"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { return []; }
}

export async function deleteOrder(id) {
    if(confirm("هل أنت متأكد من حذف هذا السجل؟")) {
        await deleteDoc(doc(db, "orders", id));
        return true;
    }
    return false;
}
