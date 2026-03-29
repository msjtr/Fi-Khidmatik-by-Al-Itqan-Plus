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

// config
const firebaseConfig = { ... };

// init
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ===================== helper =====================
export async function getCollection(name) {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ===================== products =====================
export const loadProducts = () => getCollection('products');
export const addProduct = (data) => addDoc(collection(db, 'products'), data);
export const updateProduct = (id, data) => updateDoc(doc(db, 'products', id), data);
export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

// ===================== customers =====================
export const loadCustomers = () => getCollection('customers');
export const addCustomer = (data) => addDoc(collection(db, 'customers'), data);

// ===================== orders =====================
export const loadOrders = () => getCollection('orders');
export const addOrder = (data) => addDoc(collection(db, 'orders'), data);

// ===================== settings =====================
export const getSettings = async (id) => {
    const d = await getDoc(doc(db, 'settings', id));
    return d.exists() ? d.data() : null;
};

export const setSettings = (id, data) =>
    setDoc(doc(db, 'settings', id), data, { merge: true });
