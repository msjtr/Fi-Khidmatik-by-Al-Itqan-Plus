// ================= Firebase Core =================
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

// ================= Config =================
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

// ================= Cache =================
export let customersMap = new Map();
export let productsMap = new Map();

// ================= Helper =================
const nowISO = () => new Date().toISOString();

// ================= Advanced Collection =================
export async function getCollection(name, conditions = [], sortBy = null, limitCount = null) {
    try {
        let ref = collection(db, name);
        let q = ref;

        if (conditions.length) {
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
        console.error(`❌ خطأ في ${name}:`, error);
        return [];
    }
}

// ================= Single Document =================
export async function getDocument(collectionName, docId) {
    try {
        const ref = doc(db, collectionName, docId);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error(`❌ خطأ في المستند ${collectionName}:`, error);
        return null;
    }
}

// ================= Load Cache =================
export async function loadCustomersAndProducts(forceReload = false) {

    if (!forceReload && customersMap.size && productsMap.size) {
        return;
    }

    customersMap.clear();
    productsMap.clear();

    const [customersSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'customers')),
        getDocs(collection(db, 'products'))
    ]);

    customersSnap.forEach(d => customersMap.set(d.id, d.data()));
    productsSnap.forEach(d => productsMap.set(d.id, d.data()));
}

// ================= Order (🔥 أهم تعديل) =================
export async function getOrderFull(orderId) {

    try {
        const order = await getDocument('orders', orderId);
        if (!order) return null;

        await loadCustomersAndProducts();

        const customer = customersMap.get(order.customerId) || {};

        const items = (order.items || []).map(item => {
            const product = productsMap.get(item.productId) || {};

            return {
                ...item,
                productName: product.name || 'غير معروف',
                description: product.description || '',
                image: product.image || '',
                price: item.price || product.price || 0
            };
        });

        return {
            ...order,
            customer,
            items
        };

    } catch (err) {
        console.error("❌ خطأ في جلب الطلب الكامل:", err);
        return null;
    }
}

// ================= Totals Helper =================
export function calculateTotals(items = [], discount = 0) {

    let subtotal = 0;

    items.forEach(i => {
        subtotal += (i.price || 0) * (i.quantity || 0);
    });

    const vat = subtotal * 0.15;
    const total = subtotal + vat - discount;

    return {
        subtotal,
        vat,
        discount,
        total
    };
}

// ================= Products =================
export const loadProducts = () => getCollection('products');
export const loadCustomers = () => getCollection('customers', [], { field: 'name', direction: 'asc' });
export const loadOrders = () => getCollection('orders', [], { field: 'orderDate', direction: 'desc' });

// ================= CRUD =================
export const addProduct = (data) =>
    addDoc(collection(db, 'products'), { ...data, createdAt: nowISO(), updatedAt: nowISO() });

export const updateProduct = (id, data) =>
    updateDoc(doc(db, 'products', id), { ...data, updatedAt: nowISO() });

export const deleteProduct = (id) =>
    deleteDoc(doc(db, 'products', id));

export const addOrder = (data) =>
    addDoc(collection(db, 'orders'), { ...data, createdAt: nowISO(), updatedAt: nowISO() });

export const updateOrder = (id, data) =>
    updateDoc(doc(db, 'orders', id), { ...data, updatedAt: nowISO() });

export const deleteOrder = (id) =>
    deleteDoc(doc(db, 'orders', id));

// ================= Export =================
export { db };
