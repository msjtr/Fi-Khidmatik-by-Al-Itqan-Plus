import { db } from './firebase.js';
import { collection, addDoc, getDocs, doc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// توليد بيانات الطلب التلقائية
export const generateOrderMetadata = () => {
    return {
        orderId: `KF-000-PO-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
};

// توليد باركود تلقائي للمنتجات الجديدة
export const generateBarcode = () => 'BR-' + Math.random().toString(36).substr(2, 9).toUpperCase();

// حسابات الفاتورة (الضريبة 15%)
export const calculateTotals = (items, discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxBase = subtotal - discount;
    const tax = taxBase * 0.15;
    return {
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        total: (taxBase + tax).toFixed(2)
    };
};

// جلب العملاء أو المنتجات من قاعدة البيانات
export const fetchData = async (collectionName) => {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
