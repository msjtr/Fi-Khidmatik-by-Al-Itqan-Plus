/**
 * js/core/config.js
 * إعدادات النظام العامة والتكوينات - نسخة الإصلاح الشاملة
 */

// 1. استيراد الكائنات الصحيحة (تم تغيير app إلى firebase ليتوافق مع نسخة Compat)
import { db, auth, firebase } from './firebase.js';

// 2. تعريف الإعدادات كـ constants
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '2.0.2', // تحديث النسخة لمطابقة التعديلات الأخيرة
    company: 'Tera Gateway',
    debug: true
};

export const TAX_CONFIG = {
    rate: 15,
    enabled: true,
    taxName: 'ضريبة القيمة المضافة'
};

export const FIREBASE_CONFIG = {
    collections: {
        products: 'products',
        orders: 'orders',
        customers: 'customers'
    }
};

// 3. تعريف الدوال
export function getAllConfig() {
    return {
        app: APP_CONFIG,
        tax: TAX_CONFIG,
        firebase: FIREBASE_CONFIG
    };
}

export function saveConfigToLocalStorage() {
    const allConfig = getAllConfig();
    localStorage.setItem('tera_gateway_config', JSON.stringify(allConfig));
}

export function loadConfigFromLocalStorage() {
    const saved = localStorage.getItem('tera_gateway_config');
    if (saved) {
        try {
            const config = JSON.parse(saved);
            if (config.app) Object.assign(APP_CONFIG, config.app);
            console.log('✅ Tera Engine: تم تحميل الإعدادات من التخزين المحلي');
        } catch (e) {
            console.warn('⚠️ Tera Engine: فشل تحميل الإعدادات المحفوظة:', e);
        }
    }
}

// 4. استدعاء الدالة
loadConfigFromLocalStorage();

// 5. التصدير النهائي (تأكد من تصدير الأجسام الصحيحة)
export { db, auth, firebase };

export default {
    db, auth, firebase,
    APP_CONFIG,
    getAllConfig,
    loadConfigFromLocalStorage
};
