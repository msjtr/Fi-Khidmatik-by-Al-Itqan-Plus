/**
 * customers-core.js - Fi-Khidmatik Engine
 * المحرك الرئيسي لإدارة مجموعة 'customers' ونظام الاستيراد والسجلات
 * تم ضبط الحقول لتطابق معايير 'Tera Gateway'
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
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// المراجع الرئيسية لقاعدة البيانات
const customersRef = collection(db, "customers");
const logsRef = collection(db, "system_logs");

/**
 * جلب جميع العملاء مرتبين حسب الأحدث
 */
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("createdAt", "desc"));
        return await getDocs(q);
    } catch (error) {
        console.warn("⚠️ جاري الجلب بدون ترتيب (يُرجى تفعيل Index في Firestore):", error.message);
        return await getDocs(customersRef);
    }
}

/**
 * جلب بيانات عميل واحد بالكامل للتعديل
 */
export async function fetchCustomerById(id) {
    if (!id) return null;
    try {
        const docSnap = await getDoc(doc(db, "customers", id));
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error("❌ فشل fetchCustomerById:", error);
        return null;
    }
}

/**
 * إضافة عميل جديد مع الحقول الـ 16 كاملة
 */
export async function addCustomer(customerData) {
    try {
        const payload = {
            ...customerData,
            createdAt: serverTimestamp(), // التوقيت الرسمي للخادم
            updatedAt: serverTimestamp(),
            system_origin: "Tera Gateway",
            status: customerData.status || "نشط"
        };
        
        const docRef = await addDoc(customersRef, payload);
        await logActivity(`إضافة عميل جديد: ${customerData.name}`, "نجاح");
        return docRef;
    } catch (error) {
        console.error("❌ فشل addCustomer:", error);
        await logActivity(`فشل إضافة عميل: ${customerData.name}`, "فشل", error.message);
        throw error;
    }
}

/**
 * تحديث بيانات العميل (تعديل كامل الحقول)
 */
export async function updateCustomer(id, updatedData) {
    try {
        const docRef = doc(db, "customers", id);
        await updateDoc(docRef, {
            ...updatedData,
            updatedAt: serverTimestamp() // تحديث تلقائي لتاريخ التعديل
        });
        await logActivity(`تعديل بيانات العميل: ${updatedData.name || id}`, "نجاح");
        return true;
    } catch (error) {
        console.error("❌ فشل updateCustomer:", error);
        throw error;
    }
}

/**
 * حذف العميل نهائياً من مجموعة customers
 */
export async function deleteCustomer(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        await logActivity(`حذف العميل ID: ${id}`, "نجاح");
        return true;
    } catch (error) {
        console.error("❌ فشل deleteCustomer:", error);
        return false;
    }
}

/**
 * نظام استيراد العملاء الجماعي (Batch Import)
 * مخصص لمعالجة ملفات Excel
 */
export async function importCustomersBatch(customersArray) {
    const batch = writeBatch(db);
    let count = 0;

    customersArray.forEach((customer) => {
        const newDocRef = doc(customersRef);
        batch.set(newDocRef, {
            ...customer,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            system_origin: "Excel Import"
        });
        count++;
    });

    try {
        await batch.commit();
        await logActivity(`استيراد جماعي: ${count} عميل`, "نجاح");
        return { success: true, count };
    } catch (error) {
        console.error("❌ فشل الاستيراد الجماعي:", error);
        await logActivity(`فشل الاستيراد الجماعي`, "فشل", error.message);
        throw error;
    }
}

/**
 * سجل العمليات (Activity & System Logs)
 * يوثق اسم المستخدم، التاريخ، الوقت، وحالة العملية
 */
export async function logActivity(action, status = "نجاح", errorDetail = "") {
    try {
        await addDoc(logsRef, {
            admin: "Mohammad Al-Shammari",
            action: action,
            status: status,
            error: errorDetail,
            timestamp: serverTimestamp(),
            region: "Hail",
            client_platform: "Fi-Khidmatik Desktop"
        });
    } catch (e) {
        console.warn("⚠️ تعذر تسجيل العملية في سجلات النظام:", e.message);
    }
}
