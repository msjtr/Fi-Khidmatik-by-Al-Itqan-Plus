/**
 * js/core/config.js
 * إعدادات منصة تيرا جيت واي - الإصدار الحديث V12.12.1
 * المطور: محمد بن صالح الشمري
 */

// 1. استيراد الكائنات من ملف firebase.js (الآن سيجد app بنجاح)
import { db, auth, app } from './firebase.js';

// 2. الثوابت الأساسية للمنصة
export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '2.0.2', 
    company: 'Tera Gateway',
    region: 'Saudi Arabia',
    debug: true
};

// 3. تكوين أسماء المجموعات (Collections) لضمان عدم حدوث أخطاء إملائية في الكود
export const FIREBASE_CONFIG = {
    collections: {
        products: 'products',
        orders: 'orders',
        customers: 'customers',
        payments: 'payments',
        settings: 'settings'
    }
};

// 4. الإعدادات المالية الخاصة بالسوق السعودي (تيرا)
export const FINANCIAL_CONFIG = {
    currency: 'SAR',
    taxRate: 0.15, // ضريبة القيمة المضافة 15%
    taxEnabled: true
};

/**
 * دالة جلب الإعدادات الكاملة بنظام الموديولات
 */
export function getAllConfig() {
    return { 
        app: APP_CONFIG, 
        firebase: FIREBASE_CONFIG,
        financial: FINANCIAL_CONFIG 
    };
}

// 5. تصدير الخدمات لضمان سهولة الاستيراد في الموديولات الأخرى
export { db, auth, app };

// التصدير الافتراضي المجمع
export default {
    db, 
    auth, 
    app,
    APP_CONFIG,
    FIREBASE_CONFIG,
    FINANCIAL_CONFIG
};
