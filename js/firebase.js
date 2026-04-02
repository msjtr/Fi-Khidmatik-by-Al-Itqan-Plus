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
    setDoc,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== دوال مساعدة =====================
export async function getCollection(name) {
    try {
        const snap = await getDocs(collection(db, name));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error(`خطأ في جلب مجموعة ${name}:`, error);
        return [];
    }
}

export async function getCollectionWithQuery(name, field, value) {
    try {
        const q = query(collection(db, name), where(field, "==", value));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error(`خطأ في البحث عن ${field}:`, error);
        return [];
    }
}

// ===================== المنتجات =====================
export const loadProducts = () => getCollection('products');

export const addProduct = async (data) => {
    try {
        const newProduct = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return await addDoc(collection(db, 'products'), newProduct);
    } catch (error) {
        console.error('خطأ في إضافة المنتج:', error);
        throw error;
    }
};

export const updateProduct = async (id, data) => {
    try {
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        return await updateDoc(doc(db, 'products', id), updateData);
    } catch (error) {
        console.error('خطأ في تحديث المنتج:', error);
        throw error;
    }
};

export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

export const updateProductStock = async (id, newStock) => {
    try {
        return await updateDoc(doc(db, 'products', id), { 
            stock: newStock,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('خطأ في تحديث المخزون:', error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const snap = await getDoc(doc(db, 'products', id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error('خطأ في جلب المنتج:', error);
        return null;
    }
};

// ===================== الطلبات =====================
export const loadOrders = () => getCollection('orders');

export const addOrder = async (data) => {
    try {
        const newOrder = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return await addDoc(collection(db, 'orders'), newOrder);
    } catch (error) {
        console.error('خطأ في إضافة الطلب:', error);
        throw error;
    }
};

export const updateOrder = async (id, data) => {
    try {
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        return await updateDoc(doc(db, 'orders', id), updateData);
    } catch (error) {
        console.error('خطأ في تحديث الطلب:', error);
        throw error;
    }
};

export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));

export const updateOrderStatus = async (id, status) => {
    try {
        return await updateDoc(doc(db, 'orders', id), { 
            status,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('خطأ في تحديث حالة الطلب:', error);
        throw error;
    }
};

export const getOrderById = async (id) => {
    try {
        const snap = await getDoc(doc(db, 'orders', id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error('خطأ في جلب الطلب:', error);
        return null;
    }
};

// جلب الطلبات مع تفاصيل العميل والمنتجات
export const getOrdersWithDetails = async () => {
    try {
        const orders = await getCollection('orders');
        const customers = await getCollection('customers');
        const products = await getCollection('products');
        
        const customersMap = Object.fromEntries(customers.map(c => [c.id, c]));
        const productsMap = Object.fromEntries(products.map(p => [p.id, p]));
        
        // ترتيب الطلبات حسب التاريخ (الأحدث أولاً)
        const sortedOrders = orders.sort((a, b) => {
            const dateA = new Date(`${a.orderDate}T${a.orderTime || '00:00'}`);
            const dateB = new Date(`${b.orderDate}T${b.orderTime || '00:00'}`);
            return dateB - dateA;
        });
        
        return sortedOrders.map(order => ({
            ...order,
            customer: customersMap[order.customerId] || { name: 'غير معروف', phone: '', email: '' },
            items: order.items?.map(item => ({
                ...item,
                productDetails: productsMap[item.productId] || null
            })) || [],
            total: order.total || 0
        }));
    } catch (error) {
        console.error('خطأ في جلب الطلبات مع التفاصيل:', error);
        return [];
    }
};

// ===================== العملاء =====================
export const loadCustomers = () => getCollection('customers');

export const addCustomer = async (data) => {
    try {
        const newCustomer = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return await addDoc(collection(db, 'customers'), newCustomer);
    } catch (error) {
        console.error('خطأ في إضافة العميل:', error);
        throw error;
    }
};

export const updateCustomer = async (id, data) => {
    try {
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        return await updateDoc(doc(db, 'customers', id), updateData);
    } catch (error) {
        console.error('خطأ في تحديث العميل:', error);
        throw error;
    }
};

export const deleteCustomer = (id) => deleteDoc(doc(db, 'customers', id));

export const getCustomerById = async (id) => {
    try {
        const snap = await getDoc(doc(db, 'customers', id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error('خطأ في جلب العميل:', error);
        return null;
    }
};

export const searchCustomers = async (searchTerm) => {
    try {
        const customers = await getCollection('customers');
        return customers.filter(c => 
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone?.includes(searchTerm) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error) {
        console.error('خطأ في البحث عن العملاء:', error);
        return [];
    }
};

// ===================== الإعدادات =====================
export async function getSettings(id) {
    try {
        const d = await getDoc(doc(db, 'settings', id));
        return d.exists() ? { id: d.id, ...d.data() } : null;
    } catch (error) {
        console.error('خطأ في جلب الإعدادات:', error);
        return null;
    }
}

export const setSettings = async (id, data) => {
    try {
        const settingsData = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        return await setDoc(doc(db, 'settings', id), settingsData, { merge: true });
    } catch (error) {
        console.error('خطأ في حفظ الإعدادات:', error);
        throw error;
    }
};

// ===================== الإحصائيات =====================
export const getStats = async () => {
    try {
        const orders = await getCollection('orders');
        const products = await getCollection('products');
        const customers = await getCollection('customers');
        
        const totalOrders = orders.length;
        const totalProducts = products.length;
        const totalCustomers = customers.length;
        
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        const ordersByStatus = {
            'جديد': orders.filter(o => o.status === 'جديد').length,
            'تحت التنفيذ': orders.filter(o => o.status === 'تحت التنفيذ').length,
            'تم التنفيذ': orders.filter(o => o.status === 'تم التنفيذ').length,
            'تحت المراجعة': orders.filter(o => o.status === 'تحت المراجعة').length,
            'مسترجع': orders.filter(o => o.status === 'مسترجع').length,
            'ملغي': orders.filter(o => o.status === 'ملغي').length
        };
        
        return {
            totalOrders,
            totalProducts,
            totalCustomers,
            totalRevenue,
            ordersByStatus
        };
    } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
        return null;
    }
};

// ===================== الطباعة المركزية =====================

// 🖨️ طباعة مباشرة
export function printOrderById(orderId) {
    if (!orderId) {
        console.error('لا يوجد رقم طلب للطباعة');
        return;
    }
    window.open(`print.html?id=${orderId}&auto=print`, "_blank");
}

// 📄 PDF
export function printOrderPDFById(orderId) {
    if (!orderId) {
        console.error('لا يوجد رقم طلب لتحويل PDF');
        return;
    }
    window.open(`print.html?id=${orderId}&auto=pdf`, "_blank");
}

// 🖼️ صورة PNG
export function printOrderPNGById(orderId) {
    if (!orderId) {
        console.error('لا يوجد رقم طلب لتحويل PNG');
        return;
    }
    window.open(`print.html?id=${orderId}&auto=png`, "_blank");
}

// ===================== تصدير الأساسيات =====================
export { 
    db, 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    setDoc,
    query,
    where,
    orderBy,
    limit
};
