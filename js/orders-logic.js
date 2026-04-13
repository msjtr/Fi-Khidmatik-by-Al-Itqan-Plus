import { db } from './firebase.js';
import { 
    collection, addDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. توليد بيانات الطلب الجديد تلقائياً ---
export const generateOrderMeta = () => {
    const sequence = Math.floor(1000 + Math.random() * 9000);
    return {
        orderId: `KF-000-PO-${sequence}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
};

// --- 2. جلب كافة الطلبات (القديمة والجديدة) ---
export const fetchAllOrders = async () => {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                // توفيق المسميات (يتعامل مع الأسماء القديمة والجديدة في قاعدة بياناتك)
                orderNo: data.orderNo || data.order_no || "N/A",
                customerName: data.customerName || data.client_name || "عميل غير مسجل",
                total: data.total || data.amount || "0.00",
                status: data.status || "مكتمل",
                createdAt: data.createdAt?.toDate() || new Date()
            };
        });
    } catch (e) {
        console.error("خطأ في جلب الطلبات:", e);
        return [];
    }
};

// --- 3. جلب العملاء للقائمة المنسدلة ---
export const fetchCustomers = async () => {
    const snap = await getDocs(collection(db, "customers"));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- 4. حفظ الطلب الجديد ---
export const saveOrder = async (orderData) => {
    return await addDoc(collection(db, "orders"), {
        ...orderData,
        createdAt: serverTimestamp() // إضافة ختم زمني للترتيب
    });
};
