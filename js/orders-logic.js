import { db } from './firebase.js';
import { 
    collection, addDoc, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const generateOrderID = () => `KF-${Math.floor(100 + Math.random() * 899)}-PO-${Date.now().toString().slice(-4)}`;
export const generateSKU = () => `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

// جلب كل العملاء للاختيار منهم
export const fetchCustomers = async () => {
    const snap = await getDocs(collection(db, "customers"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// جلب المنتجات من المخزون
export const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const saveData = async (col, data) => {
    return await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
};

export const fetchFullData = async () => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
