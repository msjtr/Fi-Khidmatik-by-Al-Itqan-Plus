import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    doc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// دالة جلب الطلبات مع الترتيب الزمني (كما في ملفك القديم)
export async function getOrders() {
    try {
        const ordersRef = collection(db, "orders");
        // ترتيب تنازلي حسب تاريخ الإنشاء لضمان ظهور أحدث الطلبات أولاً
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        return snap.docs.map(doc => {
            const data = doc.data();
            const firstItem = (data.items && data.items.length > 0) ? data.items[0] : {};
            
            return {
                id: doc.id,
                approvalCode: data.approvalCode || "N/A",
                orderNumber: data.orderNumber || data.orderNo || "KF-000",
                customerName: data.customerName || (data.customer ? data.customer.name : "عميل منصة تيرا"),
                packageName: firstItem.name || data.packageName || "باقة غير محددة",
                price: data.total || data.price || 0,
                paymentMethod: data.paymentMethodName || data.paymentMethod || "غير محدد",
                status: data.status || "جديد",
                createdAt: data.createdAt, // مهم جداً للترتيب
                ...data 
            };
        });
    } catch (e) {
        console.error("Error fetching orders:", e);
        return [];
    }
}

// دالة الحذف
export async function deleteOrder(orderId) {
    try {
        await deleteDoc(doc(db, "orders", orderId));
        return true;
    } catch (e) {
        console.error("Error deleting:", e);
        return false;
    }
}

// دالة التنبيه
export function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if(!toast) return;
    
    toast.innerText = message;
    toast.className = `fixed bottom-5 left-5 px-6 py-3 rounded-lg text-white z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.style.display = "block";
    
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}
