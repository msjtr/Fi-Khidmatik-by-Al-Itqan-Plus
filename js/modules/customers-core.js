/**
 * customers-core.js - Tera Gateway
 * المحرك الرئيسي لإدارة بيانات العملاء - نسخة الإصلاح الشامل
 * تم التحديث لضمان جلب البيانات حتى في حال تأخر استجابة السيرفر
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

// المرجع الرئيسي لمجموعة العملاء
const customersRef = collection(db, "customers");

/**
 * جلب جميع العملاء - تم تحسينها لضمان استجابة سريعة
 */
export const fetchAllCustomers = async function() {
    try {
        console.log("🔄 محاولة الاتصال بـ Tera Gateway لطلب البيانات...");
        
        // الترتيب حسب CreatedAt (تأكد من وجود هذا الحقل في المستندات)
        const q = query(customersRef, orderBy("CreatedAt", "desc"));
        const snapshot = await getDocs(q);
        
        // إذا كان الترتيب يسبب مشكلة (بسبب نقص الفهرس)، سينتقل الكود تلقائياً لـ catch
        console.log(`✅ تم جلب ${snapshot.size} عميل بنجاح.`);
        return snapshot;
        
    } catch (error) {
        console.warn("⚠️ جاري الجلب بدون ترتيب (Fallback) بسبب:", error.message);
        
        try {
            // جلب بسيط بدون تعقيدات لضمان ظهور البيانات للمستخدم فوراً
            const rawSnapshot = await getDocs(customersRef);
            console.log(`✅ تم جلب ${rawSnapshot.size} عميل (بدون ترتيب).`);
            return rawSnapshot;
        } catch (innerError) {
            console.error("❌ فشل الجلب النهائي:", innerError);
            throw innerError;
        }
    }
};

/**
 * جلب بيانات عميل واحد
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
 */
export const addCustomer = async function(customerData) {
    try {
        const payload = {
            ...customerData,
            CreatedAt: serverTimestamp(),
            system_origin: "Tera Gateway",
            region: "Hail"
        };
        console.log("📤 جاري حفظ بيانات العميل الجديد...");
        const docRef = await addDoc(customersRef, payload);
        console.log("✅ تمت الإضافة بنجاح، المعرف:", docRef.id);
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
            LastUpdate: serverTimestamp()
        });
        console.log("✅ تم التحديث بنجاح للعميل:", id);
        return true;
    } catch (error) {
        console.error("❌ فشل تحديث البيانات:", error);
        throw error;
    }
};

/**
 * حذف عميل
 */
export const removeCustomer = async function(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
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
