// ===================== استيراد من firebase.js =====================
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
    deleteField,
    getCollection,
    // دوال المنتجات
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    // دوال العملاء
    loadCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    // دوال الطلبات
    loadOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrdersWithDetails,
    // دوال الإعدادات
    getSettings,
    setSettings
} from './firebase.js';

// ===================== إعادة تصدير كل شيء للاستخدام في الصفحات =====================
export {
    // الأساسيات
    db,
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    deleteField,
    getCollection,
    
    // دوال المنتجات
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    
    // دوال العملاء
    loadCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // دوال الطلبات
    loadOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrdersWithDetails,
    
    // دوال الإعدادات
    getSettings,
    setSettings
};
