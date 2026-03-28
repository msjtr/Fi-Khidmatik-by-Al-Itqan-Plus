// استيراد من firebase.js
import {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    getCollection,
    loadProducts,
    addProduct,
    deleteProduct,
    loadOrders,
    addOrder,
    deleteOrder,
    updateOrderStatus,
    getSettings,
    setSettings,
    loadCustomers,      // ✅ الآن موجودة في firebase.js
    addCustomer,        // ✅ الآن موجودة في firebase.js
    deleteCustomer,     // ✅ الآن موجودة في firebase.js
    updateCustomer      // ✅ الآن موجودة في firebase.js
} from './firebase.js';

// إعادة تصدير
export {
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    getCollection,
    loadProducts,
    addProduct,
    deleteProduct,
    loadOrders,
    addOrder,
    deleteOrder,
    updateOrderStatus,
    getSettings,
    setSettings,
    loadCustomers,
    addCustomer,
    deleteCustomer,
    updateCustomer
};
