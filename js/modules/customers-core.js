/**
 * js/modules/customers-core.js - المحرك التشغيلي المطور (V12.12.8)
 * يدعم نظام البيانات الـ 17 المعتمد لمنصة تيرا جيت واي
 * الإصدار المستقر للمكتبة: 10.7.1
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/firebase.js'; 
import { 
    collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// المرجع الرئيسي لمجموعة العملاء في Firestore
const customersRef = collection(db, "customers");

/**
 * 1. إضافة عميل جديد
 * تم تحسين الهيكل ليتوافق مع الحقول الـ 17 المطلوبة في نظام تيرا
 */
export async function addCustomer(data) {
    const defaultData = {
        name: "",               // 1. الاسم الكامل
        phone: "",              // 2. رقم الجوال
        countryDial: "+966",    // 3. مفتاح الدولة
        email: "",              // 4. البريد الإلكتروني
        countryName: "المملكة العربية السعودية", // 5. الدولة
        city: "حائل",           // 6. المدينة
        district: "",           // 7. الحي
        street: "",             // 8. الشارع
        buildingNum: "",        // 9. رقم المبنى
        extraNum: "",           // 10. الرقم الإضافي
        zipCode: "",            // 11. الرمز البريدي
        poBox: "",              // 12. صندوق البريد
        status: "نشط",          // 13. الحالة (نشط/محظور)
        category: "عادي",       // 14. التصنيف (عادي/VIP/تاجر)
        type: "فرد",            // 15. النوع (فرد/شركة)
        notes: "",              // 16. ملاحظات إضافية
        avatar: "",             // 17. رابط الصورة (يتم توليده ديناميكياً)
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    // دمج البيانات المرسلة مع القيم الافتراضية
    const finalData = { ...defaultData, ...data };

    // تنظيف البيانات: تحويل القيم undefined أو null إلى نصوص فارغة لسلامة الـ Firestore
    Object.keys(finalData).forEach(key => {
        if (finalData[key] === undefined || finalData[key] === null) {
            finalData[key] = "";
        }
    });

    try {
        const docRef = await addDoc(customersRef, finalData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("🔴 Tera Core Error (Add):", error);
        throw error;
    }
}

/**
 * 2. تحديث بيانات عميل
 */
export async function updateCustomer(id, data) {
    if (!id) throw new Error("معرف العميل (ID) مطلوب لإتمام التحديث");
    
    const docRef = doc(db, "customers", id);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp()
    };
    
    // منع تعديل تاريخ الإنشاء الأصلي وتنظيف الحقول
    delete updateData.createdAt; 
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
    });

    try {
        await updateDoc(docRef, updateData);
        return { success: true };
    } catch (error) {
        console.error("🔴 Tera Core Error (Update):", error);
        throw error;
    }
}

/**
 * 3. جلب بيانات عميل واحد بواسطة الـ ID
 */
export async function fetchCustomerById(id) {
    try {
        const snap = await getDoc(doc(db, "customers", id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (error) {
        console.error("🔴 Tera Core Error (Fetch):", error);
        throw error;
    }
}

/**
 * 4. جلب كافة العملاء مرتبين من الأحدث للأقدم
 */
export async function fetchAllCustomers() {
    try {
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("🔴 Tera Core Error (FetchAll):", error);
        throw error;
    }
}

/**
 * 5. حذف عميل نهائياً من النظام
 */
export async function deleteCustomer(id) {
    try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error("🔴 Tera Core Error (Delete):", error);
        throw error;
    }
}

/**
 * 6. جلب إحصائيات لوحة التحكم (Dashboard Stats)
 * تم تحديث المنطق ليدعم الحقول الجديدة
 */
export async function getCustomersStats() {
    try {
        const snapshot = await getDocs(customersRef);
        const stats = {
            total: 0,
            active: 0,
            blocked: 0,
            vip: 0,
            merchants: 0,
            hailRegion: 0 // إحصائية خاصة لعملاء منطقة حائل
        };

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            stats.total++;
            
            if (d.status === 'نشط') stats.active++;
            else if (d.status === 'محظور') stats.blocked++;

            if (d.category === 'vip') stats.vip++;
            if (d.category === 'تاجر') stats.merchants++;
            
            // تتبع العملاء في منطقة حائل
            if (d.city && d.city.includes("حائل")) stats.hailRegion++;
        });

        return stats;
    } catch (error) {
        console.error("🔴 Tera Core Error (Stats):", error);
        return null;
    }
}

/**
 * 7. الاستيراد الجماعي (Bulk Import)
 * مفيد عند استيراد بيانات العملاء من ملفات Excel الخارجية
 */
export async function importCustomersBatch(dataArray) {
    const results = { success: 0, failed: 0 };
    
    const promises = dataArray.map(async (item) => {
        try {
            await addCustomer(item);
            results.success++;
        } catch (err) {
            results.failed++;
        }
    });

    await Promise.all(promises);
    return results;
}
