import { db } from './orders-firebase-db.js';
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// جلب كافة السجلات من مجموعة orders
export async function getOrders() {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                // فحص المسميات القديمة (name أو customerName) لضمان ظهور الاسم
                customerName: data.customerName || data.name || data.client_name || "عميل سابق",
                price: data.price || data.amount || 0,
                packageName: data.packageName || data.product || "باقة قديمة",
                orderNumber: data.orderNumber || "KF-OLD",
                phone: data.phone || data.mobile || "0000",
                paymentMethod: data.paymentMethod || "نقدي",
                ...data
            };
        });
    } catch (e) { return []; }
}

// جلب المنتجات من مجموعة products
export async function getStock() {
    const snap = await getDocs(collection(db, "products"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteOrder(id) {
    if(confirm("هل تريد حذف السجل نهائياً؟")) {
        await deleteDoc(doc(db, "orders", id));
        return true;
    }
    return false;
}

export function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `fixed bottom-6 left-6 z-50 px-6 py-3 rounded-xl text-white font-bold transition-all ${type === 'error' ? 'bg-red-500' : 'bg-green-600'}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}
