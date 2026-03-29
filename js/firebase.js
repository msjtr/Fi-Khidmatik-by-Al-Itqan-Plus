import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
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
    deleteField
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===================== إعدادات Firebase =====================
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// ===================== تشغيل Firebase =====================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔥 اختبار الاتصال
console.log("✅ Firebase Connected successfully");

// ===================== دالة عامة =====================
/**
 * جلب جميع المستندات من مجموعة معينة
 * @param {string} name - اسم المجموعة
 * @returns {Promise<Array>} - قائمة المستندات مع المعرفات
 */
export async function getCollection(name) {
    try {
        const snap = await getDocs(collection(db, name));
        return snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
    } catch (error) {
        console.error(`خطأ في جلب مجموعة ${name}:`, error);
        throw error;
    }
}

// ===================== دوال المنتجات =====================
/**
 * جلب جميع المنتجات
 * @returns {Promise<Array>} - قائمة المنتجات
 */
export const loadProducts = () => getCollection('products');

/**
 * إضافة منتج جديد
 * @param {Object} data - بيانات المنتج
 * @returns {Promise} - مرجع المستند المضاف
 */
export const addProduct = (data) => addDoc(collection(db, 'products'), data);

/**
 * تحديث منتج موجود
 * @param {string} id - معرف المنتج
 * @param {Object} data - البيانات الجديدة
 * @returns {Promise} - نتيجة التحديث
 */
export const updateProduct = (id, data) => updateDoc(doc(db, 'products', id), data);

/**
 * حذف منتج
 * @param {string} id - معرف المنتج
 * @returns {Promise} - نتيجة الحذف
 */
export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

/**
 * تحديث مخزون المنتج
 * @param {string} id - معرف المنتج
 * @param {number} newStock - المخزون الجديد
 * @returns {Promise} - نتيجة التحديث
 */
export const updateProductStock = (id, newStock) => updateDoc(doc(db, 'products', id), { stock: newStock });

// ===================== دوال العملاء =====================
/**
 * جلب جميع العملاء
 * @returns {Promise<Array>} - قائمة العملاء
 */
export const loadCustomers = () => getCollection('customers');

/**
 * إضافة عميل جديد
 * @param {Object} data - بيانات العميل
 * @returns {Promise} - مرجع المستند المضاف
 */
export const addCustomer = (data) => addDoc(collection(db, 'customers'), data);

/**
 * تحديث عميل موجود
 * @param {string} id - معرف العميل
 * @param {Object} data - البيانات الجديدة
 * @returns {Promise} - نتيجة التحديث
 */
export const updateCustomer = (id, data) => updateDoc(doc(db, 'customers', id), data);

/**
 * حذف عميل
 * @param {string} id - معرف العميل
 * @returns {Promise} - نتيجة الحذف
 */
export const deleteCustomer = (id) => deleteDoc(doc(db, 'customers', id));

// ===================== دوال الطلبات =====================
/**
 * جلب جميع الطلبات
 * @returns {Promise<Array>} - قائمة الطلبات
 */
export const loadOrders = () => getCollection('orders');

/**
 * إضافة طلب جديد
 * @param {Object} data - بيانات الطلب
 * @returns {Promise} - مرجع المستند المضاف
 */
export const addOrder = (data) => addDoc(collection(db, 'orders'), data);

/**
 * تحديث طلب موجود
 * @param {string} id - معرف الطلب
 * @param {Object} data - البيانات الجديدة
 * @returns {Promise} - نتيجة التحديث
 */
export const updateOrder = (id, data) => updateDoc(doc(db, 'orders', id), data);

/**
 * حذف طلب
 * @param {string} id - معرف الطلب
 * @returns {Promise} - نتيجة الحذف
 */
export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));

/**
 * جلب الطلبات مع تفاصيل العملاء والمنتجات
 * @returns {Promise<Array>} - قائمة الطلبات مع تفاصيل كاملة
 */
export const getOrdersWithDetails = async () => {
    try {
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
    } catch (error) {
        console.error('خطأ في جلب تفاصيل الطلبات:', error);
        throw error;
    }
};

// ===================== دوال الإعدادات =====================
/**
 * جلب الإعدادات
 * @param {string} id - معرف الإعدادات
 * @returns {Promise<Object|null>} - بيانات الإعدادات أو null
 */
export async function getSettings(id) {
    try {
        const d = await getDoc(doc(db, 'settings', id));
        return d.exists() ? d.data() : null;
    } catch (error) {
        console.error('خطأ في جلب الإعدادات:', error);
        throw error;
    }
}

/**
 * حفظ الإعدادات (دمج مع البيانات الموجودة)
 * @param {string} id - معرف الإعدادات
 * @param {Object} data - بيانات الإعدادات
 * @returns {Promise} - نتيجة الحفظ
 */
export const setSettings = (id, data) => setDoc(doc(db, 'settings', id), data, { merge: true });

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
    deleteField
};
