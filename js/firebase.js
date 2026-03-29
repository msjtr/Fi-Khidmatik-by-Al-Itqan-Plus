import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// إعدادات Firebase (ضع بيانات مشروعك الصحيحة)
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ===================== دوال مساعدة عامة =====================
export async function getCollection(name) {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ===================== المنتجات =====================
export const loadProducts = () => getCollection('products');
export const addProduct = (data) => addDoc(collection(db, 'products'), data);
export const updateProduct = (id, data) => updateDoc(doc(db, 'products', id), data);
export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));
export const updateProductStock = (id, newStock) => updateDoc(doc(db, 'products', id), { stock: newStock });

// ===================== الطلبات =====================
export const loadOrders = () => getCollection('orders');
export const addOrder = (data) => addDoc(collection(db, 'orders'), data);
export const updateOrder = (id, data) => updateDoc(doc(db, 'orders', id), data);
export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));
export const updateOrderStatus = (id, status) => updateDoc(doc(db, 'orders', id), { status });

// جلب الطلبات مع تفاصيل العميل والمنتجات
export const getOrdersWithDetails = async () => {
    const orders = await getCollection('orders');
    const customers = await getCollection('customers');
    const products = await getCollection('products');
    const customersMap = Object.fromEntries(customers.map(c => [c.id, c]));
    const productsMap = Object.fromEntries(products.map(p => [p.id, p]));
    return orders.map(order => ({
        ...order,
        customer: customersMap[order.customerId] || { name: 'غير معروف' },
        items: order.items?.map(item => ({
            ...item,
            productDetails: productsMap[item.productId] || null
        })) || []
    }));
};

// ===================== العملاء =====================
export const loadCustomers = () => getCollection('customers');
export const addCustomer = (data) => addDoc(collection(db, 'customers'), data);
export const updateCustomer = (id, data) => updateDoc(doc(db, 'customers', id), data);
export const deleteCustomer = (id) => deleteDoc(doc(db, 'customers', id));

// ===================== الإعدادات =====================
export async function getSettings(id) {
    const d = await getDoc(doc(db, 'settings', id));
    return d.exists() ? d.data() : null;
}
export const setSettings = (id, data) => setDoc(doc(db, 'settings', id), data, { merge: true });

// ===================== تصدير جميع الأساسيات =====================
export {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc
};
