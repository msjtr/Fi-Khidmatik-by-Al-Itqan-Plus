/**
 * fi-khidmatik/js/modules/customers-core.js
 * المحرك الرئيسي لإدارة بيانات العملاء - منصة Tera Gateway
 * متوافق مع الحقول: (name, phone, email, district, createdAt)
 */

import { db } from '../core/firebase.js'; 
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

// المرجع الرئيسي لمجموعة العملاء في قاعدة البيانات
const customersRef = collection(db, "customers");

/**
 * جلب جميع العملاء مرتبين حسب تاريخ الإنشاء
 * تم ضبط الحقل ليكون 'createdAt' ليتطابق مع بياناتك الفعلية
 */
export const fetchAllCustomers = async function() {
    try {
        console.log("🔄 جاري محاولة جلب بيانات العملاء من تيرا...");
        
        // محاولة جلب مرتبة (تتطلب وجود حقل createdAt في المستندات)
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        console.log(`✅ تم جلب ${snapshot.size} عميل بنجاح (مرتب).`);
        return snapshot;
    } catch (error) {
        console.warn("⚠️ فشل الجلب المرتب (ربما بسبب نقص الفهرس أو اختلاف المسمى):", error.message);
        
        // جلب خام بدون ترتيب لضمان استمرار عمل النظام في كل الظروف
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
 * إضافة عميل جديد مع طابع زمني تلقائي
 */
export const addCustomer = async function(customerData) {
    try {
        return await addDoc(customersRef, {
            ...customerData,
            createdAt: serverTimestamp(), // استخدام الحرف الصغير ليتوافق مع بياناتك
            system_origin: "Tera Gateway",
            region: "Hail"
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
            updatedAt: serverTimestamp() // التوافق مع حقل updatedAt الموجود لديك
        });
    } catch (error) {
        console.error("❌ فشل تحديث البيانات:", error);
        throw error;
    }
};

/**
 * حذف عميل نهائياً من النظام
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

export default { 
    fetchAllCustomers, 
    fetchCustomerById, 
    addCustomer, 
    updateCustomer, 
    removeCustomer 
};
