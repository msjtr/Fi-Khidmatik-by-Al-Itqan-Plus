import { db } from './firebase.js';
import { 
    collection, addDoc, getDocs, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. توليد بيانات الطلب الجديد (KF + 10 أرقام كما في بياناتك القديمة)
export const generateOrderMeta = () => {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return {
        orderNumber: `KF-${datePart}${randomPart}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
};

// 2. جلب كافة الطلبات (القديمة والجديدة) مع معالجة حقولك الخاصة
export const fetchAllOrders = async () => {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(doc => {
            const data = doc.data();
            
            // معالجة التاريخ النصي (CreatedAt)
            let displayDate = data.orderDate || "غير محدد";
            if (data.createdAt && typeof data.createdAt === 'string') {
                displayDate = new Date(data.createdAt).toLocaleDateString('ar-SA');
            }

            return {
                id: doc.id,
                orderNo: data.orderNumber || data.orderNo || "N/A",
                customerName: data.customerName || data.client_name || "عميل سابق",
                total: data.total || 0,
                status: data.status || "جديد",
                payment: data.paymentMethodName || data.paymentMethod || "غير محدد",
                date: displayDate
            };
        });
    } catch (e) {
        console.error("خطأ في جلب البيانات:", e);
        return [];
    }
};

// 3. حفظ طلب جديد أو إضافة منتج للمخزون
export const saveData = async (colName, data) => {
    return await addDoc(collection(db, colName), {
        ...data,
        createdAt: new Date().toISOString() // توحيد صيغة التاريخ مع بياناتك القديمة
    });
};
