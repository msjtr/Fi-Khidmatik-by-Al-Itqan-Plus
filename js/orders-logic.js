// js/orders-logic.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function loadOrders() {
    const snapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function loadCustomers() {
    const snapshot = await getDocs(collection(db, "customers"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveOrder(orderData, id = null) {
    if (id) {
        const { createdAt, ...updateData } = orderData;
        return await updateDoc(doc(db, "orders", id), updateData);
    } else {
        return await addDoc(collection(db, "orders"), { ...orderData, createdAt: new Date() });
    }
}
