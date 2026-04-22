/**
 * js/core/firebase.js
 * تهيئة اتصال Firebase - نسخة الإصلاح النهائي
 */

// 1. الاستيراد المباشر من CDN (تأكد من كتابة الروابط بدقة)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. تكوين Firebase (بيانات مشروعك الخاصة)
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// 3. التنفيذ المباشر والتصدير
// ملاحظة: قمنا بالتنفيذ المباشر هنا لضمان تعريف المتغيرات فوراً
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 4. حالة التهيئة
export let isInitialized = true;

/**
 * تمكين العمل دون اتصال (اختياري)
 */
async function enableOffline() {
    try {
        await enableIndexedDbPersistence(db);
        console.log('✅ تم تفعيل وضع العمل دون اتصال');
    } catch (err) {
        console.warn('⚠️ وضع العمل دون اتصال غير متاح:', err.code);
    }
}

enableOffline();

/**
 * أداة انتظار للتأكد من الجاهزية (تُستخدم في main.js)
 */
export const waitForFirebase = () => {
    return new Promise((resolve) => {
        if (isInitialized) resolve(true);
        else setTimeout(() => resolve(true), 500);
    });
};

// 5. التصدير الافتراضي
export default { app, db, auth, waitForFirebase };
