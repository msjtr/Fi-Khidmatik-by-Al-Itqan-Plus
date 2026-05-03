import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCikh505fV7E7mLjrxQLjvhMnFTJET5mNA",
    authDomain: "fi-khidmatik-admin.firebaseapp.com",
    projectId: "fi-khidmatik-admin",
    storageBucket: "fi-khidmatik-admin.firebasestorage.app",
    messagingSenderId: "814533039644",
    appId: "1:814533039644:web:9e068dd1efcea9089731d9",
    measurementId: "G-91D78EXWXK"
};

// تهيئة تطبيق فيرميز (Firebase App)
const app = initializeApp(firebaseConfig);

// تصدير الخدمات لاستخدامها في النظام
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
