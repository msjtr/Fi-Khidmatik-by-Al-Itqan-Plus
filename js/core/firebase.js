/**
 * js/core/firebase.js
 * إصلاح منصة تيرا جيت واي - نسخة التوافق المستقرة
 */

// إعدادات مشروع منصة تيرا
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة التطبيق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// تهيئة Firestore مع حلول الاتصال الجذري
const db = firebase.firestore();

db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true // حل أخطاء RPC في الشبكات المحلية
});

// جعل المحرك متاحاً لكافة موديولات النظام (مثل العملاء والطلبات)
window.db = db;
window.firebase = firebase;
window.auth = firebase.auth();

export const APP_CONFIG = {
    name: "Tera Gateway",
    version: "2.0.2"
};

console.log("✅ Tera Engine: Firebase Ready & window.db is active.");
export { db };
