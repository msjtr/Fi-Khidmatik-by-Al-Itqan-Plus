/**
 * customers-core.js - Tera Gateway
 * المحرك الرئيسي لإدارة بيانات العملاء في قاعدة البيانات
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

// المرجع الرئيسي لمجموعة العملاء
const customersRef = collection(db, "customers");

/**
 * جلب جميع العملاء من قاعدة البيانات
 * تم وضع محاولة جلب مرتبة، وفي حال الفشل يتم الجلب الخام
 */
export const fetchAllCustomers = async function() {
    try {
        console.log("🔄 جاري محاولة جلب بيانات العملاء...");
        // محاولة جلب مرتبة بالأحدث أولاً
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        const snapshot = await getDocs(q);
        console.log(`✅ تم جلب ${snapshot.size} عميل بنجاح (مرتب).`);
        return snapshot;
    } catch (error) {
        console.warn("⚠️ فشل الجلب المرتب (قد يحتاج لفهرس):", error.message);
        // جلب خام بدون ترتيب لضمان عدم توقف النظام
        const rawSnapshot = await getDocs(customersRef);
        console.log(`✅ تم جلب ${rawSnapshot.size} عميل (جلب خام).`);
        return rawSnapshot;
    }
};

/**
 * جلب بيانات عميل واحد بواسطة المعرف (ID)
 */
export const fetchCustomerById = async function(id) {
    if (!id) return null;
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("❌ خطأ في جلب بيانات العميل:", error);
        return null;
    }
};

/**
 * إضافة عميل جديد لمنصة تيرا
 */
export const addCustomer = async function(customerData) {
    try {
        return await addDoc(customersRef, {
            ...customerData,
            CreatedAt: serverTimestamp(),
            system_origin: "Tera Gateway"
        });
    } catch (error) {
        console.error("❌ فشل إضافة العميل:", error);
        throw error;
    }
};

/**
 * تحديث بيانات عميل موجود
 */
export const updateCustomer = async function(id, updatedData) {
    try {
        const docRef = doc(db, "customers", id);
        return await updateDoc(docRef, {
            ...updatedData,
            LastUpdate: serverTimestamp()
        });
    } catch (error) {
        console.error("❌ فشل تحديث البيانات:", error);
        throw error;
    }
};

/**
 * حذف عميل من النظام
 */
export const removeCustomer = async function(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("❌ فشل عملية الحذف:", error);
        return false;
    }
};
