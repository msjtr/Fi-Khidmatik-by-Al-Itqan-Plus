// js/order.js
import { db, collection, addDoc, doc, getDoc, getDocs, updateDoc, query, orderBy, limit } from './firebase.js';

// حفظ طلب جديد في Firestore
export async function saveOrderToFirebase(orderData) {
    try {
        const ordersRef = collection(db, 'orders');

        const safeData = {
            customer: orderData.customer || '',
            phone: orderData.phone || '',
            cart: orderData.cart || [],
            total: orderData.total || 0,
            payment: orderData.payment || '',
            shipping: orderData.shipping || ''
        };

        const docRef = await addDoc(ordersRef, {
            ...safeData,
            orderNumber: 'ORD-' + Date.now(),
            createdAt: new Date().toISOString(),
            timestamp: Date.now(),
            status: 'جديد'
        });

        console.log('✅ تم حفظ الطلب:', docRef.id);
        return docRef.id;

    } catch (error) {
        console.error('❌ خطأ في الحفظ:', error);
        throw error;
    }
}

// جلب طلب بواسطة ID
export async function getOrderFromFirebase(orderId) {
    try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                items: data.cart || data.items || []
            };
        }

        return null;

    } catch (error) {
        console.error('❌ خطأ في الجلب:', error);
        throw error;
    }
}

// جلب الطلبات (محسن)
export async function getAllOrdersFromFirebase() {
    try {
        const ordersRef = collection(db, 'orders');

        const q = query(
            ordersRef,
            orderBy('timestamp', 'desc'),
            limit(50)
        );

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

        console.log('✅ تم تحديث الحالة');
        return true;

    } catch (error) {
        console.error('❌ خطأ في التحديث:', error);
        throw error;
    }
}
