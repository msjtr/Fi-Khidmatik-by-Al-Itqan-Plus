// orders-logic.js
import { db } from './firebase.js'; 
export { db }; // حل مشكلة استيراد db في ملف الـ HTML

import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. جلب كافة الطلبات (تم تغيير الاسم لـ loadOrders ليطابق طلب صفحة الـ HTML)
export async function loadOrders() { 
    try {
        const ordersRef = collection(db, "orders");
        const snap = await getDocs(ordersRef);
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("خطأ في جلب الطلبات:", e);
        return [];
    }
}

// 2. جلب كافة العملاء
export async function getCustomers() {
    try {
        const snap = await getDocs(collection(db, "customers"));
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("خطأ في جلب العملاء:", e);
        return [];
    }
}

// 3. جلب كافة المنتجات
export async function getProducts() {
    try {
        const snap = await getDocs(collection(db, "products"));
        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("خطأ في جلب المنتجات:", e);
        return [];
    }
}
