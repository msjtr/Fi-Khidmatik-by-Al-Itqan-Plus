// ========================================
// js/firebase.js - تهيئة Firebase (بدون import/export)
// ========================================

// تكوين Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة Firebase (إذا لم تكن مهيأة مسبقاً)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// الحصول على Firestore
const db = firebase.firestore();

// دوال مساعدة للعمليات على قاعدة البيانات
async function addDocument(collectionName, data) {
    try {
        const docRef = await db.collection(collectionName).add(data);
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('Error adding document:', error);
        return { success: false, error: error.message };
    }
}

async function getDocument(collectionName, docId) {
    try {
        const docRef = await db.collection(collectionName).doc(docId).get();
        if (docRef.exists) {
            return { id: docRef.id, ...docRef.data(), success: true };
        }
        return { success: false, error: 'Document not found' };
    } catch (error) {
        console.error('Error getting document:', error);
        return { success: false, error: error.message };
    }
}

async function getAllDocuments(collectionName) {
    try {
        const snapshot = await db.collection(collectionName).get();
        const documents = [];
        snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return { data: documents, success: true };
    } catch (error) {
        console.error('Error getting documents:', error);
        return { success: false, error: error.message };
    }
}

async function updateDocument(collectionName, docId, data) {
    try {
        await db.collection(collectionName).doc(docId).update(data);
        return { success: true };
    } catch (error) {
        console.error('Error updating document:', error);
        return { success: false, error: error.message };
    }
}

async function deleteDocument(collectionName, docId) {
    try {
        await db.collection(collectionName).doc(docId).delete();
        return { success: true };
    } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message };
    }
}

async function setDocument(collectionName, docId, data) {
    try {
        await db.collection(collectionName).doc(docId).set(data, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error setting document:', error);
        return { success: false, error: error.message };
    }
}

async function queryDocuments(collectionName, field, operator, value) {
    try {
        const q = db.collection(collectionName).where(field, operator, value);
        const snapshot = await q.get();
        const documents = [];
        snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return { data: documents, success: true };
    } catch (error) {
        console.error('Error querying documents:', error);
        return { success: false, error: error.message };
    }
}

// تصدير كل شيء إلى window
window.db = db;
window.addDocument = addDocument;
window.getDocument = getDocument;
window.getAllDocuments = getAllDocuments;
window.updateDocument = updateDocument;
window.deleteDocument = deleteDocument;
window.setDocument = setDocument;
window.queryDocuments = queryDocuments;
window.firebaseConfig = firebaseConfig;

console.log('Firebase initialized successfully');
