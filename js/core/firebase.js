/**
 * js/core/firebase.js
 * تهيئة اتصال Firebase مع معالجة الأخطاء وتحسينات الأمان
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    connectFirestoreEmulator,
    enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, 
    connectAuthEmulator,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔐 تكوين Firebase - في الإنتاج، استخدم متغيرات البيئة
// تحذير: هذه المفاتيح معروضة للعموم، تأكد من إعداد قواعد أمان Firebase بشكل صارم
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    // measurementId غير مطلوب لـ Firestore
};

// متغيرات لحالة الاتصال
let app = null;
let db = null;
let auth = null;
let isInitialized = false;
let initError = null;

// دالة تهيئة Firebase مع إعادة المحاولة
async function initializeFirebase(retryCount = 0) {
    const maxRetries = 3;
    
    try {
        if (!app) {
            app = initializeApp(firebaseConfig);
            console.log('✅ Firebase App initialized');
        }
        
        if (!db) {
            db = getFirestore(app);
            console.log('✅ Firestore initialized');
        }
        
        if (!auth) {
            auth = getAuth(app);
            console.log('✅ Auth initialized');
        }
        
        // تمكين التخزين المحلي للعمل دون اتصال (اختياري)
        try {
            await enableIndexedDbPersistence(db);
            console.log('✅ Offline persistence enabled');
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Browser doesn\'t support persistence');
            }
        }
        
        // للتطوير المحلي فقط - قم بتعليق هذا السطر في الإنتاج
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // connectFirestoreEmulator(db, 'localhost', 8080);
            // connectAuthEmulator(auth, 'http://localhost:9099');
            console.log('🔧 Running in development mode');
        }
        
        isInitialized = true;
        initError = null;
        
        // إضافة مستمع لحالة المصادقة (اختياري)
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('👤 User signed in:', user.email);
            } else {
                console.log('👤 No user signed in');
            }
        });
        
        return { db, auth, app };
        
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        initError = error;
        
        if (retryCount < maxRetries) {
            console.log(`🔄 Retrying initialization... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return initializeFirebase(retryCount + 1);
        }
        
        // عرض خطأ للمستخدم
        showConnectionError(error);
        throw error;
    }
}

// دالة عرض خطأ الاتصال للمستخدم
function showConnectionError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        left: 20px;
        max-width: 400px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        direction: rtl;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ خطأ في الاتصال بقاعدة البيانات</strong>
        <p style="margin: 5px 0 0; font-size: 14px;">${error.message}</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px; background: white; color: #dc3545; border: none; border-radius: 5px; cursor: pointer;">
            إعادة المحاولة
        </button>
    `;
    document.body.appendChild(errorDiv);
    
    // إخفاء بعد 10 ثواني
    setTimeout(() => {
        if (errorDiv.parentNode) errorDiv.remove();
    }, 10000);
}

// تهيئة Firebase بشكل تلقائي
await initializeFirebase();

// تصدير الكائنات للاستخدام في باقي الملفات
export { db, auth, app, isInitialized, initError };

// دالة مساعدة للتحقق من جاهزية Firebase
export function isFirebaseReady() {
    return isInitialized && db !== null;
}

// دالة لإعادة تهيئة Firebase يدوياً (للحالات النادرة)
export async function reinitializeFirebase() {
    isInitialized = false;
    app = null;
    db = null;
    auth = null;
    return initializeFirebase();
}
