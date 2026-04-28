/**
 * js/core/firebase.js - الإصدار 12.12.1 الحديث
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

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تهيئة الخدمات وتصديرها
export const db = getFirestore(app);
export const auth = getAuth(app);

// تأمين الوصول العالمي للملفات التي لم تُحدث بعد
window.db = db;

console.log("🚀 Tera Engine: Firebase V12.12.1 Ready.");
