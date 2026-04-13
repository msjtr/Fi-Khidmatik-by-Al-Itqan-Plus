import { db } from './orders-firebase-db.js';
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// جلب الطلبات مع دعم هيكلة مصفوفة items
export async function getOrders() {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(doc => {
            const data = doc.data();
            
            // استخراج أول منتج من مصفوفة items حسب بياناتك المرفقة
            const firstItem = (data.items && data.items.length > 0) ? data.items[0] : {};
            
            return {
                id: doc.id,
                // استخراج الاسم من الحقل name داخل المصفوفة
                packageName: firstItem.name || data.packageName || "باقة غير محددة",
                // استخدام الحقل total للسعر
                price: data.total || data.subtotal || 0,
                orderNumber: data.orderNumber || "KF-OLD",
                customerName: data.customerName || "عميل منصة تيرا", 
                phone: data.phone || "---",
                paymentMethod: data.paymentMethodName || data.paymentMethod || "غير محدد",
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

// إضافة دالة toast وتصديرها لحل خطأ SyntaxError
export function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if(!t) {
        console.log("Toast:", msg);
        return;
    }
    t.textContent = msg;
    t.className = `fixed bottom-6 left-6 z-50 px-6 py-3 rounded-xl text-white font-bold transition-all ${type === 'error' ? 'bg-red-500' : 'bg-green-600'}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}
