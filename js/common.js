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
    loadCustomers,      // أضف هذا
    addCustomer,        // أضف هذا
    deleteCustomer,     // أضف هذا
    updateCustomer      // أضف هذا (اختياري)
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
    loadCustomers,      // أضف هذا
    addCustomer,        // أضف هذا
    deleteCustomer,     // أضف هذا
    updateCustomer      // أضف هذا
};
