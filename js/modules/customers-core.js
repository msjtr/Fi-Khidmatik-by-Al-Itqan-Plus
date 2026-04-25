import { 
    getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
const customersRef = collection(db, "customers");

export async function fetchAllCustomers() {
    try {
        // محاولة الجلب المرتب حسب CreatedAt (تأكد من كتابتها هكذا في Firestore)
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        return await getDocs(q);
    } catch (error) {
        console.warn("⚠️ تنبيه: جلب البيانات بدون ترتيب بسبب نقص حقل CreatedAt في بعض السجلات.");
        return await getDocs(customersRef);
    }
}

export async function fetchCustomerById(id) {
    const docSnap = await getDoc(doc(db, "customers", id));
    return docSnap.exists() ? docSnap.data() : null;
}

export async function addCustomer(data) {
    return await addDoc(customersRef, {
        ...data,
        CreatedAt: serverTimestamp() // إضافة تاريخ الإنشاء آلياً
    });
}

export async function updateCustomer(id, data) {
    const docRef = doc(db, "customers", id);
    return await updateDoc(docRef, data);
}

export async function removeCustomer(id) {
    try {
        await deleteDoc(doc(db, "customers", id));
        return true;
    } catch (e) { return false; }
}
