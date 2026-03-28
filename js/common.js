import {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc
} from './firebase.js';

// ===================== دوال عامة =====================
export async function getCollection(name) {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({
        id: d.id,
        ...d.data()
    }));
}

// ===================== المنتجات =====================
export const loadProducts = () => getCollection('products');

export const addProduct = (data) =>
    addDoc(collection(db, 'products'), data);

export const updateProduct = (id, data) =>
    updateDoc(doc(db, 'products', id), data);

export const deleteProduct = (id) =>
    deleteDoc(doc(db, 'products', id));

export const updateProductQuantity = (id, quantity) =>
    updateProduct(id, { quantity });

// ===================== العملاء =====================
export const loadCustomers = () => getCollection('customers');

export const addCustomer = (data) =>
    addDoc(collection(db, 'customers'), data);

export const updateCustomer = (id, data) =>
    updateDoc(doc(db, 'customers', id), data);

export const deleteCustomer = (id) =>
    deleteDoc(doc(db, 'customers', id));

// ===================== الطلبات =====================
export const loadOrders = () => getCollection('orders');

export const addOrder = (data) =>
    addDoc(collection(db, 'orders'), data);

export const updateOrder = (id, data) =>
    updateDoc(doc(db, 'orders', id), data);

export const deleteOrder = (id) =>
    deleteDoc(doc(db, 'orders', id));

// ===================== الإعدادات =====================
export async function getSettings(id) {
    const d = await getDoc(doc(db, 'settings', id));
    return d.exists() ? d.data() : null;
}

export const setSettings = (id, data) =>
    setDoc(doc(db, 'settings', id), data, { merge: true });

// ===================== النسخ الاحتياطي =====================
export async function exportAllData() {
    const cols = ['products', 'customers', 'orders', 'settings'];
    let data = {};

    for (let c of cols) {
        const snap = await getDocs(collection(db, c));
        data[c] = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
    }

    return data;
}

export async function importAllData(data) {
    for (let col in data) {
        for (let item of data[col]) {
            const { id, ...rest } = item;
            if (id) {
                await setDoc(doc(db, col, id), rest);
            }
        }
    }
}
