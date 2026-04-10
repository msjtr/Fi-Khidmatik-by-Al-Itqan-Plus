// ========================================
// js/firebase.js - تهيئة Firebase (v8 للاستخدام العام)
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة Firebase إذا لم تكن مهيأة
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// دوال مساعدة
async function addDocument(collectionName, data) {
    try {
        const docRef = await db.collection(collectionName).add(data);
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

async function getDocument(collectionName, docId) {
    try {
        const snap = await db.collection(collectionName).doc(docId).get();
        return snap.exists ? { id: snap.id, ...snap.data(), success: true } : { success: false, error: 'Not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getAllDocuments(collectionName) {
    try {
        const snapshot = await db.collection(collectionName).get();
        const docs = [];
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
        return { data: docs, success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateDocument(collectionName, docId, data) {
    try {
        await db.collection(collectionName).doc(docId).update(data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteDocument(collectionName, docId) {
    try {
        await db.collection(collectionName).doc(docId).delete();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function queryDocuments(collectionName, field, operator, value) {
    try {
        const snapshot = await db.collection(collectionName).where(field, operator, value).get();
        const docs = [];
        snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
        return { data: docs, success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// تصدير إلى window
window.db = db;
window.addDocument = addDocument;
window.getDocument = getDocument;
window.getAllDocuments = getAllDocuments;
window.updateDocument = updateDocument;
window.deleteDocument = deleteDocument;
window.queryDocuments = queryDocuments;

console.log('Firebase initialized (v8)');
