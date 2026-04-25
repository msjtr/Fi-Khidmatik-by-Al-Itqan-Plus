/**
 * customers-core.js - Tera Gateway
 */
import { db } from '../core/config.js'; 
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// مرجع المجموعة
const customersRef = collection(db, "customers");

// جلب الكل
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot;
    } catch (error) {
        console.warn("⚠️ مشكلة في الترتيب، يتم الجلب الخام...");
        return await getDocs(customersRef);
    }
}

// جلب عميل واحد
export async function fetchCustomerById(id) {
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        return null;
    }
}

// إضافة
export async function addCustomer(data) {
    return await addDoc(customersRef, {
        ...data,
        CreatedAt: serverTimestamp()
    });
}

// تحديث
export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    return await updateDoc(docRef, {
        ...data,
        UpdatedAt: serverTimestamp()
    });
}

// حذف
export async function removeCustomer(id) {
    const docRef = doc(db, "customers", id);
    return await deleteDoc(docRef);
}
