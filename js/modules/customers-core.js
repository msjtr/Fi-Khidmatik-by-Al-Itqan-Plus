/**
 * customers-core.js - Fi-Khidmatik Engine
 * المحرك الرئيسي لإدارة مجموعة 'customers' ونظام الاستيراد والسجلات
 * تم التعديل ليتوافق مع مسارات GitHub Pages ودعم الحقول الـ 17
 */

// استخدام مسار نسبي صريح لضمان عمل الاستيراد في GitHub Pages
import { db } from '../core/firebase.js'; 

import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const customersRef = collection(db, "customers");

/**
 * إضافة عميل جديد (17 حقلاً)
 */
export async function addCustomer(data) {
    try {
        const payload = {
            // بيانات أساسية
            name: data.name || '',
            phone: data.phone || '',
            countryCode: data.countryCode || '+966',
            email: data.email || '',
            
            // العنوان الوطني
            country: data.country || '',
            city: data.city || '',
            district: data.district || '',
            street: data.street || '',
            buildingNo: data.buildingNo || '',
            additionalNo: data.additionalNo || '',
            postalCode: data.postalCode || '',
            poBox: data.poBox || '',
            
            // بيانات إضافية
            notes: data.notes || '', // Rich Text من المحرر
            tag: data.tag || 'regular',
            
            // الحقل 17: الصورة (مع حل بديل في حال فشل المسار المحلي)
            image: data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'C')}&background=random`,
            
            // طوابع زمنية تلقائية
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            
            // توثيق النظام
            system_origin: "Tera Gateway"
        };
        
        return await addDoc(customersRef, payload);
    } catch (error) {
        console.error("❌ فشل إضافة العميل في Firestore:", error);
        throw error;
    }
}

/**
 * تحديث بيانات عميل موجود
 */
export async function updateCustomer(id, data) {
    if (!id) throw new Error("ID العميل مطلوب لإتمام عملية التحديث");
    
    try {
        const docRef = doc(db, "customers", id);
        return await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp() // تحديث تلقائي عند كل تعديل
        });
    } catch (error) {
        console.error("❌ فشل تحديث العميل:", error);
        throw error;
    }
}

/**
 * جلب بيانات عميل واحد بواسطة الـ ID
 */
export async function fetchCustomerById(id) {
    if (!id) return null;
    try {
        const snap = await getDoc(doc(db, "customers", id));
        if (snap.exists()) {
            return { id: snap.id, ...snap.data() };
        }
        return null;
    } catch (error) {
        console.error("❌ فشل جلب بيانات العميل:", error);
        return null;
    }
}

/**
 * جلب جميع العملاء مرتبين بالأحدث
 */
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("createdAt", "desc"));
        return await getDocs(q);
    } catch (error) {
        console.warn("⚠️ جاري الجلب بدون ترتيب (تأكد من إنشاء Index في Firestore):");
        return await getDocs(customersRef);
    }
}

/**
 * حذف عميل نهائياً
 */
export async function deleteCustomer(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("❌ فشل حذف العميل:", error);
        return false;
    }
}
