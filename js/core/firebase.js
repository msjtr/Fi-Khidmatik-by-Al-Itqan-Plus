/**
 * js/core/firebase.js
 * تهيئة اتصال Firebase
 * @version 2.0.0
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    enableIndexedDbPersistence,
    connectFirestoreEmulator
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged,
    connectAuthEmulator
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// تكوين Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// متغيرات الحالة
let app = null;
let db = null;
let auth = null;
let isInitialized = false;
let initError = null;

/**
 * تهيئة Firebase
 */
async function initializeFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        // تمكين التخزين المؤقت للعمل دون اتصال (للمتصفحات الحديثة)
        try {
            await enableIndexedDbPersistence(db);
            console.log('✅ Offline persistence enabled');
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open, persistence disabled');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Browser does not support persistence');
            } else {
                console.warn('⚠️ Persistence error:', err.message);
            }
        }
        
        // استخدام المحاكي للتطوير المحلي (اختياري - علقه في الإنتاج)
        if (window.location.hostname === 'localhost') {
            // connectFirestoreEmulator(db, 'localhost', 8080);
            // connectAuthEmulator(auth, 'http://localhost:9099');
            console.log('🔧 Running with emulators (localhost)');
        }
        
        isInitialized = true;
        console.log('✅ Firebase initialized successfully');
        console.log(`📁 Project: ${firebaseConfig.projectId}`);
        
        // مراقبة حالة المصادقة
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('👤 User signed in:', user.email);
            } else {
                console.log('👤 No user signed in (public access mode)');
            }
        });
        
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        isInitialized = false;
        initError = error;
        
        // عرض إشعار للمستخدم في واجهة الصفحة
        showFirebaseError(error);
    }
}

/**
 * عرض خطأ Firebase للمستخدم
 */
function showFirebaseError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        left: 20px;
        max-width: 400px;
        background: #dc3545;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Tajawal', sans-serif;
        direction: rtl;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ خطأ في الاتصال بقاعدة البيانات</strong>
        <p style="margin: 5px 0 0; font-size: 12px;">${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px; background: white; color: #dc3545; border: none; border-radius: 5px; cursor: pointer;">
            إعادة المحاولة
        </button>
    `;
    document.body.appendChild(errorDiv);
}

/**
 * التحقق من جاهزية Firebase
 * @returns {boolean}
 */
function isFirebaseReady() {
    return isInitialized && db !== null && auth !== null;
}

/**
 * الحصول على حالة التهيئة (للاستخدام في الموديولات الأخرى)
 * @returns {Promise<boolean>}
 */
async function waitForFirebase(timeout = 10000) {
    const startTime = Date.now();
    while (!isInitialized && (Date.now() - startTime) < timeout) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return isInitialized;
}

// بدء التهيئة (بدون await في الـ top-level)
initializeFirebase().catch(console.error);

// تصدير الكائنات
export { db, auth, app, isInitialized, initError, isFirebaseReady, waitForFirebase };

// تصدير افتراضي للمكتبة
export default {
    db,
    auth,
    app,
    isInitialized,
    initError,
    isFirebaseReady,
    waitForFirebase
};
