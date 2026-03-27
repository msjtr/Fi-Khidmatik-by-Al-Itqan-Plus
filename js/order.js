// js/order.js
import { db, collection, addDoc, doc, getDoc, getDocs, updateDoc, query, orderBy, where } from './firebase.js';

// حفظ طلب جديد في Firestore
export async function saveOrderToFirebase(orderData) {
    try {
        const ordersRef = collection(db, 'orders');
        const docRef = await addDoc(ordersRef, {
            ...orderData,
            createdAt: new Date().toISOString(),
            status: 'جديد',
            timestamp: new Date().getTime()
        });
        console.log('✅ تم حفظ الطلب في Firebase، ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ خطأ في حفظ الطلب:', error);
        throw error;
    }
}

// جلب طلب بواسطة ID (من Firestore)
export async function getOrderFromFirebase(orderId) {
    try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('❌ خطأ في جلب الطلب:', error);
        throw error;
    }
}

// جلب جميع الطلبات (لصفحة الإدارة)
export async function getAllOrdersFromFirebase() {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return orders;
    } catch (error) {
        console.error('❌ خطأ في جلب الطلبات:', error);
        throw error;
    }
}

// تحديث حالة الطلب
export async function updateOrderStatusInFirebase(orderId, newStatus) {
    try {
        const docRef = doc(db, 'orders', orderId);
        await updateDoc(docRef, { 
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        console.log('✅ تم تحديث حالة الطلب');
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث الحالة:', error);
        throw error;
    }
}
