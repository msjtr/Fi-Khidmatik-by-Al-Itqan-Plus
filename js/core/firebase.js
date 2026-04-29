/**
 * Tera Core - Firebase Integration Layer
 * SDK Version: 10.7.1 (Stable)
 * Project: msjt301-974bb (Tera Gateway)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// إعدادات المشروع (Tera Gateway)
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
};

// 1. تهيئة التطبيق (Initialization)
const app = initializeApp(firebaseConfig);

// 2. تهيئة الخدمات الأساسية
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

/**
 * تصحيح المسار: تصدير الكائنات للنافذة (window)
 * لضمان عمل السكربتات التي لا تستخدم نظام الموديولات (Legacy Scripts)
 */
window.db = db;
window.auth = auth;
window.storage = storage;
window.firebaseApp = app;

console.log("%c✅ Tera Core Connected:", "color: #f97316; font-weight: bold;", "المحرك متصل بنجاح بـ Firebase [msjt301]");

/**
 * 3. التصدير للموديولات الحديثة (ES Modules)
 * ملاحظة: استخدم هذا التصدير في ملفات مثل customers-ui.js
 */
export { app, db, auth, storage, analytics, firebaseConfig };
