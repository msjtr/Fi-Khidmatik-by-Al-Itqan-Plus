import {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc
} from './firebase.js';

export async function getCollection(name) {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// منتجات
export const loadProducts = () => getCollection('products');

export const addProduct = (data) =>
    addDoc(collection(db, 'products'), data);

export const deleteProduct = (id) =>
    deleteDoc(doc(db, 'products', id));
