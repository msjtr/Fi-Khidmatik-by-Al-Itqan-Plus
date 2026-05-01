// js-logic/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    // إعدادات مؤسسة الإتقان بلس الخاصة بك هنا
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔹 هذا هو الجزء المفقود الذي يسبب الخطأ
export const COLLECTIONS = {
    customers: 'customers',
    orders: 'orders',
    logs: 'audit_logs',
    payments: 'payments'
};

export { app, db, auth };
