import { db } from './firebase.js';
import { 
    collection, addDoc, getDocs, doc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// جلب كافة البيانات وربطها (العملاء + المنتجات + الطلبات)
export const fetchFullOrdersHistory = async () => {
    try {
        const [ordersSnap, customersSnap, productsSnap] = await Promise.all([
            getDocs(collection(db, "orders")),
            getDocs(collection(db, "customers")),
            getDocs(collection(db, "products"))
        ]);

        const customersMap = Object.fromEntries(customersSnap.docs.map(d => [d.id, d.data()]));
        const productsMap = Object.fromEntries(productsSnap.docs.map(d => [d.id, d.data()]));

        return ordersSnap.docs.map(doc => {
            const data = doc.data();
            // ربط اسم العميل من مجموعة customers باستخدام customerId
            const customer = customersMap[data.customerId] || {};
            
            // جلب أسماء المنتجات من مجموعة products إذا كانت موجودة في مصفوفة items
            const productNames = data.items ? data.items.map(item => {
                const prod = productsMap[item.productId] || {};
                return prod.name || item.name || "منتج غير معروف";
            }).join('، ') : "لا توجد منتجات";

            return {
                id: doc.id,
                orderNo: data.orderNumber || data.orderNo || "N/A",
                customerName: customer.name || data.customerName || "عميل غير معروف",
                products: productNames,
                total: data.total || 0,
                status: data.status || "مكتمل",
                date: data.orderDate || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : "---")
            };
        });
    } catch (e) {
        console.error("خطأ في ربط البيانات:", e);
        return [];
    }
};

export const generateOrderMeta = () => {
    const sequence = Math.floor(1000 + Math.random() * 9000);
    return {
        orderNumber: `KF-${new Date().getTime().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0]
    };
};

export const saveToDB = async (col, data) => {
    return await addDoc(collection(db, col), { ...data, createdAt: new Date().toISOString() });
};
