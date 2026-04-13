// استيراد أدوات Firestore الضرورية
import { db } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. دالة جلب البيانات (يجب أن تبدأ بـ export)
export async function fetchFullData() {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));
    } catch (error) {
        console.error("Logic Error: fetchFullData failed", error);
        return [];
    }
}

// 2. دالة حفظ البيانات
export async function saveData(collName, data) {
    return await addDoc(collection(db, collName), data);
}

// 3. دالة توليد رقم الطلب
export function generateOrderID() {
    return 'TR-' + Math.floor(Math.random() * 900000 + 100000);
}

// 4. دالة توليد SKU
export function generateSKU() {
    return 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
