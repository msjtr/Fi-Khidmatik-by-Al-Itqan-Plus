/**
 * Tera Core - Firebase Integration Layer
 * SDK Version: 10.7.1 (Stable)
 * Project: msjt301-974bb (Tera Gateway)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// إعدادات المشروع (Tera Gateway)
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    // تصحيح: الرابط الافتراضي للمخزن عادة ينتهي بـ .com وليس .app في المشاريع المنشأة قديماً
    storageBucket: "msjt301-974bb.appspot.com", 
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 1. تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// 2. تهيئة الخدمات
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

/**
 * حماية النافذة العالمية (Window) لبيئة المتصفح
 */
if (typeof window !== 'undefined') {
    window.db = db;
    window.auth = auth;
    window.storage = storage;
    console.log("%c✅ Tera Gateway Connected:", "color: #f97316; font-weight: bold;", "المشروع [msjt301-974bb] جاهز للعمل");
}

export { app, db, auth, storage, firebaseConfig };
