/**
 * js/core/firebase.js - الإصدار 12.12.1 الحديث
 * المطور: محمد بن صالح الشمري
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 1. تهيئة التطبيق وتصديره صراحةً لإصلاح خطأ config.js
export const app = initializeApp(firebaseConfig);

// 2. تهيئة الخدمات وتصديرها
export const db = getFirestore(app);
export const auth = getAuth(app);

// 3. تأمين الوصول العالمي (لحل مشكلة التنبيه الأصفر في main.js)
window.app = app;
window.db = db;
window.auth = auth;

console.log("🚀 Tera Engine: Firebase V12.12.1 Ready.");

// 4. تصدير افتراضي وتصدير مجمع لضمان التوافق مع كافة الملفات
export { initializeApp, getFirestore, getAuth };
export default app;
