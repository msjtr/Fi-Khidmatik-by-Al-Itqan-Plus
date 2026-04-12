// js/orders-firebase-db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// وظائف مساعدة متاحة عالمياً مع معالجة الأخطاء
window.getDocument = async (colName, id) => {
    try {
        const snap = await getDoc(doc(db, colName, id));
        if (snap.exists()) {
            return { id: snap.id, ...snap.data(), success: true };
        } else {
            console.warn(`الوثيقة المطلوبة غير موجودة في ${colName}`);
            return { success: false, error: "not-found" };
        }
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        return { success: false, error: error.message };
    }
};
