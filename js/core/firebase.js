/**
 * js/core/firebase.js
 * تهيئة محرك Firebase لـ "تيرا جيت واي"
 * الإصدار: V12.12.1
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 1. تهيئة Firebase - التأكد من عدم تكرار التهيئة
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. تعريف الخدمات
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 3. الحل الجذري لمشكلة (No Firebase App): ربط الخدمات بنطاق النافذة فوراً
// نستخدم Object.defineProperty لضمان أن القيم ثابتة ولا تتغير بالخطأ
Object.defineProperties(window, {
    "db": { value: db, writable: false },
    "auth": { value: auth, writable: false },
    "storage": { value: storage, writable: false },
    "firebaseApp": { value: app, writable: false }
});

console.log("🚀 Tera Engine: محرك Firebase جاهز ومتصل بـ [msjt301-974bb]");

// 4. التصدير للموديولات الحديثة (هذا هو الأسلوب الأفضل للاستخدام)
export { app, db, auth, storage, analytics };
