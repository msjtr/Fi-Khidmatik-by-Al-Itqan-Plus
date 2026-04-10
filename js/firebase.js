// ========================================
// js/firebase.js - تهيئة Firebase (نسخة حديثة متوافقة مع Modular SDK)
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

// استيراد الدوال اللازمة من Firebase Modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    writeBatch, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ================= دوال مساعدة عامة =================
async function addDocument(collectionName, data) {
    try {
        const coll = collection(db, collectionName);
        const docRef = await addDoc(coll, data);
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('Error adding document:', error);
        return { success: false, error: error.message };
    }
}

async function getDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return { id: snap.id, ...snap.data(), success: true };
        }
        return { success: false, error: 'Document not found' };
    } catch (error) {
        console.error('Error getting document:', error);
        return { success: false, error: error.message };
    }
}

async function getAllDocuments(collectionName) {
    try {
        const coll = collection(db, collectionName);
        const snapshot = await getDocs(coll);
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
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        return { success: true };
    } catch (error) {
        console.error('Error updating document:', error);
        return { success: false, error: error.message };
    }
}

async function deleteDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message };
    }
}

async function setDocument(collectionName, docId, data) {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error setting document:', error);
        return { success: false, error: error.message };
    }
}

async function queryDocuments(collectionName, field, operator, value) {
    try {
        const coll = collection(db, collectionName);
        const q = query(coll, where(field, operator, value));
        const snapshot = await getDocs(q);
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

// ================= دوال رفع الملفات إلى Storage =================
async function uploadImage(file, path) {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { url: downloadURL, success: true };
    } catch (error) {
        console.error('Error uploading image:', error);
        return { success: false, error: error.message };
    }
}

async function deleteImage(path) {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting image:', error);
        return { success: false, error: error.message };
    }
}

// ================= تصدير الكائنات والدوال =================
export { 
    db, 
    storage,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    serverTimestamp,
    addDocument,
    getDocument,
    getAllDocuments,
    updateDocument,
    deleteDocument,
    setDocument,
    queryDocuments,
    uploadImage,
    deleteImage
};

// للتوافق مع الكود القديم الذي يستخدم window
window.db = db;
window.storage = storage;
window.addDocument = addDocument;
window.getDocument = getDocument;
window.getAllDocuments = getAllDocuments;
window.updateDocument = updateDocument;
window.deleteDocument = deleteDocument;
window.setDocument = setDocument;
window.queryDocuments = queryDocuments;
window.uploadImage = uploadImage;
window.deleteImage = deleteImage;
window.firebaseConfig = firebaseConfig;

console.log('Firebase initialized successfully (Modular SDK)');
