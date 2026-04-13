import { db } from './orders-firebase-db.js';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function getOrders() {
    try {
        const q = query(collection(db, "orders"));
        const snap = await getDocs(q);
        return snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                // الحفاظ على الحقول القديمة والجديدة
                customerName: data.customerName || data.name || data.client_name || "بدون اسم",
                price: data.price || data.amount || data.total || 0,
                packageName: data.packageName || data.product || data.package || "باقة تيرا",
                orderNumber: data.orderNumber || "KF-" + doc.id.substring(0,5),
                ...data
            };
        });
    } catch (e) {
        console.error("Error:", e);
        return [];
    }
}

export async function deleteOrder(id) {
    if(!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return false;
    try {
        await deleteDoc(doc(db, "orders", id));
        return true;
    } catch (e) { return false; }
}

export function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    t.classList.add('bg-green-600');
    setTimeout(() => t.style.display = 'none', 3000);
}
