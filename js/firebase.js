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

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تخزين مؤقت للبيانات
export let customersMap = new Map();
export let productsMap = new Map();

// دوال مساعدة متقدمة
export async function getCollection(name, conditions = [], sortBy = null, limitCount = null) {
    try {
        let q = collection(db, name);
        if (conditions.length > 0) {
            conditions.forEach(cond => {
                q = query(q, where(cond.field, cond.operator, cond.value));
            });
        }
        if (sortBy) {
            q = query(q, orderBy(sortBy.field, sortBy.direction || 'asc'));
        }
        if (limitCount) {
            q = query(q, limit(limitCount));
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error(`خطأ في جلب مجموعة ${name}:`, error);
        throw error;
    }
}

export async function getDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error(`خطأ في جلب المستند ${collectionName}/${docId}:`, error);
        throw error;
    }
}

export async function loadCustomersAndProducts() {
    const customersSnap = await getDocs(collection(db, 'customers'));
    customersSnap.forEach(docSnap => customersMap.set(docSnap.id, docSnap.data()));
    const productsSnap = await getDocs(collection(db, 'products'));
    productsSnap.forEach(docSnap => productsMap.set(docSnap.id, docSnap.data()));
}

export async function getOrder(orderId) {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return null;
    return { id: orderSnap.id, ...orderSnap.data() };
}

export const loadProducts = () => getCollection('products');
export const loadCustomers = () => getCollection('customers', [], { field: 'name', direction: 'asc' });
export const loadOrders = () => getCollection('orders', [], { field: 'orderDate', direction: 'desc' });

export const addProduct = (data) => {
    const productData = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return addDoc(collection(db, 'products'), productData);
};

export const updateProduct = (id, data) => {
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    return updateDoc(doc(db, 'products', id), updateData);
};

export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

export const addOrder = (data) => {
    const orderData = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return addDoc(collection(db, 'orders'), orderData);
};

export const updateOrder = (id, data) => {
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    return updateDoc(doc(db, 'orders', id), updateData);
};

export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));

export { db };
