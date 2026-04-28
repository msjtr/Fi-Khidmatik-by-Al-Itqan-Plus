/**
 * js/core/firebase.js
 * نسخة التوافق (Compat) - تربط قوة v10 مع سهولة v8
 * تمنحك الوصول العالمي عبر window.db وتدعم .collection()
 */

// 1. استيراد نسخ التوافق (Compat) حصراً
import firebase from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js";
import "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js";

// إعدادات مشروع منصة تيرا
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// 2. تهيئة التطبيق بنمط التوافق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 3. تهيئة Firestore مع نظام الكاش و Long Polling (حل مشاكل الاتصال)
const db = firebase.firestore();

db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    merge: true,
    experimentalForceLongPolling: true // الإصلاح الجذري الذي طلبته لأخطاء RPC
});

// 4. جعل قاعدة البيانات متاحة عالمياً (هذا أهم سطر لعمل main.js)
window.db = db;
window.firebase = firebase; // للوصول لأي أدوات إضافية

// 5. تهيئة نظام المصادقة
const auth = firebase.auth();
window.auth = auth;

// ثوابت النظام
export const APP_CONFIG = {
    name: "Tera Gateway",
    region: "Hail",
    version: "2.0.2" // تحديث النسخة
};

// التصدير للموديولات الأخرى
export { db, auth, firebase };
export default firebase;

console.log("✅ Tera Engine: Firebase Compat Mode Activated & window.db is ready.");
