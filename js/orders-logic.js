// js/orders-logic.js
import { db } from './orders-firebase-db.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// جلب الطلبات من مجموعة customers (كما في الصورة)
export async function getOrders() {
    try {
        // نحاول الجلب مع الترتيب حسب الأحدث
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.warn("جاري الجلب بدون ترتيب (قد تحتاج لتفعيل Index في Firebase):", error);
        // إذا فشل الترتيب، نجلب البيانات بدون ترتيب لضمان ظهورها
        const snap = await getDocs(collection(db, "customers"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
}

// دالة التنبيهات
export function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `fixed bottom-6 left-6 z-50 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-2 dark:bg-gray-800 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}
