import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * جلب كافة الطلبات من Firestore مرتبة من الأحدث للأقدم
 */
export async function fetchFullData() {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("خطأ أثناء جلب البيانات:", error);
        return []; // إرجاع مصفوفة فارغة لتجنب تعطل التطبيق
    }
}

/**
 * حفظ طلب جديد في قاعدة البيانات
 */
export async function saveData(collName, data) {
    try {
        const docRef = await addDoc(collection(db, collName), data);
        return docRef;
    } catch (error) {
        throw new Error("فشل حفظ البيانات في Firestore: " + error.message);
    }
}

/**
 * توليد رقم طلب عشوائي يبدأ بـ TR
 */
export function generateOrderID() {
    return 'TR-' + Math.floor(Math.random() * 900000 + 100000);
}

/**
 * توليد SKU عشوائي للمنتجات
 */
export function generateSKU() {
    return 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
