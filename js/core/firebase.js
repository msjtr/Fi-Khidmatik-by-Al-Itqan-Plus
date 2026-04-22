/**
 * js/core/firebase.js
 * نسخة محدثة تدعم نظام Cache الجديد (Firebase 10+)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// 1. تهيئة التطبيق
export const app = initializeApp(firebaseConfig);

// 2. تهيئة Firestore بالطريقة الحديثة (تختفي رسالة التحذير هنا)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager() // يدعم فتح الموقع في أكثر من علامة تبويب
    })
});

// 3. تهيئة المصادقة
export const auth = getAuth(app);

export const isInitialized = true;

// أداة انتظار الجاهزية للموديولات الأخرى
export const waitForFirebase = () => Promise.resolve(true);

export default { app, db, auth, waitForFirebase };
