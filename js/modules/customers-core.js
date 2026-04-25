/**
 * customers-core.js - Tera Gateway
 * المحرك الرئيسي لإدارة بيانات العملاء - الإصدار المتوافق مع حقول 'customers'
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

// المرجع الرئيسي للمجموعة (تأكد أنها customers بالحروف الصغيرة)
const customersRef = collection(db, "customers");

/**
 * جلب جميع العملاء 
 * تم التعديل ليتوافق مع مسمى createdAt الصغير (String/Timestamp)
 */
export const fetchAllCustomers = async function() {
    try {
        console.log("🔄 جاري الاتصال بقاعدة بيانات تيرا (customers)...");
        
        // محاولة جلب البيانات مرتبة حسب التاريخ (الأحدث أولاً)
        // ملاحظة: استخدمنا createdAt (حروف صغيرة) لتطابق بياناتك الأصلية
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        console.log(`✅ تم جلب ${snapshot.size} عميل بنجاح.`);
        return snapshot;
        
    } catch (error) {
        console.warn("⚠️ جاري جلب البيانات بدون ترتيب بسبب اختلاف أنواع الحقول (createdAt):", error.message);
        
        try {
            // Fallback: الجلب بدون ترتيب في حال وجود تضارب بين (String و Timestamp) في createdAt
            const rawSnapshot = await getDocs(customersRef);
            return rawSnapshot;
        } catch (innerError) {
            console.error("❌ فشل الجلب نهائياً:", innerError);
            throw innerError;
        }
    }
};

/**
 * جلب بيانات عميل واحد بالمعرف
 */
export const fetchCustomerById = async function(id) {
    if (!id) return null;
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("❌ خطأ في جلب بيانات العميل:", error);
        return null;
    }
};

/**
 * إضافة عميل جديد لمنصة تيرا
 * نستخدم المسميات الصغيرة (phone, email, tag) لتطابق بياناتك القديمة
 */
export const addCustomer = async function(customerData) {
    try {
        const payload = {
            ...customerData,
            createdAt: new Date().toISOString(), // حفظه كـ String ليتوافق مع سجلاتك السابقة
            system_origin: "Tera Gateway",
            region: "Hail",
            updatedAt: serverTimestamp()
        };
        
        console.log("📤 جاري حفظ العميل الجديد في مجموعة customers...");
        const docRef = await addDoc(customersRef, payload);
        return docRef;
    } catch (error) {
        console.error("❌ فشل إضافة العميل:", error);
        throw error;
    }
};

/**
 * تحديث بيانات عميل
 */
export const updateCustomer = async function(id, updatedData) {
    try {
        const docRef = doc(db, "customers", id);
        await updateDoc(docRef, {
            ...updatedData,
            updatedAt: serverTimestamp() // تحديث طابع الوقت الأخير
        });
        console.log("✅ تم تحديث بيانات العميل بنجاح:", id);
        return true;
    } catch (error) {
        console.error("❌ فشل تحديث البيانات:", error);
        throw error;
    }
};

/**
 * حذف عميل نهائياً
 */
export const removeCustomer = async function(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        console.log("🗑️ تم حذف العميل من النظام.");
        return true;
    } catch (error) {
        console.error("❌ فشل الحذف:", error);
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
