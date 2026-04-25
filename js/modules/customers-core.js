import { db } from '../core/config.js';
import { 
    collection, query, orderBy, getDocs, doc, getDoc, 
    deleteDoc, addDoc, updateDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// جلب جميع العملاء
export async function fetchAllCustomers() {
    const q = query(collection(db, "customers"), orderBy("CreatedAt", "desc"));
    return await getDocs(q);
}

// جلب عميل واحد
export async function fetchCustomerById(id) {
    const docRef = doc(db, "customers", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

// إضافة عميل جديد بالبيانات المطلوبة حرفياً
export async function addCustomer(data) {
    return await addDoc(collection(db, "customers"), {
        name: data.name,
        Email: data.Email,
        Phone: data.Phone,
        country: data.country,
        city: data.city,
        district: data.district,
        street: data.street,
        buildingNo: data.buildingNo,
        additionalNo: data.additionalNo,
        postalCode: data.postalCode,
        poBox: data.poBox,
        notes: data.notes, // مربع نص مدعوم بمحرر
        status: data.status, // (محتال، غير جدي، مميز...)
        CreatedAt: serverTimestamp()
    });
}

export async function removeCustomer(id) {
    return await deleteDoc(doc(db, "customers", id));
}
