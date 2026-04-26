import { db } from '../core/firebase.js'; 
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const customersRef = collection(db, "customers");

export async function addCustomer(data) {
    return await addDoc(customersRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        image: data.image || 'assets/default-avatar.png' // الحقل رقم 17
    });
}

export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    return await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
}

export async function fetchCustomerById(id) {
    const snap = await getDoc(doc(db, "customers", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
