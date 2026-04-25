import { db } from '../core/config.js';
import { 
    collection, query, orderBy, getDocs, doc, getDoc, 
    deleteDoc, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// جلب جميع العملاء مع معالجة الأخطاء
export async function fetchAllCustomers() {
    try {
        // تأكد أن الحقل في Firebase اسمه CreatedAt تماماً بنفس حالة الأحرف
        const q = query(collection(db, "customers"), orderBy("CreatedAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.warn("⚠️ قاعدة بيانات العملاء فارغة حالياً.");
        }
        
        return querySnapshot;
    } catch (error) {
        console.error("❌ فشل جلب العملاء من Firebase:", error);
        
        // إذا كان الخطأ بسبب الفهرس (Index)، سيظهر لك رابط في الكونسول، اضغط عليه لتفعيله
        if (error.code === 'failed-precondition') {
            console.error("⚠️ يجب إنشاء فهرس (Index) في Firebase لهذه المجموعة. افحص الرابط في كونسول المتصفح.");
        }
        
        // حل احتياطي: جلب البيانات بدون ترتيب إذا فشل الترتيب
        console.log("🔄 محاولة جلب البيانات بدون ترتيب...");
        const fallbackQuery = query(collection(db, "customers"));
        return await getDocs(fallbackQuery);
    }
}

// جلب عميل واحد
export async function fetchCustomerById(id) {
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error("❌ خطأ في جلب بيانات العميل:", error);
        return null;
    }
}

// إضافة عميل جديد
export async function addCustomer(data) {
    try {
        return await addDoc(collection(db, "customers"), {
            name: data.name || '',
            Email: data.Email || '',
            Phone: data.Phone || '',
            country: data.country || 'السعودية',
            city: data.city || '',
            district: data.district || '',
            street: data.street || '',
            buildingNo: data.buildingNo || '',
            additionalNo: data.additionalNo || '',
            postalCode: data.postalCode || '',
            poBox: data.poBox || '',
            notes: data.notes || '',
            status: data.status || 'عادي',
            CreatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("❌ خطأ في إضافة العميل:", error);
        throw error;
    }
}

export async function removeCustomer(id) {
    try {
        return await deleteDoc(doc(db, "customers", id));
    } catch (error) {
        console.error("❌ خطأ في حذف العميل:", error);
        throw error;
    }
}
