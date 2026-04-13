import { db } from './orders-firebase-db.js';
import { collection, getDocs, query, orderBy, where, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// جلب الطلبات من مجموعة customers كما طلبت
export async function getOrders(statusFilter = 'الكل') {
    try {
        const colRef = collection(db, "customers");
        let q = (statusFilter === 'الكل') ? 
                query(colRef, orderBy("createdAt", "desc")) : 
                query(colRef, where("status", "==", statusFilter), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        const snap = await getDocs(collection(db, "customers"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

// جلب المخزون من مجموعة products
export async function getStock() {
    const snap = await getDocs(collection(db, "products"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteOrder(id) {
    if(confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
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
