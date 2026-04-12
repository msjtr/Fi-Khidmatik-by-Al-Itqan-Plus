// js/orders-firebase-db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// وظائف مساعدة متاحة عالمياً
window.getDocument = async (colName, id) => {
    const snap = await getDoc(doc(db, colName, id));
    return snap.exists() ? { id: snap.id, ...snap.data(), success: true } : { success: false };
};
