import { 
    db, collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc,
    query, orderBy, where, limit
} from './firebase.js';

// ===================== دوال عامة =====================
export async function getCollection(collectionName) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getDocument(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function addDocument(collectionName, data) {
    return await addDoc(collection(db, collectionName), data);
}

export async function updateDocument(collectionName, id, data) {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
}

export async function deleteDocument(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
}

// ===================== دوال المنتجات =====================
export function importProductsFromExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        
        let successCount = 0;
        for (const row of rows) {
            try {
                const product = {
                    name: row.name || row['اسم المنتج'] || row['المنتج'],
                    price: parseFloat(row.price || row['السعر'] || 0),
                    quantity: parseInt(row.quantity || row['الكمية'] || 0),
                    imageUrl: row.imageUrl || row['الصورة'] || '',
                    createdAt: new Date().toISOString()
                };
                if (product.name) {
                    await addDocument('products', product);
                    successCount++;
                }
            } catch(err) {
                console.error('خطأ في إضافة منتج:', err);
            }
        }
        callback({ success: true, count: successCount });
    };
    reader.readAsArrayBuffer(file);
}

// ===================== دوال العملاء =====================
export async function getCustomers() {
    return await getCollection('customers');
}

export async function addCustomer(customerData) {
    return await addDocument('customers', {
        ...customerData,
        createdAt: new Date().toISOString()
    });
}

export async function updateCustomer(id, customerData) {
    await updateDocument('customers', id, customerData);
}

export async function deleteCustomer(id) {
    await deleteDocument('customers', id);
}

// ===================== دوال الطلبات =====================
export async function getOrders() {
    const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addOrder(orderData) {
    return await addDocument('orders', {
        ...orderData,
        orderDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
    });
}

export async function updateOrder(id, orderData) {
    await updateDocument('orders', id, orderData);
}

export async function deleteOrder(id) {
    await deleteDocument('orders', id);
}

export async function updateOrderStatus(id, status) {
    await updateDocument('orders', id, { status });
}

// ===================== دوال المنتجات =====================
export async function getProducts() {
    return await getCollection('products');
}

export async function addProduct(productData) {
    return await addDocument('products', {
        ...productData,
        createdAt: new Date().toISOString()
    });
}

export async function updateProduct(id, productData) {
    await updateDocument('products', id, productData);
}

export async function deleteProduct(id) {
    await deleteDocument('products', id);
}

export async function updateProductQuantity(id, quantity) {
    await updateDocument('products', id, { quantity });
}

// ===================== دوال الإعدادات =====================
export async function getSettings(settingType) {
    const docRef = doc(db, 'settings', settingType);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
}

export async function saveSettings(settingType, data) {
    const docRef = doc(db, 'settings', settingType);
    await updateDoc(docRef, data).catch(async () => {
        // إذا لم يكن موجوداً، نقوم بإنشائه
        await addDoc(collection(db, 'settings'), { ...data, id: settingType });
    });
}
