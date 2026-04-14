import { db, collection, addDoc, getDocs } from '../core/firebase.js';

// دالة لحفظ طلب جديد بناءً على بيانات المستند
export async function saveOrder(orderData) {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            invoiceNumber: "KF-2603290287", // [cite: 3]
            date: "2026-03-29",
            status: "تم التنفيذ",
            customer: orderData.customer,
            items: orderData.items,
            totals: orderData.totals,
            timestamp: new Date()
        });
        console.log("Order saved with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}
