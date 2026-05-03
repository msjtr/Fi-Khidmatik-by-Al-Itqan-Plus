import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js"; // أضف هذا السطر

const firebaseConfig = {
    apiKey: "AIzaSyCikh505fV7E7mLjrxQLjvhMnFTJET5mNA",
    authDomain: "fi-khidmatik-admin.firebaseapp.com",
    projectId: "fi-khidmatik-admin",
    storageBucket: "fi-khidmatik-admin.firebasestorage.app",
    messagingSenderId: "814533039644",
    appId: "1:814533039644:web:9e068dd1efcea9089731d9",
    measurementId: "G-91D78EXWXK"
};

// تهيئة المشروع
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // أضف هذا السطر

export { db, storage, auth }; // تأكد من إضافة auth هنا
